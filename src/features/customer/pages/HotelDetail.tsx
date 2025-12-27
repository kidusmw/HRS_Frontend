import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { addDays, format, differenceInDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  createReservationIntent,
  getAvailability,
  getHotelById,
  getReviews,
} from '../api/customerApi'
import { AuthPromptDialog } from '../components/AuthPromptDialog'
import { AvailabilityCard } from '../components/AvailabilityCard'
import { ConfirmationDialog } from '../components/ConfirmationDialog'
import { GuestReviewsCard } from '../components/GuestReviewsCard'
import { HotelHeader } from '../components/HotelHeader'
import { HotelImageGallery } from '../components/HotelImageGallery'
import { OverviewCard } from '../components/OverviewCard'
import { ReserveCard } from '../components/ReserveCard'
import type { AvailabilityByType, Hotel, Review } from '../types'
import { useUnavailableCustomerDates } from '../hooks/useUnavailableCustomerDates'

export function HotelDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 2),
  })
  const [availability, setAvailability] = useState<AvailabilityByType[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<AvailabilityByType | null>(null)

  const [reviews, setReviews] = useState<Review[]>([])
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([getHotelById(id), getReviews(id)])
      .then(([hotelData, reviewData]) => {
        if (!hotelData) {
          setError('Hotel not found.')
          setHotel(null)
        } else {
          setHotel(hotelData)
          setReviews(reviewData)
        }
      })
      .catch(() => setError('Unable to load this hotel right now.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !dateRange?.from || !dateRange?.to) return
    setLoadingAvailability(true)
    setSelectedRoomType(null) // Clear selection when dates change
    getAvailability({ hotelId: id, startDate: dateRange.from, endDate: dateRange.to })
      .then(setAvailability)
      .finally(() => setLoadingAvailability(false))
  }, [id, dateRange])

  const { unavailableCheckInDates, unavailableCheckOutDates } = useUnavailableCustomerDates({
    enabled: Boolean(id) && Boolean(selectedRoomType?.type),
    hotelId: String(id ?? ''),
    roomType: selectedRoomType?.type ?? '',
    checkIn: dateRange?.from,
    days: 90,
  })

  const avgRating = useMemo(() => hotel?.reviewSummary.averageRating ?? 0, [hotel])

  // Calculate number of nights and total price
  const numberOfNights = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return 0
    return differenceInDays(dateRange.to, dateRange.from)
  }, [dateRange])

  const totalPrice = useMemo(() => {
    if (!selectedRoomType?.priceFrom || numberOfNights === 0) return null
    return selectedRoomType.priceFrom * numberOfNights
  }, [selectedRoomType, numberOfNights])

  const handlePayToConfirm = () => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
    if (!selectedRoomType || !dateRange?.from || !dateRange?.to) {
      return
    }
    // Check if user has a valid phone number
    if (!user.phoneNumber || !/^\+[1-9]\d{1,14}$/.test(user.phoneNumber)) {
      alert('Please complete your profile by adding a valid phone number before making a reservation.')
      navigate('/profile')
      return
    }
    setShowConfirmDialog(true)
  }

  const handleConfirmPayment = async () => {
    if (!hotel || !selectedRoomType || !dateRange?.from || !dateRange?.to || !user) {
      return
    }

    setIsProcessingPayment(true)
    try {
      const returnUrl = `${window.location.origin}/payment/return`
      const response = await createReservationIntent({
        hotel_id: parseInt(hotel.id),
        room_type: selectedRoomType.type,
        check_in: format(dateRange.from, 'yyyy-MM-dd'),
        check_out: format(dateRange.to, 'yyyy-MM-dd'),
        guests: 1,
        return_url: returnUrl,
      })

      // Redirect to Chapa checkout
      // Fallback: store tx_ref in case gateway doesn't append it to return_url
      try {
        sessionStorage.setItem('chapa_tx_ref', response.tx_ref)
      } catch {
        // ignore storage errors (private mode, etc.)
      }
      window.location.href = response.checkout_url
    } catch (error: any) {
      console.error('Failed to create reservation intent:', error)
      
      // Check if error is due to missing/invalid phone number
      if (error.response?.status === 422) {
        const errors = error.response?.data?.errors
        if (errors?.phoneNumber) {
          alert('Please complete your profile by adding a valid phone number before making a reservation.')
          navigate('/profile')
          setIsProcessingPayment(false)
          setShowConfirmDialog(false)
          return
        }
      }
      
      alert(error.response?.data?.message || 'Failed to initiate payment. Please try again.')
      setIsProcessingPayment(false)
      setShowConfirmDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
        {error ?? 'Hotel not found.'}
        <div className="pt-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to explore
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <HotelHeader hotel={hotel} avgRating={avgRating} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_40%] lg:items-stretch">
          {/* Left column - 60% */}
          <div className="min-w-0 space-y-6">
            <HotelImageGallery images={hotel.images ?? []} hotelName={hotel.name} />
            <OverviewCard hotel={hotel} />
            <GuestReviewsCard reviews={reviews} />
          </div>

          {/* Right column - 40% */}
          <div className="min-w-0 space-y-4 lg:sticky lg:top-4">
            <ReserveCard
              selectedRoomType={selectedRoomType}
              dateRange={dateRange}
              totalPrice={totalPrice}
              numberOfNights={numberOfNights}
              isProcessingPayment={isProcessingPayment}
              onPayClick={handlePayToConfirm}
              className="lg:h-[420px]"
            />
            <AvailabilityCard
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              availability={availability}
              loadingAvailability={loadingAvailability}
              selectedRoomType={selectedRoomType}
              onRoomTypeSelect={setSelectedRoomType}
              unavailableCheckInDates={unavailableCheckInDates}
              unavailableCheckOutDates={unavailableCheckOutDates}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        selectedRoomType={selectedRoomType}
        dateRange={dateRange}
        numberOfNights={numberOfNights}
        totalPrice={totalPrice}
        isProcessingPayment={isProcessingPayment}
        onConfirm={handleConfirmPayment}
      />

      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} />
    </div>
  )
}

