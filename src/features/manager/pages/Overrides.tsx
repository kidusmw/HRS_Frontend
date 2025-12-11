import { Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { managerOperations } from '@/features/manager/mock';

export function Overrides() {
  const overrides = managerOperations.filter((op) => op.type === 'override');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overrides</h1>
        <p className="text-muted-foreground">
          List of overridden reservations (mock data)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Override history</CardTitle>
          <CardDescription>Manager overrides with timestamps and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {overrides.map((ov) => (
            <div
              key={ov.id}
              className="flex items-start justify-between rounded-lg border p-3 text-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    Booking #{ov.bookingId}
                  </span>
                </div>
                <div className="text-muted-foreground">{ov.details}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(ov.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  By: {ov.receptionistName}
                </div>
              </div>
              <Badge
                variant={ov.status === 'flagged' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {ov.status}
              </Badge>
            </div>
          ))}
          {overrides.length === 0 && (
            <div className="text-sm text-muted-foreground">No overrides recorded.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

