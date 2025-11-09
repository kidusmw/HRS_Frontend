import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Download, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { BackupItem } from '@/types/admin';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getBackups,
  runFullBackup,
  runHotelBackup,
  downloadBackup,
  getHotels,
} from '../api/superAdminApi';


function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

function getStatusBadgeVariant(status: BackupItem['status']) {
  switch (status) {
    case 'success':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'running':
      return 'secondary';
    case 'queued':
      return 'outline';
    default:
      return 'outline';
  }
}

const createColumns = (
  handleDownload: (backup: BackupItem) => void
): ColumnDef<BackupItem>[] => [
  {
    accessorKey: 'createdAt',
    header: 'Timestamp',
    cell: ({ row }) => {
      const timestamp = row.getValue('createdAt') as string;
      return (
        <span className="text-sm">
          {format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss')}
        </span>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant="outline">
          {type === 'full' ? 'Full System' : 'Hotel'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'hotelName',
    header: 'Hotel',
    cell: ({ row }) => {
      const hotelName = row.getValue('hotelName') as string | null;
      const type = row.original.type;
      // For full backups, show Badge like Status column with yellow color
      if (!hotelName && type === 'full') {
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            Global
          </Badge>
        );
      }
      return hotelName || <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as BackupItem['status'];
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'sizeBytes',
    header: 'Size',
    cell: ({ row }) => {
      const sizeBytes = row.getValue('sizeBytes') as number | null;
      return <span className="text-sm">{formatFileSize(sizeBytes)}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const backup = row.original;
      if (backup.status === 'success' && backup.path) {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(backup)}
          >
            <Download className="h-4 w-4" />
          </Button>
        );
      }
      return null;
    },
  },
];

export function Backups() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [isFullBackupDialogOpen, setIsFullBackupDialogOpen] = useState(false);
  const [isHotelBackupDialogOpen, setIsHotelBackupDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [hotels, setHotels] = useState<{ id: number; name: string }[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 6,
    total: 0,
    lastPage: 1,
  });

  // Fetch hotels (only once)
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const hotelsResponse = await getHotels({ perPage: 100 });
        setHotels(
          hotelsResponse.data.map((h) => ({ id: h.id, name: h.name }))
        );
      } catch (error) {
        console.error('Failed to load hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  // Fetch backups with pagination
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setIsLoading(true);
        const response = await getBackups({
          page: pagination.page,
          perPage: pagination.perPage,
        });
        setBackups(response.data);
        // Extract pagination info from response
        if (response.meta && typeof response.meta === 'object') {
          const meta = response.meta as {
            total?: number;
            last_page?: number;
            per_page?: number;
            current_page?: number;
          };
          setPagination((prev) => ({
            ...prev,
            total: meta.total ?? prev.total,
            lastPage: meta.last_page ?? prev.lastPage,
            perPage: meta.per_page ?? prev.perPage,
            page: meta.current_page ?? prev.page,
          }));
        }
      } catch (error) {
        console.error('Failed to load backups:', error);
        toast.error('Failed to load backups');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBackups();
  }, [pagination.page, pagination.perPage]);

  const data = useMemo(() => backups, [backups]);

  const handleDownload = useCallback(async (backup: BackupItem) => {
    if (!backup.path || backup.status !== 'success') {
      toast.error('Backup file not available');
      return;
    }

    try {
      const blob = await downloadBackup(backup.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = backup.path.split('/').pop() || `backup-${backup.id}.${backup.type === 'full' ? 'zip' : 'json'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Backup downloaded successfully');
    } catch (error: any) {
      console.error('Download failed:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to download backup';
      toast.error(errorMessage);
    }
  }, []);

  const columns = useMemo(() => createColumns(handleDownload), [handleDownload]);

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

  const refreshBackups = async () => {
    try {
      const response = await getBackups({
        page: pagination.page,
        perPage: pagination.perPage,
      });
      setBackups(response.data);
      // Extract pagination info from response
      if (response.meta && typeof response.meta === 'object') {
        const meta = response.meta as {
          total?: number;
          last_page?: number;
          per_page?: number;
          current_page?: number;
        };
        setPagination((prev) => ({
          ...prev,
          total: meta.total ?? prev.total,
          lastPage: meta.last_page ?? prev.lastPage,
          perPage: meta.per_page ?? prev.perPage,
          page: meta.current_page ?? prev.page,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh backups:', error);
    }
  };

  const handleFullBackup = async () => {
    try {
      setIsRunningBackup(true);
      const response = await runFullBackup();
      const newBackup = response.data;
      
      // Ensure backup has 'running' status for display
      const backupWithRunningStatus = { ...newBackup, status: 'running' as const };
      
      // Immediately add backup with 'running' status
      setBackups((prev) => [backupWithRunningStatus, ...prev]);
      setIsFullBackupDialogOpen(false);
      toast.success('Full backup started successfully');
      
      // After 5 seconds, update status to 'success'
      setTimeout(() => {
        setBackups((prev) =>
          prev.map((backup) =>
            backup.id === backupWithRunningStatus.id
              ? { ...backup, status: 'success' as const }
              : backup
          )
        );
        // Refresh to get actual backup data from server
        refreshBackups();
      }, 5000);
    } catch (error: any) {
      console.error('Backup failed:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to start backup';
      toast.error(errorMessage);
    } finally {
      setIsRunningBackup(false);
    }
  };

  const handleHotelBackup = async () => {
    if (!selectedHotelId) return;
    try {
      setIsRunningBackup(true);
      const hotelId = parseInt(selectedHotelId);
      const response = await runHotelBackup(hotelId);
      const newBackup = response.data;
      
      // Ensure backup has 'running' status for display
      const backupWithRunningStatus = { ...newBackup, status: 'running' as const };
      
      // Immediately add backup with 'running' status
      setBackups((prev) => [backupWithRunningStatus, ...prev]);
      setIsHotelBackupDialogOpen(false);
      setSelectedHotelId('');
      toast.success('Hotel backup started successfully');
      
      // After 5 seconds, update status to 'success'
      setTimeout(() => {
        setBackups((prev) =>
          prev.map((backup) =>
            backup.id === backupWithRunningStatus.id
              ? { ...backup, status: 'success' as const }
              : backup
          )
        );
        // Refresh to get actual backup data from server
        refreshBackups();
      }, 5000);
    } catch (error: any) {
      console.error('Backup failed:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to start backup';
      toast.error(errorMessage);
    } finally {
      setIsRunningBackup(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backups</h1>
        <p className="text-muted-foreground">
          Manage system backups and data exports
        </p>
      </div>

      {/* Backup Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Full System Backup
            </CardTitle>
            <CardDescription>
              Create a complete backup of all hotels, users, reservations, and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isFullBackupDialogOpen} onOpenChange={setIsFullBackupDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Run Full Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Full System Backup</DialogTitle>
                  <DialogDescription>
                    This will create a complete backup of the entire system including all hotels,
                    users, reservations, and settings. This process may take several minutes.
                  </DialogDescription>
                </DialogHeader>
                <Alert>
                  <AlertDescription>
                    Full backups use Spatie Laravel Backup and include both database and files.
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsFullBackupDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleFullBackup} disabled={isRunningBackup}>
                    {isRunningBackup ? 'Starting...' : 'Start Backup'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Per-Hotel Backup
            </CardTitle>
            <CardDescription>
              Create a JSON export for a specific hotel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a hotel" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id.toString()}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isHotelBackupDialogOpen} onOpenChange={setIsHotelBackupDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" disabled={!selectedHotelId}>
                  <Play className="mr-2 h-4 w-4" />
                  Run Hotel Backup
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Hotel Backup</DialogTitle>
                  <DialogDescription>
                    This will create a JSON export for{' '}
                    {hotels.find((h) => h.id.toString() === selectedHotelId)?.name || 'the selected hotel'}.
                    The export includes hotel data, rooms, staff, and reservations.
                  </DialogDescription>
                </DialogHeader>
                <Alert>
                  <AlertDescription>
                    Hotel backups are exported as JSON files (no SQL restore in Phase 1).
                  </AlertDescription>
                </Alert>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsHotelBackupDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleHotelBackup} disabled={!selectedHotelId || isRunningBackup}>
                    {isRunningBackup ? 'Starting...' : 'Start Backup'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View past backup operations and download files</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
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
                      No backups found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {backups.length > 0 ? (pagination.page - 1) * pagination.perPage + 1 : 0} to{' '}
              {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
              {pagination.total} backups
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
        </CardContent>
      </Card>
    </div>
  );
}

