import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Hotel } from '../data/mockData'

type Props = {
  hotel: Hotel
  onView: () => void
  onReserve: () => void
}

export function HotelCard({ hotel, onReserve, onView }: Props) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 h-48 sm:h-auto">
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">{hotel.name}</div>
                <div className="text-sm text-muted-foreground">
                  {hotel.city}, {hotel.country}
                </div>
                <div className="text-xs text-muted-foreground">{hotel.address}</div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {hotel.rating.toFixed(1)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {hotel.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.slice(0, 4).map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                </Badge>
              ))}
              {hotel.amenities.length > 4 && (
                <Badge variant="outline">+{hotel.amenities.length - 4} more</Badge>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-lg font-semibold">${hotel.priceFrom} / night</div>
                <div className="text-xs text-muted-foreground">
                  Avg. rating {hotel.reviewSummary.averageRating.toFixed(1)} ·{' '}
                  {hotel.reviewSummary.totalReviews} reviews
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onView}>
                  View details
                </Button>
                <Button onClick={onReserve}>Reserve</Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

