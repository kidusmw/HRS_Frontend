import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import type { ReceptionistRoom } from '../api/receptionistApi'
import type { WalkInFormState } from '../hooks/useWalkInForm'
import { format, startOfToday } from 'date-fns'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void

  form: WalkInFormState
  onFieldChange: <K extends keyof WalkInFormState>(key: K, value: WalkInFormState[K]) => void

  roomTypes: string[]
  loadingDateFilteredRooms: boolean
  dateFilteredRooms: ReceptionistRoom[]

  unavailableCheckInDates: string[]
  unavailableCheckOutDates: string[]

  onSubmit: () => void
  submitDisabled: boolean
}

export function WalkInDialog({
  open,
  onOpenChange,
  form,
  onFieldChange,
  roomTypes,
  loadingDateFilteredRooms,
  dateFilteredRooms,
  unavailableCheckInDates,
  unavailableCheckOutDates,
  onSubmit,
  submitDisabled,
}: Props) {
  const today = startOfToday()
  const disabledCheckIn = new Set(unavailableCheckInDates)
  const disabledCheckOut = new Set(unavailableCheckOutDates)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Walk-in Booking</DialogTitle>
          <DialogDescription>Create a new reservation for a walk-in guest</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="walkin-name">Guest Name *</Label>
            <Input
              id="walkin-name"
              value={form.guestName}
              onChange={(e) => onFieldChange('guestName', e.target.value)}
              placeholder="Enter guest name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="walkin-email">Email</Label>
            <Input
              id="walkin-email"
              type="email"
              value={form.guestEmail}
              onChange={(e) => onFieldChange('guestEmail', e.target.value)}
              placeholder="Enter email address"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="walkin-phone">Phone</Label>
            <Input
              id="walkin-phone"
              value={form.guestPhone}
              onChange={(e) => onFieldChange('guestPhone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="walkin-room-type">Room Type *</Label>
            <Select value={form.roomType || ''} onValueChange={(v) => onFieldChange('roomType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!form.roomType ? (
              <div className="text-xs text-muted-foreground">Select a room type to enable date selection.</div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="walkin-checkin">Check-in Date *</Label>
              <DatePicker
                id="walkin-checkin"
                value={form.checkIn}
                onChange={(value) => onFieldChange('checkIn', value)}
                placeholder="Select check-in date"
                disabled={!form.roomType}
                calendarDisabled={(date) => {
                  if (date < today) return true
                  const key = format(date, 'yyyy-MM-dd')
                  return disabledCheckIn.has(key)
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walkin-checkout">Check-out Date *</Label>
              <DatePicker
                id="walkin-checkout"
                value={form.checkOut}
                onChange={(value) => onFieldChange('checkOut', value)}
                placeholder="Select check-out date"
                disabled={!form.roomType || !form.checkIn}
                calendarDisabled={(date) => {
                  if (date < today) return true
                  if (!form.checkIn) return true
                  const key = format(date, 'yyyy-MM-dd')
                  // Must be strictly after check-in
                  if (key <= form.checkIn) return true
                  return disabledCheckOut.has(key)
                }}
              />
            </div>
          </div>

          {!form.roomType ? (
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              Please select a room type to see availability.
            </div>
          ) : !form.checkIn || !form.checkOut ? (
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              Please select both check-in and check-out dates to see available rooms.
            </div>
          ) : loadingDateFilteredRooms ? (
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              Loading available rooms...
            </div>
          ) : dateFilteredRooms.length === 0 ? (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-sm text-orange-700">
              No rooms available for the selected dates. Please choose different dates.
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="walkin-room">Room Number *</Label>
              <Select
                value={form.roomNumber}
                onValueChange={(v) => onFieldChange('roomNumber', v)}
                disabled={dateFilteredRooms.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {dateFilteredRooms
                    .filter((room) => room && (!form.roomType || room.type === form.roomType))
                    .map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.number ? `Room ${room.number}` : `Room ${room.id}`} - {room.type || 'N/A'} (
                        {room.price?.toLocaleString() || '0'} ETB/night)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="walkin-payment">Payment Method *</Label>
            <Select
              value={form.paymentMethod}
              onValueChange={(v) => onFieldChange('paymentMethod', v as WalkInFormState['paymentMethod'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="walkin-requests">Special Requests</Label>
            <Textarea
              id="walkin-requests"
              value={form.specialRequests}
              onChange={(e) => onFieldChange('specialRequests', e.target.value)}
              placeholder="Any special requests or notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitDisabled}>
            Create Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


