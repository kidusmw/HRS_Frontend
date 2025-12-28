import type { SortingState } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogsFilters } from '@/features/super_admin/components/logs/LogsFilters';
import { LogsTable } from '@/features/super_admin/components/logs/LogsTable';
import { useSuperAdminLogs } from '@/features/super_admin/hooks/useSuperAdminLogs';

export function Logs() {
  const logsState = useSuperAdminLogs();
  const sorting = logsState.sorting as unknown as SortingState;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            View system activity and user actions
          </p>
        </div>
        <Button onClick={logsState.exportCsv} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <LogsFilters
        dateFrom={logsState.dateFrom}
        dateTo={logsState.dateTo}
        setDateFrom={logsState.setDateFrom}
        setDateTo={logsState.setDateTo}
        userFilter={logsState.userFilter}
        setUserFilter={logsState.setUserFilter}
        hotelFilter={logsState.hotelFilter}
        setHotelFilter={logsState.setHotelFilter}
        actionFilter={logsState.actionFilter}
        setActionFilter={logsState.setActionFilter}
        users={logsState.users}
        hotels={logsState.hotels}
        actions={logsState.actions}
      />

      {/* Table */}
      <LogsTable
        isLoading={logsState.isLoading}
        data={logsState.data}
        sorting={sorting}
        onSortingChange={(s) => logsState.setSorting(s as any)}
        pagination={logsState.pagination}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {logsState.logs.length > 0 ? (logsState.pagination.page - 1) * logsState.pagination.perPage + 1 : 0}{' '}
          to {Math.min(logsState.pagination.page * logsState.pagination.perPage, logsState.pagination.total)} of{' '}
          {logsState.pagination.total} logs
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => logsState.setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={logsState.pagination.page <= 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(10, logsState.pagination.lastPage) }, (_, i) => i + 1).map(
            (pageNum) => (
              <Button
                key={pageNum}
                variant={logsState.pagination.page === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => logsState.setPagination((prev) => ({ ...prev, page: pageNum }))}
                className="min-w-[40px]"
              >
                {pageNum}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => logsState.setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={logsState.pagination.page >= logsState.pagination.lastPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

