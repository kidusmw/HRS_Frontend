import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWalkInForm } from './useWalkInForm'

describe('useWalkInForm', () => {
  describe('Initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useWalkInForm())

      expect(result.current.form).toMatchObject({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        roomType: '',
        roomNumber: '',
        checkOut: '',
        paymentMethod: 'cash',
        specialRequests: '',
      })
      expect(result.current.form.checkIn).toBeTruthy() // Should be today's date
      expect(result.current.canSubmit).toBe(false)
    })

    it('should use provided initialCheckIn when provided', () => {
      const customDate = '2024-12-25'
      const { result } = renderHook(() => useWalkInForm({ initialCheckIn: customDate }))

      expect(result.current.form.checkIn).toBe(customDate)
    })
  })

  describe('setField', () => {
    it('should update individual fields', () => {
      const { result } = renderHook(() => useWalkInForm())

      act(() => {
        result.current.setField('guestName', 'John Doe')
      })

      expect(result.current.form.guestName).toBe('John Doe')
      expect(result.current.form.guestEmail).toBe('')

      act(() => {
        result.current.setField('guestEmail', 'john@example.com')
      })

      expect(result.current.form.guestEmail).toBe('john@example.com')
      expect(result.current.form.guestName).toBe('John Doe')
    })

    it('should clear roomNumber when roomType changes', () => {
      const { result } = renderHook(() => useWalkInForm())

      // First set a room number
      act(() => {
        result.current.setField('roomNumber', '101')
      })
      expect(result.current.form.roomNumber).toBe('101')

      // Change room type - should clear room number
      act(() => {
        result.current.setField('roomType', 'deluxe')
      })

      expect(result.current.form.roomType).toBe('deluxe')
      expect(result.current.form.roomNumber).toBe('')
    })

    it('should clear roomNumber when checkIn changes', () => {
      const { result } = renderHook(() => useWalkInForm())

      // First set a room number
      act(() => {
        result.current.setField('roomNumber', '101')
      })
      expect(result.current.form.roomNumber).toBe('101')

      // Change check-in date - should clear room number
      act(() => {
        result.current.setField('checkIn', '2024-12-26')
      })

      expect(result.current.form.checkIn).toBe('2024-12-26')
      expect(result.current.form.roomNumber).toBe('')
    })

    it('should clear roomNumber when checkOut changes', () => {
      const { result } = renderHook(() => useWalkInForm())

      // First set a room number
      act(() => {
        result.current.setField('roomNumber', '101')
      })
      expect(result.current.form.roomNumber).toBe('101')

      // Change check-out date - should clear room number
      act(() => {
        result.current.setField('checkOut', '2024-12-28')
      })

      expect(result.current.form.checkOut).toBe('2024-12-28')
      expect(result.current.form.roomNumber).toBe('')
    })

    it('should not clear roomNumber when other fields change', () => {
      const { result } = renderHook(() => useWalkInForm())

      // Set room number
      act(() => {
        result.current.setField('roomNumber', '101')
      })

      // Change other fields - room number should remain
      act(() => {
        result.current.setField('guestName', 'John Doe')
      })
      expect(result.current.form.roomNumber).toBe('101')

      act(() => {
        result.current.setField('paymentMethod', 'transfer')
      })
      expect(result.current.form.roomNumber).toBe('101')
    })
  })

  describe('canSubmit', () => {
    it('should be false when required fields are missing', () => {
      const { result } = renderHook(() => useWalkInForm())

      expect(result.current.canSubmit).toBe(false)

      // Only guest name
      act(() => {
        result.current.setField('guestName', 'John Doe')
      })
      expect(result.current.canSubmit).toBe(false)

      // Guest name + room number
      act(() => {
        result.current.setField('roomNumber', '101')
      })
      expect(result.current.canSubmit).toBe(false)

      // Guest name + room number + check-in
      act(() => {
        result.current.setField('checkIn', '2024-12-25')
      })
      expect(result.current.canSubmit).toBe(false)
    })

    it('should be true when all required fields are present', () => {
      const { result } = renderHook(() => useWalkInForm())

      act(() => {
        // 1. Set context fields first
        result.current.setField('guestName', 'John Doe')
        result.current.setField('checkIn', '2024-12-25')
        result.current.setField('checkOut', '2024-12-27')
        
        // 2. Set room number LAST so it doesn't get cleared
        result.current.setField('roomNumber', '101') 
      })

      expect(result.current.canSubmit).toBe(true)
    })

    it('should be false if any required field becomes empty', () => {
      const { result } = renderHook(() => useWalkInForm())

      // Set all required fields
      act(() => {
        // SET DATES FIRST
        result.current.setField('checkIn', '2024-12-25')
        result.current.setField('checkOut', '2024-12-27')
        // SET ROOM NUMBER LAST
        result.current.setField('guestName', 'John Doe')
        result.current.setField('roomNumber', '101')
      })
      expect(result.current.canSubmit).toBe(true)

      // Clear guest name
      act(() => {
        result.current.setField('guestName', '')
      })
      expect(result.current.canSubmit).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset form to initial state', () => {
      const customDate = '2024-12-25'
      const { result } = renderHook(() => useWalkInForm({ initialCheckIn: customDate }))

      // Fill in some fields
      act(() => {
        result.current.setField('guestName', 'John Doe')
        result.current.setField('guestEmail', 'john@example.com')
        result.current.setField('roomNumber', '101')
        result.current.setField('checkOut', '2024-12-27')
        result.current.setField('paymentMethod', 'transfer')
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.form).toMatchObject({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        roomType: '',
        roomNumber: '',
        checkIn: customDate, // Should reset to initial check-in
        checkOut: '',
        paymentMethod: 'cash',
        specialRequests: '',
      })
      expect(result.current.canSubmit).toBe(false)
    })
  })

  describe('toCreatePayload', () => {
    it('should transform form data to API payload correctly', () => {
      const { result } = renderHook(() => useWalkInForm())

      act(() => {
        // Always set these before roomNumber
        result.current.setField('checkIn', '2024-12-25')
        result.current.setField('checkOut', '2024-12-27')
        
        result.current.setField('guestName', 'John Doe')
        result.current.setField('guestEmail', 'john@example.com')
        result.current.setField('guestPhone', '1234567890')
        result.current.setField('roomNumber', '101') // Set this last!
        result.current.setField('paymentMethod', 'transfer')
        result.current.setField('specialRequests', 'Late check-in')
      })

      const payload = result.current.toCreatePayload()

      expect(payload).toEqual({
        guestName: 'John Doe',
        guestEmail: 'john@example.com',
        guestPhone: '1234567890',
        roomNumber: 101, // Should be parsed as integer
        checkIn: '2024-12-25',
        checkOut: '2024-12-27',
        paymentMethod: 'transfer',
        specialRequests: 'Late check-in',
      })
    })

    it('should convert empty strings to undefined for optional fields', () => {
      const { result } = renderHook(() => useWalkInForm())

      act(() => {
        result.current.setField('guestName', 'John Doe')
        result.current.setField('guestEmail', '') // Empty
        result.current.setField('guestPhone', '') // Empty
        result.current.setField('roomNumber', '101')
        result.current.setField('checkIn', '2024-12-25')
        result.current.setField('checkOut', '2024-12-27')
        result.current.setField('specialRequests', '') // Empty
      })

      const payload = result.current.toCreatePayload()

      expect(payload.guestEmail).toBeUndefined()
      expect(payload.guestPhone).toBeUndefined()
      expect(payload.specialRequests).toBeUndefined()
    })

    it('should parse roomNumber as integer', () => {
      const { result } = renderHook(() => useWalkInForm())

      act(() => {
        // 1. Set dates first
        result.current.setField('checkIn', '2024-12-25')
        result.current.setField('checkOut', '2024-12-27')
        
        // 2. Set other required fields
        result.current.setField('guestName', 'John Doe')
        
        // 3. Set roomNumber LAST
        result.current.setField('roomNumber', '205')
      })

      const payload = result.current.toCreatePayload()

      expect(payload.roomNumber).toBe(205)
      expect(typeof payload.roomNumber).toBe('number')
    })
  })
})
