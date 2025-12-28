import { useState } from 'react'
import { format } from 'date-fns'
import type { AuditLogItem } from '@/types/admin'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function LogDetailsDialog({
  log,
  children,
}: {
  log: AuditLogItem
  children: React.ReactElement
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>Complete information for this audit log entry</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
              <p className="text-sm">{format(new Date(log.timestamp), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User</p>
              <p className="text-sm">{log.userName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Action</p>
              <p className="text-sm">{log.action}</p>
            </div>
            {log.hotelName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hotel</p>
                <p className="text-sm">{log.hotelName}</p>
              </div>
            )}
          </div>
          {log.meta !== undefined && log.meta !== null && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Metadata</p>
              <pre className="rounded-md bg-muted p-4 text-xs overflow-auto max-h-64">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


