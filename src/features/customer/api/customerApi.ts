import { format } from 'date-fns'
import api from '@/lib/axios'
import type { AvailabilityByType, Hotel, Review } from '../types'

export type HotelSearchParams = {
  search?: string
  minRating?: number
  maxPrice?: number
  sort?: 'price-asc' | 'price-desc' | 'rating-desc'
}

interface ApiHotelListItem {
  id: string
  name: string
  city: string
  country: string
  address: string
  priceFrom: number
  rating: number
  images: string[]
  reviewSummary: {
    averageRating: number
    totalReviews: number
  }
}

interface ApiHotelDetail {
  id: string
  name: string
  city: string
  country: string
  address: string
  description: string
  images: string[]
  roomTypes: Array<{
    type: string
    priceFrom: number
    description: string | null
    images: string[]
  }>
  reviewSummary: {
    averageRating: number
    totalReviews: number
  }
}

interface ApiReview {
  id: string
  hotelId: string
  userName: string
  rating: number
  date: string
  comment: string
}

interface ApiAvailabilityResponse {
  data: AvailabilityByType[]
}

export async function getHotels(params: HotelSearchParams = {}): Promise<Hotel[]> {
  const { search, minRating, maxPrice, sort } = params

  const queryParams: Record<string, string> = {}
  if (search) queryParams.search = search
  if (sort) queryParams.sort = sort

  const response = await api.get<{ data: ApiHotelListItem[]; meta: any }>('/customer/hotels', {
    params: queryParams,
  })

  let results = response.data.data.map((h) => ({
    id: h.id,
    name: h.name,
    city: h.city,
    country: h.country,
    address: h.address,
    rating: h.rating,
    priceFrom: h.priceFrom,
    description: '', // Not in list view
    images: h.images,
    reviewSummary: h.reviewSummary,
  }))

  // Client-side filtering for minRating and maxPrice (backend doesn't support these yet)
  if (minRating) {
    results = results.filter((h) => h.rating >= minRating)
  }

  if (maxPrice) {
    results = results.filter((h) => h.priceFrom <= maxPrice)
  }

  return results
}

export async function getHotelById(id: string): Promise<Hotel | undefined> {
  try {
    const response = await api.get<ApiHotelDetail>(`/customer/hotels/${id}`)
    const h = response.data
    // Calculate priceFrom from roomTypes
    const priceFrom = h.roomTypes && h.roomTypes.length > 0
      ? Math.min(...h.roomTypes.map(rt => rt.priceFrom))
      : 0

    return {
      id: String(h.id),
      name: h.name,
      city: h.city,
      country: h.country,
      address: h.address,
      rating: h.reviewSummary.averageRating,
      priceFrom,
      description: h.description,
      images: h.images,
      reviewSummary: h.reviewSummary,
      roomTypes: h.roomTypes,
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      return undefined
    }
    throw error
  }
}

export async function getAvailability(options: {
  hotelId: string
  startDate: Date
  endDate: Date
}): Promise<AvailabilityByType[]> {
  const { hotelId, startDate, endDate } = options

  const response = await api.get<ApiAvailabilityResponse>(
    `/customer/hotels/${hotelId}/availability`,
    {
      params: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      },
    }
  )

  return response.data.data
}

export async function getUnavailableCustomerCheckInDates(options: {
  hotelId: string
  roomType: string
  start: Date
  days?: number
}): Promise<string[]> {
  const response = await api.get<{ data: string[] }>(
    `/customer/hotels/${options.hotelId}/availability/checkin-dates`,
    {
      params: {
        room_type: options.roomType,
        start: format(options.start, 'yyyy-MM-dd'),
        days: options.days ?? 90,
      },
    }
  )

  return response.data.data
}

export async function getUnavailableCustomerCheckOutDates(options: {
  hotelId: string
  roomType: string
  checkIn: Date
  days?: number
}): Promise<string[]> {
  const response = await api.get<{ data: string[] }>(
    `/customer/hotels/${options.hotelId}/availability/checkout-dates`,
    {
      params: {
        room_type: options.roomType,
        check_in: format(options.checkIn, 'yyyy-MM-dd'),
        days: options.days ?? 90,
      },
    }
  )

  return response.data.data
}

export async function getReviews(hotelId: string): Promise<Review[]> {
  const response = await api.get<{ data: ApiReview[]; meta: any }>(
    `/customer/hotels/${hotelId}/reviews`
  )

  return response.data.data.map((r) => ({
    id: r.id,
    hotelId: r.hotelId,
    userName: r.userName,
    rating: r.rating,
    date: r.date,
    comment: r.comment,
  }))
}

export interface CreateReservationIntentPayload {
  hotel_id: number
  room_type: string
  check_in: string
  check_out: string
  guests: number
  return_url?: string
}

export interface CreateReservationIntentResponse {
  intent_id: number
  checkout_url: string
  tx_ref: string
}

export interface PaymentStatusResponse {
  payment_status: string
  intent_status: string
  reservation_id: number | null
}

export async function createReservationIntent(
  payload: CreateReservationIntentPayload
): Promise<CreateReservationIntentResponse> {
  const response = await api.post<{
    message: string
    data: CreateReservationIntentResponse
  }>('/customer/reservation-intents', payload)

  return response.data.data
}

export async function getPaymentStatus(txRef: string): Promise<PaymentStatusResponse> {
  const response = await api.get<{ data: PaymentStatusResponse }>(
    '/customer/payments/status',
    {
      params: { tx_ref: txRef },
    }
  )

  return response.data.data
}

export interface CustomerReservation {
  id: number
  hotelId: number | null
  hotelName: string
  roomType: string
  roomNumber: number | null
  checkIn: string
  checkOut: string
  status: string
  totalAmount: number
  amountPaid: number
  currency: string
  paymentStatus: string
  createdAt: string
}

export async function getMyReservations(): Promise<CustomerReservation[]> {
  const response = await api.get<{ data: CustomerReservation[] }>(
    '/customer/reservations'
  )

  return response.data.data
}

export interface MyReview {
  id: string
  hotelId: string
  rating: number
  comment: string
  createdAt?: string | null
  updatedAt?: string | null
}

export async function getMyReviews(): Promise<MyReview[]> {
  const response = await api.get<{ data: MyReview[] }>('/customer/reviews/mine')
  return response.data.data
}

export interface CreateReviewPayload {
  hotel_id: number
  rating: number
  review: string
}

export async function createReview(payload: CreateReviewPayload): Promise<MyReview> {
  const response = await api.post<{ message: string; data: MyReview }>('/customer/reviews', payload)
  return response.data.data
}

