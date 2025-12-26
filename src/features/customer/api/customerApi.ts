import { addDays, isAfter, isBefore, parseISO } from 'date-fns'
import {
  mockAvailability,
  mockHotels,
  mockReviews,
  type AvailabilityDay,
  type Hotel,
  type Review,
} from '../data/mockData'

export type HotelSearchParams = {
  search?: string
  minRating?: number
  maxPrice?: number
  sort?: 'price-asc' | 'price-desc' | 'rating-desc'
}

const delay = <T,>(data: T, ms = 300) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))

export async function getHotels(params: HotelSearchParams = {}): Promise<Hotel[]> {
  const { search, minRating, maxPrice, sort } = params

  let results = [...mockHotels]

  if (search && search.trim()) {
    const q = search.toLowerCase()
    results = results.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.country.toLowerCase().includes(q)
    )
  }

  if (minRating) {
    results = results.filter((h) => h.rating >= minRating)
  }

  if (maxPrice) {
    results = results.filter((h) => h.priceFrom <= maxPrice)
  }

  if (sort === 'price-asc') {
    results = results.sort((a, b) => a.priceFrom - b.priceFrom)
  } else if (sort === 'price-desc') {
    results = results.sort((a, b) => b.priceFrom - a.priceFrom)
  } else if (sort === 'rating-desc') {
    results = results.sort((a, b) => b.rating - a.rating)
  }

  return delay(results)
}

export async function getHotelById(id: string): Promise<Hotel | undefined> {
  const hotel = mockHotels.find((h) => h.id === id)
  return delay(hotel)
}

export async function getAvailability(options: {
  hotelId: string
  startDate: Date
  endDate: Date
}): Promise<AvailabilityDay[]> {
  const { hotelId, startDate, endDate } = options
  const days = mockAvailability[hotelId] ?? []

  const filtered = days.filter((day) => {
    const d = parseISO(day.date)
    return (
      (isAfter(d, addDays(startDate, -1)) || d.getTime() === startDate.getTime()) &&
      (isBefore(d, addDays(endDate, 1)) || d.getTime() === endDate.getTime())
    )
  })

  return delay(filtered)
}

export async function getReviews(hotelId: string): Promise<Review[]> {
  const reviews = mockReviews.filter((r) => r.hotelId === hotelId)
  return delay(reviews)
}

