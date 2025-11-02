import { Building2, Users, Calendar, Bed, TrendingUp } from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardMetrics, AuditLogItem, NotificationItem } from '@/types/admin';

// Mock data - will be replaced with API calls
const mockMetrics: DashboardMetrics = {
  hotels: 12,
  usersByRole: {
    client: 245,
    receptionist: 15,
    manager: 8,
    admin: 5,
    super_admin: 1,
  },
  totalBookings: 1847,
  rooms: {
    available: 342,
    occupied: 158,
  },
};

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
];

const mockActivity: AuditLogItem[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    userName: 'John Admin',
    userId: 1,
    action: 'user.created',
    hotelId: 1,
    hotelName: 'Grand Hotel',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userName: 'Jane Admin',
    userId: 2,
    action: 'hotel.updated',
    hotelId: 2,
    hotelName: 'Plaza Hotel',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userName: 'System',
    userId: 0,
    action: 'backup.started',
  },
];

export function Dashboard() {
  const isLoading = false;
  const metrics = mockMetrics;
  const notifications = mockNotifications;
  const activity = mockActivity;

  const roomOccupancyRate =
    metrics.rooms.occupied / (metrics.rooms.available + metrics.rooms.occupied);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hotel reservation system
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Hotels"
          value={metrics.hotels}
          icon={Building2}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Total Users"
          value={Object.values(metrics.usersByRole).reduce((a, b) => a + b, 0)}
          icon={Users}
          isLoading={isLoading}
          description={`${metrics.usersByRole.admin} admins, ${metrics.usersByRole.manager} managers`}
        />
        <SummaryCard
          title="Total Bookings"
          value={metrics.totalBookings}
          icon={Calendar}
          isLoading={isLoading}
        />
        <SummaryCard
          title="Room Occupancy"
          value={`${(roomOccupancyRate * 100).toFixed(1)}%`}
          icon={Bed}
          isLoading={isLoading}
          description={`${metrics.rooms.occupied} occupied / ${metrics.rooms.available} available`}
        />
      </div>

      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
          <CardDescription>Distribution of users across different roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries(metrics.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">{role.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest system alerts and updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 rounded-lg border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest audit log entries</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href="/super-admin/logs">View all</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {activity.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {activity.map((log) => (
                    <div key={log.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{log.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.action}</p>
                      {log.hotelName && (
                        <p className="text-xs text-muted-foreground">
                          Hotel: {log.hotelName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <a href="/super-admin/hotels?action=create">Create Hotel</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/super-admin/users?action=create">Invite User</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/super-admin/backups">Run Full Backup</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

