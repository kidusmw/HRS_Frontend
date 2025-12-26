import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, XCircle } from 'lucide-react'
import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { HotelCard } from '../components/HotelCard'
import { getHotels } from '../api/customerApi'
import type { Hotel } from '../data/mockData'

export function Explore() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state: RootState) => state.auth.user)

  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)

  const [search, setSearch] = useState('')
  const [minRating, setMinRating] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'rating-desc'>('rating-desc')

  useEffect(() => {
    setLoading(true)
    setError(null)
    getHotels({ search, minRating, maxPrice, sort })
      .then((data) => setHotels(data))
      .catch(() => setError('Unable to load hotels right now.'))
      .finally(() => setLoading(false))
  }, [search, minRating, maxPrice, sort])

  const hasResults = useMemo(() => hotels.length > 0, [hotels])

  const handleReserve = (hotelId: string) => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
    navigate(`/hotels/${hotelId}`)
  }

  const handleView = (hotelId: string) => {
    navigate(`/hotels/${hotelId}`)
  }

  const ratingOptions = [undefined, 3, 3.5, 4, 4.5]

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase text-muted-foreground tracking-wide">Explore</p>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
              Find stays inspired by TripAdvisor and Booking
            </h1>
            <p className="text-muted-foreground">
              Browse hotels, view locations, and reserve after you sign in.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <Card className="border-none shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or city"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-3 sm:flex-none">
              <Select
                value={minRating?.toString() ?? 'any'}
                onValueChange={(value) => setMinRating(value === 'any' ? undefined : Number(value))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Min rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((r) => (
                    <SelectItem key={r ?? 'any'} value={r?.toString() ?? 'any'}>
                      {r ? `${r}+ stars` : 'Any rating'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Max price</span>
                <Input
                  type="number"
                  className="w-[120px]"
                  placeholder="e.g. 180"
                  value={maxPrice?.toString() ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating-desc">Top rated</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                </SelectContent>
              </Select>

              {(search || minRating || maxPrice) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setSearch('')
                    setMinRating(undefined)
                    setMaxPrice(undefined)
                    setSort('rating-desc')
                  }}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {error}
            </CardContent>
          </Card>
        ) : hasResults ? (
          <div className="grid gap-4">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onView={() => handleView(hotel.id)}
                onReserve={() => handleReserve(hotel.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No hotels match these filters yet.
            </CardContent>
          </Card>
        )}
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
                navigate('/login', {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate('/register', {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              Create account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

