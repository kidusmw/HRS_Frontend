import { CalendarRange } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ReceptionistReservation } from '../api/receptionistApi'
import type { ReservationStatus } from '../hooks/useReservations'
import { reservationStatusLabels } from '../hooks/useReservations'
import { ReservationActions } from './ReservationActions'

type Props = {
  loading: boolean
  reservations: ReceptionistReservation[]
  onConfirm: (r: ReceptionistReservation) => void
  onCheckIn: (r: ReceptionistReservation) => void
  onCheckOut: (r: ReceptionistReservation) => void
  onEdit: (r: ReceptionistReservation) => void
  onCancel: (r: ReceptionistReservation) => void
}

export function ReservationsTable({
  loading,
  reservations,
  onConfirm,
  onCheckIn,
  onCheckOut,
  onEdit,
  onCancel,
}: Props) {
  return (
    <CardContent className="overflow-x-auto">
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>#{r.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-semibold">{r.user?.name || 'Guest'}</div>
                    <div className="text-xs text-muted-foreground">{r.user?.email || ''}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {r.room?.id || 'N/A'} · {r.room?.type || 'N/A'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarRange className="h-4 w-4" />
                    {r.check_in} → {r.check_out}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {reservationStatusLabels[r.status as ReservationStatus] ||
                      r.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {r.currency || 'ETB'} {(r.amount_paid ?? 0).toLocaleString()}
                </TableCell>
                <TableCell>
                  <ReservationActions
                    reservation={r}
                    onConfirm={() => onConfirm(r)}
                    onCheckIn={() => onCheckIn(r)}
                    onCheckOut={() => onCheckOut(r)}
                    onEdit={() => onEdit(r)}
                    onCancel={() => onCancel(r)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No reservations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </CardContent>
  )
}


