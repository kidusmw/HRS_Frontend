import { useState, useEffect } from 'react';
import { Percent, Bed, Calendar, CalendarCheck, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { KpiCard } from '../components/KpiCard';
import { NotificationsPanel } from '../components/NotificationsPanel';
import { getDashboardMetrics, getAdminNotifications } from '../api/adminApi';
import type { NotificationItem } from '@/types/admin';
import { toast } from 'sonner';

const bookingsChartConfig = {
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

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<{
    occupancyPct: number;
    occupancyChangeFromLastMonth?: number;
    occupancyChangeFormatted?: string;
    roomsAvailable: number;
    activeReservationsToday: number;
    upcomingCheckins: number;
  } | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [bookingsTrend, setBookingsTrend] = useState<
    Array<{ month: string; bookings: number }>
  >([]);
  const [weeklyOccupancy, setWeeklyOccupancy] = useState<
    Array<{ week: string; occupied: number; available: number }>
  >([]);
  const [revenueTrend, setRevenueTrend] = useState<
    Array<{ month: string; revenue: number }>
  >([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard metrics from API
        const metrics = await getDashboardMetrics();
        
        setKpis(metrics.kpis);
        setMonthlyRevenue(metrics.monthlyRevenue);
        setBookingsTrend(metrics.bookingTrends);
        setWeeklyOccupancy(metrics.weeklyOccupancy);
        setRevenueTrend(metrics.revenueTrends);
        
        const notifResp = await getAdminNotifications({ limit: 10 });
        setNotifications(notifResp.data || []);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to load dashboard data';
        toast.error(errorMessage);
        // Keep using mock data as fallback
        setKpis({
          occupancyPct: 0,
          roomsAvailable: 0,
          activeReservationsToday: 0,
          upcomingCheckins: 0,
        });
        setMonthlyRevenue(0);
        setBookingsTrend([]);
        setWeeklyOccupancy([]);
        setRevenueTrend([]);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your hotel operations and analytics
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Occupancy %"
          value={`${kpis?.occupancyPct.toFixed(1)}%`}
          icon={Percent}
          delta={
            kpis?.occupancyChangeFormatted
              ? `${kpis.occupancyChangeFormatted}% from last month`
              : undefined
          }
          deltaType={
            kpis?.occupancyChangeFromLastMonth !== undefined
              ? kpis.occupancyChangeFromLastMonth >= 0
                ? 'positive'
                : 'negative'
              : 'neutral'
          }
          tooltip="Current hotel occupancy rate"
        />
        <KpiCard
          title="Rooms Available"
          value={kpis?.roomsAvailable || 0}
          icon={Bed}
          delta={`${kpis?.roomsAvailable || 0} rooms ready`}
          deltaType="neutral"
          tooltip="Available rooms for booking"
        />
        <KpiCard
          title="Active Reservations (Today)"
          value={kpis?.activeReservationsToday || 0}
          icon={Calendar}
          delta="8 check-ins today"
          deltaType="neutral"
          tooltip="Reservations active today"
        />
        <KpiCard
          title="Upcoming Check-ins"
          value={kpis?.upcomingCheckins || 0}
          icon={CalendarCheck}
          delta="Next 24 hours"
          deltaType="neutral"
          tooltip="Scheduled check-ins"
        />
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monthly Revenue
          </CardTitle>
          <CardDescription>Current month revenue summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${monthlyRevenue?.toLocaleString() || '0'}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Revenue for the current month
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bookings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends (6 Months)</CardTitle>
            <CardDescription>Monthly booking statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={bookingsChartConfig} className="min-h-[200px] w-full">
              <AreaChart data={bookingsTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Occupancy</CardTitle>
            <CardDescription>Room occupancy by week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={occupancyChartConfig} className="min-h-[200px] w-full">
              <BarChart data={weeklyOccupancy}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="occupied" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (6 Months)</CardTitle>
          <CardDescription>Monthly revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="min-h-[200px] w-full">
            <AreaChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Notifications */}
      <NotificationsPanel notifications={notifications} isLoading={false} />
    </div>
  );
}

