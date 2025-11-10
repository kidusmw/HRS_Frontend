import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getHotelPayments } from '../mock';
import type { PaymentListItem, PaymentStatus, PaymentMethod } from '@/types/admin';

function getStatusBadgeVariant(status: PaymentStatus) {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'outline';
  }
}

function formatPaymentMethod(method: PaymentMethod): string {
  const methods: Record<PaymentMethod, string> = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    online: 'Online',
  };
  return methods[method] || method;
}

function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  });
  return formatter.format(amount);
}

const createColumns = (
  handleViewDetails: (payment: PaymentListItem) => void
): ColumnDef<PaymentListItem>[] => [
  {
    accessorKey: 'paidAt',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('paidAt') as string;
      return (
        <span className="text-sm">
          {format(new Date(date), 'MMM dd, yyyy HH:mm')}
        </span>
      );
    },
  },
  {
    accessorKey: 'reservationNumber',
    header: 'Reservation',
    cell: ({ row }) => {
      const reservationNumber = row.getValue('reservationNumber') as string | null;
      const reservationId = row.original.reservationId;
      return (
        <span className="text-sm">
          {reservationNumber || `#${reservationId}`}
        </span>
      );
    },
  },
  {
    accessorKey: 'guestName',
    header: 'Guest',
    cell: ({ row }) => {
      const guestName = row.getValue('guestName') as string;
      const guestEmail = row.original.guestEmail;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{guestName}</span>
          {guestEmail && (
            <span className="text-xs text-muted-foreground">{guestEmail}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number;
      const currency = row.original.currency;
      return (
        <span className="font-medium">{formatCurrency(amount, currency)}</span>
      );
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Method',
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod') as PaymentMethod;
      return <span className="text-sm">{formatPaymentMethod(method)}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as PaymentStatus;
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(payment)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
];


export function Payments() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const hotelId = currentUser?.hotel_id || 1;
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'paidAt', desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentListItem | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await getHotelPayments(hotelId);
        setPayments(response.data);
      } catch (error) {
        console.error('Failed to load payments:', error);
        toast.error('Failed to load payments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [hotelId]);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleViewDetails = (payment: PaymentListItem) => {
    setSelectedPayment(payment);
    setIsDetailsDialogOpen(true);
  };

  const handleExport = () => {
    // Convert payments to CSV
    const headers = [
      'Date',
      'Reservation',
      'Guest',
      'Guest Email',
      'Amount',
      'Currency',
      'Payment Method',
      'Status',
      'Transaction ID',
    ];
    const rows = payments.map((payment) => [
      format(new Date(payment.paidAt), 'yyyy-MM-dd HH:mm:ss'),
      payment.reservationNumber || `#${payment.reservationId}`,
      payment.guestName,
      payment.guestEmail || '',
      payment.amount.toString(),
      payment.currency,
      formatPaymentMethod(payment.paymentMethod),
      payment.status,
      payment.transactionId || '',
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
    link.setAttribute('download', `hotel-payments-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payments exported successfully');
  };

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Global search filter
    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.guestName.toLowerCase().includes(searchLower) ||
          p.guestEmail?.toLowerCase().includes(searchLower) ||
          (p.reservationNumber || `#${p.reservationId}`)
            .toLowerCase()
            .includes(searchLower) ||
          p.transactionId?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [payments, statusFilter, globalFilter]);

  const data = useMemo(() => filteredPayments, [filteredPayments]);
  const columns = useMemo(
    () => createColumns(handleViewDetails),
    [handleViewDetails]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  // Calculate summary statistics
  const summary = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter((p) => p.status === 'pending');
    const failed = payments.filter((p) => p.status === 'failed');

    return {
      totalRevenue,
      totalPayments: payments.length,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
    };
  }, [payments]);

  if (isLoading && payments.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            View payments and financial data for your hotel
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(summary.totalRevenue, payments[0]?.currency || 'USD')}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Payments</CardDescription>
            <CardTitle className="text-2xl">{summary.totalPayments}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">{summary.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{summary.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl">{summary.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by guest, reservation, or transaction ID..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Hotel payment records and transactions</CardDescription>
        </CardHeader>
        <CardContent>
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
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {table.getPageCount() > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  filteredPayments.length
                )}{' '}
                of {filteredPayments.length} payments
              </div>
              {table.getPageCount() > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | string)[] = [];
                      const totalPages = table.getPageCount();
                      const currentPage = table.getState().pagination.pageIndex + 1;
                      const maxVisible = 10;

                      if (totalPages <= maxVisible) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (currentPage <= 4) {
                          for (let i = 1; i <= 5; i++) {
                            pages.push(i);
                          }
                          pages.push('...');
                          pages.push(totalPages);
                        } else if (currentPage >= totalPages - 3) {
                          pages.push(1);
                          pages.push('...');
                          for (let i = totalPages - 4; i <= totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
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
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => table.setPageIndex(pageNum - 1)}
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
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Complete information for this payment transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                  <p className="text-sm">#{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reservation</p>
                  <p className="text-sm">
                    {selectedPayment.reservationNumber || `#${selectedPayment.reservationId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Guest</p>
                  <p className="text-sm">{selectedPayment.guestName}</p>
                  {selectedPayment.guestEmail && (
                    <p className="text-xs text-muted-foreground">{selectedPayment.guestEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-sm">{formatPaymentMethod(selectedPayment.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedPayment.status)}>
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </Badge>
                </div>
                {selectedPayment.transactionId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                    <p className="text-sm font-mono text-xs">{selectedPayment.transactionId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid At</p>
                  <p className="text-sm">
                    {format(new Date(selectedPayment.paidAt), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
