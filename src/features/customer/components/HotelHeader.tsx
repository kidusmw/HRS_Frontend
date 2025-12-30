import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Hotel } from '../types'

type Props = {
  hotel: Hotel
  avgRating: number
}

export function HotelHeader({ hotel, avgRating }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-muted-foreground">Hotel</div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
            <Star className="h-4 w-4 fill-primary" />
            {avgRating.toFixed(1)} ({hotel.reviewSummary.totalReviews} reviews)
          </span>
          <Badge variant="outline">{hotel.city}</Badge>
        </div>
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span>
          {hotel.address}, {hotel.city}, {hotel.country}
        </span>
      </div>
    </div>
  )
}

