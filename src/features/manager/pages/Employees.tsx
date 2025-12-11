import { useEffect, useMemo, useState } from 'react';
import { Users, Filter, CalendarDays, Activity, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { managerEmployees, managerAttendance } from '@/features/manager/mock';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function Employees() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date('2025-12-11'));
  const [onlySupervised, setOnlySupervised] = useState(true);
  const [search, setSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [employeePage, setEmployeePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);

  const EMP_PAGE_SIZE = 6;
  const ATT_PAGE_SIZE = 5;

  const filteredEmployees = useMemo(() => {
    const pool = onlySupervised
      ? managerEmployees.filter((emp) => emp.underSupervision)
      : managerEmployees;
    if (!search.trim()) return pool;
    const term = search.toLowerCase();
    return pool.filter((emp) => {
      const managerName = emp.managerName || '';
      return (
        emp.name.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        (emp.phone || '').toLowerCase().includes(term) ||
        managerName.toLowerCase().includes(term)
      );
    });
  }, [onlySupervised, search]);

  const employeeTotalPages = Math.max(1, Math.ceil(filteredEmployees.length / EMP_PAGE_SIZE));
  const employeesPageData = useMemo(() => {
    const start = (employeePage - 1) * EMP_PAGE_SIZE;
    return filteredEmployees.slice(start, start + EMP_PAGE_SIZE);
  }, [filteredEmployees, employeePage]);

  useEffect(() => {
    setEmployeePage(1);
  }, [onlySupervised, search]);

  const attendanceForDate = useMemo(() => {
    const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
    const term = attendanceSearch.trim().toLowerCase();

    return managerAttendance.filter((a) => {
      if (a.date !== dateStr) return false;
      const emp = managerEmployees.find((e) => e.id === a.employeeId && e.underSupervision);
      if (!emp) return false;
      if (!term) return true;
      return (
        emp.name.toLowerCase().includes(term) ||
        emp.email.toLowerCase().includes(term) ||
        (emp.phone || '').toLowerCase().includes(term) ||
        (emp.managerName || '').toLowerCase().includes(term)
      );
    });
  }, [selectedDate, attendanceSearch]);

  const attendanceTotalPages = Math.max(1, Math.ceil(attendanceForDate.length / ATT_PAGE_SIZE));
  const attendancePageData = useMemo(() => {
    const start = (attendancePage - 1) * ATT_PAGE_SIZE;
    return attendanceForDate.slice(start, start + ATT_PAGE_SIZE);
  }, [attendanceForDate, attendancePage]);

  useEffect(() => {
    setAttendancePage(1);
  }, [selectedDate, attendanceSearch]);

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
            {filteredEmployees.length} shown / {managerEmployees.length} total
          </Badge>
        </div>
      </div>

      {/* Attendance mini section */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Attendance
            </CardTitle>
            <CardDescription>By date (only employees under your supervision)</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full sm:w-56 justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attendance"
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {attendancePageData.map((att) => {
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

          {attendanceForDate.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {attendancePage} of {attendanceTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttendancePage((p) => Math.max(1, p - 1))}
                  disabled={attendancePage === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttendancePage((p) => Math.min(attendanceTotalPages, p + 1))}
                  disabled={attendancePage === attendanceTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Employees
          </CardTitle>
          <CardDescription>Toggle supervision view and search by name/email/phone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="supervision-toggle"
                checked={onlySupervised}
                onCheckedChange={setOnlySupervised}
              />
              <Label htmlFor="supervision-toggle">Under my supervision</Label>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {employeesPageData.map((emp) => (
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
                  {emp.underSupervision ? (
                    <Badge variant="default">Under you</Badge>
                  ) : (
                    <Badge variant="outline">
                      {emp.managerName || 'N/A'}
                    </Badge>
                  )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredEmployees.length === 0 && (
              <div className="text-sm text-muted-foreground">No employees match this view.</div>
            )}
          </div>

          {filteredEmployees.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {employeePage} of {employeeTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmployeePage((p) => Math.max(1, p - 1))}
                  disabled={employeePage === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEmployeePage((p) => Math.min(employeeTotalPages, p + 1))}
                  disabled={employeePage === employeeTotalPages}
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

