import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Hotel } from '../types'

type Props = {
  hotel: Hotel
}

export function OverviewCard({ hotel }: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
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
  )
}

