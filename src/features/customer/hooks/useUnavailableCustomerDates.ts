import { useEffect, useState } from 'react'
import { startOfToday } from 'date-fns'
import {
  getUnavailableCustomerCheckInDates,
  getUnavailableCustomerCheckOutDates,
} from '../api/customerApi'

type Args = {
  enabled: boolean
  hotelId: string
  roomType: string
  checkIn: Date | undefined
  days?: number
}

export function useUnavailableCustomerDates({ enabled, hotelId, roomType, checkIn, days = 90 }: Args) {
  const [unavailableCheckInDates, setUnavailableCheckInDates] = useState<string[]>([])
  const [unavailableCheckOutDates, setUnavailableCheckOutDates] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!enabled || !hotelId || !roomType) {
        setUnavailableCheckInDates([])
        return
      }

      try {
        const res = await getUnavailableCustomerCheckInDates({
          hotelId,
          roomType,
          start: startOfToday(),
          days,
        })
        if (!cancelled) setUnavailableCheckInDates(res || [])
      } catch {
        if (!cancelled) setUnavailableCheckInDates([])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [enabled, hotelId, roomType, days])

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!enabled || !hotelId || !roomType || !checkIn) {
        setUnavailableCheckOutDates([])
        return
      }

      try {
        const res = await getUnavailableCustomerCheckOutDates({
          hotelId,
          roomType,
          checkIn,
          days,
        })
        if (!cancelled) setUnavailableCheckOutDates(res || [])
      } catch {
        if (!cancelled) setUnavailableCheckOutDates([])
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [enabled, hotelId, roomType, checkIn, days])

  return { unavailableCheckInDates, unavailableCheckOutDates }
}


