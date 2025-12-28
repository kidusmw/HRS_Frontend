import { useEffect, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Role, UserListItem } from '@/types/admin'
import { formatDistanceToNow } from 'date-fns'
import { Search } from 'lucide-react'
import { UserActions } from './UserActions'

const roles: Role[] = ['client', 'admin', 'super_admin']

function getRoleBadgeVariant(role: Role) {
  switch (role) {
    case 'super_admin':
      return 'default'
    case 'admin':
      return 'secondary'
    case 'manager':
      return 'outline'
    default:
      return 'outline'
  }
}

type HotelOption = { id: string; name: string }

type Props = {
  users: UserListItem[]
  hotels: HotelOption[]
  globalFilter: string
  roleFilter: string
  statusFilter: string
  hotelFilter: string
  onGlobalFilterChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onHotelFilterChange: (value: string) => void
  onEdit: (user: UserListItem) => void
  onToggleActive: (user: UserListItem) => void
  onResetPassword: (userId: number) => void
  onDelete: (user: UserListItem) => void
}

export function UsersTable({
  users,
  hotels,
  globalFilter,
  roleFilter,
  statusFilter,
  hotelFilter,
  onGlobalFilterChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onHotelFilterChange,
  onEdit,
  onToggleActive,
  onResetPassword,
  onDelete,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
          const role = row.getValue('role') as Role
          return <Badge variant={getRoleBadgeVariant(role)}>{role.replace('_', ' ').toUpperCase()}</Badge>
        },
      },
      {
        accessorKey: 'hotelName',
        header: 'Hotel',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const hotelName = row.getValue('hotelName') as string | null
          return (
            hotelName || (
              <Badge variant="outline" className="text-xs">
                No assigned hotel
              </Badge>
            )
          )
        },
      },
      {
        id: 'hotelId',
        accessorKey: 'hotelId',
        header: 'Hotel ID',
        enableColumnFilter: false,
        filterFn: (row, _id, value) => row.original.hotelId?.toString() === value,
        cell: ({ row }) => {
          const hotelId = row.getValue('hotelId') as number | null | undefined
          return hotelId ? (
            <span className="text-muted-foreground">{hotelId}</span>
          ) : (
            <Badge variant="outline" className="text-xs">
              No assigned hotel
            </Badge>
          )
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        filterFn: (row, id, value) => row.getValue(id) === value,
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean
          return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
        },
      },
      {
        accessorKey: 'lastActiveAt',
        header: 'Last Active',
        cell: ({ row }) => {
          const lastActive = row.getValue('lastActiveAt') as string | null
          if (!lastActive) return <span className="text-muted-foreground">Never</span>
          return (
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(lastActive), { addSuffix: true })}
            </span>
          )
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <UserActions
            user={row.original}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onResetPassword={onResetPassword}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onDelete, onEdit, onResetPassword, onToggleActive]
  )

  useEffect(() => {
    const filters: ColumnFiltersState = []
    if (roleFilter !== 'all') filters.push({ id: 'role', value: roleFilter })
    if (statusFilter !== 'all') filters.push({ id: 'isActive', value: statusFilter === 'active' })
    if (hotelFilter !== 'all') filters.push({ id: 'hotelId', value: hotelFilter })
    setColumnFilters(filters)
  }, [hotelFilter, roleFilter, statusFilter])

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const name = row.original.name?.toLowerCase() || ''
      const email = row.original.email?.toLowerCase() || ''
      return name.includes(searchValue) || email.includes(searchValue)
    },
    state: { sorting, columnFilters, globalFilter },
  })

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
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
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={hotelFilter} onValueChange={onHotelFilterChange}>
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </>
  )
}


