import { useState } from 'react';
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
import { format } from 'date-fns';
import type { BackupItem } from '@/types/admin';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Mock data
const mockBackups: BackupItem[] = [
  {
    id: 1,
    type: 'full',
    status: 'success',
    sizeBytes: 52428800,
    path: '/backups/full_20240101_120000.zip',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 2,
    type: 'hotel',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    status: 'success',
    sizeBytes: 10485760,
    path: '/backups/hotel_1_20240101_110000.json',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    type: 'full',
    status: 'failed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const mockHotels = [
  { id: 1, name: 'Grand Hotel' },
  { id: 2, name: 'Plaza Hotel' },
  { id: 3, name: 'Ocean View Hotel' },
];

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

const columns: ColumnDef<BackupItem>[] = [
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
            onClick={() => console.log('Download', backup.path)}
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

  const table = useReactTable({
    data: mockBackups,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleFullBackup = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Starting full backup...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsFullBackupDialogOpen(false);
      // Show success notification
    } catch (error) {
      console.error('Backup failed:', error);
      // Show error notification
    }
  };

  const handleHotelBackup = async () => {
    if (!selectedHotelId) return;
    try {
      // TODO: Replace with actual API call
      console.log('Starting hotel backup for:', selectedHotelId);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsHotelBackupDialogOpen(false);
      setSelectedHotelId('');
      // Show success notification
    } catch (error) {
      console.error('Backup failed:', error);
      // Show error notification
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
                  <Button onClick={handleFullBackup}>Start Backup</Button>
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
                {mockHotels.map((hotel) => (
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
                    {mockHotels.find((h) => h.id.toString() === selectedHotelId)?.name || 'the selected hotel'}.
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
                  <Button onClick={handleHotelBackup} disabled={!selectedHotelId}>
                    Start Backup
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
          <div className="flex items-center justify-end space-x-2 mt-4">
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
        </CardContent>
      </Card>
    </div>
  );
}

