import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { HotelListItem } from '@/types/admin'

type Props = {
  open: boolean
  hotel: HotelListItem | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteHotelDialog({ open, hotel, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Hotel</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{hotel?.name}&quot;? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={!hotel}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


