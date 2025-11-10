import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
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
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoomForm } from '@/features/admin/components/RoomForm';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import type { RoomListItem } from '@/types/admin';
import {
  getHotelRooms,
  deleteHotelRoom,
} from '../mock';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];

function getTypeBadgeVariant(type: string) {
  switch (type.toLowerCase()) {
    case 'suite':
    case 'presidential':
      return 'default';
    case 'deluxe':
    case 'executive':
      return 'secondary';
    default:
      return 'outline';
  }
}

const createColumns = (
  handleEditRoom: (room: RoomListItem) => void,
  handleDeleteRoom: (room: RoomListItem) => void
): ColumnDef<RoomListItem>[] => [
  {
    accessorKey: 'type',
    header: 'Type',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={getTypeBadgeVariant(type)}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      return (
        <span className="font-medium">
          {price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          })}
        </span>
      );
    },
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => {
      const capacity = row.getValue('capacity') as number;
      return (
        <span className="text-muted-foreground">
          {capacity} {capacity === 1 ? 'guest' : 'guests'}
        </span>
      );
    },
  },
  {
    accessorKey: 'isAvailable',
    header: 'Status',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const isAvailable = row.getValue('isAvailable') as boolean;
      return (
        <Badge variant={isAvailable ? 'default' : 'secondary'}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {description || 'No description'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const room = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditRoom(room)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteRoom(room)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Rooms() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const hotelId = currentUser?.hotel_id || 1;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    room: RoomListItem | null;
  }>({ open: false, room: null });

  // Fetch rooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        const response = getHotelRooms(hotelId);
        setRooms(response.data);
      } catch (error) {
        console.error('Failed to load rooms:', error);
        toast.error('Failed to load rooms');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const handleEditRoom = (room: RoomListItem) => {
    setSelectedRoom(room);
    setIsDrawerOpen(true);
  };

  const handleFormSuccess = async () => {
    setIsDrawerOpen(false);
    setSelectedRoom(null);
    // Refresh rooms list
    try {
      const response = getHotelRooms(hotelId);
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to refresh rooms:', error);
    }
  };

  const handleDeleteRoom = (room: RoomListItem) => {
    setDeleteDialog({ open: true, room });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.room) return;
    const roomToDelete = deleteDialog.room;
    try {
      await deleteHotelRoom(roomToDelete.id, hotelId);
      toast.success('Room deleted successfully');
      setDeleteDialog({ open: false, room: null });
      // Refresh rooms list - remove from state immediately and then fetch fresh data
      setRooms((prevRooms) => prevRooms.filter((r) => r.id !== roomToDelete.id));
      // Fetch fresh data to ensure sync
      const response = getHotelRooms(hotelId);
      setRooms(response.data);
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete room';
      toast.error(errorMessage);
    }
  };

  const columns = createColumns(handleEditRoom, handleDeleteRoom);

  // Update column filters when external filter states change
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (typeFilter !== 'all') {
      filters.push({ id: 'type', value: typeFilter });
    }
    if (statusFilter !== 'all') {
      filters.push({ 
        id: 'isAvailable', 
        value: statusFilter === 'available' 
      });
    }
    setColumnFilters(filters);
  }, [typeFilter, statusFilter]);

  const table = useReactTable({
    data: rooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const type = row.original.type?.toLowerCase() || '';
      const description = row.original.description?.toLowerCase() || '';
      return type.includes(searchValue) || description.includes(searchValue);
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">
            Manage hotel rooms, types, and availability
          </p>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={handleCreateRoom}>
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col max-h-[90vh]">
            <ScrollArea className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-2xl p-6">
                <RoomForm
                  room={selectedRoom}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsDrawerOpen(false)}
                />
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
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
                      No rooms found.
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
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, room: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
              {deleteDialog.room && (
                <>
                  <br />
                  <strong>Room Type:</strong> {deleteDialog.room.type}
                  <br />
                  <strong>Price:</strong>{' '}
                  {deleteDialog.room.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, room: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
