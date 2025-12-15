import { useState, useEffect } from 'react';
import {
  Calendar,
  Bed,
  LogIn,
  LogOut,
  Users,
  Clock,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { mockReservations, mockRooms, type MockReservation } from '../mockData';

export function Dashboard() {
  const [todayArrivals, setTodayArrivals] = useState<MockReservation[]>([]);
  const [todayDepartures, setTodayDepartures] = useState<MockReservation[]>([]);
  const [inHouse, setInHouse] = useState<MockReservation[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's arrivals
    const arrivals = mockReservations.filter(
      (r) => r.checkIn === today && (r.status === 'confirmed' || r.status === 'pending')
    );
    setTodayArrivals(arrivals);

    // Today's departures
    const departures = mockReservations.filter(
      (r) => r.checkOut === today && (r.status === 'checked_in')
    );
    setTodayDepartures(departures);

    // Currently in-house
    const inHouseGuests = mockReservations.filter((r) => r.status === 'checked_in');
    setInHouse(inHouseGuests);
  }, []);

  const totalRooms = mockRooms.length;
  const occupiedRooms = mockRooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = mockRooms.filter((r) => r.status === 'available').length;
  const maintenanceRooms = mockRooms.filter((r) => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

  const pendingReservations = mockReservations.filter((r) => r.status === 'pending').length;
  const confirmedReservations = mockReservations.filter((r) => r.status === 'confirmed').length;

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
            <div className="text-2xl font-bold">{todayArrivals.length}</div>
            <p className="text-xs text-muted-foreground">Guests checking in today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Departures</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDepartures.length}</div>
            <p className="text-xs text-muted-foreground">Guests checking out today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In-House</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inHouse.length}</div>
            <p className="text-xs text-muted-foreground">Currently checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {occupiedRooms} of {totalRooms} rooms occupied
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
              todayArrivals.map((arrival) => (
                <div
                  key={arrival.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-semibold">{arrival.guestName}</div>
                    <div className="text-muted-foreground">
                      Room {arrival.roomNumber} · {arrival.roomType} · Check-in: {arrival.checkIn}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {arrival.status}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/receptionist/reservations?action=checkin&id=${arrival.id}`}>
                        Check In
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
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
              todayDepartures.map((departure) => (
                <div
                  key={departure.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-semibold">{departure.guestName}</div>
                    <div className="text-muted-foreground">
                      Room {departure.roomNumber} · Check-out: {departure.checkOut}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/receptionist/reservations?action=checkout&id=${departure.id}`}>
                      Check Out
                    </Link>
                  </Button>
                </div>
              ))
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
              <Badge variant="default">{availableRooms}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Occupied</span>
              </div>
              <Badge variant="secondary">{occupiedRooms}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Maintenance</span>
              </div>
              <Badge variant="outline">{maintenanceRooms}</Badge>
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
              <Badge variant="outline">{pendingReservations}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Confirmed</span>
              </div>
              <Badge variant="default">{confirmedReservations}</Badge>
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

