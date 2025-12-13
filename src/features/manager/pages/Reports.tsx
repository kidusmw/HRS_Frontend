import { useState } from 'react';
import { FileText, BarChart2, Download, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getReports, type ReportRange } from '@/features/manager/api/managerApi';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { downloadReportAsExcel } from '@/lib/reportToExcel';

const predefinedReports = [
  { id: 'daily-occupancy', title: 'Daily Occupancy Report', description: 'Occupancy, ADR, RevPAR snapshot' },
  { id: 'revenue-room-type', title: 'Revenue by Room Type', description: 'Revenue split by room class' },
  { id: 'booking-source', title: 'Booking Source Breakdown', description: 'OTA vs direct vs walk-in' },
  { id: 'cancellation', title: 'Cancellation Trends', description: 'Cancel rate, lead time impact' },
];

export function Reports() {
  const [range, setRange] = useState<ReportRange>('last_7_days');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await getReports({ range });
      setReportData(response.data);
    } catch (error: any) {
      console.error('Failed to load report:', error);
      toast.error(error.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [range]);

  const handleGenerate = () => {
    loadReport();
  };

  const handleDownload = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }
    try {
      downloadReportAsExcel(reportData, range);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  const rangeLabels: Record<ReportRange, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    six_months: '6 months',
    yearly: 'Yearly',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate high-level manager reports</p>
        </div>
        <div className="flex gap-2">
          {reportData && (
            <Button onClick={handleDownload} variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
          <Button onClick={handleGenerate} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Loading...' : 'Generate'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report settings</CardTitle>
          <CardDescription>Select a preset range</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <Select value={range} onValueChange={(v) => setRange(v as ReportRange)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_7_days">Last 7 days</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="six_months">6 months</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing data for: <span className="font-medium">{rangeLabels[range]}</span>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : reportData ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
                Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{reportData.occupancy?.rate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-muted-foreground">
                {reportData.occupancy?.roomsOccupied || 0} occupied / {reportData.occupancy?.roomsAvailable || 0} available
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">${reportData.revenue?.total?.toLocaleString() || 0}</div>
              {reportData.revenue?.byRoomType && reportData.revenue.byRoomType.length > 0 && (
                <div className="space-y-1 text-sm">
                  {reportData.revenue.byRoomType.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{item.type}:</span>
                      <span className="font-medium">${item.revenue?.toLocaleString() || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{reportData.bookings?.total || 0}</div>
              <div className="text-sm text-muted-foreground">
                Cancellations: {reportData.bookings?.cancellations || 0}
              </div>
              {reportData.bookings?.bySource && reportData.bookings.bySource.length > 0 && (
                <div className="space-y-1 text-sm">
                  {reportData.bookings.bySource.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{item.source}:</span>
                      <span className="font-medium">{item.count || 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ADR:</span>
                  <span className="font-medium">${reportData.metrics?.adr?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">RevPAR:</span>
                  <span className="font-medium">${reportData.metrics?.revpar?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Select a date range and click Generate to view reports.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
