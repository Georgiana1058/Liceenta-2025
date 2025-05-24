import Header from '@/components/header-custom/Header';
import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import ResumePreview from '@/router/dashboard/dashboardUser/resume/componentsResume/ResumePreview';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GlobalAPI from '../../../../../service/GlobalAPI';
import { useUser } from '@clerk/clerk-react';
import { useStrapiUser } from '@/hooks/useStrapiUser';
import { toast } from 'sonner';
import { searchGoogleCourses } from '../../../../../service/googleSearch';
import GoogleSearchDialog from '../resumeItem/GoogleSearch/GoogleSearchDialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

function ViewAdmin() {
  const [resumeInfo, setResumeInfo] = useState();
  const [notifications, setNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMode, setFeedbackMode] = useState('reject');
  const [editingNotification, setEditingNotification] = useState(null);
  const [editText, setEditText] = useState('');
  const { resumeId } = useParams();
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);
  const [openRecommendationDialog, setOpenRecommendationDialog] = useState(false)
  const [recommendationURL, setRecommendationURL] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [recommendationText, setRecommendationText] = useState('');


  useEffect(() => {
    console.log('🔁 useEffect triggered | strapiUser:', strapiUser);
    if (strapiUser?.id) {
      GetResumeInfo();
    }
  }, [strapiUser]);


  useEffect(() => {
    if (resumeInfo?.themeColor) {
      document.documentElement.style.setProperty('--bar-color', resumeInfo.themeColor);
    }
  }, [resumeInfo]);

  const CreateCvIfNotExists = async (resumeParam) => {
    console.log("🧾 [DEBUG] Resume primit:", resumeParam);

    let userId = resumeParam?.user?.id;

    if (!userId && resumeParam?.userEmail) {
      try {
        const allUsersRes = await GlobalAPI.GetAllUsers();
        const match = allUsersRes?.data?.find((u) => u.email === resumeParam.userEmail);
        if (match) {
          userId = match.id;
          console.log("🔗 User matched by email:", match.email, "| ID:", userId);
        }
      } catch (err) {
        console.error("❌ Eroare la căutarea userului după email:", err);
      }
    }

    console.log("👤 Final userId:", userId);
    console.log("🆔 ResumeId:", resumeParam?.id);

    if (!userId || !resumeParam?.id) {
      console.warn("⚠️ CV cannot be created – missing user or resume ID.");
      return;
    }

    try {
      const existing = await GlobalAPI.GetAllCVsByFilter({
        filters: {
          soucerResume: {
            id: {
              $eq: resumeParam.id,
            },
          },
        },
      });

      const alreadyExists = existing?.data?.data?.length > 0;
      console.log("📦 CV already exists:", alreadyExists);

      if (alreadyExists) {
        console.log("ℹ️ CV deja există pentru acest resume. Nu mai creez altul.");
        return;
      }

      const payload = {
        title: resumeParam?.title || "Untitled CV",
        user: userId,
        isApproved: false,
        soucerResume: resumeParam.id,
        content: resumeParam.summery,
        skills: resumeParam.skills?.map(({ name, rating }) => ({ name, rating })) || [],
        experience: resumeParam.experience || [],
        education: resumeParam.education?.map(({ universityName, degree, major, startDate, endDate, description }) => ({
          universityName, degree, major, startDate, endDate, description
        })) || [],
        languages: resumeParam.languages?.map(({ languageName, proficiencyLevel }) => ({
          languageName, proficiencyLevel
        })) || [],
        certification: resumeParam.certification?.map(({ name, issuer }) => ({ name, issuer })) || []
      };


      console.log("📤 Payload pregătit pentru POST:", JSON.stringify(payload, null, 2));

      const res = await GlobalAPI.CreateNewCV(payload);
      console.log("✅ CV creat cu succes:", res.data);
      toast.success("✅ CV saved in database.");
    } catch (err) {
      console.error("❌ Eroare la crearea CV-ului:", err.response?.data || err.message || err);
      toast.error("❌ Failed to save CV.");
    }
  };




  const GetResumeInfo = async () => {
    try {
      console.log("🚀 Fetching resume by ID:", resumeId);
      const res = await GlobalAPI.GetResumeById(resumeId);

      const resume = res?.data?.data;
      if (!resume) {
        console.warn("⚠️ Resume not found in response:", res?.data);
        return;
      }

      console.log("✅ Resume loaded:", resume);

      const notificationIds = resume?.notifications?.map(n => n.id) || [];
      console.log("🔔 Extracted notification IDs:", notificationIds);

      if (notificationIds.length === 0) {
        console.warn("⚠️ No notifications linked to this resume.");
      }

      const allNotifs = await Promise.all(
        notificationIds.map((id) => {
          console.log("🌐 Fetching notification by ID:", id);
          return GlobalAPI.GetNotificationById(id)
            .then((r) => {
              console.log("✅ Notification fetched:", r?.data?.data);
              return r?.data?.data;
            })
            .catch((err) => {
              console.error("❌ Error fetching notification ID", id, err);
              return null;
            });
        })
      );

      const filtered = allNotifs.filter((notif) => {
        if (!notif) return false;

        const participantId = notif?.participant?.id;
        const organizerId = notif?.organizer?.id;


        console.log("🔍 Checking notif", notif.id, {
          participantId,
          organizerId,
          currentUserId: strapiUser?.id
        });

        const isRelevant = participantId === strapiUser?.id || organizerId === strapiUser?.id;
        console.log("🧪 Is relevant?", isRelevant);
        return isRelevant;
      });

      console.log("✅ Filtered notifications:", filtered);

      setResumeInfo(resume);
      setNotifications(filtered);
    } catch (err) {
      console.error("❌ Error in GetResumeInfo:", err);
    }
  };





  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      toast.error('Please enter feedback text.');
      return;
    }

    try {
      let participantId = resumeInfo?.user?.id;

      if (!participantId && resumeInfo?.userEmail) {
        const allUsersRes = await GlobalAPI.GetAllUsers();
        const match = allUsersRes?.data?.find((u) => u.email === resumeInfo.userEmail);
        if (match) participantId = match.id;
      }

      if (!participantId) {
        toast.error("❌ Could not find student user.");
        return;
      }

      const payload = {
        title: feedbackMode === 'reject' ? 'CV Rejected' : 'CV Accepted',
        message: feedbackText,
        type: feedbackMode === 'reject' ? 'feedback_negative' : 'feedback_positive',
        isRead: false,
        user_resume: resumeId,
        organizer: strapiUser.id,
        participant: participantId,
        responseReason: feedbackText,
      };


      if (editingNotification) {
        await GlobalAPI.UpdateNotification(editingNotification.id, { data: payload });
        toast.success("✅ Feedback updated!");
      } else {
        await GlobalAPI.CreateNotification({ data: payload });
        toast.success("✅ Feedback sent successfully.");
      }

      setOpenDialog(false);
      setFeedbackText('');
      setEditingNotification(null);

      // dacă e feedback pozitiv, creează CV
      if (feedbackMode === 'accept') {
        const existing = await GlobalAPI.GetAllCVsByFilter({
          filters: {
            soucerResume: {
              id: {
                $eq: resumeId,
              },
            },
          },
        });

        const alreadyExists = existing?.data?.data?.length > 0;

        if (!alreadyExists) {
          console.log("🟢 Feedback pozitiv -> Creez CV.");
          await CreateCvIfNotExists(resumeInfo);
        } else {
          console.log("⚠️ CV deja există. Nu mai creez.");
        }
      }

      GetResumeInfo();
    } catch (err) {
      console.error('❌ Error sending feedback:', err);
      toast.error('Error while sending feedback.');
    }
  };


  const handleRecommendationSubmit = async () => {
    if (!recommendationText.trim() || !recommendationURL.trim()) {
      toast.error("All fields are required.");
      return;
    }

    try {
      let participantId = resumeInfo?.user?.id;

      if (!participantId && resumeInfo?.userEmail) {
        const allUsersRes = await GlobalAPI.GetAllUsers();
        const match = allUsersRes?.data?.find((u) => u.email === resumeInfo.userEmail);
        if (match) participantId = match.id;
      }

      if (!participantId) {
        toast.error("❌ Could not find student user.");
        return;
      }

      const payload = {
        title: "📚 Course Recommendation",
        message: recommendationText,
        type: "course_sugestion",
        isRead: false,
        user_resume: resumeId,
        organizer: strapiUser.id,
        participant: participantId,
        linkedRecommendationURL: recommendationURL,
      };

      if (editingNotification) {
        await GlobalAPI.UpdateNotification(editingNotification.id, { data: payload });
        toast.success("✅ Recommendation updated!");
      } else {
        await GlobalAPI.CreateNotification({ data: payload });
        toast.success("✅ Recommendation sent!");
      }



      setOpenRecommendationDialog(false);
      setRecommendationText('');
      setRecommendationURL('');
      setEditingNotification(null);
      GetResumeInfo();
    } catch (err) {
      console.error("❌ Error submitting recommendation:", err);
      toast.error("Failed to submit recommendation.");
    }
  };

  return (
    <ResumeInfoContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div id="no-print">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-10 py-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-2">CV Preview</h2>
            <div id="print-area">
              <ResumePreview />
            </div>
            <div className="flex gap-4 mt-6">
              <div className="flex gap-4 mt-6">
                <Button onClick={() => { setFeedbackMode('accept'); setOpenDialog(true); }} className=" bg-green-700 hover:bg-green-600 text-white font-medium rounded-md px-4 py-2">Accept CV</Button>
                <Button onClick={() => { setFeedbackMode('reject'); setOpenDialog(true); }} className=" bg-red-700 hover:bg-red-900 text-white font-medium rounded-md px-4 py-2">Reject CV</Button>
                <Button onClick={() => setOpenRecommendationDialog(true)} className="bg-[#14346b] hover:bg-[#16887f] text-white font-medium rounded-md px-4 py-2">Send Recommendation</Button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">🔔 Notifications for this CV</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={(e) => {
                      const target = e.target;
                      if (
                        target.tagName === 'INPUT' ||
                        target.closest('input') ||
                        target.closest('button')
                      ) return;

                      if (notif.organizer && notif.organizer.email !== strapiUser?.email) return;

                      setEditingNotification(notif);

                      if (notif.type === 'course_sugestion') {
                        setRecommendationText(notif.message);
                        setRecommendationURL(notif.linkedRecommendationURL || '');
                        setOpenRecommendationDialog(true);
                      } else if (notif.type === 'feedback_positive' || notif.type === 'feedback_negative') {
                        setFeedbackText(notif.responseReason || notif.message);
                        setFeedbackMode(notif.type === 'feedback_negative' ? 'reject' : 'accept');
                        setOpenDialog(true);
                      } else {
                        toast("⚠️ Tip necunoscut de notificare: " + notif.type);
                      }
                    }}
                    className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all flex gap-3 items-start"
                  >
                    <div className="pt-1">
                      <Checkbox
                        checked={notif.isRead}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={async (checked) => {
                          await GlobalAPI.UpdateNotification(notif.id, {
                            data: { isRead: checked, organizer: null },
                          });
                          toast.success("✅ Marked as read.");
                          setNotifications((prev) => prev.filter(n => n.id !== notif.id));
                          GetResumeInfo();
                        }}
                        className="border-gray-300 text-[#14346b]"
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <p className="text-lg font-semibold text-[#14346b]">{notif.title}</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{notif.message}</p>

                      {notif.responseReason && (
                        <p className="text-xs text-gray-500 italic mt-1">Reason: {notif.responseReason}</p>
                      )}

                      {notif.feedbackScore != null && (
                        <div className="flex items-center mt-1 gap-1 text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < notif.feedbackScore ? '' : 'text-gray-300'}>★</span>
                          ))}
                          <span className="text-xs text-gray-600 ml-1">({notif.feedbackScore}/5)</span>
                        </div>
                      )}

                      {notif.type === 'course_sugestion' && notif.linkedRecommendationURL && (
                        <a
                          href={notif.linkedRecommendationURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm underline break-words mt-1"
                        >
                          {notif.linkedRecommendationURL}
                        </a>
                      )}

                      {notif?.organizer?.email && (
                        <p className="text-xs italic text-gray-400 mt-1">
                          From: {notif.organizer.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No notifications for this CV yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackMode === 'reject' ? 'Rejection Reason' : 'Feedback for Acceptance'}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={feedbackMode === 'reject' ? 'Enter rejection reason...' : 'Enter feedback for the candidate...'}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpenDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={handleFeedbackSubmit} className={feedbackMode === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Recommendation Dialog */}
      <Dialog open={openRecommendationDialog} onOpenChange={setOpenRecommendationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Course Recommendation</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter your message or reason for recommendation..."
            value={recommendationText}
            onChange={(e) => setRecommendationText(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium text-gray-700">Need help finding a course?</span>
            <Button onClick={() => setSearchDialogOpen(true)} variant="outline">
              🔍 Open Custom Search
            </Button>
            <GoogleSearchDialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} />
          </div>
          <Textarea
            placeholder="Paste a link to the recommended course (e.g. Udemy, Coursera)..."
            value={recommendationURL}
            onChange={(e) => setRecommendationURL(e.target.value)}
            className="mt-3"
          />
           <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setOpenRecommendationDialog(false)} variant="outline">Cancel</Button>
            <Button onClick={handleRecommendationSubmit} className="bg-[#14346b] hover:bg-[#16887f] text-white">
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </ResumeInfoContext.Provider>
  );
}

export default ViewAdmin;
