import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Eye } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { AuditLogItem } from '@/types/admin';

// Mock data
const mockLogs: AuditLogItem[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    userName: 'John Admin',
    userId: 1,
    action: 'user.created',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { userId: 5, email: 'newuser@example.com' },
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    userName: 'Jane Admin',
    userId: 2,
    action: 'hotel.updated',
    hotelId: 2,
    hotelName: 'Plaza Hotel',
    meta: { fields: ['name', 'address'] },
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userName: 'System',
    userId: 0,
    action: 'backup.started',
    meta: { type: 'full' },
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userName: 'Bob Manager',
    userId: 3,
    action: 'login.success',
    hotelId: 1,
    hotelName: 'Grand Hotel',
  },
];

function getActionBadgeVariant(action: string) {
  if (action.includes('created')) return 'default';
  if (action.includes('updated')) return 'secondary';
  if (action.includes('deleted')) return 'destructive';
  if (action.includes('backup')) return 'outline';
  return 'outline';
}

const columns: ColumnDef<AuditLogItem>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as string;
      return (
        <span className="text-sm">
          {format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss')}
        </span>
      );
    },
  },
  {
    accessorKey: 'userName',
    header: 'User',
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      return (
        <Badge variant={getActionBadgeVariant(action)}>
          {action.replace('.', ' ').toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'hotelName',
    header: 'Hotel',
    cell: ({ row }) => {
      const hotelName = row.getValue('hotelName') as string | null;
      return hotelName || <span className="text-muted-foreground">Global</span>;
    },
  },
  {
    id: 'details',
    header: 'Details',
    cell: ({ row }) => {
      const log = row.original;
      return (
        <LogDetailsDialog log={log}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </LogDetailsDialog>
      );
    },
  },
];

function LogDetailsDialog({
  log,
  children,
}: {
  log: AuditLogItem;
  children: React.ReactElement;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>
            Complete information for this audit log entry
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <p className="text-sm">
                {format(new Date(log.timestamp), 'PPpp')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User</p>
              <p className="text-sm">{log.userName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Action</p>
              <p className="text-sm">{log.action}</p>
            </div>
            {log.hotelName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hotel</p>
                <p className="text-sm">{log.hotelName}</p>
              </div>
            )}
          </div>
          {log.meta !== undefined && log.meta !== null && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Metadata
              </p>
              <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-64">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Logs() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [userFilter, setUserFilter] = useState<string>('all');
  const [hotelFilter, setHotelFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const data = mockLogs.filter((log) => {
    const logDate = new Date(log.timestamp);
    const matchesDateFrom = !dateFrom || logDate >= dateFrom;
    const matchesDateTo = !dateTo || logDate <= dateTo;
    const matchesUser = userFilter === 'all' || log.userId.toString() === userFilter;
    const matchesHotel =
      hotelFilter === 'all' ||
      (hotelFilter === 'global' && !log.hotelId) ||
      log.hotelId?.toString() === hotelFilter;
    const matchesAction =
      actionFilter === 'all' || log.action.includes(actionFilter);

    return (
      matchesDateFrom &&
      matchesDateTo &&
      matchesUser &&
      matchesHotel &&
      matchesAction
    );
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const users = Array.from(new Set(mockLogs.map((l) => l.userName)));
  const hotels = Array.from(
    new Set(mockLogs.map((l) => l.hotelName).filter(Boolean))
  );
  const actions = Array.from(
    new Set(mockLogs.map((l) => l.action.split('.')[0]))
  );

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting logs to CSV...', data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            View system activity and user actions
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[240px] justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {dateFrom ? (
                dateTo ? (
                  <>
                    {format(dateFrom, 'LLL dd, y')} - {format(dateTo, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateFrom, 'LLL dd, y')
                )
              ) : (
                <span>Pick date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <CalendarComponent
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
              />
              <CalendarComponent
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>

        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {users.map((user, idx) => (
              <SelectItem key={idx} value={mockLogs.find((l) => l.userName === user)?.userId.toString() || ''}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={hotelFilter} onValueChange={setHotelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Hotels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hotels</SelectItem>
            <SelectItem value="global">Global Actions</SelectItem>
            {hotels.map((hotel, idx) => (
              <SelectItem key={idx} value={mockLogs.find((l) => l.hotelName === hotel)?.hotelId?.toString() || ''}>
                {hotel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {action.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

