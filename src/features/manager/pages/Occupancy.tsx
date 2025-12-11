import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, Gauge, Hotel } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { managerAlerts, managerOccupancy } from '@/features/manager/mock';
import { Button } from '@/components/ui/button';

export function Occupancy() {
  const [alertPage, setAlertPage] = useState(1);
  const ALERT_PAGE_SIZE = 5;

  const alertTotalPages = Math.max(1, Math.ceil(managerAlerts.length / ALERT_PAGE_SIZE));
  const alertPageData = useMemo(() => {
    const start = (alertPage - 1) * ALERT_PAGE_SIZE;
    return managerAlerts.slice(start, start + ALERT_PAGE_SIZE);
  }, [alertPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Occupancy & Alerts</h1>
        <p className="text-muted-foreground">Monitor occupancy and review system/hotel alerts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {managerOccupancy.map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </CardTitle>
              <CardDescription>
                {item.roomsOccupied} occupied / {item.roomsAvailable} available
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{item.occupancyRate}%</div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${item.occupancyRate}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Alerts
          </CardTitle>
          <CardDescription>System and hotel alerts (mocked)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertPageData.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between rounded-lg border p-3 text-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {alert.severity === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Hotel className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-semibold capitalize">
                    {alert.type} · {alert.severity}
                  </span>
                </div>
                <div className="text-muted-foreground">{alert.message}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
              <Badge
                variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                className="capitalize"
              >
                {alert.status}
              </Badge>
            </div>
          ))}
          {managerAlerts.length === 0 && (
            <div className="text-sm text-muted-foreground">No alerts.</div>
          )}
          {managerAlerts.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {alertPage} of {alertTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlertPage((p) => Math.max(1, p - 1))}
                  disabled={alertPage === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAlertPage((p) => Math.min(alertTotalPages, p + 1))}
                  disabled={alertPage === alertTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

