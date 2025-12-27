import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAvailableRooms, getRooms, type ReceptionistRoom } from '../api/receptionistApi'

export type RoomsAvailabilityQuery = {
  enabled: boolean
  checkIn: string
  checkOut: string
  roomType: string
}

export type Notify = {
  error: (message: string) => void
}

export function useRooms(args?: { notify?: Notify; availability?: RoomsAvailabilityQuery }) {
  const notify = args?.notify

  const [roomsLoading, setRoomsLoading] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<ReceptionistRoom[]>([])
  const [allRooms, setAllRooms] = useState<ReceptionistRoom[]>([])

  const [dateFilteredRooms, setDateFilteredRooms] = useState<ReceptionistRoom[]>([])
  const [loadingDateFilteredRooms, setLoadingDateFilteredRooms] = useState(false)

  const loadRooms = useCallback(async () => {
    try {
      setRoomsLoading(true)
      const response = await getRooms({ per_page: 100 })
      const rooms = response.data || []
      setAllRooms(rooms)
      setAvailableRooms(rooms.filter((r) => r && r.status === 'available'))
    } catch (error: any) {
      setAvailableRooms([])
      setAllRooms([])
      notify?.error?.(error?.response?.data?.message || 'Failed to load rooms')
    } finally {
      setRoomsLoading(false)
    }
  }, [notify])

  const refreshDateFilteredRooms = useCallback(
    async (params: { checkIn: string; checkOut: string; roomType?: string }) => {
      try {
        setLoadingDateFilteredRooms(true)
        const response = await getAvailableRooms({
          check_in: params.checkIn,
          check_out: params.checkOut,
          room_type: params.roomType || undefined,
        })
        setDateFilteredRooms(response.data || [])
      } catch (error: any) {
        setDateFilteredRooms([])
        notify?.error?.(error?.response?.data?.message || 'Failed to load available rooms')
      } finally {
        setLoadingDateFilteredRooms(false)
      }
    },
    [notify]
  )

  const availability = args?.availability
  const availabilityKey = useMemo(() => {
    if (!availability?.enabled) return ''
    return `${availability.checkIn}|${availability.checkOut}|${availability.roomType}`
  }, [availability?.enabled, availability?.checkIn, availability?.checkOut, availability?.roomType])

  useEffect(() => {
    if (!availability || !availability.enabled) {
      setDateFilteredRooms([])
      return
    }
    if (!availability.checkIn || !availability.checkOut) {
      setDateFilteredRooms([])
      return
    }
    refreshDateFilteredRooms({
      checkIn: availability.checkIn,
      checkOut: availability.checkOut,
      roomType: availability.roomType,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey])

  return {
    roomsLoading,
    availableRooms,
    allRooms,
    loadRooms,
    dateFilteredRooms,
    loadingDateFilteredRooms,
    refreshDateFilteredRooms,
  }
}


