import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getPaymentStatus } from '../api/customerApi'

type PaymentStatus = 'initiated' | 'pending' | 'paid' | 'completed' | 'failed' | 'refunded'
type IntentStatus = 'pending' | 'confirmed' | 'failed' | 'expired'

export function PaymentReturn() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const txRef =
    searchParams.get('tx_ref') ||
    searchParams.get('trx_ref') ||
    searchParams.get('reference') ||
    (() => {
      try {
        return sessionStorage.getItem('chapa_tx_ref')
      } catch {
        return null
      }
    })()

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [intentStatus, setIntentStatus] = useState<IntentStatus | null>(null)
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const maxPolls = 20 // 20 polls * 3 seconds = 60 seconds max

  useEffect(() => {
    if (!txRef) {
      setError('Missing transaction reference')
      setLoading(false)
      return
    }

    let pollTimeout: ReturnType<typeof setTimeout> | null = null
    let currentPollCount = 0

    const pollStatus = async () => {
      try {
        const status = await getPaymentStatus(txRef)
        setPaymentStatus(status.payment_status as PaymentStatus)
        setIntentStatus(status.intent_status as IntentStatus)
        setReservationId(status.reservation_id)

        // If confirmed, stop polling
        if (status.intent_status === 'confirmed' && status.reservation_id) {
          try {
            sessionStorage.removeItem('chapa_tx_ref')
          } catch {
            // ignore
          }
          setLoading(false)
          return
        }

        // If failed, stop polling
        if (status.intent_status === 'failed' || status.payment_status === 'failed') {
          try {
            sessionStorage.removeItem('chapa_tx_ref')
          } catch {
            // ignore
          }
          setLoading(false)
          return
        }

        // Continue polling if not confirmed yet
        currentPollCount++
        if (currentPollCount < maxPolls) {
          pollTimeout = setTimeout(pollStatus, 3000) // Poll every 3 seconds
        } else {
          setError('Payment confirmation is taking longer than expected. Please check your reservations.')
          setLoading(false)
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Failed to get payment status:', err.message)
        } else {
          console.error('Failed to get payment status:', err)
        }
        setError('Failed to check payment status. Please try again later.')
        setLoading(false)
      }
    }

    // Start polling immediately
    pollStatus()

    // Cleanup on unmount
    return () => {
      if (pollTimeout) {
        clearTimeout(pollTimeout)
      }
    }
  }, [txRef, maxPolls])

  if (!txRef) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-lg font-semibold">Invalid Payment Link</p>
              <p className="text-sm text-muted-foreground">
                Missing transaction reference. Please return to the hotel page and try again.
              </p>
              <Button onClick={() => navigate('/')}>Go to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Confirming Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Please wait while we confirm your payment...
            </p>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-lg font-semibold">Payment Confirmation Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Go to Home
                </Button>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (intentStatus === 'confirmed' && reservationId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-lg font-semibold">Reservation Confirmed!</p>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed and your reservation is confirmed.
              </p>
              <p className="text-xs text-muted-foreground">
                Reservation ID: {reservationId}
              </p>
              <div className="flex gap-2 justify-center pt-4">
                <Button onClick={() => navigate('/')}>Go to Home</Button>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  View My Reservations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (intentStatus === 'failed' || paymentStatus === 'failed') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-lg font-semibold">Payment Failed</p>
              <p className="text-sm text-muted-foreground">
                Your payment could not be processed. Please try again or contact support.
              </p>
              <div className="flex gap-2 justify-center pt-4">
                <Button onClick={() => navigate('/')}>Go to Home</Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-lg font-semibold">Processing Payment</p>
            <p className="text-sm text-muted-foreground">
              Your payment is being processed. This may take a few moments.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

