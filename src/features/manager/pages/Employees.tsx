import { useMemo, useState } from 'react';
import { Users, Filter, CalendarDays, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { managerEmployees, managerAttendance } from '@/features/manager/mock';
import { Input } from '@/components/ui/input';

export function Employees() {
  const [selectedDate, setSelectedDate] = useState('2025-12-11');

  const supervised = useMemo(
    () => managerEmployees.filter((emp) => emp.underSupervision),
    []
  );
  const others = useMemo(
    () => managerEmployees.filter((emp) => !emp.underSupervision),
    []
  );

  const attendanceForDate = useMemo(
    () =>
      managerAttendance.filter(
        (a) =>
          a.date === selectedDate &&
          managerEmployees.find((e) => e.id === a.employeeId && e.underSupervision)
      ),
    [selectedDate]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Receptionists under your supervision, others, and attendance (mock data)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {managerEmployees.length} total
          </Badge>
        </div>
      </div>

      {/* Attendance mini section */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Attendance
            </CardTitle>
            <CardDescription>By date (only employees under your supervision)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-48"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {attendanceForDate.map((att) => {
            const emp = managerEmployees.find((e) => e.id === att.employeeId);
            if (!emp) return null;
            return (
              <div
                key={att.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{emp.name}</span>
                    <Badge variant={emp.status === 'active' ? 'secondary' : 'outline'}>
                      {emp.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">{emp.email}</div>
                  {att.note && <div className="text-xs text-muted-foreground">{att.note}</div>}
                </div>
                <Badge
                  variant={
                    att.status === 'absent' || att.status === 'on_leave' ? 'outline' : 'secondary'
                  }
                  className="capitalize"
                >
                  {att.status.replace('_', ' ')}
                </Badge>
              </div>
            );
          })}
          {attendanceForDate.length === 0 && (
            <div className="text-sm text-muted-foreground">No attendance records for this date.</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Under my supervision
            </CardTitle>
            <CardDescription>Receptionists directly supervised</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {supervised.map((emp) => (
              <Card key={emp.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{emp.name}</span>
                    <Badge variant={emp.status === 'active' ? 'secondary' : 'outline'}>
                      {emp.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{emp.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shift</span>
                    <Badge variant="outline" className="capitalize">
                      {emp.shift}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{emp.phone || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {supervised.length === 0 && (
              <div className="text-sm text-muted-foreground">No supervised employees.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Others
            </CardTitle>
            <CardDescription>Receptionists not assigned under you</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {others.map((emp) => (
              <Card key={emp.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{emp.name}</span>
                    <Badge variant={emp.status === 'active' ? 'secondary' : 'outline'}>
                      {emp.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{emp.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shift</span>
                    <Badge variant="outline" className="capitalize">
                      {emp.shift}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span>{emp.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Supervision</span>
                    <Badge variant="outline">Not under you</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {others.length === 0 && (
              <div className="text-sm text-muted-foreground">No other employees.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

