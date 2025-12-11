import { useMemo, useState } from 'react';
import { Search, Filter, CalendarRange, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { managerBookings, type ManagerBookingStatus, summarizeBookings } from '@/features/manager/mock';

const statusLabels: Record<ManagerBookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  checked_in: 'Checked in',
  checked_out: 'Checked out',
  cancelled: 'Cancelled',
};

export function Bookings() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ManagerBookingStatus | 'all'>('all');

  const summary = summarizeBookings(managerBookings);

  const filtered = useMemo(() => {
    return managerBookings.filter((b) => {
      const matchesSearch =
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.roomType.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' ? true : b.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Overview, search, and filter bookings (mock data)
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
            <CardDescription>All active bookings</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{summary.total}</CardContent>
        </Card>
        {(['confirmed', 'pending', 'checked_in', 'cancelled'] as ManagerBookingStatus[]).map(
          (key) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{statusLabels[key]}</CardTitle>
                <CardDescription>Current count</CardDescription>
              </CardHeader>
              <CardContent className="text-2xl font-bold">{summary.byStatus[key]}</CardContent>
            </Card>
          )
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & filter</CardTitle>
          <CardDescription>Filter by guest, room, or status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guest, room, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 md:w-1/3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={(v) => setStatus(v as ManagerBookingStatus | 'all')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(['confirmed', 'pending', 'checked_in', 'checked_out', 'cancelled'] as const).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking history</CardTitle>
          <CardDescription>Latest bookings (mock)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>#{b.id}</TableCell>
                  <TableCell>{b.guestName}</TableCell>
                  <TableCell>
                    {b.roomNumber} · {b.roomType}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarRange className="h-4 w-4" />
                      {b.checkIn} → {b.checkOut}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {statusLabels[b.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{b.channel}</TableCell>
                  <TableCell>${b.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(b.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No bookings match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

