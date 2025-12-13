import { useState, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
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
import { getAlerts } from '../api/managerApi';

function getAlertBadgeVariant(severity: string) {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'info':
      return 'secondary';
    default:
      return 'default';
  }
}

export function NotificationBell() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await getAlerts({ status: 'open', per_page: 10 });
        setAlerts(response.data || []);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refresh when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const fetchAlerts = async () => {
        try {
          const response = await getAlerts({ status: 'open', per_page: 10 });
          setAlerts(response.data || []);
        } catch (error) {
          console.error('Failed to load alerts:', error);
        }
      };
      fetchAlerts();
    }
  }, [isOpen]);

  // Filter to only show open alerts
  const openAlerts = alerts.filter((a) => a.status === 'open');
  const openCount = openAlerts.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {openCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {openCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Alerts & Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : openAlerts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No alerts
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {openAlerts.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                >
                  <div className="flex w-full items-center justify-between">
                    <Badge
                      variant={getAlertBadgeVariant(alert.severity)}
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        alert.severity === 'critical'
                          ? 'text-red-500'
                          : alert.severity === 'warning'
                            ? 'text-amber-500'
                            : 'text-blue-500'
                      }`}
                    />
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {alert.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.createdAt), {
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
            window.location.href = '/manager/occupancy';
          }}
        >
          View all alerts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

