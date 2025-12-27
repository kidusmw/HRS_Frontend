import { useCallback, useState } from 'react'
import type { ReceptionistReservation } from '../api/receptionistApi'

export type EditReservationFormState = {
  roomNumber: string
  checkIn: string
  checkOut: string
  specialRequests: string
}

export function useReservationDialogs() {
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false)
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const [selectedReservation, setSelectedReservation] = useState<ReceptionistReservation | null>(null)
  const [editForm, setEditForm] = useState<EditReservationFormState>({
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
  })

  const closeAll = useCallback(() => {
    setWalkInDialogOpen(false)
    setCheckInDialogOpen(false)
    setCheckOutDialogOpen(false)
    setEditDialogOpen(false)
    setConfirmDialogOpen(false)
    setCancelDialogOpen(false)
  }, [])

  const openWalkIn = useCallback(() => {
    setWalkInDialogOpen(true)
  }, [])

  const openCheckIn = useCallback((reservation: ReceptionistReservation) => {
    setSelectedReservation(reservation)
    setCheckInDialogOpen(true)
  }, [])

  const openCheckOut = useCallback((reservation: ReceptionistReservation) => {
    setSelectedReservation(reservation)
    setCheckOutDialogOpen(true)
  }, [])

  const openConfirm = useCallback((reservation: ReceptionistReservation) => {
    setSelectedReservation(reservation)
    setConfirmDialogOpen(true)
  }, [])

  const openCancel = useCallback((reservation: ReceptionistReservation) => {
    setSelectedReservation(reservation)
    setCancelDialogOpen(true)
  }, [])

  const openEdit = useCallback((reservation: ReceptionistReservation) => {
    setSelectedReservation(reservation)
    setEditForm({
      roomNumber: reservation.room_id?.toString() || '',
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      specialRequests: reservation.special_requests || '',
    })
    setEditDialogOpen(true)
  }, [])

  const clearSelectedReservation = useCallback(() => {
    setSelectedReservation(null)
  }, [])

  return {
    // state
    walkInDialogOpen,
    checkInDialogOpen,
    checkOutDialogOpen,
    editDialogOpen,
    confirmDialogOpen,
    cancelDialogOpen,
    selectedReservation,
    editForm,

    // setters (for Dialog onOpenChange)
    setWalkInDialogOpen,
    setCheckInDialogOpen,
    setCheckOutDialogOpen,
    setEditDialogOpen,
    setConfirmDialogOpen,
    setCancelDialogOpen,
    setSelectedReservation,
    setEditForm,

    // helpers
    closeAll,
    openWalkIn,
    openCheckIn,
    openCheckOut,
    openEdit,
    openConfirm,
    openCancel,
    clearSelectedReservation,
  }
}


