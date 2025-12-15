import { useState, useEffect } from 'react';
import { FileText, Users, Bed, LogIn, LogOut, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockReservations, mockRooms } from '../mockData';
import { downloadReceptionistReportAsExcel } from '@/lib/reportToExcel';
import { toast } from 'sonner';

type ReportRange = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days';

const rangeLabels: Record<ReportRange, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 days',
  last_30_days: 'Last 30 days',
};

export function Reports() {
  const [range, setRange] = useState<ReportRange>('today');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    generateReport();
  }, [range]);

  const generateReport = () => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_30_days':
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Filter reservations by date range
    const arrivals = mockReservations.filter(
      (r) => r.checkIn >= startDateStr && r.checkIn <= endDateStr
    );
    const departures = mockReservations.filter(
      (r) => r.checkOut >= startDateStr && r.checkOut <= endDateStr && r.status === 'checked_out'
    );
    const inHouse = mockReservations.filter((r) => r.status === 'checked_in');

    // Calculate occupancy
    const totalRooms = mockRooms.length;
    const occupiedRooms = mockRooms.filter((r) => r.status === 'occupied').length;
    const availableRooms = mockRooms.filter((r) => r.status === 'available').length;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

    // Group by date for daily breakdown
    const arrivalsByDate: Record<string, number> = {};
    const departuresByDate: Record<string, number> = {};

    arrivals.forEach((r) => {
      const date = r.checkIn;
      arrivalsByDate[date] = (arrivalsByDate[date] || 0) + 1;
    });

    departures.forEach((r) => {
      const date = r.checkOut;
      departuresByDate[date] = (departuresByDate[date] || 0) + 1;
    });

    setReportData({
      arrivals: {
        total: arrivals.length,
        byDate: arrivalsByDate,
        list: arrivals,
      },
      departures: {
        total: departures.length,
        byDate: departuresByDate,
        list: departures,
      },
      inHouse: {
        total: inHouse.length,
        list: inHouse,
      },
      occupancy: {
        rate: parseFloat(occupancyRate),
        totalRooms,
        occupiedRooms,
        availableRooms,
      },
      dateRange: {
        start: startDateStr,
        end: endDateStr,
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!reportData) {
      toast.error('Please generate a report first');
      return;
    }
    try {
      downloadReceptionistReportAsExcel(reportData, range);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operational Reports</h1>
          <p className="text-muted-foreground">
            Daily summaries, check-in/out lists, and occupancy status
          </p>
        </div>
        <div className="flex gap-2">
          {reportData && (
            <>
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Select a date range for the report</CardDescription>
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
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing data for: <span className="font-medium">{rangeLabels[range]}</span>
            {reportData && (
              <span className="ml-2">
                ({reportData.dateRange.start} to {reportData.dateRange.end})
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Arrivals</CardTitle>
                <LogIn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.arrivals.total}</div>
                <p className="text-xs text-muted-foreground">Check-ins in period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departures</CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.departures.total}</div>
                <p className="text-xs text-muted-foreground">Check-outs in period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In-House</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.inHouse.total}</div>
                <p className="text-xs text-muted-foreground">Currently checked in</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.occupancy.rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {reportData.occupancy.occupiedRooms} of {reportData.occupancy.totalRooms} rooms
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Check-in List</CardTitle>
                <CardDescription>Guests checking in during the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.arrivals.list.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No arrivals in this period
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.arrivals.list.map((arrival: any) => (
                        <TableRow key={arrival.id}>
                          <TableCell className="font-medium">{arrival.guestName}</TableCell>
                          <TableCell>{arrival.roomNumber}</TableCell>
                          <TableCell>{arrival.checkIn}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {arrival.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-out List</CardTitle>
                <CardDescription>Guests checking out during the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {reportData.departures.list.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No departures in this period
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Check-out</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.departures.list.map((departure: any) => (
                        <TableRow key={departure.id}>
                          <TableCell className="font-medium">{departure.guestName}</TableCell>
                          <TableCell>{departure.roomNumber}</TableCell>
                          <TableCell>{departure.checkOut}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Occupancy Status</CardTitle>
              <CardDescription>Real-time room occupancy information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Available Rooms</div>
                    <div className="text-2xl font-bold">{reportData.occupancy.availableRooms}</div>
                  </div>
                  <Bed className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Occupied Rooms</div>
                    <div className="text-2xl font-bold">{reportData.occupancy.occupiedRooms}</div>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Occupancy Rate</div>
                    <div className="text-2xl font-bold">{reportData.occupancy.rate}%</div>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {reportData.inHouse.list.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>In-House Guests</CardTitle>
                <CardDescription>Currently checked-in guests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check-in Date</TableHead>
                      <TableHead>Check-out Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.inHouse.list.map((guest: any) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">{guest.guestName}</TableCell>
                        <TableCell>{guest.roomNumber}</TableCell>
                        <TableCell>{guest.checkIn}</TableCell>
                        <TableCell>{guest.checkOut}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Select a date range to generate a report.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

