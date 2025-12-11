import { useEffect, useMemo, useState } from 'react';
import { Activity, ShieldCheck, UserCheck, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { managerOperations } from '@/features/manager/mock';
import { toast } from 'sonner';

export function Operations() {
  const [overrideBookingId, setOverrideBookingId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('confirmed');
  const [overrideNote, setOverrideNote] = useState('');
  const [activityPage, setActivityPage] = useState(1);
  const [activitySearch, setActivitySearch] = useState('');

  const ACTIVITY_PAGE_SIZE = 6;

  const recentOps = useMemo(() => managerOperations, []);

  const activityTotalPages = Math.max(
    1,
    Math.ceil(
      recentOps.filter((op) => {
        if (!activitySearch.trim()) return true;
        return String(op.bookingId).includes(activitySearch.trim());
      }).length / ACTIVITY_PAGE_SIZE
    )
  );
  const activityPageData = useMemo(() => {
    const filtered = recentOps.filter((op) => {
      if (!activitySearch.trim()) return true;
      return String(op.bookingId).includes(activitySearch.trim());
    });
    const start = (activityPage - 1) * ACTIVITY_PAGE_SIZE;
    return filtered.slice(start, start + ACTIVITY_PAGE_SIZE);
  }, [recentOps, activityPage, activitySearch]);

  useEffect(() => {
    setActivityPage(1);
  }, [activitySearch]);
  const submitOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideBookingId) {
      toast.error('Enter a booking ID to override.');
      return;
    }
    toast.success(`Override queued for booking #${overrideBookingId}`);
    setOverrideNote('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations</h1>
        <p className="text-muted-foreground">
          Supervise receptionist actions and handle reservation overrides (mocked)
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
              <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <span>
                  Page {activityPage} of {activityTotalPages}
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
                    onClick={() => setActivityPage((p) => Math.min(activityTotalPages, p + 1))}
                    disabled={activityPage === activityTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityPageData.map((op) => (
              <div
                key={op.id}
                className="flex items-start justify-between rounded-lg border p-3 text-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{op.action}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Booking #{op.bookingId} · {op.details}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {op.receptionistName} · {new Date(op.timestamp).toLocaleString()}
                  </div>
                </div>
                <Badge
                  variant={op.status === 'flagged' ? 'destructive' : 'secondary'}
                  className="capitalize"
                >
                  {op.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card id="override">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Override reservation
            </CardTitle>
            <CardDescription>Manager-only override (local state only)</CardDescription>
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
              <Button type="submit">Queue override</Button>
              <p className="text-xs text-muted-foreground">
                This is a UI-only flow; connect to an API to apply overrides server-side.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

