import { useEffect, useState } from 'react';
import { Clock, ShieldCheck, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getOverrides } from '@/features/manager/api/managerApi';
import { toast } from 'sonner';

export function Overrides() {
  const [overrides, setOverrides] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadOverrides = async () => {
      try {
        setLoading(true);
        const params: any = {
          page,
          per_page: 10,
        };
        if (search) {
          const bookingId = parseInt(search);
          if (!isNaN(bookingId)) {
            params.booking_id = bookingId;
          }
        }
        const response = await getOverrides(params);
        setOverrides(response.data || []);
        setMeta(response.meta);
      } catch (error: any) {
        console.error('Failed to load overrides:', error);
        toast.error(error.response?.data?.message || 'Failed to load overrides');
      } finally {
        setLoading(false);
      }
    };
    loadOverrides();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overrides</h1>
        <p className="text-muted-foreground">
          List of overridden reservations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Search by booking ID</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Override history</CardTitle>
          <CardDescription>Manager overrides with timestamps and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <>
              {overrides.map((ov) => (
                <div
                  key={ov.id}
                  className="flex items-start justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        Booking #{ov.reservation_id}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      New status: <Badge variant="secondary" className="capitalize">{ov.new_status}</Badge>
                    </div>
                    {ov.note && (
                      <div className="text-muted-foreground">{ov.note}</div>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(ov.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {overrides.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No overrides found.
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
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
    </div>
  );
}
