import { useMemo } from 'react'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { BackupItem } from '@/types/admin'

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}

function getStatusBadgeVariant(status: BackupItem['status']) {
  switch (status) {
    case 'success':
      return 'default'
    case 'failed':
      return 'destructive'
    case 'running':
      return 'secondary'
    case 'queued':
      return 'outline'
    default:
      return 'outline'
  }
}

const createColumns = (handleDownload: (backup: BackupItem) => void): ColumnDef<BackupItem>[] => [
  {
    accessorKey: 'createdAt',
    header: 'Timestamp',
    cell: ({ row }) => <span className="text-sm">{format(new Date(row.getValue('createdAt') as string), 'MMM dd, yyyy HH:mm:ss')}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return <Badge variant="outline">{type === 'full' ? 'Full System' : 'Hotel'}</Badge>
    },
  },
  {
    accessorKey: 'hotelName',
    header: 'Hotel',
    cell: ({ row }) => {
      const hotelName = row.getValue('hotelName') as string | null
      const type = row.original.type
      if (!hotelName && type === 'full') {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
          >
            Global
          </Badge>
        )
      }
      return hotelName || <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as BackupItem['status']
      return <Badge variant={getStatusBadgeVariant(status)}>{status.toUpperCase()}</Badge>
    },
  },
  {
    accessorKey: 'sizeBytes',
    header: 'Size',
    cell: ({ row }) => <span className="text-sm">{formatFileSize(row.getValue('sizeBytes') as number | null)}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const backup = row.original
      if (backup.status === 'success' && backup.path) {
        return (
          <Button variant="ghost" size="sm" onClick={() => handleDownload(backup)}>
            <Download className="h-4 w-4" />
          </Button>
        )
      }
      return null
    },
  },
]

type PaginationState = { page: number; perPage: number; total: number; lastPage: number }

type Props = {
  isLoading: boolean
  data: BackupItem[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  pagination: PaginationState
  onPageChange: (page: number) => void
  onDownload: (backup: BackupItem) => void
}

export function BackupsTable({ isLoading, data, sorting, onSortingChange, pagination, onPageChange, onDownload }: Props) {
  const columns = useMemo(() => createColumns(onDownload), [onDownload])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    <>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
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
                    No backups found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {data.length > 0 ? (pagination.page - 1) * pagination.perPage + 1 : 0} to{' '}
          {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} backups
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
            Previous
          </Button>
          {Array.from({ length: Math.min(10, pagination.lastPage) }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={pagination.page === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="min-w-[40px]"
            >
              {pageNum}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.page + 1)} disabled={pagination.page >= pagination.lastPage}>
            Next
          </Button>
        </div>
      </div>
    </>
  )
}


