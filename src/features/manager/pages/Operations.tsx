import { useMemo, useState } from 'react';
import { Activity, ShieldCheck, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { managerOperations } from '@/features/manager/mock';
import { toast } from 'sonner';

export function Operations() {
  const [overrideBookingId, setOverrideBookingId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState('confirmed');
  const [overrideNote, setOverrideNote] = useState('');

  const recentOps = useMemo(() => managerOperations.slice(0, 6), []);

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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              Receptionist activity
            </CardTitle>
            <CardDescription>Recent operational actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOps.map((op) => (
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
                <Input
                  id="status"
                  placeholder="confirmed / pending / checked_in"
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                />
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

