import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AuditLogItem } from '@/types/admin'
import { LogDetailsDialog } from './LogDetailsDialog'

function getActionBadgeVariant(action: string) {
  if (action.includes('created')) return 'default'
  if (action.includes('updated')) return 'secondary'
  if (action.includes('deleted')) return 'destructive'
  if (action.includes('backup')) return 'outline'
  return 'outline'
}

const columns: ColumnDef<AuditLogItem>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: ({ row }) => {
      const timestamp = row.getValue('timestamp') as string
      return <span className="text-sm">{format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss')}</span>
    },
  },
  { accessorKey: 'userName', header: 'User' },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as string
      const formatted = action
        .replace(/\./g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      return <Badge variant={getActionBadgeVariant(action)}>{formatted}</Badge>
    },
  },
  {
    accessorKey: 'hotelName',
    header: 'Hotel',
    cell: ({ row }) => {
      const hotelName = row.getValue('hotelName') as string | null
      return hotelName || <span className="text-muted-foreground">Global</span>
    },
  },
  {
    id: 'details',
    header: 'Details',
    cell: ({ row }) => (
      <LogDetailsDialog log={row.original}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </LogDetailsDialog>
    ),
  },
]

type PaginationState = { page: number; perPage: number; total: number; lastPage: number }

type Props = {
  isLoading: boolean
  data: AuditLogItem[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  pagination: PaginationState
}

export function LogsTable({ isLoading, data, sorting, onSortingChange, pagination }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    manualPagination: true,
    pageCount: pagination.lastPage,
    state: {
      sorting,
      pagination: { pageIndex: pagination.page - 1, pageSize: pagination.perPage },
    },
  })

  return (
    <div className="rounded-md border">
      {isLoading ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
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
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}


