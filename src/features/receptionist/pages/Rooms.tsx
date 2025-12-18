import { useState, useEffect } from 'react';
import { Search, Bed, Wrench, XCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getRooms, updateRoomStatus, type ReceptionistRoom } from '../api/receptionistApi';
import { toast } from 'sonner';

type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'unavailable';

const statusLabels: Record<RoomStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Under Maintenance',
  unavailable: 'Unavailable',
};

const statusColors: Record<RoomStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  available: 'default',
  occupied: 'secondary',
  maintenance: 'outline',
  unavailable: 'destructive',
};

export function Rooms() {
  const [rooms, setRooms] = useState<ReceptionistRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [roomToUpdateStatus, setRoomToUpdateStatus] = useState<ReceptionistRoom | null>(null);
  const [newStatus, setNewStatus] = useState<RoomStatus>('available');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const params: any = {
        per_page: 100,
      };
      if (search) params.search = search;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') {
        params.isAvailable = statusFilter === 'available';
      }
      const response = await getRooms(params);
      setRooms(response.data || []);
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
      toast.error(error.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadRooms();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, typeFilter, statusFilter]);

  const roomTypes = Array.from(new Set(rooms.map((r) => r.type)));

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      !search ||
      room.number?.toLowerCase().includes(search.toLowerCase()) ||
      room.type.toLowerCase().includes(search.toLowerCase()) ||
      room.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateStatus = (room: ReceptionistRoom) => {
    setRoomToUpdateStatus(room);
    setNewStatus(room.status);
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!roomToUpdateStatus) return;
    try {
      setUpdating(true);
      await updateRoomStatus(roomToUpdateStatus.id, { status: newStatus });
      toast.success(`Room ${roomToUpdateStatus.number} status updated to ${statusLabels[newStatus]}`);
      setStatusDialogOpen(false);
      setRoomToUpdateStatus(null);
      // Reload rooms to get updated status
      await loadRooms();
    } catch (error: any) {
      console.error('Failed to update room status:', error);
      toast.error(error.response?.data?.message || 'Failed to update room status');
    } finally {
      setUpdating(false);
    }
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
            {loading ? 'Loading...' : `${filteredRooms.length} room${filteredRooms.length !== 1 ? 's' : ''} found`}
          </CardDescription>
        </CardHeader>
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
                    <TableCell className="font-semibold">{room.number || `#${room.id}`}</TableCell>
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
                      {room.description || 'No description'}
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
          )}
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
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleSaveStatus} disabled={updating}>
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

