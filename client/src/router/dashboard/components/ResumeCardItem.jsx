import { Loader2Icon, MoreVertical } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import GlobalAPI from '../../../../service/GlobalAPI'
import { toast } from 'sonner'

function ResumeCardItem({ resume, refreshData }) {
  const navigate = useNavigate()
  const [openAlert, setOpenAlert] = useState(false)
  const [loading, setLoading] = useState(false)

  const onDelete = () => {
    setLoading(true)
    GlobalAPI.DeleteResumeById(resume.documentId)
      .then(resp => {
        toast.success('Resume Deleted!')
        refreshData()
      })
      .catch(err => {
        console.error(err)
        toast.error('Delete failed')
      })
      .finally(() => {
        setLoading(false)
        setOpenAlert(false)
      })
  }

  const themeColor = resume?.themeColor || '#000852'

  return (
    <div className="relative group">
      <div
        onClick={() => navigate(`/dashboard/resume/${resume.documentId}/edit`)}
        className="relative h-[280px] rounded-lg border-2 overflow-hidden hover:scale-105 transition-all shadow-lg cursor-pointer"
        style={{ borderColor: themeColor }}
      >
        {/* Bara de sus cu culoarea temei */}
        <div
          className="absolute top-0 left-0 w-full h-2"
          style={{ backgroundColor: themeColor }}
        />

        {/* Imagine fundal */}
        <img
          src="/cv.png"
          alt="Resume Icon"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Titlul */}
      <h2 className="text-center mt-2 font-medium">{resume.title}</h2>

      {/* Meniu 3 puncte */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={e => e.stopPropagation()}>
              <MoreVertical className="h-5 w-5 cursor-pointer text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/dashboard/resume/${resume.documentId}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/my-resume/${resume.documentId}/view`)
}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() =>navigate(`/my-resume/${resume.documentId}/view`)
}>
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={e => { e.stopPropagation(); setOpenAlert(true) }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* AlertDialog ștergere */}
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your resume and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlert(false)}>
              Cancel
            </AlertDialogCancel>
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
