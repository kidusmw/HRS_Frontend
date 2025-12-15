import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, CalendarRange, Plus, Edit, X, Check, LogIn, LogOut } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { mockReservations, mockRooms, getAvailableRooms, type MockReservation } from '../mockData';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const statusLabels: Record<MockReservation['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export function Reservations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MockReservation['status'] | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reservations, setReservations] = useState<MockReservation[]>(mockReservations);
  const [selectedReservation, setSelectedReservation] = useState<MockReservation | null>(null);
  
  // Dialog states
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomNumber: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    specialRequests: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
  });

  // Check URL params for actions
  useEffect(() => {
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    
    if (action === 'walkin') {
      setWalkInDialogOpen(true);
      setSearchParams({});
    } else if (action === 'checkin' && id) {
      const reservation = reservations.find((r) => r.id === parseInt(id));
      if (reservation) {
        setSelectedReservation(reservation);
        setCheckInDialogOpen(true);
        setSearchParams({});
      }
    } else if (action === 'checkout' && id) {
      const reservation = reservations.find((r) => r.id === parseInt(id));
      if (reservation) {
        setSelectedReservation(reservation);
        setCheckOutDialogOpen(true);
        setSearchParams({});
      }
    }
  }, [searchParams, reservations, setSearchParams]);

  // Filter reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesSearch =
        !search ||
        r.guestName.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toString().includes(search) ||
        r.roomNumber.includes(search);
      
      const matchesStatus = status === 'all' || r.status === status;
      
      const matchesDateRange =
        (!dateRange.start || r.checkIn >= dateRange.start) &&
        (!dateRange.end || r.checkIn <= dateRange.end);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [reservations, search, status, dateRange]);

  const handleConfirmReservation = () => {
    if (!selectedReservation) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === selectedReservation.id ? { ...r, status: 'confirmed' as const } : r
      )
    );
    toast.success('Reservation confirmed');
    setConfirmDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleCancelReservation = () => {
    if (!selectedReservation) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === selectedReservation.id ? { ...r, status: 'cancelled' as const } : r
      )
    );
    toast.success('Reservation cancelled');
    setCancelDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleCheckIn = () => {
    if (!selectedReservation) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === selectedReservation.id ? { ...r, status: 'checked_in' as const } : r
      )
    );
    // Update room status
    const room = mockRooms.find((rm) => rm.number === selectedReservation.roomNumber);
    if (room) {
      // In a real app, this would update the room status via API
      toast.success(`Guest checked in to room ${selectedReservation.roomNumber}`);
    }
    setCheckInDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleCheckOut = () => {
    if (!selectedReservation) return;
    setReservations((prev) =>
      prev.map((r) =>
        r.id === selectedReservation.id ? { ...r, status: 'checked_out' as const } : r
      )
    );
    // Update room status
    const room = mockRooms.find((rm) => rm.number === selectedReservation.roomNumber);
    if (room) {
      // In a real app, this would update the room status via API
      toast.success(`Guest checked out from room ${selectedReservation.roomNumber}`);
    }
    setCheckOutDialogOpen(false);
    setSelectedReservation(null);
  };

  const handleSaveWalkIn = () => {
    if (!walkInForm.guestName || !walkInForm.roomNumber || !walkInForm.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newReservation: MockReservation = {
      id: Math.max(...reservations.map((r) => r.id)) + 1,
      guestName: walkInForm.guestName,
      guestEmail: walkInForm.guestEmail,
      guestPhone: walkInForm.guestPhone,
      roomNumber: walkInForm.roomNumber,
      roomType: mockRooms.find((r) => r.number === walkInForm.roomNumber)?.type || 'Standard',
      checkIn: walkInForm.checkIn,
      checkOut: walkInForm.checkOut,
      status: 'confirmed',
      amount: mockRooms.find((r) => r.number === walkInForm.roomNumber)?.price || 0,
      channel: 'walk-in',
      createdAt: new Date().toISOString(),
      specialRequests: walkInForm.specialRequests,
    };

    setReservations((prev) => [...prev, newReservation]);
    toast.success('Walk-in reservation created');
    setWalkInDialogOpen(false);
    setWalkInForm({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomNumber: '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: '',
      specialRequests: '',
    });
  };

  const handleSaveEdit = () => {
    if (!selectedReservation) return;
    if (!editForm.roomNumber || !editForm.checkIn || !editForm.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    setReservations((prev) =>
      prev.map((r) =>
        r.id === selectedReservation.id
          ? {
              ...r,
              roomNumber: editForm.roomNumber,
              checkIn: editForm.checkIn,
              checkOut: editForm.checkOut,
              specialRequests: editForm.specialRequests,
            }
          : r
      )
    );
    toast.success('Reservation updated');
    setEditDialogOpen(false);
    setSelectedReservation(null);
  };

  const availableRooms = getAvailableRooms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">
            Manage reservations, check-ins, and check-outs
          </p>
        </div>
        <Button onClick={() => setWalkInDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Walk-in Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Filter by guest, reservation ID, date range, or status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guest name, ID, or room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 md:w-1/4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={(v) => setStatus(v as MockReservation['status'] | 'all')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'] as const).map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 md:w-1/4">
            <Input
              type="date"
              placeholder="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="flex-1"
            />
            <Input
              type="date"
              placeholder="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reservation List</CardTitle>
          <CardDescription>
            {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>#{r.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{r.guestName}</div>
                      <div className="text-xs text-muted-foreground">{r.guestEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.roomNumber} · {r.roomType}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarRange className="h-4 w-4" />
                      {r.checkIn} → {r.checkOut}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {statusLabels[r.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{r.channel}</TableCell>
                  <TableCell>${r.amount?.toLocaleString() || '0'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {r.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReservation(r);
                            setConfirmDialogOpen(true);
                          }}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Confirm
                        </Button>
                      )}
                      {r.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReservation(r);
                            setCheckInDialogOpen(true);
                          }}
                        >
                          <LogIn className="h-3 w-3 mr-1" />
                          Check In
                        </Button>
                      )}
                      {r.status === 'checked_in' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReservation(r);
                            setCheckOutDialogOpen(true);
                          }}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Check Out
                        </Button>
                      )}
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedReservation(r);
                            setEditForm({
                              roomNumber: r.roomNumber,
                              checkIn: r.checkIn,
                              checkOut: r.checkOut,
                              specialRequests: r.specialRequests || '',
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedReservation(r);
                            setCancelDialogOpen(true);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No reservations match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Walk-in Booking Dialog */}
      <Dialog open={walkInDialogOpen} onOpenChange={setWalkInDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Walk-in Booking</DialogTitle>
            <DialogDescription>Create a new reservation for a walk-in guest</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="walkin-name">Guest Name *</Label>
              <Input
                id="walkin-name"
                value={walkInForm.guestName}
                onChange={(e) => setWalkInForm((prev) => ({ ...prev, guestName: e.target.value }))}
                placeholder="Enter guest name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walkin-email">Email</Label>
              <Input
                id="walkin-email"
                type="email"
                value={walkInForm.guestEmail}
                onChange={(e) => setWalkInForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walkin-phone">Phone</Label>
              <Input
                id="walkin-phone"
                value={walkInForm.guestPhone}
                onChange={(e) => setWalkInForm((prev) => ({ ...prev, guestPhone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walkin-room">Room Number *</Label>
              <Select
                value={walkInForm.roomNumber}
                onValueChange={(v) => setWalkInForm((prev) => ({ ...prev, roomNumber: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.number}>
                      {room.number} - {room.type} (${room.price}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="walkin-checkin">Check-in Date *</Label>
                <Input
                  id="walkin-checkin"
                  type="date"
                  value={walkInForm.checkIn}
                  onChange={(e) => setWalkInForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walkin-checkout">Check-out Date *</Label>
                <Input
                  id="walkin-checkout"
                  type="date"
                  value={walkInForm.checkOut}
                  onChange={(e) => setWalkInForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walkin-requests">Special Requests</Label>
              <Textarea
                id="walkin-requests"
                value={walkInForm.specialRequests}
                onChange={(e) => setWalkInForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any special requests or notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalkInDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWalkIn}>Create Reservation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In Guest</DialogTitle>
            <DialogDescription>
              Verify reservation details and complete check-in for {selectedReservation?.guestName}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Guest:</div>
                <div className="text-sm text-muted-foreground">{selectedReservation.guestName}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Room:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReservation.roomNumber} - {selectedReservation.roomType}
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Dates:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReservation.checkIn} to {selectedReservation.checkOut}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn}>Confirm Check-in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={checkOutDialogOpen} onOpenChange={setCheckOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out Guest</DialogTitle>
            <DialogDescription>
              Complete check-out for {selectedReservation?.guestName}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Guest:</div>
                <div className="text-sm text-muted-foreground">{selectedReservation.guestName}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Room:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReservation.roomNumber} - {selectedReservation.roomType}
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Total Amount:</div>
                <div className="text-sm font-semibold">${selectedReservation.amount}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckOutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckOut}>Confirm Check-out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>Modify reservation details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-room">Room Number *</Label>
              <Select
                value={editForm.roomNumber}
                onValueChange={(v) => setEditForm((prev) => ({ ...prev, roomNumber: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {mockRooms.map((room) => (
                    <SelectItem key={room.id} value={room.number}>
                      {room.number} - {room.type} (${room.price}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-checkin">Check-in Date *</Label>
                <Input
                  id="edit-checkin"
                  type="date"
                  value={editForm.checkIn}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-checkout">Check-out Date *</Label>
                <Input
                  id="edit-checkout"
                  type="date"
                  value={editForm.checkOut}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-requests">Special Requests</Label>
              <Textarea
                id="edit-requests"
                value={editForm.specialRequests}
                onChange={(e) => setEditForm((prev) => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any special requests or notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Reservation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this reservation? This will change the status from pending to confirmed.
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-2 py-4">
              <div className="text-sm">
                <strong>Guest:</strong> {selectedReservation.guestName}
              </div>
              <div className="text-sm">
                <strong>Room:</strong> {selectedReservation.roomNumber} - {selectedReservation.roomType}
              </div>
              <div className="text-sm">
                <strong>Dates:</strong> {selectedReservation.checkIn} to {selectedReservation.checkOut}
              </div>
              <div className="text-sm">
                <strong>Amount:</strong> ${selectedReservation.amount}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReservation}>
              Yes, Confirm Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-2 py-4">
              <div className="text-sm">
                <strong>Guest:</strong> {selectedReservation.guestName}
              </div>
              <div className="text-sm">
                <strong>Room:</strong> {selectedReservation.roomNumber} - {selectedReservation.roomType}
              </div>
              <div className="text-sm">
                <strong>Dates:</strong> {selectedReservation.checkIn} to {selectedReservation.checkOut}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              No, Keep Reservation
            </Button>
            <Button variant="destructive" onClick={handleCancelReservation}>
              Yes, Cancel Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

