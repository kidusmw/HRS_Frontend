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
import { HotelForm } from '@/features/super_admin/components/HotelForm';
import type { HotelListItem } from '@/types/admin';

// Mock data
const mockHotels: HotelListItem[] = [
  {
    id: 1,
    name: 'Grand Hotel',
    address: '123 Main St, City, State 12345',
    timezone: 'America/New_York',
    adminName: 'John Admin',
    roomsCount: 120,
    phoneNumber: '+1234567890',
    email: 'info@grandhotel.com',
  },
  {
    id: 2,
    name: 'Plaza Hotel',
    address: '456 Park Ave, City, State 12345',
    timezone: 'America/Los_Angeles',
    adminName: 'Jane Admin',
    roomsCount: 85,
    phoneNumber: '+1234567891',
    email: 'info@plazahotel.com',
  },
  {
    id: 3,
    name: 'Ocean View Hotel',
    address: '789 Beach Blvd, City, State 12345',
    timezone: 'America/Chicago',
    adminName: null,
    roomsCount: 200,
    phoneNumber: '+1234567892',
    email: 'info@oceanview.com',
  },
];

const columns: ColumnDef<HotelListItem>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'timezone',
    header: 'Timezone',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
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
            <DropdownMenuItem onClick={() => console.log('View', hotel.id)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', hotel.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Assign Admin', hotel.id)}>
              Assign Admin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => console.log('Delete', hotel.id)}
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
  const [timezoneFilter, setTimezoneFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelListItem | null>(null);

  const data = mockHotels;

  // Memoize timezones list to prevent recalculation on every render
  const timezones = useMemo(() => {
    return Array.from(new Set(mockHotels.map((h) => h.timezone)));
  }, []);

  // Update column filters when external filter states change
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (timezoneFilter !== 'all') {
      filters.push({ id: 'timezone', value: timezoneFilter });
    }
    if (adminFilter !== 'all') {
      filters.push({ 
        id: 'hasAdmin', 
        value: adminFilter === 'has' 
      });
    }
    setColumnFilters(filters);
  }, [timezoneFilter, adminFilter]);

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
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const name = row.original.name?.toLowerCase() || '';
      const address = row.original.address?.toLowerCase() || '';
      return name.includes(searchValue) || address.includes(searchValue);
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleCreateHotel = () => {
    setSelectedHotel(null);
    setIsDialogOpen(true);
  };

  const handleEditHotel = (hotel: HotelListItem) => {
    setSelectedHotel(hotel);
    setIsDialogOpen(true);
  };

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
              hotel={selectedHotel}
              onSuccess={() => setIsDialogOpen(false)}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

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
        <Select value={timezoneFilter} onValueChange={setTimezoneFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Timezones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timezones</SelectItem>
            {timezones.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
    </div>
  );
}

