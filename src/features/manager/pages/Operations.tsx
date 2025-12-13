import { useEffect, useState } from 'react';
import { Activity, ShieldCheck, UserCheck, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getOverrides, createOverride } from '@/features/manager/api/managerApi';
import { toast } from 'sonner';

export function Operations() {
  const [overrideBookingId, setOverrideBookingId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('confirmed');
  const [overrideNote, setOverrideNote] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activitySearch, setActivitySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [activityMeta, setActivityMeta] = useState<any>(null);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        setActivityLoading(true);
        const params: any = {
          page: activityPage,
          per_page: 6,
        };
        if (activitySearch) {
          const bookingId = parseInt(activitySearch);
          if (!isNaN(bookingId)) {
            params.booking_id = bookingId;
          }
        }
        const response = await getOverrides(params);
        setActivities(response.data || []);
        setActivityMeta(response.meta);
      } catch (error: any) {
        console.error('Failed to load activities:', error);
        toast.error(error.response?.data?.message || 'Failed to load activities');
      } finally {
        setActivityLoading(false);
      }
    };
    loadActivities();
  }, [activityPage, activitySearch]);

  useEffect(() => {
    setActivityPage(1);
  }, [activitySearch]);

  const submitOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideBookingId) {
      toast.error('Enter a booking ID to override.');
      return;
    }
    try {
      setLoading(true);
      await createOverride({
        booking_id: parseInt(overrideBookingId),
        new_status: overrideStatus as any,
        note: overrideNote || undefined,
      });
      toast.success(`Override created for booking #${overrideBookingId}`);
      setOverrideBookingId('');
      setOverrideStatus('confirmed');
      setOverrideNote('');
      // Reload activities
      const response = await getOverrides({ page: 1, per_page: 6 });
      setActivities(response.data || []);
      setActivityMeta(response.meta);
    } catch (error: any) {
      console.error('Failed to create override:', error);
      toast.error(error.response?.data?.message || 'Failed to create override');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations</h1>
        <p className="text-muted-foreground">
          Supervise receptionist actions and handle reservation overrides
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Receptionist activity
              </CardTitle>
              <CardDescription>Recent operational actions</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search booking ID"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {activityMeta && activityMeta.last_page > 1 && (
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                  <span>
                    Page {activityMeta.current_page} of {activityMeta.last_page}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      disabled={activityPage === 1}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActivityPage((p) => Math.min(activityMeta.last_page, p + 1))}
                      disabled={activityPage === activityMeta.last_page}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <>
                {activities.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-start justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Override</span>
                      </div>
                      <div className="text-muted-foreground">
                        Booking #{op.reservation_id} · Status: {op.new_status}
                      </div>
                      {op.note && (
                        <div className="text-muted-foreground">{op.note}</div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(op.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      Override
                    </Badge>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No recent activities.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card id="override">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Override reservation
            </CardTitle>
            <CardDescription>Manager-only override</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submitOverride}>
              <div className="space-y-2">
                <Label htmlFor="booking-id">Booking ID</Label>
                <Input
                  id="booking-id"
                  placeholder="e.g. 103"
                  value={overrideBookingId}
                  onChange={(e) => setOverrideBookingId(e.target.value)}
                  required
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">New status</Label>
                <Select value={overrideStatus} onValueChange={setOverrideStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="checked_in">Checked in</SelectItem>
                    <SelectItem value="checked_out">Checked out</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Reason for override..."
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create override'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
