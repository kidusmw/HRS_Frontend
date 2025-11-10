import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  flexRender,
  getCoreRowModel,
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
import { Calendar as CalendarIcon, Download, Eye } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import type { AuditLogItem } from '@/types/admin';
import { getHotelLogs, getHotelUsers } from '../mock';

function getActionBadgeVariant(action: string) {
  if (action.includes('created')) return 'default';
  if (action.includes('updated')) return 'secondary';
  if (action.includes('deleted')) return 'destructive';
  if (action.includes('backup')) return 'outline';
  return 'outline';
}

function formatAction(action: string): string {
  return action
    .replace(/\./g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const createColumns = (): ColumnDef<AuditLogItem>[] => [
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
          {formatAction(action)}
        </Badge>
      );
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
              <p className="text-sm">{formatAction(log.action)}</p>
            </div>
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
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const hotelId = currentUser?.hotel_id || 1;
  console.log('Logs component - currentUser:', currentUser);
  console.log('Logs component - hotelId:', hotelId);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: true },
  ]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 5,
    total: 0,
    lastPage: 1,
  });
  const [actions, setActions] = useState<string[]>([]);

  // Fetch users for filter dropdown
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const usersResponse = await getHotelUsers(hotelId);
        setUsers(
          usersResponse.data.map((u) => ({ id: u.id, name: u.name }))
        );
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    fetchFilterData();
  }, [hotelId]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => {
      if (prev.page === 1) return prev;
      return { ...prev, page: 1 };
    });
  }, [dateFrom, dateTo, userFilter, actionFilter]);

  // Fetch logs when filters or pagination change
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const params: {
          userId?: number;
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

        if (actionFilter !== 'all') {
          params.action = actionFilter;
        }

        if (dateFrom) {
          params.from = format(dateFrom, 'yyyy-MM-dd');
        }

        if (dateTo) {
          params.to = format(dateTo, 'yyyy-MM-dd');
        }

        const response = await getHotelLogs(hotelId, params);
        console.log('Full response:', response);
        console.log('Fetched logs:', response.data);
        console.log('Hotel ID:', hotelId);
        console.log('Params:', params);
        console.log('Response data length:', response.data?.length);
        setLogs(response.data || []);

        // Extract unique actions for filter dropdown
        if (response.data && response.data.length > 0) {
          const uniqueActions = Array.from(
            new Set(response.data.map((log) => log.action.split('.')[0]))
          );
          setActions(uniqueActions);
        } else {
          // If no logs, still set empty actions array
          setActions([]);
        }

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
  }, [dateFrom, dateTo, userFilter, actionFilter, pagination.page, pagination.perPage, hotelId]);

  const data = useMemo(() => logs, [logs]);
  const columns = useMemo(() => createColumns(), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  // Debug: Log table state
  useEffect(() => {
    console.log('Table rows:', table.getRowModel().rows.length);
    console.log('Logs state:', logs.length);
    console.log('Data:', data.length);
  }, [table, logs, data]);

  const handleExport = () => {
    // Convert logs to CSV
    const headers = ['Timestamp', 'User', 'Action', 'Metadata'];
    const rows = logs.map((log) => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.userName,
      formatAction(log.action),
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
    link.setAttribute('download', `hotel-audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Logs exported successfully');
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit/Activity Logs</h1>
        <p className="text-muted-foreground">
          View hotel activity and audit trail
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by user" />
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

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((action) => (
              <SelectItem key={action} value={action}>
                {formatAction(action)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, 'PPP') : <span>From date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateFrom}
              onSelect={setDateFrom}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, 'PPP') : <span>To date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateTo}
              onSelect={setDateTo}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
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
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {pagination.page} of {pagination.lastPage} (
            {pagination.total} total logs)
          </div>
          {pagination.lastPage > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const pages: (number | string)[] = [];
                const totalPages = pagination.lastPage;
                const currentPage = pagination.page;
                const maxVisible = 10;

                if (totalPages <= maxVisible) {
                  // Show all pages if total is less than max
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Show smart pagination with ellipsis
                  if (currentPage <= 4) {
                    // Show first pages
                    for (let i = 1; i <= 5; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    // Show last pages
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show middle pages
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  const pageNum = page as number;
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                });
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.lastPage}
            >
              Next
            </Button>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
