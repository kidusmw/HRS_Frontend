import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { AvailabilityByType } from '../types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRoomType: AvailabilityByType | null
  dateRange: DateRange | undefined
  numberOfNights: number
  totalPrice: number | null
  isProcessingPayment: boolean
  onConfirm: () => void
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  selectedRoomType,
  dateRange,
  numberOfNights,
  totalPrice,
  isProcessingPayment,
  onConfirm,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Reservation</DialogTitle>
        </DialogHeader>
        {selectedRoomType && dateRange?.from && dateRange?.to && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Room Type</div>
              <div className="text-lg">{selectedRoomType.type}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Check-in</div>
              <div className="text-sm text-muted-foreground">
                {format(dateRange.from, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Check-out</div>
              <div className="text-sm text-muted-foreground">
                {format(dateRange.to, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Number of Nights</div>
              <div className="text-sm text-muted-foreground">
                {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm font-medium">Total Amount</div>
              <div className="text-2xl font-semibold">
                {totalPrice !== null
                  ? `$${totalPrice.toFixed(2)}`
                  : selectedRoomType.priceFrom !== null
                    ? `$${selectedRoomType.priceFrom} / night`
                    : 'N/A'}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessingPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={isProcessingPayment} className="flex-1">
                {isProcessingPayment ? 'Processing...' : 'Confirm and Pay'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

