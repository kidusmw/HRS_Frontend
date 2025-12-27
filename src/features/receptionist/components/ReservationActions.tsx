import { Check, Edit, LogIn, LogOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ReceptionistReservation } from '../api/receptionistApi'

type Props = {
  reservation: ReceptionistReservation
  onConfirm: () => void
  onCheckIn: () => void
  onCheckOut: () => void
  onEdit: () => void
  onCancel: () => void
}

export function ReservationActions({
  reservation,
  onConfirm,
  onCheckIn,
  onCheckOut,
  onEdit,
  onCancel,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {reservation.status === 'pending' && (
        <Button size="sm" variant="outline" onClick={onConfirm}>
          <Check className="h-3 w-3 mr-1" />
          Confirm
        </Button>
      )}
      {reservation.status === 'confirmed' && (
        <Button size="sm" variant="outline" onClick={onCheckIn}>
          <LogIn className="h-3 w-3 mr-1" />
          Check In
        </Button>
      )}
      {reservation.status === 'checked_in' && (
        <Button size="sm" variant="outline" onClick={onCheckOut}>
          <LogOut className="h-3 w-3 mr-1" />
          Check Out
        </Button>
      )}
      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Edit className="h-3 w-3" />
        </Button>
      )}
      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}


