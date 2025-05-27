// ViewCompany.jsx (cu creare notificare interview_offer + data interviului)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import GlobalAPI from '../../../../../service/GlobalAPI';
import Header from '@/components/header-custom/Header';
import ResumePreview from '../../dashboardUser/resume/componentsResume/ResumePreview';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';
import { useStrapiUser } from '@/hooks/useStrapiUser';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom'; // la începutul fișierului

function ViewCompany() {
  const { cvId } = useParams();
  const [cvData, setCvData] = useState(null);
  const [resumeInfo, setResumeInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [feedbackMode, setFeedbackMode] = useState('reject');
  const [editingNotification, setEditingNotification] = useState(null);
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);

  const navigate = useNavigate();

  useEffect(() => {
    if (cvId && strapiUser?.id) {
      fetchCVAndResume();
    }
  }, [cvId, strapiUser]);

  const fetchCVAndResume = async () => {
    try {
      const res = await GlobalAPI.GetCVById(cvId);
      const cv = res?.data?.data;
      setCvData(cv);

      if (cv?.soucerResume) {
        const resumeRes = await GlobalAPI.GetUserResumeByResumeId(cv.soucerResume);
        const resume = resumeRes?.data?.data?.[0];
        setResumeInfo(resume);

        const notificationIds = resume?.notifications?.map(n => n.id) || [];
        const notifList = await Promise.all(
          notificationIds.map((id) =>
            GlobalAPI.GetNotificationById(id).then((r) => r.data.data)
          )
        );

        const strapiUserId = Number(strapiUser?.id);

        const filtered = notifList.filter((notif) => {
          if (!notif) return false;
          const organizerId = Number(notif?.organizer?.id);
          const participantIds = notif?.participants?.map(p => Number(p.id)) || [];
          return organizerId === strapiUserId || participantIds.includes(strapiUserId);
        });

        setNotifications(filtered);
      }
    } catch (err) {
      console.error('❌ Error loading CV or Resume:', err);
      toast.error('Failed to load resume or notifications.');
    }
  };
  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    try {
      let participantId = resumeInfo?.user?.id;
      const allUsersRes = await GlobalAPI.GetAllUsers();
      const admins = allUsersRes?.data?.filter((u) => u.role?.name === 'admin') || [];

      if (!participantId && resumeInfo?.userEmail) {
        const match = allUsersRes?.data?.find((u) => u.email === resumeInfo.userEmail);
        if (match) participantId = match.id;
      }

      if (!participantId) {
        toast.error("❌ Could not find student user.");
        return;
      }

      const payload = {
        title: feedbackMode === 'reject' ? 'Refuze Offer' : 'Interview Offer',
        message: feedbackText,
        type: feedbackMode === 'reject' ? 'rejection_offer' : 'interview_offer',
        isRead: false,
        user_resume: resumeInfo?.id,
        organizer: strapiUser?.id,
        participants: feedbackMode === 'reject'
          ? admins.map(a => ({ id: a.id }))
          : [...admins.map(a => ({ id: a.id })), { id: participantId }],
        responseReason: feedbackText,
        interviewDate: feedbackMode === 'accept' && interviewDate
          ? new Date(interviewDate).toISOString()
          : null,
        cv: cvData?.id // 🟢 Adăugat aici!
      };


      // --- DELETE & RECREATE LOGIC ---
      if (feedbackMode === 'reject' && strapiUser?.id && cvData?.id) {
        try {
          console.log("🗑️ Deleting old CV ID:", cvData.id);
          await GlobalAPI.DeleteCV(cvData.id);

          const remainingCompanies = (cvData.companyStatus || [])
            .filter(c => c?.id !== strapiUser.id)
            .map(c => c.id);

          const newPayload = {
            title: cvData.title,
            user: cvData.user.id,
            isApproved: cvData.isApproved,
            soucerResume: cvData.soucerResume,
            content: cvData.content,
            skills: cvData.skills?.map(({ name, rating }) => ({ name, rating })) || [],
            experience: cvData.experience || [],
            education: cvData.education || [],
            languages: cvData.languages || [],
            certification: cvData.certification || [],
            companyStatus: remainingCompanies
          };

          await GlobalAPI.CreateNewCV(newPayload);
          toast.success("✅ CV recreated without this company.");

          // 🟢 Refetch după `soucerResume`
          const allCVs = await GlobalAPI.GetAllCVsByFilter({
            filters: { soucerResume: { $eq: cvData.soucerResume } },
            sort: ['createdAt:desc'],
            populate: '*'
          });

          const newest = allCVs?.data?.data?.[0];
          if (newest?.id) {
            navigate(`/view-company/${newest.id}`);
          } else {
            toast.error("❌ Could not locate recreated CV.");
          }

          return; // oprim logica aici, restul nu se mai aplică
        } catch (err) {
          console.error("❌ Error during delete/create CV:", err);
          toast.error("Failed to recreate CV with updated companies.");
          return;
        }
      }

      // --- NOTIFICATION LOGIC ---
      if (editingNotification) {
        await GlobalAPI.UpdateNotification(editingNotification.id, { data: payload });
        toast.success(`✅ ${feedbackMode === 'reject' ? 'Rejection offer updated!' : 'Interview offer updated!'}`);
      } else {
        await GlobalAPI.CreateNotification({ data: payload });
        toast.success(`✅ ${feedbackMode === 'reject' ? 'Rejection offer sent!' : 'Interview offer sent!'}`);
      }

      setOpenDialog(false);
      setFeedbackText('');
      setInterviewDate('');
      setEditingNotification(null);
      fetchCVAndResume();

    } catch (err) {
      console.error('❌ Error sending interview offer:', err);
      toast.error('Error while sending interview offer.');
    }
  };

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <Header />
      <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {resumeInfo ? <ResumePreview /> : <p className="text-sm italic text-gray-500">Loading resume preview...</p>}

          <div className="mt-6 flex flex-wrap gap-4 z-10 relative">
            <Button onClick={() => { setFeedbackMode("accept"); setOpenDialog(true); }} className="bg-green-700 hover:bg-green-600 text-white">Interview Offer</Button>
            <Button onClick={() => { setFeedbackMode("reject"); setOpenDialog(true); }} className="bg-yellow-600 hover:bg-yellow-700 text-white">Refuze Offer</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Notifications</h3>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {notifications.length > 0 ? notifications.map((n) => (
              <div
                key={n.id}
                onClick={(e) => {
                  const target = e.target;
                  if (target.tagName === 'INPUT' || target.closest('input') || target.closest('button')) return;
                  if (n.organizer && n.organizer.email !== strapiUser?.email) return;

                  setEditingNotification(n);
                  setFeedbackText(n.responseReason || n.message);
                  setInterviewDate(n.interviewDate || '');
                  setFeedbackMode(n.type === 'interview_offer' ? 'accept' : 'reject');
                  setOpenDialog(true);
                }}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all flex gap-3 items-start"
              >
                <div className="pt-1">
                  <Checkbox
                    checked={n.isRead}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={async (checked) => {
                      await GlobalAPI.UpdateNotification(n.id, {
                        data: { isRead: checked, organizer: null },
                      });
                      toast.success("✅ Marked as read.");
                      fetchCVAndResume();
                    }}
                    className="border-gray-300 text-[#14346b]"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-lg font-semibold text-[#14346b]">{n.title}</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.message}</p>
                  {n.responseReason && (
                    <p className="text-sm text-blue-600 italic mt-1">Response: {n.responseReason}</p>
                  )}

                  {n?.interviewDate && (
                    <p className="text-xs text-gray-600">📅 {new Date(n.interviewDate).toLocaleString()}</p>
                  )}
                  {n?.organizer?.email && (
                    <p className="text-xs italic text-gray-400 mt-1">From: {n.organizer.email}</p>
                  )}
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No notifications available.</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackMode === 'reject' ? 'Rejection Reason' : 'Interview Offer Details'}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={feedbackMode === 'reject' ? 'Enter rejection reason...' : 'Why was this CV accepted?'}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          {feedbackMode === 'accept' && (
            <Input
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="mt-2"
            />
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpenDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={handleFeedbackSubmit} className={feedbackMode === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ResumeInfoContext.Provider>
  );
}

export default ViewCompany;
