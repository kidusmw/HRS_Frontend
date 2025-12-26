import { useMemo } from 'react'
import type { DateRange } from 'react-day-picker'
import { startOfToday } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AvailabilityByType } from '../types'

type Props = {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  availability: AvailabilityByType[]
  loadingAvailability: boolean
  selectedRoomType: AvailabilityByType | null
  onRoomTypeSelect: (roomType: AvailabilityByType) => void
}

export function AvailabilityCard({
  dateRange,
  onDateRangeChange,
  availability,
  loadingAvailability,
  selectedRoomType,
  onRoomTypeSelect,
}: Props) {
  // Disable all dates before today
  const disabledDates = useMemo(() => {
    const today = startOfToday()
    return (date: Date) => date < today
  }, [])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={1}
          disabled={disabledDates}
        />
        <div className="space-y-4">
          {loadingAvailability && <Skeleton className="h-16 w-full" />}
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
                    'flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : isAvailable
                        ? 'hover:bg-muted/50'
                        : 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <h4 className="text-sm font-semibold">
                    {typeAvailability.type}
                    {typeAvailability.totalRooms !== undefined && (
                      <>
                        {' '}
                        - {typeAvailability.totalRooms}{' '}
                        {typeAvailability.totalRooms === 1 ? 'Room' : 'Rooms'}
                      </>
                    )}
                    {typeAvailability.availableRooms !== undefined &&
                      typeAvailability.availableRooms > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({typeAvailability.availableRooms} available)
                        </span>
                      )}
                  </h4>
                  <span className="font-medium">
                    {typeAvailability.priceFrom !== null &&
                    typeAvailability.priceFrom !== undefined
                      ? `$${typeAvailability.priceFrom}`
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

