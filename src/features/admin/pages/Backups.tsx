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
import { getBackups, createBackup, downloadBackup } from '../api/adminApi';

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—';
  
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  
  if (bytes >= GB) {
    // Show in GB for files >= 1 GB
    return `${(bytes / GB).toFixed(2)} GB`;
  } else if (bytes >= MB) {
    // Show in MB for files >= 1 MB
    return `${(bytes / MB).toFixed(2)} MB`;
  } else {
    // Show in KB for files < 1 MB (including files < 1 KB)
    return `${(bytes / KB).toFixed(2)} KB`;
  }
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

// Backups 
// Displays the backup history for the hotel
export function Backups() {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [isHotelBackupDialogOpen, setIsHotelBackupDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 15,
    total: 0,
    lastPage: 1,
  });

  // Fetch backups with pagination
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setIsLoading(true);
        const response = await getBackups({
          page: pagination.page,
          per_page: pagination.perPage,
        });
        setBackups(response.data);
        // Update pagination from API response
        if (response.meta) {
          setPagination((prev) => ({
            ...prev,
            total: response.meta.total ?? prev.total,
            lastPage: response.meta.last_page ?? prev.lastPage,
            perPage: response.meta.per_page ?? prev.perPage,
            page: response.meta.current_page ?? prev.page,
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
      link.download = backup.path.split('/').pop() || `backup-${backup.id}.json`;
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
        per_page: pagination.perPage,
      });
      setBackups(response.data);
      // Update pagination from API response
      if (response.meta) {
        setPagination((prev) => ({
          ...prev,
          total: response.meta.total ?? prev.total,
          lastPage: response.meta.last_page ?? prev.lastPage,
          perPage: response.meta.per_page ?? prev.perPage,
          page: response.meta.current_page ?? prev.page,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh backups:', error);
    }
  };

  const handleHotelBackup = async () => {
    try {
      setIsRunningBackup(true);
      const response = await createBackup();
      const newBackup = response.data;
      
      // Immediately add backup to list (status will be 'queued' or 'running' from backend)
      setBackups((prev) => [newBackup, ...prev]);
      setIsHotelBackupDialogOpen(false);
      toast.success('Hotel backup started successfully');
      
      // Refresh after a short delay to get updated status
      setTimeout(() => {
        refreshBackups();
      }, 2000);
    } catch (error: any) {
      console.error('Backup failed:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to start backup';
      toast.error(errorMessage);
    } finally {
      setIsRunningBackup(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading && backups.length === 0) {
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
          <h1 className="text-3xl font-bold">Backup</h1>
          <p className="text-muted-foreground">
            Manage hotel data backups and exports
          </p>
        </div>
        <Dialog open={isHotelBackupDialogOpen} onOpenChange={setIsHotelBackupDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Hotel Backup</DialogTitle>
              <DialogDescription>
                Create a backup of your hotel's data. This will export all hotel information,
                rooms, reservations, and settings to a JSON file.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsHotelBackupDialogOpen(false)}
                disabled={isRunningBackup}
              >
                Cancel
              </Button>
              <Button onClick={handleHotelBackup} disabled={isRunningBackup}>
                {isRunningBackup ? (
                  <>
                    <Database className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Create Backup
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>Hotel backup operations and exports</CardDescription>
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
                      No backups found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing page {pagination.page} of {pagination.lastPage} (
                {pagination.total} total backups)
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
        </CardContent>
      </Card>
    </div>
  );
}
