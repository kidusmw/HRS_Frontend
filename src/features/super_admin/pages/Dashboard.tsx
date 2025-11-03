import { useState, useEffect } from 'react';
import { Building2, Users, Calendar, Bed, TrendingUp } from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { DashboardMetrics, AuditLogItem, NotificationItem } from '@/types/admin';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getDashboardMetrics, getNotifications, getLogs } from '../api/superAdminApi';
import { toast } from 'sonner';

// Mock booking data for chart (last 6 months)
const bookingChartData = [
  { month: 'Jan', bookings: 245, revenue: 45200 },
  { month: 'Feb', bookings: 312, revenue: 58700 },
  { month: 'Mar', bookings: 289, revenue: 53400 },
  { month: 'Apr', bookings: 356, revenue: 67100 },
  { month: 'May', bookings: 423, revenue: 79800 },
  { month: 'Jun', bookings: 398, revenue: 75100 },
];

// Mock room occupancy data for chart (last 6 months)
const occupancyChartData = [
  { month: 'Jan', occupied: 120, available: 380 },
  { month: 'Feb', occupied: 145, available: 355 },
  { month: 'Mar', occupied: 138, available: 362 },
  { month: 'Apr', occupied: 162, available: 338 },
  { month: 'May', occupied: 175, available: 325 },
  { month: 'Jun', occupied: 158, available: 342 },
];

const bookingChartConfig = {
  bookings: {
    label: 'Bookings',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

const occupancyChartConfig = {
  occupied: {
    label: 'Occupied',
    color: 'var(--chart-3)',
  },
  available: {
    label: 'Available',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activity, setActivity] = useState<AuditLogItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [metricsData, notificationsData, logsData] = await Promise.all([
          getDashboardMetrics(),
          getNotifications({ limit: 10 }).catch(() => ({ data: [] })),
          getLogs({ page: 1, perPage: 10 }).catch(() => ({ data: [] })),
        ]);
        setMetrics(metricsData);
        setNotifications(notificationsData?.data || []);
        setActivity(logsData?.data || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const roomOccupancyRate =
    metrics.rooms.occupied + metrics.rooms.available > 0
      ? metrics.rooms.occupied / (metrics.rooms.available + metrics.rooms.occupied)
      : 0;

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

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bookings Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Booking Trends</CardTitle>
                <CardDescription>Total bookings over the last 6 months</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bookingChartConfig} className="min-h-[200px] w-full">
              <AreaChart
                accessibilityLayer
                data={bookingChartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="bookings"
                  type="natural"
                  fill="var(--color-bookings)"
                  fillOpacity={0.4}
                  stroke="var(--color-bookings)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Room Occupancy Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Room Occupancy</CardTitle>
                <CardDescription>Occupied vs available rooms over time</CardDescription>
              </div>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={occupancyChartConfig} className="min-h-[200px] w-full">
              <AreaChart
                accessibilityLayer
                data={occupancyChartData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="occupied"
                  type="natural"
                  fill="var(--color-occupied)"
                  fillOpacity={0.4}
                  stroke="var(--color-occupied)"
                  stackId="a"
                />
                <Area
                  dataKey="available"
                  type="natural"
                  fill="var(--color-available)"
                  fillOpacity={0.4}
                  stroke="var(--color-available)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
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
              {!notifications || notifications.length === 0 ? (
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
              {!activity || activity.length === 0 ? (
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

