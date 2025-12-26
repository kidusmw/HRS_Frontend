export type Hotel = {
  id: string
  name: string
  city: string
  country: string
  address: string
  rating: number
  priceFrom: number
  description: string
  images: string[]
  reviewSummary: {
    averageRating: number
    totalReviews: number
  }
  roomTypes?: Array<{
    type: string
    priceFrom: number
    description: string | null
    images: string[]
  }>
}

export type AvailabilityDay = {
  date: string // ISO date
  roomsAvailable: number
  price: number
}

export type AvailabilityByType = {
  type: string
  totalRooms?: number
  availableRooms?: number
  priceFrom?: number | null
}

export type Review = {
  id: string
  hotelId: string
  userName: string
  rating: number
  date: string
  comment: string
}


