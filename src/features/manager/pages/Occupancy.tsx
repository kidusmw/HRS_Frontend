import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Gauge, Hotel } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getOccupancy, getAlerts } from '@/features/manager/api/managerApi';
import { toast } from 'sonner';

export function Occupancy() {
  const [alertPage, setAlertPage] = useState(1);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertsMeta, setAlertsMeta] = useState<any>(null);
  const [loadingOccupancy, setLoadingOccupancy] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    const loadOccupancy = async () => {
      try {
        setLoadingOccupancy(true);
        const response = await getOccupancy();
        setOccupancy(response.data || []);
      } catch (error: any) {
        console.error('Failed to load occupancy:', error);
        toast.error(error.response?.data?.message || 'Failed to load occupancy');
      } finally {
        setLoadingOccupancy(false);
      }
    };
    loadOccupancy();
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoadingAlerts(true);
        const response = await getAlerts({ page: alertPage, per_page: 5 });
        setAlerts(response.data || []);
        setAlertsMeta(response.meta);
      } catch (error: any) {
        console.error('Failed to load alerts:', error);
        toast.error(error.response?.data?.message || 'Failed to load alerts');
      } finally {
        setLoadingAlerts(false);
      }
    };
    loadAlerts();
  }, [alertPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Occupancy & Alerts</h1>
        <p className="text-muted-foreground">Monitor occupancy and review system/hotel alerts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loadingOccupancy ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          occupancy.map((item) => (
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
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            System & Hotel Alerts
          </CardTitle>
          <CardDescription>Active alerts requiring attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingAlerts ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.severity === 'critical'
                            ? 'text-red-500'
                            : alert.severity === 'warning'
                              ? 'text-amber-500'
                              : 'text-blue-500'
                        }`}
                      />
                      <span className="font-semibold">{alert.message}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {alert.type} · {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="capitalize"
                    >
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {alert.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No alerts at this time.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {alertsMeta && alertsMeta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Page {alertsMeta.current_page} of {alertsMeta.last_page}
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
              onClick={() => setAlertPage((p) => Math.min(alertsMeta.last_page, p + 1))}
              disabled={alertPage === alertsMeta.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
