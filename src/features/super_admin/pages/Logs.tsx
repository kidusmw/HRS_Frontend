import { useState, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { AuditLogItem } from '@/types/admin';
import { getLogs, getUsers, getHotels } from '../api/superAdminApi';


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
      // Format action: replace dots with spaces, handle camelCase, then capitalize
      const formatted = action
        .replace(/\./g, ' ') // Replace all dots with spaces
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters (camelCase)
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      return (
        <Badge variant={getActionBadgeVariant(action)}>
          {formatted}
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
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [hotels, setHotels] = useState<{ id: number; name: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  });
  const [actions, setActions] = useState<string[]>([]);

  // Fetch users and hotels for filter dropdowns
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [usersResponse, hotelsResponse] = await Promise.all([
          getUsers({ perPage: 100 }),
          getHotels({ perPage: 100 }),
        ]);
        setUsers(
          usersResponse.data.map((u) => ({ id: u.id, name: u.name }))
        );
        setHotels(
          hotelsResponse.data.map((h) => ({ id: h.id, name: h.name }))
        );
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    fetchFilterData();
  }, []);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => {
      if (prev.page === 1) return prev; // No change needed
      return { ...prev, page: 1 };
    });
  }, [dateFrom, dateTo, userFilter, hotelFilter, actionFilter]);

  // Fetch logs when filters or pagination change
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const params: {
          userId?: number;
          hotelId?: number;
          action?: string;
          from?: string;
          to?: string;
          page?: number;
          perPage?: number;
        } = {
          page: pagination.page,
          perPage: pagination.perPage,
        };

        if (userFilter !== 'all') {
          params.userId = parseInt(userFilter);
        }

        if (hotelFilter === 'global') {
          params.hotelId = 0; // Special value for global actions
        } else if (hotelFilter !== 'all') {
          params.hotelId = parseInt(hotelFilter);
        }

        if (actionFilter !== 'all') {
          params.action = actionFilter;
        }

        if (dateFrom) {
          params.from = format(dateFrom, 'yyyy-MM-dd');
        }

        if (dateTo) {
          params.to = format(dateTo, 'yyyy-MM-dd');
        }

        const response = await getLogs(params);
        setLogs(response.data);
        
        // Extract unique actions for filter dropdown
        const uniqueActions = Array.from(
          new Set(response.data.map((log) => log.action.split('.')[0]))
        );
        setActions(uniqueActions);

        // Update pagination from API response
        if (response.meta && typeof response.meta === 'object') {
          const meta = response.meta as {
            current_page?: number;
            per_page?: number;
            total?: number;
            last_page?: number;
          };
          setPagination((prev) => ({
            ...prev,
            page: meta.current_page || prev.page,
            perPage: meta.per_page || prev.perPage,
            total: meta.total || 0,
            lastPage: meta.last_page || prev.lastPage,
          }));
        }
      } catch (error) {
        console.error('Failed to load logs:', error);
        toast.error('Failed to load logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [dateFrom, dateTo, userFilter, hotelFilter, actionFilter, pagination.page, pagination.perPage]);

  const data = useMemo(() => logs, [logs]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: pagination.lastPage,
    state: {
      sorting,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.perPage,
      },
    },
  });

  const handleExport = () => {
    // Convert logs to CSV
    const headers = ['Timestamp', 'User', 'Action', 'Hotel', 'Metadata'];
    const rows = logs.map((log) => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.userName,
      log.action,
      log.hotelName || 'Global',
      log.meta ? JSON.stringify(log.meta) : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logs exported successfully');
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
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
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
            {hotels.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id.toString()}>
                {hotel.name}
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
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
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
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {logs.length > 0 ? (pagination.page - 1) * pagination.perPage + 1 : 0} to{' '}
          {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
          {pagination.total} logs
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(10, pagination.lastPage) }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.lastPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

