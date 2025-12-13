import { useEffect, useState } from 'react';
import { Search, Filter, CalendarRange, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getBookings, type ManagerBookingStatus } from '@/features/manager/api/managerApi';
import { toast } from 'sonner';

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
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          per_page: 10,
        };
        if (search) params.search = search;
        if (status !== 'all') params.status = status;
        const response = await getBookings(params);
        // Transform backend data to frontend format
        const transformed = (response.data || []).map((booking: any) => ({
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
        setBookings(transformed);
        setMeta(response.meta);
      } catch (error: any) {
        console.error('Failed to load bookings:', error);
        toast.error(error.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [search, status, page]);

  const summary = {
    total: meta?.total || 0,
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
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Overview, search, and filter bookings
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 md:w-1/3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={(v) => {
              setStatus(v as ManagerBookingStatus | 'all');
              setPage(1);
            }}>
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
          <CardDescription>Latest bookings</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
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
                  {bookings.map((b) => (
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
                          {statusLabels[b.status] || b.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{b.channel}</TableCell>
                      <TableCell>${b.amount?.toLocaleString() || '0'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(b.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No bookings match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-xs text-muted-foreground">
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                      disabled={page === meta.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
