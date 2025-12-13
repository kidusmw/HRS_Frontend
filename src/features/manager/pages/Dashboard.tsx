import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bed,
  Calendar,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardMetrics, getAlerts, getBookings, getOverrides } from '@/features/manager/api/managerApi';
import { toast } from 'sonner';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e2b6fcbc-3ef6-4016-afd7-573e5fddb1c8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:26',message:'loadData started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        const [metricsData, alertsData, bookingsData, overridesData] = await Promise.all([
          getDashboardMetrics(),
          getAlerts({ status: 'open', per_page: 5 }),
          getBookings({ per_page: 4 }),
          getOverrides({ per_page: 2 }),
        ]);
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e2b6fcbc-3ef6-4016-afd7-573e5fddb1c8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:35',message:'loadData all promises resolved',data:{hasMetrics:!!metricsData,hasAlerts:!!alertsData,hasBookings:!!bookingsData,hasOverrides:!!overridesData},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setMetrics(metricsData);
        setAlerts(alertsData.data || []);
        // Transform booking data
        const transformedBookings = (bookingsData.data || []).map((booking: any) => ({
          id: booking.id,
          guestName: booking.user?.name || 'Guest',
          roomNumber: booking.room?.number || 'N/A',
          roomType: booking.room?.type || 'N/A',
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          status: booking.status,
          amount: booking.total_amount || booking.room?.price || 0,
          channel: booking.source || 'web',
          createdAt: booking.created_at,
        }));
        setBookings(transformedBookings);
        setOverrides(overridesData.data || []);
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/e2b6fcbc-3ef6-4016-afd7-573e5fddb1c8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.tsx:55',message:'loadData error caught',data:{status:error.response?.status,statusText:error.response?.statusText,message:error.message,url:error.config?.url,responseData:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.error('Failed to load dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const bookingSummary = {
    total: bookings.length,
    byStatus: {
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      checked_in: bookings.filter((b) => b.status === 'checked_in').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            High-level overview of bookings, occupancy, alerts, and operations
          </p>
        </div>
        <Button asChild>
          <Link to="/manager/bookings">Go to bookings</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingSummary.total}</div>
            <p className="text-xs text-muted-foreground">Recent bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In-house / Arrivals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.kpis?.activeReservationsToday || 0} / {metrics?.kpis?.upcomingCheckins || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active today / Upcoming check-ins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy (today)</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.kpis?.occupancyPct?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.kpis?.roomsAvailable || 0} available rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.alertsOpen || alerts.length}</div>
            <p className="text-xs text-muted-foreground">Open / acknowledged alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking highlights</CardTitle>
            <CardDescription>Recent activity and status mix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Status mix:</span>
              <span>Confirmed {bookingSummary.byStatus.confirmed}</span>
              <span>Pending {bookingSummary.byStatus.pending}</span>
              <span>Checked-in {bookingSummary.byStatus.checked_in}</span>
              <span>Cancelled {bookingSummary.byStatus.cancelled}</span>
            </div>
            <div className="space-y-2">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-semibold">{b.guestName}</div>
                    <div className="text-muted-foreground">
                      #{b.id} · {b.roomType} · {b.checkIn} → {b.checkOut}
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {b.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" asChild size="sm">
              <Link to="/manager/bookings">View all bookings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts & operations</CardTitle>
            <CardDescription>What needs your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-semibold">{alert.message}</div>
                    <div className="text-muted-foreground">
                      {alert.type} · {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge
                    className="capitalize"
                    variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                Recent Overrides
              </div>
              {overrides.slice(0, 2).map((ov) => (
                <div key={ov.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-semibold">Override #{ov.id}</div>
                  <div className="text-muted-foreground">
                    Booking #{ov.reservation_id} · Status: {ov.new_status}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild size="sm">
                <Link to="/manager/occupancy">View alerts</Link>
              </Button>
              <Button variant="secondary" asChild size="sm">
                <Link to="/manager/operations#override">Manage overrides</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

