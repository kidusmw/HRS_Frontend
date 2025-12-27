import { useEffect, useState } from 'react'
import { format, startOfToday } from 'date-fns'
import { getUnavailableCheckInDates, getUnavailableCheckOutDates } from '../api/receptionistApi'

type Args = {
  enabled: boolean
  roomType: string
  checkIn: string
  days?: number
}

export function useWalkInUnavailableDates({ enabled, roomType, checkIn, days = 90 }: Args) {
  const [unavailableCheckInDates, setUnavailableCheckInDates] = useState<string[]>([])
  const [unavailableCheckOutDates, setUnavailableCheckOutDates] = useState<string[]>([])

  // Load unavailable check-in dates
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!enabled || !roomType) {
        setUnavailableCheckInDates([])
        return
      }

      try {
        const today = format(startOfToday(), 'yyyy-MM-dd')
        const res = await getUnavailableCheckInDates({
          room_type: roomType,
          start: today,
          days,
        })
        if (!cancelled) setUnavailableCheckInDates(res.data || [])
      } catch {
        if (!cancelled) setUnavailableCheckInDates([])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [enabled, roomType, days])

  // Load unavailable check-out dates once check-in is selected
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!enabled || !roomType || !checkIn) {
        setUnavailableCheckOutDates([])
        return
      }

      try {
        const res = await getUnavailableCheckOutDates({
          room_type: roomType,
          check_in: checkIn,
          days,
        })
        if (!cancelled) setUnavailableCheckOutDates(res.data || [])
      } catch {
        if (!cancelled) setUnavailableCheckOutDates([])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [enabled, roomType, checkIn, days])

  return {
    unavailableCheckInDates,
    unavailableCheckOutDates,
  }
}


