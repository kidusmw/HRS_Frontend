import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ReceptionistReservation } from '../api/receptionistApi'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReceptionistReservation | null
  onConfirm: () => void
}

export function ConfirmReservationDialog({ open, onOpenChange, reservation, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Reservation</DialogTitle>
          <DialogDescription>
            Are you sure you want to confirm this reservation? This will change the status from pending to confirmed.
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
            <div className="text-sm">
              <strong>Amount:</strong>{' '}
              {reservation.room?.price
                ? (() => {
                    const checkIn = new Date(reservation.check_in)
                    const checkOut = new Date(reservation.check_out)
                    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                    return `${(reservation.room.price * nights).toLocaleString()} ETB`
                  })()
                : '0 ETB'}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Yes, Confirm Reservation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


