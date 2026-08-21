import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationService from '../../services/notification.service';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationService.getUnreadNotifications,
    // Simple polling instead of websockets for now — good enough until
    // a real-time layer is built.
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markNotificationAsRead,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = () => {
    const opening = !open;
    setOpen(opening);

    if (opening && notifications.length > 0) {
      // Mark everything currently shown as read the moment the panel opens —
      // fired without awaiting so the dropdown doesn't visually flicker.
      // The badge/list only refreshes once the panel is closed, so what
      // the user sees mid-view stays stable.
      notifications.forEach((n) => markReadMutation.mutate(n.id));
    } else if (!opening) {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative w-8 h-8 flex items-center justify-center rounded-md text-[#8b93a3] hover:text-[#e8eaef] hover:bg-[#181d26] transition-colors"
      >
        <Bell size={16} />
        {notifications.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#e0625f] text-white text-[9.5px] font-semibold flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-[#12161d] border border-[#242b37] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-[#242b37]">
            <p className="text-[13px] font-medium text-[#e8eaef]">Notifications</p>
          </div>

          {notifications.length === 0 ? (
            <p className="text-[12.5px] text-[#565f6f] px-4 py-6 text-center">
              You're all caught up.
            </p>
          ) : (
            <div className="divide-y divide-[#242b37]">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <p className="text-[12.5px] text-[#c2c5cc] leading-relaxed">{n.message}</p>
                  <p className="text-[11px] text-[#565f6f] mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}