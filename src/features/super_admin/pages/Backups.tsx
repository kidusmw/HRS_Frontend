import type { SortingState } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackupActions } from '@/features/super_admin/components/backups/BackupActions';
import { BackupsTable } from '@/features/super_admin/components/backups/BackupsTable';
import { useSuperAdminBackups } from '@/features/super_admin/hooks/useSuperAdminBackups';

export function Backups() {
  const backupsState = useSuperAdminBackups();
  const sorting = backupsState.sorting as unknown as SortingState;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backups</h1>
        <p className="text-muted-foreground">
          Manage system backups and data exports
        </p>
      </div>

      {/* Backup Actions */}
      <BackupActions
        hotels={backupsState.hotels}
        selectedHotelId={backupsState.selectedHotelId}
        onSelectedHotelIdChange={backupsState.setSelectedHotelId}
        isFullBackupDialogOpen={backupsState.isFullBackupDialogOpen}
        onFullBackupDialogOpenChange={backupsState.setIsFullBackupDialogOpen}
        isHotelBackupDialogOpen={backupsState.isHotelBackupDialogOpen}
        onHotelBackupDialogOpenChange={backupsState.setIsHotelBackupDialogOpen}
        isRunningBackup={backupsState.isRunningBackup}
        onRunFullBackup={backupsState.handleFullBackup}
        onRunHotelBackup={backupsState.handleHotelBackup}
      />

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View past backup operations and download files</CardDescription>
        </CardHeader>
        <CardContent>
          <BackupsTable
            isLoading={backupsState.isLoading}
            data={backupsState.data}
            sorting={sorting}
            onSortingChange={(updater) => backupsState.setSorting(updater as any)}
            pagination={backupsState.pagination}
            onPageChange={(page) => backupsState.setPagination((prev) => ({ ...prev, page }))}
            onDownload={backupsState.handleDownload}
          />
        </CardContent>
      </Card>
    </div>
  );
}

