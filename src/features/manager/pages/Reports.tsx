import { useState } from 'react';
import { FileText, BarChart2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const predefinedReports = [
  { id: 'daily-occupancy', title: 'Daily Occupancy Report', description: 'Occupancy, ADR, RevPAR snapshot' },
  { id: 'revenue-room-type', title: 'Revenue by Room Type', description: 'Revenue split by room class' },
  { id: 'booking-source', title: 'Booking Source Breakdown', description: 'OTA vs direct vs walk-in' },
  { id: 'cancellation', title: 'Cancellation Trends', description: 'Cancel rate, lead time impact' },
];

export function Reports() {
  const [range, setRange] = useState('last-7');
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const handleGenerate = () => {
    const label =
      range === 'today'
        ? 'Today'
        : range === 'yesterday'
          ? 'Yesterday'
          : range === 'last-7'
            ? 'Last 7 days'
            : 'Last 30 days';
    setLastGenerated(label);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate high-level manager reports (mocked)</p>
        </div>
        <Button onClick={handleGenerate}>
          <Download className="mr-2 h-4 w-4" />
          Generate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report settings</CardTitle>
          <CardDescription>Select a preset range</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="sm:w-64">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {lastGenerated && (
            <Badge variant="secondary" className="w-fit">
              Generated for {lastGenerated}
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {predefinedReports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {report.title}
                </CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Uses mocked aggregates for now.</p>
              <p>• Replace with API data when backend endpoints are ready.</p>
              <Button variant="outline" size="sm">
                Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

