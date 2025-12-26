import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { addDays, format, differenceInDays } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { MapPin, ShieldCheck, Star } from 'lucide-react'
import type { RootState } from '@/app/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { getAvailability, getHotelById, getReviews } from '../api/customerApi'
import type { AvailabilityByType, Hotel, Review } from '../data/mockData'

export function HotelDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
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
  const [showReserved, setShowReserved] = useState(false)

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

  const handleReserve = () => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
    setShowReserved(true)
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
              <Badge variant="secondary">Mock data</Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {hotel.address}, {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 grid grid-cols-2 gap-2">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="col-span-2 h-64 w-full rounded-lg object-cover"
              loading="lazy"
            />
            {hotel.images.slice(1).map((src) => (
              <img
                key={src}
                src={src}
                alt={hotel.name}
                className="h-32 w-full rounded-lg object-cover"
                loading="lazy"
              />
            ))}
          </div>
          <Card className="md:col-span-1 self-start shadow-sm sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Reserve your stay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRoomType ? (
                <>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Selected: {selectedRoomType.type}</div>
                    {dateRange?.from && (
                      <div className="text-sm text-muted-foreground">
                        Check-in: {format(dateRange.from, 'MMM d, yyyy')}
                      </div>
                    )}
                    {dateRange?.to && (
                      <div className="text-sm text-muted-foreground">
                        Check-out: {format(dateRange.to, 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  {selectedRoomType.priceFrom !== null && selectedRoomType.priceFrom !== undefined ? (
                    <div className="space-y-1">
                      <div className="text-2xl font-semibold">
                        {totalPrice !== null ? `$${totalPrice.toFixed(2)}` : `$${selectedRoomType.priceFrom} / night`}
                      </div>
                      {totalPrice !== null && numberOfNights > 0 && (
                        <div className="text-sm text-muted-foreground">
                          ${selectedRoomType.priceFrom} × {numberOfNights} {numberOfNights === 1 ? 'night' : 'nights'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-muted-foreground">Sold out</div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a room type and dates to see pricing
                </div>
              )}
              <Button className="w-full" onClick={handleReserve} disabled={!selectedRoomType || !user}>
                Reserve
              </Button>
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Secure checkout will be enabled in Phase 2.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{hotel.description}</p>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Location</h3>
                <div className="rounded-lg border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                  Map placeholder · {hotel.city}, {hotel.country}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
              <div className="space-y-4">
                {loadingAvailability && <Skeleton className="h-16 w-full" />}
                {!loadingAvailability && availability.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No availability for the selected dates.
                  </p>
                )}
                {!loadingAvailability &&
                  availability.map((typeAvailability) => {
                    const isSelected = selectedRoomType?.type === typeAvailability.type
                    const isAvailable = typeAvailability.availableRooms !== undefined && typeAvailability.availableRooms > 0
                    
                    return (
                      <div
                        key={typeAvailability.type}
                        onClick={() => isAvailable && setSelectedRoomType(typeAvailability)}
                        className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : isAvailable
                            ? 'hover:bg-muted/50'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <h4 className="text-sm font-semibold">
                          {typeAvailability.type}
                          {typeAvailability.totalRooms !== undefined && (
                            <> - {typeAvailability.totalRooms} {typeAvailability.totalRooms === 1 ? 'Room' : 'Rooms'}</>
                          )}
                          {typeAvailability.availableRooms !== undefined && typeAvailability.availableRooms > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({typeAvailability.availableRooms} available)
                            </span>
                          )}
                        </h4>
                        <span className="font-medium">
                          {typeAvailability.priceFrom !== null && typeAvailability.priceFrom !== undefined
                            ? `$${typeAvailability.priceFrom}`
                            : 'Sold out'}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Guest reviews</CardTitle>
          </CardHeader>
          <CardContent>
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
      </div>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to reserve</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            You can explore without signing in. To reserve, please login or create an account.
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              onClick={() =>
                navigate('/login', { state: { from: location.pathname + location.search } })
              }
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate('/register', { state: { from: location.pathname + location.search } })
              }
            >
              Create account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReserved} onOpenChange={setShowReserved}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservation saved (mock)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            In Phase 2 this will create a real reservation. For now we confirm your intent with mock
            data.
          </p>
          <div className="pt-4">
            <Button onClick={() => setShowReserved(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

