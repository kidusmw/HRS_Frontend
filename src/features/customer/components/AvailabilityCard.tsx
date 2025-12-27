import { useMemo, type Dispatch, type SetStateAction } from 'react'
import type { DateRange } from 'react-day-picker'
import { format, startOfToday } from 'date-fns'
import { Check } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AvailabilityByType } from '../types'

type Props = {
  dateRange: DateRange | undefined
  onDateRangeChange: Dispatch<SetStateAction<DateRange | undefined>>
  availability: AvailabilityByType[]
  loadingAvailability: boolean
  selectedRoomType: AvailabilityByType | null
  onRoomTypeSelect: (roomType: AvailabilityByType) => void
  unavailableCheckInDates: string[]
  unavailableCheckOutDates: string[]
}

export function AvailabilityCard({
  dateRange,
  onDateRangeChange,
  availability,
  loadingAvailability,
  selectedRoomType,
  onRoomTypeSelect,
  unavailableCheckInDates,
  unavailableCheckOutDates,
}: Props) {
  const today = useMemo(() => startOfToday(), [])

  const disabledCheckIn = useMemo(() => new Set(unavailableCheckInDates), [unavailableCheckInDates])
  const disabledCheckOut = useMemo(() => new Set(unavailableCheckOutDates), [unavailableCheckOutDates])

  // Disabled date functions for DatePicker
  const disabledCheckInFn = useMemo(() => {
    return (date: Date) => {
      if (date < today) return true
      if (!selectedRoomType?.type) return false
      const key = format(date, 'yyyy-MM-dd')
      return disabledCheckIn.has(key)
    }
  }, [today, selectedRoomType?.type, disabledCheckIn])

  const disabledCheckOutFn = useMemo(() => {
    const from = dateRange?.from
    const fromKey = from ? format(from, 'yyyy-MM-dd') : null

    return (date: Date) => {
      if (date < today) return true
      if (!fromKey) return true // must pick check-in first
      const key = format(date, 'yyyy-MM-dd')
      if (key <= fromKey) return true
      if (!selectedRoomType?.type) return false
      return disabledCheckOut.has(key)
    }
  }, [today, dateRange?.from, selectedRoomType?.type, disabledCheckOut])

  // Convert Date to string for DatePicker
  const checkInValue = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  const checkOutValue = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

  const handleCheckInChange = (value: string) => {
    const newDate = new Date(value)
    // Per spec: changing check-in clears check-out
    onDateRangeChange({ from: newDate, to: undefined })
  }

  const handleCheckOutChange = (value: string) => {
    const newDate = new Date(value)
    onDateRangeChange((prev) => ({ from: prev?.from, to: newDate }) as DateRange | undefined)
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="check-in" className="text-xs font-medium">
              Check-in
            </Label>
            <DatePicker
              id="check-in"
              value={checkInValue}
              onChange={handleCheckInChange}
              placeholder="Select date"
              calendarDisabled={disabledCheckInFn}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="check-out" className="text-xs font-medium">
              Check-out
            </Label>
            <DatePicker
              id="check-out"
              value={checkOutValue}
              onChange={handleCheckOutChange}
              placeholder="Select date"
              disabled={!dateRange?.from}
              calendarDisabled={disabledCheckOutFn}
            />
          </div>
        </div>

        {!selectedRoomType?.type && (
          <p className="text-xs text-muted-foreground">
            Select a room type to see unavailable dates
          </p>
        )}

        {/* Room types */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Room Type</Label>
          {loadingAvailability && <Skeleton className="h-12 w-full" />}
          {!loadingAvailability && availability.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No availability for the selected dates.
            </p>
          )}
          {!loadingAvailability &&
            availability.map((typeAvailability) => {
              const isSelected = selectedRoomType?.type === typeAvailability.type
              const isAvailable =
                typeAvailability.availableRooms !== undefined &&
                typeAvailability.availableRooms > 0

              return (
                <div
                  key={typeAvailability.type}
                  onClick={() => isAvailable && onRoomTypeSelect(typeAvailability)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : isAvailable
                        ? 'cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50'
                        : 'cursor-not-allowed opacity-50'
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/40'
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{typeAvailability.type}</div>
                      {typeAvailability.availableRooms !== undefined &&
                        typeAvailability.availableRooms > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {typeAvailability.availableRooms} available
                          </div>
                        )}
                    </div>
                  </div>
                  <span className="shrink-0 font-semibold">
                    {typeAvailability.priceFrom !== null &&
                    typeAvailability.priceFrom !== undefined
                      ? `${typeAvailability.priceFrom} ETB`
                      : 'Sold out'}
                  </span>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
