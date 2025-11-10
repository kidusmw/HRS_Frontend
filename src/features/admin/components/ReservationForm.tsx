import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ReservationListItem, ReservationStatus } from '@/types/admin';
import {
  createHotelReservation,
  updateHotelReservation,
  getHotelRooms,
  getHotelUsers,
} from '../mock';
import { toast } from 'sonner';

const reservationFormSchema = z.object({
  roomId: z.number().min(1, 'Room selection is required'),
  userId: z.number().nullable().optional(),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  guests: z.number().int().min(1, 'Number of guests must be at least 1'),
  specialRequests: z.string().optional().nullable(),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

type ReservationFormValues = z.infer<typeof reservationFormSchema>;

interface ReservationFormProps {
  reservation?: ReservationListItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const statuses: ReservationStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

export function ReservationForm({ reservation, onSuccess, onCancel }: ReservationFormProps) {
  const isEditing = !!reservation;
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const hotelId = currentUser?.hotel_id || 1;
  const [rooms, setRooms] = useState<{ id: number; type: string; capacity: number }[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsResponse, usersResponse] = await Promise.all([
          getHotelRooms(hotelId),
          getHotelUsers(hotelId),
        ]);
        setRooms(roomsResponse.data.map((r) => ({ id: r.id, type: r.type, capacity: r.capacity })));
        setUsers(usersResponse.data.map((u) => ({ id: u.id, name: u.name, email: u.email })));
      } catch (error) {
        console.error('Failed to load rooms/users:', error);
        toast.error('Failed to load rooms and users');
      }
    };
    fetchData();
  }, [hotelId]);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      roomId: reservation?.roomId || 0,
      userId: reservation?.userId || null,
      checkIn: reservation?.checkIn || '',
      checkOut: reservation?.checkOut || '',
      status: reservation?.status || 'pending',
      guests: reservation?.guests || 1,
      specialRequests: reservation?.specialRequests || '',
    },
  });

  useEffect(() => {
    if (isEditing && reservation) {
      form.reset({
        roomId: reservation.roomId,
        userId: reservation.userId || null,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        status: reservation.status,
        guests: reservation.guests,
        specialRequests: reservation.specialRequests || '',
      });
    }
  }, [reservation, isEditing, form]);

  const selectedRoomId = form.watch('roomId');
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const onSubmit = async (values: ReservationFormValues) => {
    try {
      if (isEditing && reservation) {
        await updateHotelReservation(reservation.id, hotelId, values);
        toast.success('Reservation updated successfully');
      } else {
        await createHotelReservation(hotelId, values);
        toast.success('Reservation created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save reservation:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save reservation';
      toast.error(errorMessage);
    }
  };

  // Set minimum dates for date inputs
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            {isEditing ? 'Edit Reservation' : 'Create Reservation'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update reservation details and status'
              : 'Create a new booking for a guest'}
          </p>
        </div>

        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value, 10))}
                value={field.value?.toString() || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.type} (Capacity: {room.capacity} guests)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the room for this reservation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guest (Optional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value, 10))}
                value={field.value?.toString() || 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a guest or leave as walk-in" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Walk-in Guest</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select a registered user or leave as walk-in guest
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="checkIn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Format as YYYY-MM-DD without timezone conversion
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          field.onChange(`${year}-${month}-${day}`);
                        } else {
                          field.onChange('');
                        }
                      }}
                      disabled={(date) => {
                        const dateOnly = new Date(date);
                        dateOnly.setHours(0, 0, 0, 0);
                        return dateOnly < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Arrival date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkOut"
            render={({ field }) => {
              const checkInDate = form.watch('checkIn');
              const minDate = checkInDate
                ? new Date(checkInDate)
                : today;
              minDate.setDate(minDate.getDate() + 1); // Check-out must be at least 1 day after check-in

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-out Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Format as YYYY-MM-DD without timezone conversion
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            field.onChange(`${year}-${month}-${day}`);
                          } else {
                            field.onChange('');
                          }
                        }}
                        disabled={(date) => {
                          const dateOnly = new Date(date);
                          dateOnly.setHours(0, 0, 0, 0);
                          return dateOnly < minDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Departure date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Guests</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max={selectedRoom?.capacity || 10}
                    placeholder="1"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? 1 : parseInt(value, 10) || 1);
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>
                  {selectedRoom
                    ? `Room capacity: ${selectedRoom.capacity} guests`
                    : 'Number of guests'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Current reservation status
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or notes..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional special requests or notes for this reservation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update Reservation' : 'Create Reservation'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

