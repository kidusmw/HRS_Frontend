import { format } from 'date-fns'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Review } from '../types'

type Props = {
  reviews: Review[]
}

export function GuestReviewsCard({ reviews }: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Guest reviews</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{review.userName}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      {review.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(review.date), 'MMM d, yyyy')}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

