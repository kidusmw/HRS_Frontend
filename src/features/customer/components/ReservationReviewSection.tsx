import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { MyReview } from '../api/customerApi'

type Props = {
  hotelId: number | null
  reservationStatus: string
  existingReview?: MyReview | null
  isSubmitting?: boolean
  onSubmit: (payload: { hotelId: number; rating: number; comment: string }) => void | Promise<void>
}

export function ReservationReviewSection({
  hotelId,
  reservationStatus,
  existingReview,
  isSubmitting = false,
  onSubmit,
}: Props) {
  const canReview = useMemo(() => reservationStatus?.toLowerCase() === 'checked_out', [reservationStatus])
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 0)
  const [comment, setComment] = useState<string>(existingReview?.comment ?? '')

  const isReadOnly = Boolean(existingReview)

  const handleSubmit = async () => {
    if (!hotelId) return
    if (!canReview) return
    if (rating < 1 || rating > 5) return
    if (!comment.trim()) return
    await onSubmit({ hotelId, rating, comment: comment.trim() })
  }

  return (
    <div className="mt-5 border-t pt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Your review</div>
        {!canReview && !existingReview ? (
          <div className="text-xs text-muted-foreground">Available after checkout</div>
        ) : null}
      </div>

      <div className="mt-3 space-y-3">
        <div className={cn('flex items-center gap-1', !canReview && !existingReview && 'opacity-60')}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const value = idx + 1
            const filled = rating >= value
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  if (isReadOnly) return
                  if (!canReview) return
                  setRating(value)
                }}
                className={cn('rounded-sm p-0.5', !isReadOnly && canReview && 'hover:bg-muted')}
                aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
                disabled={isReadOnly || !canReview}
              >
                <Star className={cn('h-4 w-4', filled ? 'fill-primary text-primary' : 'text-muted-foreground')} />
              </button>
            )
          })}
          {rating > 0 ? <span className="ml-2 text-xs text-muted-foreground">{rating}/5</span> : null}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            canReview
              ? 'Share what you liked (or what could be better)...'
              : 'You can leave a review after you check out.'
          }
          disabled={isReadOnly || !canReview}
          className="min-h-[96px]"
        />

        {existingReview ? (
          <div className="text-xs text-muted-foreground">Thanks! You’ve already reviewed this hotel.</div>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canReview || !hotelId || rating < 1 || !comment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit review'}
          </Button>
        )}
      </div>
    </div>
  )
}


