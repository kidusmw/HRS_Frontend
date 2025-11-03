import { useState, useEffect } from 'react';
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
import { UserForm } from '@/features/super_admin/components/UserForm';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import type { UserListItem, Role } from '@/types/admin';
import { formatDistanceToNow } from 'date-fns';
import {
  getUsers,
  activateUser,
  deactivateUser,
  resetUserPassword,
  getHotels,
} from '../api/superAdminApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const roles: Role[] = ['client', 'receptionist', 'manager', 'admin', 'super_admin'];

function getRoleBadgeVariant(role: Role) {
  switch (role) {
    case 'super_admin':
      return 'default';
    case 'admin':
      return 'secondary';
    case 'manager':
      return 'outline';
    default:
      return 'outline';
  }
}

const createColumns = (
  handleEditUser: (user: UserListItem) => void,
  handleToggleActive: (user: UserListItem) => void,
  handleResetPassword: (userId: number) => void
): ColumnDef<UserListItem>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const role = row.getValue('role') as Role;
      return (
        <Badge variant={getRoleBadgeVariant(role)}>
          {role.replace('_', ' ').toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'hotelName',
    header: 'Hotel',
    enableColumnFilter: false,
    cell: ({ row }) => {
      const hotelName = row.getValue('hotelName') as string | null;
      return hotelName || <span className="text-muted-foreground">—</span>;
    },
  },
  {
    id: 'hotelId',
    accessorKey: 'hotelId',
    filterFn: (row, _id, value) => {
      const hotelId = row.original.hotelId?.toString();
      return hotelId === value;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastActiveAt',
    header: 'Last Active',
    cell: ({ row }) => {
      const lastActive = row.getValue('lastActiveAt') as string | null;
      if (!lastActive) return <span className="text-muted-foreground">Never</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(lastActive), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditUser(user)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
              {user.isActive ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
              Reset Password
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Users() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hotelFilter, setHotelFilter] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: number | null;
    password: string | null;
  }>({ open: false, userId: null, password: null });

  // Fetch users and hotels
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, hotelsResponse] = await Promise.all([
          getUsers({ perPage: 100 }),
          getHotels({ perPage: 100 }),
        ]);
        setUsers(usersResponse.data);
        setHotels(
          hotelsResponse.data.map((h) => ({
            id: h.id.toString(),
            name: h.name,
          }))
        );
      } catch (error) {
        console.error('Failed to load users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync external filter states with TanStack Table columnFilters
  const data = users;

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleToggleActive = async (user: UserListItem) => {
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
        toast.success('User deactivated successfully');
      } else {
        await activateUser(user.id);
        toast.success('User activated successfully');
      }
      // Refresh users list
      const response = await getUsers({ perPage: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      const response = await resetUserPassword(userId);
      setResetPasswordDialog({
        open: true,
        userId,
        password: response.password,
      });
      toast.success('Password reset successfully');
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast.error('Failed to reset password');
    }
  };

  const handleFormSuccess = async () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
    // Refresh users list
    try {
      const response = await getUsers({ perPage: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to refresh users:', error);
    }
  };

  const columns = createColumns(handleEditUser, handleToggleActive, handleResetPassword);

  // Update column filters when external filter states change
  useEffect(() => {
    const filters: ColumnFiltersState = [];
    if (roleFilter !== 'all') {
      filters.push({ id: 'role', value: roleFilter });
    }
    if (statusFilter !== 'all') {
      filters.push({ 
        id: 'isActive', 
        value: statusFilter === 'active' 
      });
    }
    if (hotelFilter !== 'all') {
      filters.push({ id: 'hotelId', value: hotelFilter });
    }
    setColumnFilters(filters);
  }, [roleFilter, statusFilter, hotelFilter]);

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
      const email = row.original.email?.toLowerCase() || '';
      return name.includes(searchValue) || email.includes(searchValue);
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={handleCreateUser}>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col max-h-[90vh]">
            <ScrollArea className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-2xl p-6">
                <UserForm
                  user={selectedUser}
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
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.replace('_', ' ').toUpperCase()}
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hotelFilter} onValueChange={setHotelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Hotels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hotels</SelectItem>
            {hotels.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id}>
                {hotel.name}
              </SelectItem>
            ))}
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
                  No users found.
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

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(open: boolean) =>
          setResetPasswordDialog({ open, userId: null, password: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              The password has been reset. Please copy and share this password with the user.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4">
            <p className="font-mono text-sm break-all">{resetPasswordDialog.password}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (resetPasswordDialog.password) {
                  navigator.clipboard.writeText(resetPasswordDialog.password);
                  toast.success('Password copied to clipboard');
                }
              }}
            >
              Copy Password
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setResetPasswordDialog({ open: false, userId: null, password: null })
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

