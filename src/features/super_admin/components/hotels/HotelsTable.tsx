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
import type { HotelListItem } from '@/types/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search } from 'lucide-react'
import { HotelActions } from './HotelActions'

type Props = {
  data: HotelListItem[]
  globalFilter: string
  adminFilter: string
  onGlobalFilterChange: (value: string) => void
  onAdminFilterChange: (value: string) => void
  onEdit: (hotel: HotelListItem) => void
  onDelete: (hotel: HotelListItem) => void
}

export function HotelsTable({
  data,
  globalFilter,
  adminFilter,
  onGlobalFilterChange,
  onAdminFilterChange,
  onEdit,
  onDelete,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const columns: ColumnDef<HotelListItem>[] = useMemo(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'country', header: 'Country' },
      {
        accessorKey: 'adminName',
        header: 'Admin',
        enableColumnFilter: false,
        cell: ({ row }) => {
          const adminName = row.getValue('adminName') as string | null
          return (
            adminName || (
              <Badge variant="outline" className="text-xs">
                No Admin
              </Badge>
            )
          )
        },
      },
      {
        id: 'hasAdmin',
        filterFn: (row, _id, value) => (row.original.adminName !== null) === value,
      },
      {
        accessorKey: 'roomsCount',
        header: 'Rooms',
        cell: ({ row }) => <span className="font-medium">{row.getValue('roomsCount') as number}</span>,
      },
      {
        id: 'actions',
        cell: ({ row }) => <HotelActions hotel={row.original} onEdit={onEdit} onDelete={onDelete} />,
      },
    ],
    [onDelete, onEdit]
  )

  useEffect(() => {
    const filters: ColumnFiltersState = []
    if (adminFilter !== 'all') {
      filters.push({ id: 'hasAdmin', value: adminFilter === 'has' })
    }
    setColumnFilters(filters)
  }, [adminFilter])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: onGlobalFilterChange,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase()
      const name = row.original.name?.toLowerCase() || ''
      const city = row.original.city?.toLowerCase() || ''
      const country = row.original.country?.toLowerCase() || ''
      return name.includes(searchValue) || city.includes(searchValue) || country.includes(searchValue)
    },
  })

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hotels..."
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={adminFilter} onValueChange={onAdminFilterChange}>
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
                  No hotels found.
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


