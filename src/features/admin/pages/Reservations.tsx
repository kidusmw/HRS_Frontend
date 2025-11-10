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
import { MoreHorizontal, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReservationForm } from '@/features/admin/components/ReservationForm';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ReservationListItem, ReservationStatus } from '@/types/admin';
import { format } from 'date-fns';
import {
  getHotelReservations,
  deleteHotelReservation,
  updateHotelReservationStatus,
  getHotelRooms,
  getHotelUsers,
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

const statuses: ReservationStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

function getStatusBadgeVariant(status: ReservationStatus) {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'outline';
    case 'completed':
      return 'default';
    default:
      return 'outline';
  }
}

const createColumns = (
  handleEditReservation: (reservation: ReservationListItem) => void,
  handleDeleteReservation: (reservation: ReservationListItem) => void,
  handleConfirmReservation: (reservation: ReservationListItem) => void,
  handleCancelReservation: (reservation: ReservationListItem) => void
): ColumnDef<ReservationListItem>[] => [
  {
    accessorKey: 'roomType',
    header: 'Room',
    size: 120,
    filterFn: (row, _id, value) => {
      if (!value) return true;
      return row.original.roomId === value;
    },
    cell: ({ row }) => {
      const roomType = row.getValue('roomType') as string | null;
      return roomType || <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    id: 'roomId',
    accessorKey: 'roomId',
    header: () => null,
    enableHiding: false,
    filterFn: (row, _id, value) => {
      if (!value) return true;
      return row.original.roomId === value;
    },
  },
  {
    accessorKey: 'userName',
    header: 'Guest',
    size: 180,
    filterFn: (row, _id, value) => {
      if (value === null) {
        // Filter for walk-in guests
        return row.original.userId === null;
      }
      if (!value) return true;
      return row.original.userId === value;
    },
    cell: ({ row }) => {
      const userName = row.getValue('userName') as string | null;
      const userEmail = row.original.userEmail;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{userName || 'Walk-in Guest'}</span>
          {userEmail && (
            <span className="text-xs text-muted-foreground">{userEmail}</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'userId',
    accessorKey: 'userId',
    header: () => null,
    enableHiding: false,
    filterFn: (row, _id, value) => {
      if (value === null) {
        return row.original.userId === null;
      }
      if (value === undefined) return true;
      return row.original.userId === value;
    },
  },
  {
    accessorKey: 'checkIn',
    header: 'Check-in',
    size: 130,
    filterFn: (row, _id, value) => {
      if (!value) return true;
      const checkIn = row.original.checkIn.split('T')[0];
      return checkIn === value;
    },
    cell: ({ row }) => {
      const checkIn = row.getValue('checkIn') as string;
      return format(new Date(checkIn), 'MMM dd, yyyy');
    },
  },
  {
    accessorKey: 'checkOut',
    header: 'Check-out',
    size: 130,
    cell: ({ row }) => {
      const checkOut = row.getValue('checkOut') as string;
      return format(new Date(checkOut), 'MMM dd, yyyy');
    },
  },
  {
    accessorKey: 'guests',
    header: 'Guests',
    size: 80,
    cell: ({ row }) => {
      const guests = row.getValue('guests') as number;
      return <span>{guests}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as ReservationStatus;
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'specialRequests',
    header: 'Special Requests',
    size: 250,
    cell: ({ row }) => {
      const requests = row.getValue('specialRequests') as string | null;
      return (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {requests || 'None'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    size: 60,
    cell: ({ row }) => {
      const reservation = row.original;
      const canConfirm = reservation.status === 'pending';
      const canCancel = reservation.status === 'pending' || reservation.status === 'confirmed';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {canConfirm && (
              <DropdownMenuItem onClick={() => handleConfirmReservation(reservation)}>
                Confirm
              </DropdownMenuItem>
            )}
            {canCancel && (
              <DropdownMenuItem
                onClick={() => handleCancelReservation(reservation)}
                className="text-orange-600 focus:text-orange-600"
              >
                Cancel
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleEditReservation(reservation)}>
              Update
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteReservation(reservation)}
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

export function Reservations() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const hotelId = currentUser?.hotel_id || 1;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [rooms, setRooms] = useState<{ id: number; type: string }[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    reservation: ReservationListItem | null;
  }>({ open: false, reservation: null });

  // Fetch reservations, rooms, and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300));
        const [reservationsResponse, roomsResponse, usersResponse] = await Promise.all([
          getHotelReservations(hotelId),
          getHotelRooms(hotelId),
          getHotelUsers(hotelId),
        ]);
        console.log('Fetched reservations:', reservationsResponse.data);
        console.log('Hotel ID:', hotelId);
        setReservations(reservationsResponse.data);
        setRooms(roomsResponse.data.map((r) => ({ id: r.id, type: r.type })));
        setUsers(usersResponse.data.map((u) => ({ id: u.id, name: u.name, email: u.email })));
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load reservations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [hotelId]);

  const handleEditReservation = (reservation: ReservationListItem) => {
    setSelectedReservation(reservation);
    setIsDrawerOpen(true);
  };

  const handleFormSuccess = async () => {
    setIsDrawerOpen(false);
    setSelectedReservation(null);
    // Refresh reservations list
    try {
      const response = await getHotelReservations(hotelId);
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to refresh reservations:', error);
    }
  };

  const handleConfirmReservation = async (reservation: ReservationListItem) => {
    try {
      await updateHotelReservationStatus(reservation.id, hotelId, 'confirmed');
      toast.success('Reservation confirmed successfully');
      // Refresh reservations list
      const response = await getHotelReservations(hotelId);
      setReservations(response.data);
    } catch (error: any) {
      console.error('Failed to confirm reservation:', error);
      toast.error('Failed to confirm reservation');
    }
  };

  const handleCancelReservation = async (reservation: ReservationListItem) => {
    try {
      await updateHotelReservationStatus(reservation.id, hotelId, 'cancelled');
      toast.success('Reservation cancelled successfully');
      // Refresh reservations list
      const response = await getHotelReservations(hotelId);
      setReservations(response.data);
    } catch (error: any) {
      console.error('Failed to cancel reservation:', error);
      toast.error('Failed to cancel reservation');
    }
  };

  const handleDeleteReservation = (reservation: ReservationListItem) => {
    setDeleteDialog({ open: true, reservation });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.reservation) return;
    const reservationToDelete = deleteDialog.reservation;
    try {
      await deleteHotelReservation(reservationToDelete.id, hotelId);
      toast.success('Reservation deleted successfully');
      setDeleteDialog({ open: false, reservation: null });
      // Refresh reservations list - remove from state immediately and then fetch fresh data
      setReservations((prevReservations) =>
        prevReservations.filter((r) => r.id !== reservationToDelete.id)
      );
      // Fetch fresh data to ensure sync
      const response = await getHotelReservations(hotelId);
      setReservations(response.data);
    } catch (error: any) {
      console.error('Failed to delete reservation:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete reservation';
      toast.error(errorMessage);
    }
  };

  const columns = createColumns(
    handleEditReservation,
    handleDeleteReservation,
    handleConfirmReservation,
    handleCancelReservation
  );

  // Update column filters when external filter states change
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (statusFilter !== 'all') {
      filters.push({ id: 'status', value: statusFilter });
    }
    if (clientFilter !== 'all') {
      filters.push({ id: 'userId', value: clientFilter === 'walkin' ? null : parseInt(clientFilter, 10) });
    }
    if (roomFilter !== 'all') {
      filters.push({ id: 'roomId', value: parseInt(roomFilter, 10) });
    }
    if (dateFilter) {
      filters.push({ id: 'checkIn', value: dateFilter });
    }
    setColumnFilters(filters);
  }, [statusFilter, clientFilter, roomFilter, dateFilter]);

  const table = useReactTable({
    data: reservations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      columnVisibility: {
        roomId: false,
        userId: false,
      },
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const roomType = row.original.roomType?.toLowerCase() || '';
      const userName = row.original.userName?.toLowerCase() || '';
      const userEmail = row.original.userEmail?.toLowerCase() || '';
      const specialRequests = row.original.specialRequests?.toLowerCase() || '';
      return (
        roomType.includes(searchValue) ||
        userName.includes(searchValue) ||
        userEmail.includes(searchValue) ||
        specialRequests.includes(searchValue)
      );
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reservation Management</h1>
        <p className="text-muted-foreground">
          View, filter, and manage bookings for your hotel
        </p>
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
                placeholder="Search reservations..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="walkin">Walk-in Guests</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.type}
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
                    !dateFilter && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter ? (
                    format(new Date(dateFilter), 'PPP')
                  ) : (
                    <span>Filter by date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFilter ? new Date(dateFilter + 'T00:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Format as YYYY-MM-DD without timezone conversion
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setDateFilter(`${year}-${month}-${day}`);
                    } else {
                      setDateFilter('');
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers
                      .filter((header) => header.column.getIsVisible())
                      .map((header) => (
                        <TableHead 
                          key={header.id}
                          style={{ width: header.getSize() !== 150 ? `${header.getSize()}px` : 'auto' }}
                        >
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
                        <TableCell 
                          key={cell.id}
                          style={{ width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : 'auto' }}
                        >
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
                      colSpan={table.getVisibleLeafColumns().length}
                      className="h-24 text-center"
                    >
                      No reservations found.
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
        onOpenChange={(open: boolean) => setDeleteDialog({ open, reservation: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reservation? This action cannot be undone.
              {deleteDialog.reservation && (
                <>
                  <br />
                  <br />
                  <strong>Guest:</strong> {deleteDialog.reservation.userName || 'Walk-in Guest'}
                  <br />
                  <strong>Room:</strong> {deleteDialog.reservation.roomType || 'N/A'}
                  <br />
                  <strong>Check-in:</strong>{' '}
                  {format(new Date(deleteDialog.reservation.checkIn), 'MMM dd, yyyy')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, reservation: null })}
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

      {/* Update Reservation Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="flex flex-col max-h-[90vh]">
          <ScrollArea className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-2xl p-6">
              <ReservationForm
                reservation={selectedReservation}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsDrawerOpen(false)}
              />
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
