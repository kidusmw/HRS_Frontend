import { useState, useMemo, useEffect } from 'react';
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
import { MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Note: Using Dialog instead of AlertDialog if alert-dialog doesn't exist
import { HotelForm } from '@/features/super_admin/components/HotelForm';
import type { HotelListItem } from '@/types/admin';
import { getHotels, deleteHotel } from '../api/superAdminApi';
import { toast } from 'sonner';

const createColumns = (
  handleEditHotel: (hotel: HotelListItem) => void,
  handleDeleteHotel: (hotel: HotelListItem) => void
): ColumnDef<HotelListItem>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'country',
    header: 'Country',
  },
  {
    accessorKey: 'adminName',
    header: 'Admin',
    enableColumnFilter: false,
    cell: ({ row }) => {
      const adminName = row.getValue('adminName') as string | null;
      return adminName || (
        <Badge variant="outline" className="text-xs">
          No Admin
        </Badge>
      );
    },
  },
  {
    id: 'hasAdmin',
    filterFn: (row, _id, value) => {
      const hasAdmin = row.original.adminName !== null;
      return hasAdmin === value;
    },
  },
  {
    accessorKey: 'roomsCount',
    header: 'Rooms',
    cell: ({ row }) => {
      const count = row.getValue('roomsCount') as number;
      return <span className="font-medium">{count}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const hotel = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditHotel(hotel)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteHotel(hotel)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Hotels() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hotels, setHotels] = useState<HotelListItem[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    hotel: HotelListItem | null;
  }>({ open: false, hotel: null });

  // Fetch hotels
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const response = await getHotels({ perPage: 100 });
        setHotels(response.data);
      } catch (error) {
        console.error('Failed to load hotels:', error);
        toast.error('Failed to load hotels');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHotels();
  }, []);

  // Create a new array reference when hotels change to ensure React Table detects the update
  const data = useMemo(() => {
    return [...hotels];
  }, [hotels]);

  const handleCreateHotel = () => {
    setSelectedHotel(null);
    setIsDialogOpen(true);
  };

  const handleEditHotel = (hotel: HotelListItem) => {
    setSelectedHotel(hotel);
    setIsDialogOpen(true);
  };

  const handleDeleteHotel = (hotel: HotelListItem) => {
    setDeleteDialog({ open: true, hotel });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.hotel) return;
    const hotelToDelete = deleteDialog.hotel;
    try {
      await deleteHotel(hotelToDelete.id);
      toast.success('Hotel deleted successfully');
      setDeleteDialog({ open: false, hotel: null });
      // Refresh hotels list - remove from state immediately and then fetch fresh data
      setHotels((prevHotels) => prevHotels.filter((h) => h.id !== hotelToDelete.id));
      // Fetch fresh data to ensure sync
      const response = await getHotels({ perPage: 100 });
      setHotels(response.data);
    } catch (error: any) {
      console.error('Failed to delete hotel:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete hotel';
      toast.error(errorMessage);
    }
  };

  const handleFormSuccess = async (updatedHotel?: HotelListItem) => {
    setIsDialogOpen(false);
    setSelectedHotel(null);

    if (updatedHotel) {
      // Optimistically update the state immediately with the updated hotel from API
      setHotels((prevHotels) => {
        const index = prevHotels.findIndex((h) => h.id === updatedHotel.id);
        if (index !== -1) {
          const newHotels = [...prevHotels];
          newHotels[index] = updatedHotel;
          return newHotels;
        } else {
          return [...prevHotels, updatedHotel];
        }
      });
    }

    // Refetch to ensure we have the latest data from the backend
    try {
      const response = await getHotels({ perPage: 100 });
      setHotels(response.data);
    } catch (error) {
      console.error('Failed to refresh hotels:', error);
      toast.error('Failed to refresh hotel list');
    }
  };

  const columns = createColumns(handleEditHotel, handleDeleteHotel);

  // Update column filters when external filter states change
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (adminFilter !== 'all') {
      filters.push({ 
        id: 'hasAdmin', 
        value: adminFilter === 'has' 
      });
    }
    setColumnFilters(filters);
  }, [adminFilter]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    // Force table to update when data changes
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const name = row.original.name?.toLowerCase() || '';
      const city = row.original.city?.toLowerCase() || '';
      const country = row.original.country?.toLowerCase() || '';
      return name.includes(searchValue) || city.includes(searchValue) || country.includes(searchValue);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotels</h1>
          <p className="text-muted-foreground">
            Manage hotel properties and configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateHotel}>
              <Plus className="mr-2 h-4 w-4" />
              Create Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedHotel ? 'Edit Hotel' : 'Create Hotel'}
              </DialogTitle>
              <DialogDescription>
                {selectedHotel
                  ? 'Update hotel information and settings'
                  : 'Add a new hotel to the system'}
              </DialogDescription>
            </DialogHeader>
            <HotelForm
              key={selectedHotel ? `hotel-${selectedHotel.id}` : 'hotel-new'}
              hotel={selectedHotel}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
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
            placeholder="Search hotels..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={adminFilter} onValueChange={setAdminFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Admin Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hotels</SelectItem>
            <SelectItem value="has">Has Admin</SelectItem>
            <SelectItem value="none">No Admin</SelectItem>
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
                  No hotels found.
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
        onOpenChange={(open) => setDeleteDialog({ open, hotel: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hotel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.hotel?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, hotel: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

