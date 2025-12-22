import { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import {
  getReservations,
  createWalkInReservation,
  confirmReservation,
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  getRooms,
  type ReceptionistReservation,
} from '../api/receptionistApi';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Checked Out',
  cancelled: 'Cancelled',
};

export function Reservations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ReservationStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reservations, setReservations] = useState<ReceptionistReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<ReceptionistReservation | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  
  // Dialog states
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState<{
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    roomType: string;
    roomNumber: string;
    checkIn: string;
    checkOut: string;
    paymentMethod: 'cash' | 'transfer';
    specialRequests: string;
  }>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomType: '',
    roomNumber: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: '',
    paymentMethod: 'cash',
    specialRequests: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    roomNumber: '',
    checkIn: '',
    checkOut: '',
    specialRequests: '',
  });

  // Load reservations and rooms
  useEffect(() => {
    loadReservations();
    loadRooms();
  }, [search, status, dateRange]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const params: any = {
        per_page: 100,
      };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      if (dateRange.start) params.date_from = dateRange.start;
      if (dateRange.end) params.date_to = dateRange.end;
      const response = await getReservations(params);
      setReservations(response.data || []);
    } catch (error: any) {
      console.error('Failed to load reservations:', error);
      toast.error(error.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    console.log('[Reservations] loadRooms called');
    try {
      setRoomsLoading(true);
      console.log('[Reservations] Fetching rooms from API...');
      const response = await getRooms({ per_page: 100 });
      console.log('[Reservations] Rooms API response:', response);
      const rooms = response.data || [];
      console.log('[Reservations] Rooms data:', rooms);
      setAllRooms(rooms);
      const available = rooms.filter((r: any) => r && r.status === 'available');
      console.log('[Reservations] Available rooms:', available);
      setAvailableRooms(available);
    } catch (error: any) {
      console.error('[Reservations] Failed to load rooms:', error);
      console.error('[Reservations] Error details:', error.response?.data || error.message);
      setAvailableRooms([]);
      setAllRooms([]);
    } finally {
      setRoomsLoading(false);
      console.log('[Reservations] loadRooms completed, roomsLoading set to false');
    }
  };

  // Load rooms when dialog opens to ensure fresh data
  useEffect(() => {
    console.log('[Reservations] walkInDialogOpen changed:', walkInDialogOpen);
    if (walkInDialogOpen) {
      console.log('[Reservations] Dialog opened, loading rooms...');
      loadRooms().catch((error) => {
        console.error('[Reservations] Error loading rooms for walk-in dialog:', error);
        toast.error('Failed to load rooms');
      });
    }
  }, [walkInDialogOpen]);

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

  const handleConfirmReservation = async () => {
    if (!selectedReservation) return;
    try {
      await confirmReservation(selectedReservation.id);
      toast.success('Reservation confirmed');
      setConfirmDialogOpen(false);
      setSelectedReservation(null);
      await loadReservations();
    } catch (error: any) {
      console.error('Failed to confirm reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm reservation');
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    try {
      await cancelReservation(selectedReservation.id);
      toast.success('Reservation cancelled');
      setCancelDialogOpen(false);
      setSelectedReservation(null);
      await loadReservations();
    } catch (error: any) {
      console.error('Failed to cancel reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const handleCheckIn = async () => {
    if (!selectedReservation) return;
    try {
      await checkInReservation(selectedReservation.id);
      toast.success(`Guest checked in successfully`);
      setCheckInDialogOpen(false);
      setSelectedReservation(null);
      await loadReservations();
      await loadRooms(); // Refresh room status
    } catch (error: any) {
      console.error('Failed to check in:', error);
      toast.error(error.response?.data?.message || 'Failed to check in guest');
    }
  };

  const handleCheckOut = async () => {
    if (!selectedReservation) return;
    try {
      await checkOutReservation(selectedReservation.id);
      toast.success(`Guest checked out successfully`);
      setCheckOutDialogOpen(false);
      setSelectedReservation(null);
      await loadReservations();
      await loadRooms(); // Refresh room status
    } catch (error: any) {
      console.error('Failed to check out:', error);
      toast.error(error.response?.data?.message || 'Failed to check out guest');
    }
  };

  const handleSaveWalkIn = async () => {
    if (!walkInForm.guestName || !walkInForm.roomNumber || !walkInForm.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createWalkInReservation({
        guestName: walkInForm.guestName,
        guestEmail: walkInForm.guestEmail || undefined,
        guestPhone: walkInForm.guestPhone || undefined,
        roomNumber: parseInt(walkInForm.roomNumber),
        checkIn: walkInForm.checkIn,
        checkOut: walkInForm.checkOut,
        paymentMethod: walkInForm.paymentMethod,
        specialRequests: walkInForm.specialRequests || undefined,
      });
      toast.success('Walk-in reservation created');
      setWalkInDialogOpen(false);
      setWalkInForm({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        roomType: '',
        roomNumber: '',
        checkIn: new Date().toISOString().split('T')[0],
        checkOut: '',
        paymentMethod: 'cash',
        specialRequests: '',
      });
      await loadReservations();
      await loadRooms(); // Refresh available rooms
    } catch (error: any) {
      console.error('Failed to create walk-in reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to create walk-in reservation');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedReservation) return;
    if (!editForm.roomNumber || !editForm.checkIn || !editForm.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Note: Edit functionality might need a separate API endpoint
    // For now, we'll show a message that this needs to be implemented
    toast.error('Edit reservation functionality requires backend API endpoint');
    setEditDialogOpen(false);
    setSelectedReservation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">
            Manage reservations, check-ins, and check-outs
          </p>
        </div>
        <Button
          onClick={() => {
            console.log('[Reservations] Walk-in booking button clicked');
            console.log('[Reservations] Current availableRooms:', availableRooms);
            console.log('[Reservations] Current roomsLoading:', roomsLoading);
            setWalkInDialogOpen(true);
          }}
        >
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
            <Select value={status} onValueChange={(v) => setStatus(v as ReservationStatus | 'all')}>
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
            <DatePicker
              value={dateRange.start}
              onChange={(value) => setDateRange((prev) => ({ ...prev, start: value }))}
              placeholder="Start date"
              className="flex-1"
            />
            <DatePicker
              value={dateRange.end}
              onChange={(value) => setDateRange((prev) => ({ ...prev, end: value }))}
              placeholder="End date"
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reservation List</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${reservations.length} reservation${reservations.length !== 1 ? 's' : ''} found`}
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
                        {statusLabels[r.status as ReservationStatus] || r.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${r.room?.price?.toLocaleString() || '0'}</TableCell>
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
                              roomNumber: r.room_id?.toString() || '',
                              checkIn: r.check_in,
                              checkOut: r.check_out,
                              specialRequests: r.special_requests || '',
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
      </Card>

      {/* Walk-in Booking Dialog */}
      <Dialog open={walkInDialogOpen} onOpenChange={setWalkInDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Walk-in Booking</DialogTitle>
            <DialogDescription>Create a new reservation for a walk-in guest</DialogDescription>
          </DialogHeader>
          {(() => {
            console.log('[Reservations] Dialog rendering - roomsLoading:', roomsLoading);
            console.log('[Reservations] Dialog rendering - availableRooms:', availableRooms);
            console.log('[Reservations] Dialog rendering - availableRooms type:', typeof availableRooms);
            console.log('[Reservations] Dialog rendering - availableRooms isArray:', Array.isArray(availableRooms));
            return roomsLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading rooms...</div>
            ) : (
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="walkin-room-type">Room Type</Label>
                <Select
                  value={walkInForm.roomType || 'all'}
                  onValueChange={(v) => {
                    setWalkInForm((prev) => ({ ...prev, roomType: v === 'all' ? '' : v, roomNumber: '' }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {availableRooms && Array.isArray(availableRooms) && availableRooms.length > 0
                      ? Array.from(new Set(availableRooms.map((r) => r?.type).filter(Boolean))).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walkin-room">Room Number *</Label>
                <Select
                  value={walkInForm.roomNumber}
                  onValueChange={(v) => setWalkInForm((prev) => ({ ...prev, roomNumber: v }))}
                  disabled={!availableRooms || availableRooms.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      console.log('[Reservations] Room number selector - availableRooms:', availableRooms);
                      console.log('[Reservations] Room number selector - roomType filter:', walkInForm.roomType);
                      if (!availableRooms || !Array.isArray(availableRooms) || availableRooms.length === 0) {
                        console.log('[Reservations] No available rooms for room number selector');
                        return (
                          <SelectItem value="no-rooms" disabled>
                            No available rooms
                          </SelectItem>
                        );
                      }
                      try {
                        const filtered = availableRooms.filter(
                          (room) => room && (!walkInForm.roomType || room.type === walkInForm.roomType)
                        );
                        console.log('[Reservations] Filtered rooms:', filtered);
                        if (filtered.length === 0) {
                          return (
                            <SelectItem value="no-rooms-filtered" disabled>
                              No rooms of selected type
                            </SelectItem>
                          );
                        }
                        return filtered.map((room) => {
                          console.log('[Reservations] Rendering room option:', room);
                          return (
                            <SelectItem key={room.id} value={room.id.toString()}>
                              {room.number ? `Room ${room.number}` : `Room ${room.id}`} - {room.type || 'N/A'} (${room.price?.toLocaleString() || '0'}/night)
                            </SelectItem>
                          );
                        });
                      } catch (error) {
                        console.error('[Reservations] Error in room number selector:', error);
                        return (
                          <SelectItem value="error" disabled>
                            Error loading rooms
                          </SelectItem>
                        );
                      }
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="walkin-checkin">Check-in Date *</Label>
                <DatePicker
                  id="walkin-checkin"
                  value={walkInForm.checkIn}
                  onChange={(value) => setWalkInForm((prev) => ({ ...prev, checkIn: value }))}
                  placeholder="Select check-in date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walkin-checkout">Check-out Date *</Label>
                <DatePicker
                  id="walkin-checkout"
                  value={walkInForm.checkOut}
                  onChange={(value) => setWalkInForm((prev) => ({ ...prev, checkOut: value }))}
                  placeholder="Select check-out date"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="walkin-payment">Payment Method *</Label>
              <Select
                value={walkInForm.paymentMethod}
                onValueChange={(v) => setWalkInForm((prev) => ({ ...prev, paymentMethod: v as 'cash' | 'transfer' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
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
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setWalkInDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWalkIn} disabled={roomsLoading || !availableRooms || availableRooms.length === 0}>
              Create Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-in Dialog */}
      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In Guest</DialogTitle>
            <DialogDescription>
              Verify reservation details and complete check-in for {selectedReservation?.user?.name || 'Guest'}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Guest:</div>
                <div className="text-sm text-muted-foreground">{selectedReservation.user?.name || 'Guest'}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Room:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReservation.room?.id || 'N/A'} - {selectedReservation.room?.type || 'N/A'}
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Dates:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReservation.check_in} to {selectedReservation.check_out}
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
              Complete check-out for {selectedReservation?.user?.name || 'Guest'}
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Guest:</div>
                <div className="text-sm text-muted-foreground">{selectedReservation.user?.name || 'Guest'}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Room:</div>
                <div className="text-sm text-muted-foreground">
                  {selectedReservation.room?.id || 'N/A'} - {selectedReservation.room?.type || 'N/A'}
                </div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Total Amount:</div>
                <div className="text-sm font-semibold">${selectedReservation.room?.price || '0'}</div>
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
                  {allRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.number || `#${room.id}`} - {room.type} (${room.price}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-checkin">Check-in Date *</Label>
                <DatePicker
                  id="edit-checkin"
                  value={editForm.checkIn}
                  onChange={(value) => setEditForm((prev) => ({ ...prev, checkIn: value }))}
                  placeholder="Select check-in date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-checkout">Check-out Date *</Label>
                <DatePicker
                  id="edit-checkout"
                  value={editForm.checkOut}
                  onChange={(value) => setEditForm((prev) => ({ ...prev, checkOut: value }))}
                  placeholder="Select check-out date"
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
                <strong>Guest:</strong> {selectedReservation.user?.name || 'Guest'}
              </div>
              <div className="text-sm">
                <strong>Room:</strong> {selectedReservation.room?.id || 'N/A'} - {selectedReservation.room?.type || 'N/A'}
              </div>
              <div className="text-sm">
                <strong>Dates:</strong> {selectedReservation.check_in} to {selectedReservation.check_out}
              </div>
              <div className="text-sm">
                <strong>Amount:</strong> $
                {selectedReservation.room?.price
                  ? (() => {
                      const checkIn = new Date(selectedReservation.check_in);
                      const checkOut = new Date(selectedReservation.check_out);
                      const nights = Math.ceil(
                        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (selectedReservation.room.price * nights).toLocaleString();
                    })()
                  : '0'}
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
                <strong>Guest:</strong> {selectedReservation.user?.name || 'Guest'}
              </div>
              <div className="text-sm">
                <strong>Room:</strong> {selectedReservation.room?.id || 'N/A'} - {selectedReservation.room?.type || 'N/A'}
              </div>
              <div className="text-sm">
                <strong>Dates:</strong> {selectedReservation.check_in} to {selectedReservation.check_out}
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

