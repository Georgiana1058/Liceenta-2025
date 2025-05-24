import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useStrapiUser } from '../../../hooks/useStrapiUser';
import GlobalAPI from '../../../../service/GlobalAPI';
import { toast } from 'sonner';

export default function NotificationListener() {
  const { user } = useUser();
  const { user: strapiUser } = useStrapiUser(user?.id);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!strapiUser?.id) return;

      try {
        const res = await GlobalAPI.GetAllNotifications();
        const notifs = res?.data?.data || [];

        const recentNotifs = notifs.filter(n =>
          !n.isRead &&
          n.type === 'event_reminder' &&
          n.participant?.id === strapiUser.id
        );

        recentNotifs.forEach((notif) => {
          toast(`${notif.title}: ${notif.message}`, {
            action: {
              label: "Mark as read",
              onClick: async () => {
                await GlobalAPI.UpdateNotification(notif.id, {
                  data: { isRead: true }
                });
              }
            }
          });
        });
      } catch (err) {
        console.error("❌ Error checking reminders:", err);
      }
    }, 30000); // verifică la 30s

    return () => clearInterval(interval);
  }, [strapiUser]);

  return null;
}
