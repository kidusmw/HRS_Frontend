import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import type { ReceptionistRoom, ReceptionistReservation } from '../api/receptionistApi'
import type { EditReservationFormState } from '../hooks/useReservationDialogs'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: ReceptionistReservation | null
  allRooms: ReceptionistRoom[]
  form: EditReservationFormState
  onFormChange: (next: EditReservationFormState) => void
  onSave: () => void
}

export function EditReservationDialog({
  open,
  onOpenChange,
  reservation,
  allRooms,
  form,
  onFormChange,
  onSave,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Reservation</DialogTitle>
          <DialogDescription>Modify reservation details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-room">Room Number *</Label>
            <Select value={form.roomNumber} onValueChange={(v) => onFormChange({ ...form, roomNumber: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {allRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.number || `#${room.id}`} - {room.type} ({room.price?.toLocaleString() || '0'} ETB/night)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-checkin">Check-in Date *</Label>
              <DatePicker
                id="edit-checkin"
                value={form.checkIn}
                onChange={(value) => onFormChange({ ...form, checkIn: value })}
                placeholder="Select check-in date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-checkout">Check-out Date *</Label>
              <DatePicker
                id="edit-checkout"
                value={form.checkOut}
                onChange={(value) => onFormChange({ ...form, checkOut: value })}
                placeholder="Select check-out date"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-requests">Special Requests</Label>
            <Textarea
              id="edit-requests"
              value={form.specialRequests}
              onChange={(e) => onFormChange({ ...form, specialRequests: e.target.value })}
              placeholder="Any special requests or notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


