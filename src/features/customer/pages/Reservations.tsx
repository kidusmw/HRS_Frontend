import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  createReview,
  getMyReservations,
  getMyReviews,
  type CustomerReservation,
  type MyReview,
} from '../api/customerApi'
import { ReservationReviewSection } from '../components/ReservationReviewSection'

function getStatusBadge(status: string) {
  const statusLower = status.toLowerCase()
  
  if (statusLower === 'confirmed' || statusLower === 'checked_in') {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }
  
  if (statusLower === 'pending') {
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        PENDING
      </Badge>
    )
  }
  
  if (statusLower === 'checked_out' || statusLower === 'cancelled') {
    return (
      <Badge variant="outline" className="border-gray-400 text-gray-600">
        <XCircle className="mr-1 h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }
  
  return (
    <Badge variant="outline">
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  )
}

function getPaymentStatusBadge(paymentStatus: string, amountPaid: number, totalAmount: number) {
  if (paymentStatus === 'paid' || amountPaid >= totalAmount) {
    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        PAID
      </Badge>
    )
  }
  
  if (paymentStatus === 'pending' && amountPaid > 0) {
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" />
        PARTIAL
      </Badge>
    )
  }
  
  return (
    <Badge variant="outline" className="border-orange-400 text-orange-600">
      <Clock className="mr-1 h-3 w-3" />
      PENDING
    </Badge>
  )
}

export function Reservations() {
  const [reservations, setReservations] = useState<CustomerReservation[]>([])
  const [reviewsByHotelId, setReviewsByHotelId] = useState<Record<string, MyReview>>({})
  const [submittingHotelId, setSubmittingHotelId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([getMyReservations(), getMyReviews()])
      .then(([reservationData, reviewData]) => {
        setReservations(reservationData)
        const map: Record<string, MyReview> = {}
        for (const r of reviewData) {
          map[String(r.hotelId)] = r
        }
        setReviewsByHotelId(map)
      })
      .catch(() => setError('Unable to load your reservations.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmitReview = async (args: { hotelId: number; rating: number; comment: string }) => {
    setSubmittingHotelId(String(args.hotelId))
    try {
      const created = await createReview({
        hotel_id: args.hotelId,
        rating: args.rating,
        review: args.comment,
      })
      setReviewsByHotelId((prev) => ({ ...prev, [String(args.hotelId)]: created }))
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to submit review. Please try again.')
    } finally {
      setSubmittingHotelId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="border-b bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </section>
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <section className="border-b bg-muted/30">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">My Reservations</h1>
            <p className="text-muted-foreground">View and manage your hotel reservations</p>
          </div>
        </section>
        <div className="mx-auto flex max-w-6xl px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">My Reservations</h1>
          <p className="text-muted-foreground">
            {reservations.length === 0
              ? 'You have no reservations yet.'
              : `You have ${reservations.length} reservation${reservations.length !== 1 ? 's' : ''}.`}
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        {reservations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No reservations found. Start exploring hotels to make a reservation!</p>
            </CardContent>
          </Card>
        ) : (
          reservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{reservation.hotelName}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{reservation.roomType}</span>
                      {reservation.roomNumber && (
                        <>
                          <span>•</span>
                          <span>Room #{reservation.roomNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(reservation.status)}
                    {getPaymentStatusBadge(
                      reservation.paymentStatus,
                      reservation.amountPaid,
                      reservation.totalAmount
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reservation.checkIn), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reservation.checkOut), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Amount Paid</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.amountPaid.toLocaleString()} {reservation.currency}
                        {reservation.amountPaid < reservation.totalAmount && (
                          <span className="text-orange-600 ml-1">
                            / {reservation.totalAmount.toLocaleString()} {reservation.currency}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Booked on</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reservation.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                <ReservationReviewSection
                  hotelId={reservation.hotelId}
                  reservationStatus={reservation.status}
                  existingReview={
                    reservation.hotelId ? reviewsByHotelId[String(reservation.hotelId)] ?? null : null
                  }
                  isSubmitting={reservation.hotelId ? submittingHotelId === String(reservation.hotelId) : false}
                  onSubmit={handleSubmitReview}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

