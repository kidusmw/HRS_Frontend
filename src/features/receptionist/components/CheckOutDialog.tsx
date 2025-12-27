import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ReceptionistReservation } from '../api/receptionistApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReceptionistReservation | null
  onConfirm: () => void
}

export function CheckOutDialog({ open, onOpenChange, reservation, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-4">
        <DialogHeader>
          <DialogTitle>Check Out Guest</DialogTitle>
          <DialogDescription>Complete check-out for {reservation?.user?.name || 'Guest'}</DialogDescription>
        </DialogHeader>
        {reservation && (
          <div className="space-y-3 py-3">
            <div className="grid gap-1">
              <div className="text-sm font-medium">Guest:</div>
              <div className="text-sm text-muted-foreground">{reservation.user?.name || 'Guest'}</div>
            </div>
            <div className="grid gap-1">
              <div className="text-sm font-medium">Room:</div>
              <div className="text-sm text-muted-foreground">
                {reservation.room?.id || 'N/A'} - {reservation.room?.type || 'N/A'}
              </div>
            </div>
            <div className="grid gap-1">
              <div className="text-sm font-medium">Total Amount:</div>
              <div className="text-sm font-semibold">
                {reservation.room?.price?.toLocaleString() || '0'} ETB
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Check-out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


