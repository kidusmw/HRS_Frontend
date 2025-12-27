import { useCallback, useEffect, useMemo } from 'react'
import { Filter, Plus, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import type { ReservationStatus } from '../hooks/useReservations'
import { reservationStatusLabels } from '../hooks/useReservations'
import { useReservations } from '../hooks/useReservations'
import { useRooms } from '../hooks/useRooms'
import { useWalkInForm } from '../hooks/useWalkInForm'
import { useReservationDialogs } from '../hooks/useReservationDialogs'
import { useWalkInUnavailableDates } from '../hooks/useWalkInUnavailableDates'
import { ReservationsTable } from '../components/ReservationsTable'
import { WalkInDialog } from '../components/WalkInDialog'
import { CheckInDialog } from '../components/CheckInDialog'
import { CheckOutDialog } from '../components/CheckOutDialog'
import { EditReservationDialog } from '../components/EditReservationDialog'
import { ConfirmReservationDialog } from '../components/ConfirmReservationDialog'
import { CancelReservationDialog } from '../components/CancelReservationDialog'

export function Reservations() {
  const [searchParams, setSearchParams] = useSearchParams()

  const dialogs = useReservationDialogs()
  const walkIn = useWalkInForm()

  const notifyError = useCallback((m: string) => toast.error(m), [])
  const notifySuccess = useCallback((m: string) => toast.success(m), [])

  const roomsNotify = useMemo(() => ({ error: notifyError }), [notifyError])
  const reservationsNotify = useMemo(
    () => ({ success: notifySuccess, error: notifyError }),
    [notifySuccess, notifyError]
  )

  const rooms = useRooms({
    notify: roomsNotify,
    availability: {
      enabled: dialogs.walkInDialogOpen,
      checkIn: walkIn.form.checkIn,
      checkOut: walkIn.form.checkOut,
      roomType: walkIn.form.roomType,
    },
  })

  const { unavailableCheckInDates, unavailableCheckOutDates } = useWalkInUnavailableDates({
    enabled: dialogs.walkInDialogOpen,
    roomType: walkIn.form.roomType,
    checkIn: walkIn.form.checkIn,
    days: 90,
  })

  const onAfterMutation = useCallback(async () => {
    // Keep existing behavior: refresh rooms after reservation mutations that affect room status
    await rooms.loadRooms()
  }, [rooms.loadRooms])

  const reservationsState = useReservations({
    notify: reservationsNotify,
    onAfterMutation,
  })

  // Preserve existing behavior: refresh rooms when filters change
  useEffect(() => {
    rooms.loadRooms()
  }, [
    reservationsState.search,
    reservationsState.status,
    reservationsState.dateRange.start,
    reservationsState.dateRange.end,
    rooms.loadRooms,
  ])

  // Check URL params for actions
  useEffect(() => {
    const action = searchParams.get('action')
    const id = searchParams.get('id')
    
    if (action === 'walkin') {
      dialogs.openWalkIn()
      setSearchParams({})
      return
    }

    if ((action === 'checkin' || action === 'checkout') && id) {
      const reservation = reservationsState.reservations.find((r) => r.id === parseInt(id, 10))
      if (reservation) {
        if (action === 'checkin') dialogs.openCheckIn(reservation)
        if (action === 'checkout') dialogs.openCheckOut(reservation)
        setSearchParams({})
      }
    }
  }, [dialogs, reservationsState.reservations, searchParams, setSearchParams])

  const handleCreateWalkIn = async () => {
    if (!walkIn.canSubmit) {
      toast.error('Please fill in all required fields')
      return
    }
    await reservationsState.createWalkIn(walkIn.toCreatePayload())
    dialogs.setWalkInDialogOpen(false)
    walkIn.reset()
  }

  const handleConfirmReservation = async () => {
    if (!dialogs.selectedReservation) return
    await reservationsState.confirm(dialogs.selectedReservation.id)
    dialogs.setConfirmDialogOpen(false)
    dialogs.clearSelectedReservation()
  }

  const handleCancelReservation = async () => {
    if (!dialogs.selectedReservation) return
    await reservationsState.cancel(dialogs.selectedReservation.id)
    dialogs.setCancelDialogOpen(false)
    dialogs.clearSelectedReservation()
  }

  const handleCheckIn = async () => {
    if (!dialogs.selectedReservation) return
    await reservationsState.checkIn(dialogs.selectedReservation.id)
    dialogs.setCheckInDialogOpen(false)
    dialogs.clearSelectedReservation()
  }

  const handleCheckOut = async () => {
    if (!dialogs.selectedReservation) return
    await reservationsState.checkOut(dialogs.selectedReservation.id)
    dialogs.setCheckOutDialogOpen(false)
    dialogs.clearSelectedReservation()
  }

  const handleSaveEdit = async () => {
    if (!dialogs.selectedReservation) return
    if (!dialogs.editForm.roomNumber || !dialogs.editForm.checkIn || !dialogs.editForm.checkOut) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.error('Edit reservation functionality requires backend API endpoint')
    dialogs.setEditDialogOpen(false)
    dialogs.clearSelectedReservation()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">
            Manage reservations, check-ins, and check-outs
          </p>
        </div>
        <Button onClick={dialogs.openWalkIn}>
          <Plus className="mr-2 h-4 w-4" />
          Walk-in Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Filter by guest, reservation ID, date range, or status</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-4 px-6 md:flex-row md:items-center">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guest name, ID, or room number..."
              value={reservationsState.search}
              onChange={(e) => reservationsState.setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 md:w-1/4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={reservationsState.status}
              onValueChange={(v) => reservationsState.setStatus(v as ReservationStatus | 'all')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as const).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {reservationStatusLabels[s]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 md:w-1/4">
            <DatePicker
              value={reservationsState.dateRange.start}
              onChange={(value) => reservationsState.setDateRange((prev) => ({ ...prev, start: value }))}
              placeholder="Start date"
              className="flex-1"
            />
            <DatePicker
              value={reservationsState.dateRange.end}
              onChange={(value) => reservationsState.setDateRange((prev) => ({ ...prev, end: value }))}
              placeholder="End date"
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reservation List</CardTitle>
          <CardDescription>
            {reservationsState.loading
              ? 'Loading...'
              : `${reservationsState.reservations.length} reservation${reservationsState.reservations.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
        <ReservationsTable
          loading={reservationsState.loading}
          reservations={reservationsState.reservations}
          onConfirm={dialogs.openConfirm}
          onCheckIn={dialogs.openCheckIn}
          onCheckOut={dialogs.openCheckOut}
          onEdit={dialogs.openEdit}
          onCancel={dialogs.openCancel}
        />
      </Card>

      <WalkInDialog
        open={dialogs.walkInDialogOpen}
        onOpenChange={dialogs.setWalkInDialogOpen}
        form={walkIn.form}
        onFieldChange={walkIn.setField}
        roomTypes={Array.from(new Set(rooms.availableRooms.map((r) => r?.type).filter(Boolean))) as string[]}
        loadingDateFilteredRooms={rooms.loadingDateFilteredRooms}
        dateFilteredRooms={rooms.dateFilteredRooms}
        unavailableCheckInDates={unavailableCheckInDates}
        unavailableCheckOutDates={unavailableCheckOutDates}
        onSubmit={handleCreateWalkIn}
        submitDisabled={
          rooms.loadingDateFilteredRooms ||
          !walkIn.form.roomType ||
          !walkIn.form.checkIn ||
          !walkIn.form.checkOut ||
          rooms.dateFilteredRooms.length === 0 ||
          !walkIn.form.roomNumber ||
          !walkIn.form.guestName
        }
      />

      <CheckInDialog
        open={dialogs.checkInDialogOpen}
        onOpenChange={dialogs.setCheckInDialogOpen}
        reservation={dialogs.selectedReservation}
        onConfirm={handleCheckIn}
      />

      <CheckOutDialog
        open={dialogs.checkOutDialogOpen}
        onOpenChange={dialogs.setCheckOutDialogOpen}
        reservation={dialogs.selectedReservation}
        onConfirm={handleCheckOut}
      />

      <EditReservationDialog
        open={dialogs.editDialogOpen}
        onOpenChange={dialogs.setEditDialogOpen}
        reservation={dialogs.selectedReservation}
        allRooms={rooms.allRooms}
        form={dialogs.editForm}
        onFormChange={dialogs.setEditForm}
        onSave={handleSaveEdit}
      />

      <ConfirmReservationDialog
        open={dialogs.confirmDialogOpen}
        onOpenChange={dialogs.setConfirmDialogOpen}
        reservation={dialogs.selectedReservation}
        onConfirm={handleConfirmReservation}
      />

      <CancelReservationDialog
        open={dialogs.cancelDialogOpen}
        onOpenChange={dialogs.setCancelDialogOpen}
        reservation={dialogs.selectedReservation}
        onConfirm={handleCancelReservation}
      />
    </div>
  )
}