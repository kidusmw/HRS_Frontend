import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ReceptionistReservation } from '../api/receptionistApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReceptionistReservation | null
  onConfirm: () => void
}

export function CancelReservationDialog({ open, onOpenChange, reservation, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Reservation</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this reservation? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {reservation && (
          <div className="space-y-2 py-4">
            <div className="text-sm">
              <strong>Guest:</strong> {reservation.user?.name || 'Guest'}
            </div>
            <div className="text-sm">
              <strong>Room:</strong> {reservation.room?.id || 'N/A'} - {reservation.room?.type || 'N/A'}
            </div>
            <div className="text-sm">
              <strong>Dates:</strong> {reservation.check_in} to {reservation.check_out}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            No, Keep Reservation
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes, Cancel Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


