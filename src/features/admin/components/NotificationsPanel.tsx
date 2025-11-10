import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { NotificationItem } from '@/types/admin';

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  isLoading?: boolean;
}

function getNotificationBadgeVariant(type: string) {
  switch (type) {
    case 'backup':
      return 'default';
    case 'user':
      return 'secondary';
    case 'hotel':
      return 'outline';
    case 'reservation':
      return 'default';
    default:
      return 'default';
  }
}

export function NotificationsPanel({
  notifications,
  isLoading = false,
}: NotificationsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications & Alerts</CardTitle>
          <CardDescription>Recent hotel activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications & Alerts</CardTitle>
        <CardDescription>Recent hotel activity</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex flex-col gap-2 rounded-lg border p-3 transition-colors',
                    notification.status === 'unread'
                      ? 'border-primary/50 bg-primary/5 shadow-sm'
                      : 'border-border bg-background opacity-60'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={getNotificationBadgeVariant(notification.type)}
                      className={cn(
                        'text-xs',
                        notification.status === 'unread' && 'font-semibold'
                      )}
                    >
                      {notification.type}
                    </Badge>
                    {notification.status === 'unread' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm',
                      notification.status === 'unread'
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

