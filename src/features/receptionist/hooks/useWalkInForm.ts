import { useCallback, useMemo, useState } from 'react'
import type { CreateWalkInReservationParams } from '../api/receptionistApi'

export type WalkInFormState = {
  guestName: string
  guestEmail: string
  guestPhone: string
  roomType: string
  roomNumber: string
  checkIn: string
  checkOut: string
  paymentMethod: 'cash' | 'transfer'
  specialRequests: string
}

export function useWalkInForm(args?: { initialCheckIn?: string }) {
  const initialCheckIn = args?.initialCheckIn ?? new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<WalkInFormState>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomType: '',
    roomNumber: '',
    checkIn: initialCheckIn,
    checkOut: '',
    paymentMethod: 'cash',
    specialRequests: '',
  })

  const setField = useCallback(<K extends keyof WalkInFormState>(key: K, value: WalkInFormState[K]) => {
    setForm((prev) => {
      // When date/type changes we must clear selected room
      if (key === 'roomType' || key === 'checkIn' || key === 'checkOut') {
        return { ...prev, [key]: value, roomNumber: '' }
      }
      return { ...prev, [key]: value }
    })
  }, [])

  const reset = useCallback(() => {
    setForm({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomType: '',
      roomNumber: '',
      checkIn: initialCheckIn,
      checkOut: '',
      paymentMethod: 'cash',
      specialRequests: '',
    })
  }, [initialCheckIn])

  const canSubmit = useMemo(() => {
    return Boolean(form.guestName && form.roomNumber && form.checkIn && form.checkOut)
  }, [form.guestName, form.roomNumber, form.checkIn, form.checkOut])

  const toCreatePayload = useCallback((): CreateWalkInReservationParams => {
    return {
      guestName: form.guestName,
      guestEmail: form.guestEmail || undefined,
      guestPhone: form.guestPhone || undefined,
      roomNumber: form.roomNumber ? parseInt(form.roomNumber, 10) : 0,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      paymentMethod: form.paymentMethod,
      specialRequests: form.specialRequests || undefined,
    }
  }, [form])

  return {
    form,
    setForm,
    setField,
    reset,
    canSubmit,
    toCreatePayload,
  }
}


