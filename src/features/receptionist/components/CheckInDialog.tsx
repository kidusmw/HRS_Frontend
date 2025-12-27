import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ReceptionistReservation } from '../api/receptionistApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReceptionistReservation | null
  onConfirm: () => void
}

export function CheckInDialog({ open, onOpenChange, reservation, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-4">
        <DialogHeader>
          <DialogTitle>Check In Guest</DialogTitle>
          <DialogDescription>
            Verify reservation details and complete check-in for {reservation?.user?.name || 'Guest'}
          </DialogDescription>
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
              <div className="text-sm font-medium">Dates:</div>
              <div className="text-sm text-muted-foreground">
                {reservation.check_in} to {reservation.check_out}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


