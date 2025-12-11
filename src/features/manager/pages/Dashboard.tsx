import {
  Activity,
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
import {
  managerAlerts,
  managerBookings,
  managerOccupancy,
  managerOperations,
  summarizeBookings,
} from '@/features/manager/mock';

export function Dashboard() {
  const bookingSummary = summarizeBookings(managerBookings);
  const todayOccupancy = managerOccupancy.find((o) => o.label === 'Today') || managerOccupancy[0];
  const openAlerts = managerAlerts.filter((a) => a.status !== 'resolved');
  const flaggedOps = managerOperations.filter((op) => op.status === 'flagged');

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
            <p className="text-xs text-muted-foreground">Across all channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In-house / Arrivals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingSummary.byStatus.checked_in} / {bookingSummary.byStatus.confirmed}
            </div>
            <p className="text-xs text-muted-foreground">Checked-in vs confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy (today)</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOccupancy.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {todayOccupancy.roomsOccupied} occupied / {todayOccupancy.roomsAvailable} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openAlerts.length}</div>
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
              {managerBookings.slice(0, 4).map((b) => (
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
              {openAlerts.slice(0, 3).map((alert) => (
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
                Overrides & flagged items
              </div>
              {flaggedOps.slice(0, 2).map((op) => (
                <div key={op.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-semibold">{op.action}</div>
                  <div className="text-muted-foreground">
                    Booking #{op.bookingId} · {op.details}
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

