import { useState, useEffect } from 'react';
import {
  Calendar,
  Bed,
  LogIn,
  LogOut,
  Users,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardMetrics, getReservations, type ReceptionistReservation } from '../api/receptionistApi';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [todayArrivals, setTodayArrivals] = useState<ReceptionistReservation[]>([]);
  const [todayDepartures, setTodayDepartures] = useState<ReceptionistReservation[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        
        console.log('[Dashboard] Loading dashboard data, today:', today);
        
        // Load dashboard metrics
        const metricsData = await getDashboardMetrics();
        console.log('[Dashboard] Metrics data:', metricsData);
        setMetrics(metricsData);

        // Load today's arrivals
        // Get reservations with check-in date today and status pending or confirmed
        // (matching the backend dashboard metrics query)
        const arrivalsData = await getReservations({
          status: 'all',
          date_from: today,
          date_to: today,
          per_page: 100,
        });
        console.log('[Dashboard] Arrivals API response:', arrivalsData);
        console.log('[Dashboard] Arrivals raw data:', arrivalsData.data);
        
        // Normalize dates for comparison - extract just the date part
        // Show arrivals that are checking in today and are pending or confirmed
        // (matching backend logic: whereIn('status', ['pending', 'confirmed']))
        const arrivals = (arrivalsData.data || []).filter((r) => {
          const checkInDate = r.check_in?.split('T')[0] || r.check_in;
          const isToday = checkInDate === today;
          const isRelevantStatus = ['pending', 'confirmed'].includes(r.status);
          const matches = isToday && isRelevantStatus;
          console.log('[Dashboard] Arrival filter:', {
            reservationId: r.id,
            checkIn: r.check_in,
            normalizedCheckIn: checkInDate,
            today,
            status: r.status,
            isWalkIn: (r as any).is_walk_in ?? (r as any).isWalkIn ?? 'not found',
            isToday,
            isRelevantStatus,
            matches,
          });
          return matches;
        });
        console.log('[Dashboard] Filtered arrivals:', arrivals);
        setTodayArrivals(arrivals);

        // Load today's departures (checked-in guests with check-out today)
        const departuresData = await getReservations({
          status: 'checked_in',
          per_page: 100,
        });
        console.log('[Dashboard] Departures API response:', departuresData);
        console.log('[Dashboard] Departures raw data:', departuresData.data);
        
        const departures = (departuresData.data || []).filter((r) => {
          const checkOutDate = r.check_out?.split('T')[0] || r.check_out;
          const matches = checkOutDate === today && r.status === 'checked_in';
          console.log('[Dashboard] Departure filter:', {
            reservationId: r.id,
            checkOut: r.check_out,
            normalizedCheckOut: checkOutDate,
            today,
            status: r.status,
            matches,
          });
          return matches;
        });
        console.log('[Dashboard] Filtered departures:', departures);
        setTodayDepartures(departures);

        // Get pending and confirmed counts
        const allReservations = await getReservations({ status: 'all', per_page: 100 });
        console.log('[Dashboard] All reservations:', allReservations.data);
        const pending = (allReservations.data || []).filter((r) => r.status === 'pending').length;
        const confirmed = (allReservations.data || []).filter((r) => r.status === 'confirmed').length;
        console.log('[Dashboard] Pending count:', pending, 'Confirmed count:', confirmed);
        setPendingCount(pending);
        setConfirmedCount(confirmed);
      } catch (error: any) {
        console.error('[Dashboard] Failed to load dashboard data:', error);
        console.error('[Dashboard] Error details:', error.response?.data);
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

  const occupancy = metrics?.occupancy || {
    rate: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receptionist Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of today's operations and quick actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/receptionist/reservations?action=walkin">
              <Plus className="mr-2 h-4 w-4" />
              Walk-in Booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Arrivals</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.arrivals || 0}</div>
            <p className="text-xs text-muted-foreground">Guests checking in today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Departures</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.departures || 0}</div>
            <p className="text-xs text-muted-foreground">Guests checking out today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In-House</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.inHouse || 0}</div>
            <p className="text-xs text-muted-foreground">Currently checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancy.rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {occupancy.occupiedRooms} of {occupancy.totalRooms} rooms occupied
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Arrivals</CardTitle>
            <CardDescription>Guests expected to check in today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayArrivals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No arrivals scheduled for today
              </p>
            ) : (
              todayArrivals.map((arrival) => {
                const checkInDate = arrival.check_in ? format(new Date(arrival.check_in), 'MMM d, yyyy') : 'N/A';
                const canCheckIn = arrival.status === 'pending' || arrival.status === 'confirmed';
                
                return (
                  <div
                    key={arrival.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{arrival.user?.name || 'Guest'}</div>
                      <div className="text-muted-foreground">
                        Room {arrival.room?.id || 'N/A'} · {arrival.room?.type || 'N/A'} · {checkInDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {arrival.status.replace('_', ' ')}
                      </Badge>
                      {canCheckIn && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/receptionist/reservations?action=checkin&id=${arrival.id}`}>
                            Check In
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <Button variant="outline" asChild size="sm" className="w-full">
              <Link to="/receptionist/reservations">View All Reservations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Departures</CardTitle>
            <CardDescription>Guests checking out today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayDepartures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No departures scheduled for today
              </p>
            ) : (
              todayDepartures.map((departure) => {
                const checkOutDate = departure.check_out ? format(new Date(departure.check_out), 'MMM d, yyyy') : 'N/A';
                
                return (
                  <div
                    key={departure.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{departure.user?.name || 'Guest'}</div>
                      <div className="text-muted-foreground">
                        Room {departure.room?.id || 'N/A'} · {departure.room?.type || 'N/A'} · {checkOutDate}
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/receptionist/reservations?action=checkout&id=${departure.id}`}>
                        Check Out
                      </Link>
                    </Button>
                  </div>
                );
              })
            )}
            <Button variant="outline" asChild size="sm" className="w-full">
              <Link to="/receptionist/reservations">View All Reservations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Room Status Summary</CardTitle>
            <CardDescription>Current room availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Available</span>
              </div>
              <Badge variant="default">{occupancy.availableRooms}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Occupied</span>
              </div>
              <Badge variant="secondary">{occupancy.occupiedRooms}</Badge>
            </div>
            <Button variant="outline" asChild size="sm" className="w-full mt-4">
              <Link to="/receptionist/rooms">Manage Rooms</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reservation Status</CardTitle>
            <CardDescription>Pending and confirmed reservations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Pending</span>
              </div>
              <Badge variant="outline">{pendingCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Confirmed</span>
              </div>
              <Badge variant="default">{confirmedCount}</Badge>
            </div>
            <Button variant="outline" asChild size="sm" className="w-full mt-4">
              <Link to="/receptionist/reservations">View All Reservations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

