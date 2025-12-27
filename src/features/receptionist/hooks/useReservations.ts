import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  confirmReservation,
  createWalkInReservation,
  getReservations,
  type CreateWalkInReservationParams,
  type ReceptionistReservation,
} from '../api/receptionistApi'

export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
}

export type ReservationsDateRange = { start: string; end: string }

export type Notify = {
  success: (message: string) => void
  error: (message: string) => void
}

export function useReservations(args?: {
  notify?: Notify
  onAfterMutation?: () => Promise<void> | void
}) {
  const notify = args?.notify

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<ReservationsDateRange>({ start: '', end: '' })

  const [reservations, setReservations] = useState<ReceptionistReservation[]>([])
  const [loading, setLoading] = useState(true)

  const queryParams = useMemo(() => {
    const params: any = { per_page: 100 }
    if (search) params.search = search
    if (status !== 'all') params.status = status
    if (dateRange.start) params.date_from = dateRange.start
    if (dateRange.end) params.date_to = dateRange.end
    return params
  }, [search, status, dateRange.start, dateRange.end])

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getReservations(queryParams)
      setReservations(response.data || [])
    } catch (error: any) {
      notify?.error?.(error?.response?.data?.message || 'Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }, [notify, queryParams])

  useEffect(() => {
    loadReservations()
  }, [loadReservations])

  const afterMutation = useCallback(async () => {
    await loadReservations()
    await args?.onAfterMutation?.()
  }, [args, loadReservations])

  const confirm = useCallback(
    async (reservationId: number) => {
      await confirmReservation(reservationId)
      notify?.success?.('Reservation confirmed')
      await afterMutation()
    },
    [afterMutation, notify]
  )

  const cancel = useCallback(
    async (reservationId: number) => {
      await cancelReservation(reservationId)
      notify?.success?.('Reservation cancelled')
      await afterMutation()
    },
    [afterMutation, notify]
  )

  const checkIn = useCallback(
    async (reservationId: number) => {
      await checkInReservation(reservationId)
      notify?.success?.('Guest checked in successfully')
      await afterMutation()
    },
    [afterMutation, notify]
  )

  const checkOut = useCallback(
    async (reservationId: number) => {
      await checkOutReservation(reservationId)
      notify?.success?.('Guest checked out successfully')
      await afterMutation()
    },
    [afterMutation, notify]
  )

  const createWalkIn = useCallback(
    async (params: CreateWalkInReservationParams) => {
      await createWalkInReservation(params)
      notify?.success?.('Walk-in reservation created')
      await afterMutation()
    },
    [afterMutation, notify]
  )

  return {
    // list
    reservations,
    loading,
    loadReservations,

    // filters
    search,
    setSearch,
    status,
    setStatus,
    dateRange,
    setDateRange,

    // actions
    confirm,
    cancel,
    checkIn,
    checkOut,
    createWalkIn,
  }
}


