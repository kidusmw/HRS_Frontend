import { useState } from 'react';
import { Search, Bed, Wrench, XCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockRooms, type MockRoom } from '../mockData';
import { toast } from 'sonner';

const statusLabels: Record<MockRoom['status'], string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Under Maintenance',
  unavailable: 'Unavailable',
};

const statusColors: Record<MockRoom['status'], 'default' | 'secondary' | 'outline' | 'destructive'> = {
  available: 'default',
  occupied: 'secondary',
  maintenance: 'outline',
  unavailable: 'destructive',
};

export function Rooms() {
  const [rooms, setRooms] = useState<MockRoom[]>(mockRooms);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MockRoom['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [roomToUpdateStatus, setRoomToUpdateStatus] = useState<MockRoom | null>(null);
  const [newStatus, setNewStatus] = useState<MockRoom['status']>('available');

  const roomTypes = Array.from(new Set(rooms.map((r) => r.type)));

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      !search ||
      room.number.toLowerCase().includes(search.toLowerCase()) ||
      room.type.toLowerCase().includes(search.toLowerCase()) ||
      room.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateStatus = (room: MockRoom) => {
    setRoomToUpdateStatus(room);
    setNewStatus(room.status);
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = () => {
    if (!roomToUpdateStatus) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === roomToUpdateStatus.id ? { ...r, status: newStatus } : r))
    );
    toast.success(`Room ${roomToUpdateStatus.number} status updated to ${statusLabels[newStatus]}`);
    setStatusDialogOpen(false);
    setRoomToUpdateStatus(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">
            View room inventory and update room status
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Filter rooms by status, type, or search term</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search room number, type, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 md:w-1/4">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as MockRoom['status'] | 'all')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(['available', 'occupied', 'maintenance', 'unavailable'] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 md:w-1/4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Room Inventory</CardTitle>
          <CardDescription>
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-semibold">{room.number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{room.type}</Badge>
                  </TableCell>
                  <TableCell>${room.price.toLocaleString()}</TableCell>
                  <TableCell>{room.capacity} guest{room.capacity !== 1 ? 's' : ''}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[room.status]}>
                      {statusLabels[room.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {room.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(room)}
                    >
                      {room.status === 'available' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {room.status === 'occupied' && <Bed className="h-3 w-3 mr-1" />}
                      {room.status === 'maintenance' && <Wrench className="h-3 w-3 mr-1" />}
                      {room.status === 'unavailable' && <XCircle className="h-3 w-3 mr-1" />}
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No rooms match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Room Status</DialogTitle>
            <DialogDescription>
              Change the status of room {roomToUpdateStatus?.number}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="room-status">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as MockRoom['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['available', 'occupied', 'maintenance', 'unavailable'] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Rooms marked as "Under Maintenance" or "Unavailable" cannot be booked.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

