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
import { formatDistanceToNow } from 'date-fns';
import type { NotificationItem } from '@/types/admin';

// Mock data for now - will be replaced with API calls
const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    message: 'Full system backup completed successfully',
    type: 'backup',
    status: 'unread',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    message: 'New user registered: john@example.com',
    type: 'user',
    status: 'unread',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    hotelId: 1,
    hotelName: 'Grand Hotel',
  },
  {
    id: 3,
    message: 'Hotel configuration updated: Grand Hotel',
    type: 'hotel',
    status: 'read',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    hotelId: 1,
    hotelName: 'Grand Hotel',
  },
];

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
  const unreadCount = mockNotifications.filter((n) => n.status === 'unread').length;

  return (
    <DropdownMenu>
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
          {mockNotifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {mockNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 py-3"
                  onSelect={(e) => e.preventDefault()}
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
        <DropdownMenuItem>View all notifications</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

