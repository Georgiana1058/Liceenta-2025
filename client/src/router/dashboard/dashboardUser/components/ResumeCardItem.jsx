import { Loader2Icon, MoreVertical } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import GlobalAPI from '../../../../../service/GlobalAPI'
import { toast } from 'sonner'
import { useUser } from '@clerk/clerk-react';
import { useStrapiUser } from '@/hooks/useStrapiUser';


function ResumeCardItem({ resume, refreshData }) {
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);
  
  const onDelete = () => {
    setLoading(true)
    GlobalAPI.DeleteResumeById(resume.documentId)
      .then(() => {
        toast.success('🗑️ Resume deleted successfully!')
        refreshData()
      })
      .catch(err => {
        console.error(err)
        toast.error('❌ Failed to delete resume.')
      })
      .finally(() => {
        setLoading(false)
        setOpenAlert(false)
      })
  }

  const handleRequestApproval = async () => {
    setLoading(true);
    try {
      // 1. Actualizează statusul în resume (isApproved: true)
      await GlobalAPI.UpdateResumeDetail(resume.documentId, {
        data: { isApproved: true },
      });
      toast.success("✅ Resume submitted for approval!");
  
      // 2. Găsește toți adminii
      const allAdminsRes = await GlobalAPI.GetAllAdmins();
      const admins = allAdminsRes?.data || [];
  
      if (!admins.length) {
        toast.warning("⚠️ No admin found to notify.");
        return;
      }
  
      const adminIds = admins.map((admin) => admin.id);
  
      // 3. Găsește organizatorul exact ca în ViewAdmin (fallback după email)
      let organizerId = strapiUser?.id;
  
      if (!organizerId && user?.emailAddresses?.[0]?.emailAddress) {
        const userEmail = user.emailAddresses[0].emailAddress;
        const allUsersRes = await GlobalAPI.GetAllUsers();
        const matched = allUsersRes?.data?.find((u) => u.email === userEmail);
        if (matched) organizerId = matched.id;
      }
  
      if (!organizerId) {
        toast.error("❌ Could not determine organizer.");
        return;
      }
  
      // 4. Creează notificarea pentru toți adminii
      await GlobalAPI.CreateNotification({
        data: {
          title: "New resume submitted for approval",
          message: `The student ${resume.lastName} ${resume.firstName} has submitted a resume for review.`,
          type: "approval_request",
          isRead: false,
          organizer: organizerId,
          participants: adminIds.map((id) => ({ id })), // many-to-many corect
          user_resume: resume.documentId,
        },
      });
  
      toast("📨 Admin notifications sent!", {
        description: "All admins have been notified.",
        duration: 5000,
      });
  
      refreshData();
    } catch (err) {
      console.error("❌ Failed to submit for approval:", err);
      toast.error("❌ Failed to submit resume for approval.");
    } finally {
      setLoading(false);
    }
  };
  

  const themeColor = resume?.themeColor || '#000852'


  return (
    <div className="relative group">
      <div
        onClick={() => navigate(`/dashboard/resume/${resume.documentId}/edit`)}
        className="relative h-[280px] rounded-lg border-2 overflow-hidden hover:scale-105 transition-all shadow-lg cursor-pointer"
        style={{ borderColor: themeColor }}
      >
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: themeColor }} />
        <img src="/cv.png" alt="Resume Icon" className="w-full h-full object-cover" />
      </div>

      <h2 className="text-center mt-2 font-medium">{resume.title}</h2>
      {resume.feedbackScore != null && (
        <div className="text-center mt-1 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < resume.feedbackScore ? '' : 'text-gray-300'}>★</span>
          ))}
          <span className="ml-1 text-sm text-gray-600">({resume.feedbackScore}/5)</span>
        </div>
      )}



      {resume.isApproved && (
        <p className="text-center text-green-600 text-sm font-medium">✔️ Sent for Approval</p>
      )}

      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={e => e.stopPropagation()}>
              <MoreVertical className="h-5 w-5 cursor-pointer" color="white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/dashboard/resume/${resume.documentId}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/my-resume/${resume.documentId}/view`)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/my-resume/${resume.documentId}/view`)}>
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRequestApproval}>
              Submit for Approval
            </DropdownMenuItem>
            <DropdownMenuItem onClick={e => { e.stopPropagation(); setOpenAlert(true) }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your resume. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlert(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={loading}>
              {loading ? <Loader2Icon className="animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default ResumeCardItem
