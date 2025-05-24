import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function ResumeCardItemAdmin({ resume }) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);

  const themeColor = resume?.themeColor || '#000852';
  const userName = resume?.firstName && resume?.lastName
    ? `${resume.firstName} ${resume.lastName}`
    : resume?.userName || 'Unknown user';
  const userEmail = resume?.email || resume?.userEmail || 'No email';

  // ✅ Filtrare safe doar notificări de la company
  const companyNotifications = Array.isArray(resume?.notifications)
    ? resume.notifications.filter(n => n?.organizer?.role?.name === 'company')
    : [];

  return (
    <div className="relative group">
      <div
        onClick={() => navigate(`/my-resume/${resume?.documentId}/viewAdmin`)}
        className="relative h-[280px] rounded-lg border-2 overflow-hidden hover:scale-105 transition-all shadow-lg cursor-pointer"
        style={{ borderColor: themeColor }}
      >
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: themeColor }} />
        <img src="/cv.png" alt="Resume Icon" className="w-full h-full object-cover" />
      </div>

      <h2 className="text-center mt-2 font-medium">{resume?.title}</h2>
      <p className="text-center text-sm text-gray-500">
        From: <span className="font-semibold">{userName}</span> ({userEmail})
      </p>

      {/* View Notifications Button */}
      <div className="flex justify-center mt-2">
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">View Notifications</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications from Companies for "{resume?.title}"</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {companyNotifications.length > 0 ? (
                companyNotifications.map((notif) => (
                  <div key={notif.id} className="border rounded p-2 text-sm bg-gray-50">
                    <p className="font-semibold">{notif.title}</p>
                    <p>{notif.message}</p>
                    {notif.organizer?.email && (
                      <p className="text-xs mt-1 text-gray-500 italic">From: {notif.organizer.email}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No company notifications linked to this resume.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dropdown menu */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-5 w-5 cursor-pointer" color="white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/view-admin/${resume?.documentId}`)}
 >
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default ResumeCardItemAdmin;
