import { useEffect, useState } from 'react';
import { Users, Filter, CalendarDays, Activity, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEmployees, getAttendance } from '@/features/manager/api/managerApi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const attendanceStatusStyles: Record<'present' | 'absent' | 'late' | 'on_leave', string> = {
  present: 'bg-green-100 text-green-800',
  absent: 'bg-red-100 text-red-800',
  late: 'bg-amber-100 text-amber-800',
  on_leave: 'bg-blue-100 text-blue-800',
};

const employeeStatusStyles: Record<'active' | 'inactive', string> = {
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-slate-200 text-slate-700',
};

const supervisionStyles = {
  under: 'bg-blue-100 text-blue-800',
  other: 'bg-amber-100 text-amber-800',
};

const shiftStyles: Record<'morning' | 'evening' | 'night', string> = {
  morning: 'bg-yellow-100 text-yellow-800',
  evening: 'bg-purple-100 text-purple-800',
  night: 'bg-indigo-100 text-indigo-800',
};

export function Employees() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [onlySupervised, setOnlySupervised] = useState(true);
  const [search, setSearch] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [employeePage, setEmployeePage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesMeta, setEmployeesMeta] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceMeta, setAttendanceMeta] = useState<any>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const params: any = {
          page: employeePage,
          per_page: 6,
        };
        if (search) params.search = search;
        const response = await getEmployees(params);
        let data = response.data || [];
        if (onlySupervised) {
          data = data.filter((emp: any) => emp.underSupervision);
        }
        setEmployees(data);
        setEmployeesMeta(response.meta);
      } catch (error: any) {
        console.error('Failed to load employees:', error);
        toast.error(error.response?.data?.message || 'Failed to load employees');
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, [search, employeePage, onlySupervised]);

  useEffect(() => {
    setEmployeePage(1);
  }, [onlySupervised, search]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedDate) return;
      try {
        setLoadingAttendance(true);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const params: any = {
          date: dateStr,
          page: attendancePage,
          per_page: 5,
        };
        if (attendanceSearch) {
          // Note: Backend may not support search in attendance, filter client-side for now
        }
        const response = await getAttendance(params);
        let data = response.data || [];
        if (attendanceSearch) {
          const term = attendanceSearch.toLowerCase();
          data = data.filter((att: any) => {
            // We'd need employee data to search, so this is a simplified filter
            return att.note?.toLowerCase().includes(term);
          });
        }
        setAttendance(data);
        setAttendanceMeta(response.meta);
      } catch (error: any) {
        console.error('Failed to load attendance:', error);
        toast.error(error.response?.data?.message || 'Failed to load attendance');
      } finally {
        setLoadingAttendance(false);
      }
    };
    loadAttendance();
  }, [selectedDate, attendancePage, attendanceSearch]);

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
            {employees.length} shown / {employeesMeta?.total || 0} total
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
          {loadingAttendance ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            attendance.map((att) => {
              const emp = employees.find((e: any) => e.id === att.employeeId);
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
                    <Badge
                      variant="secondary"
                      className={cn('capitalize', employeeStatusStyles[emp.status as 'active' | 'inactive'])}
                    >
                      {emp.status}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">{emp.email}</div>
                  {att.note && <div className="text-xs text-muted-foreground">{att.note}</div>}
                </div>
                <Badge
                  variant="secondary"
                  className={cn('capitalize', attendanceStatusStyles[att.status as 'present' | 'absent' | 'late' | 'on_leave'])}
                >
                  {att.status.replace('_', ' ')}
                </Badge>
              </div>
            );
            })
          )}
          {!loadingAttendance && attendance.length === 0 && (
            <div className="text-sm text-muted-foreground">No attendance records for this date.</div>
          )}

          {!loadingAttendance && attendanceMeta && attendanceMeta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {attendanceMeta.current_page} of {attendanceMeta.last_page}
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
                  onClick={() => setAttendancePage((p) => Math.min(attendanceMeta.last_page, p + 1))}
                  disabled={attendancePage === attendanceMeta.last_page}
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
            {loadingEmployees ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))
            ) : (
              employees.map((emp) => (
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
                    <Badge
                      variant="secondary"
                      className={cn('capitalize', shiftStyles[emp.shift as 'morning' | 'evening' | 'night'])}
                    >
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
                    <Badge variant="secondary" className={supervisionStyles.under}>
                      Under you
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className={supervisionStyles.other}>
                      {emp.managerName || 'N/A'}
                    </Badge>
                  )}
                  </div>
                </CardContent>
              </Card>
              ))
            )}
            {!loadingEmployees && employees.length === 0 && (
              <div className="text-sm text-muted-foreground col-span-full">No employees match this view.</div>
            )}
          </div>

          {!loadingEmployees && employeesMeta && employeesMeta.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Page {employeesMeta.current_page} of {employeesMeta.last_page}
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
                  onClick={() => setEmployeePage((p) => Math.min(employeesMeta.last_page, p + 1))}
                  disabled={employeePage === employeesMeta.last_page}
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