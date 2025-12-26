import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AvailabilityByType } from '../types'

type Props = {
  selectedRoomType: AvailabilityByType | null
  dateRange: DateRange | undefined
  totalPrice: number | null
  numberOfNights: number
  isProcessingPayment: boolean
  onPayClick: () => void
}

export function ReserveCard({
  selectedRoomType,
  dateRange,
  totalPrice,
  numberOfNights,
  isProcessingPayment,
  onPayClick,
}: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Reserve your stay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedRoomType ? (
          <>
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected: {selectedRoomType.type}</div>
              {dateRange?.from && (
                <div className="text-sm text-muted-foreground">
                  Check-in: {format(dateRange.from, 'MMM d, yyyy')}
                </div>
              )}
              {dateRange?.to && (
                <div className="text-sm text-muted-foreground">
                  Check-out: {format(dateRange.to, 'MMM d, yyyy')}
                </div>
              )}
            </div>
            {selectedRoomType.priceFrom !== null && selectedRoomType.priceFrom !== undefined ? (
              <div className="space-y-1">
                <div className="text-2xl font-semibold">
                  {totalPrice !== null
                    ? `$${totalPrice.toFixed(2)}`
                    : `$${selectedRoomType.priceFrom} / night`}
                </div>
                {totalPrice !== null && numberOfNights > 0 && (
                  <div className="text-sm text-muted-foreground">
                    ${selectedRoomType.priceFrom} × {numberOfNights}{' '}
                    {numberOfNights === 1 ? 'night' : 'nights'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-lg font-semibold text-muted-foreground">Sold out</div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a room type and dates to see pricing
          </div>
        )}
        <Button className="w-full" onClick={onPayClick} disabled={!selectedRoomType || isProcessingPayment}>
          {isProcessingPayment ? 'Processing...' : 'Pay to Confirm Your Reservation'}
        </Button>
        <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          Secure payment via Chapa
        </div>
      </CardContent>
    </Card>
  )
}

