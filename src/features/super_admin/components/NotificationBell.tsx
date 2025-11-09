import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationItem } from '@/types/admin';
import { getNotifications, markNotificationRead } from '../api/superAdminApi';

function getNotificationBadgeVariant(type: string) {
  switch (type) {
    case 'backup':
      return 'default';
    case 'user':
      return 'secondary';
    case 'hotel':
      return 'outline';
    default:
      return 'default';
  }
}

export function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications({ limit: 10 });
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        try {
          const response = await getNotifications({ limit: 10 });
          setNotifications(response.data || []);
        } catch (error) {
          console.error('Failed to load notifications:', error);
        }
      };
      fetchNotifications();
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.status === 'unread') {
      try {
        await markNotificationRead(notification.id);
        // Remove the notification from the list after marking as read
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  // Filter to only show unread notifications
  const unreadNotifications = notifications.filter((n) => n.status === 'unread');
  const unreadCount = unreadNotifications.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : unreadNotifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {unreadNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <Badge
                      variant={getNotificationBadgeVariant(notification.type)}
                      className="text-xs"
                    >
                      {notification.type}
                    </Badge>
                    {notification.status === 'unread' && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-sm">{notification.message}</p>
                  {notification.hotelName && (
                    <p className="text-xs text-muted-foreground">
                      {notification.hotelName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setIsOpen(false);
            navigate('/super-admin/logs');
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

