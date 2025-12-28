import { Database, Play } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription as DDesc, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type HotelOption = { id: number; name: string }

type Props = {
  hotels: HotelOption[]
  selectedHotelId: string
  onSelectedHotelIdChange: (v: string) => void
  isFullBackupDialogOpen: boolean
  onFullBackupDialogOpenChange: (open: boolean) => void
  isHotelBackupDialogOpen: boolean
  onHotelBackupDialogOpenChange: (open: boolean) => void
  isRunningBackup: boolean
  onRunFullBackup: () => void
  onRunHotelBackup: () => void
}

export function BackupActions({
  hotels,
  selectedHotelId,
  onSelectedHotelIdChange,
  isFullBackupDialogOpen,
  onFullBackupDialogOpenChange,
  isHotelBackupDialogOpen,
  onHotelBackupDialogOpenChange,
  isRunningBackup,
  onRunFullBackup,
  onRunHotelBackup,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Full System Backup
          </CardTitle>
          <CardDescription>Create a complete backup of all hotels, users, reservations, and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isFullBackupDialogOpen} onOpenChange={onFullBackupDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Run Full Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Full System Backup</DialogTitle>
                <DDesc>
                  This will create a complete backup of the entire system including all hotels, users, reservations, and
                  settings. This process may take several minutes.
                </DDesc>
              </DialogHeader>
              <Alert>
                <AlertDescription>Full backups use Spatie Laravel Backup and include both database and files.</AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => onFullBackupDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={onRunFullBackup} disabled={isRunningBackup}>
                  {isRunningBackup ? 'Starting...' : 'Start Backup'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Per-Hotel Backup
          </CardTitle>
          <CardDescription>Create a JSON export for a specific hotel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedHotelId} onValueChange={onSelectedHotelIdChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a hotel" />
            </SelectTrigger>
            <SelectContent>
              {hotels.map((hotel) => (
                <SelectItem key={hotel.id} value={hotel.id.toString()}>
                  {hotel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isHotelBackupDialogOpen} onOpenChange={onHotelBackupDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="w-full" disabled={!selectedHotelId}>
                <Play className="mr-2 h-4 w-4" />
                Run Hotel Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Hotel Backup</DialogTitle>
                <DDesc>
                  This will create a JSON export for{' '}
                  {hotels.find((h) => h.id.toString() === selectedHotelId)?.name || 'the selected hotel'}. The export
                  includes hotel data, rooms, staff, and reservations.
                </DDesc>
              </DialogHeader>
              <Alert>
                <AlertDescription>Hotel backups are exported as JSON files (no SQL restore in Phase 1).</AlertDescription>
              </Alert>
              <DialogFooter>
                <Button variant="outline" onClick={() => onHotelBackupDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={onRunHotelBackup} disabled={!selectedHotelId || isRunningBackup}>
                  {isRunningBackup ? 'Starting...' : 'Start Backup'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}


