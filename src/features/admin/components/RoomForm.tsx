import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RoomListItem } from '@/types/admin';
import {
  createRoom,
  updateRoom,
} from '../api/adminApi';
import { toast } from 'sonner';

const roomFormSchema = z.object({
  type: z.string().min(1, 'Room type is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  capacity: z.number().int().min(1, 'Number of rooms must be at least 1'),
  isAvailable: z.boolean(), // Kept in schema for form state, but not sent to backend
  description: z.string().optional().nullable(),
});

const SENSIBLE_CAPACITY_LIMIT = 100;

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
  room?: RoomListItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];

export function RoomForm({ room, onSuccess, onCancel }: RoomFormProps) {
  const isEditing = !!room;
  const [showCapacityConfirm, setShowCapacityConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<RoomFormValues | null>(null);

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      type: room?.type || 'Standard',
      price: room?.price || 0,
      capacity: room?.capacity || 1,
      isAvailable: room?.isAvailable ?? true,
      description: room?.description || '',
    },
  });

  useEffect(() => {
    if (isEditing && room) {
      form.reset({
        type: room.type,
        price: room.price,
        capacity: room.capacity,
        isAvailable: room.isAvailable,
        description: room.description || '',
      });
    }
  }, [room, isEditing, form]);

  const handleSubmit = async (values: RoomFormValues) => {
    // Check if capacity exceeds sensible limit
    if (values.capacity > SENSIBLE_CAPACITY_LIMIT) {
      setPendingValues(values);
      setShowCapacityConfirm(true);
      return;
    }
    await submitRoom(values);
  };

  const submitRoom = async (values: RoomFormValues) => {
    try {
      // Remove isAvailable from payload - it's managed by receptionists/managers
      const { isAvailable, ...roomData } = values;
      
      if (isEditing && room) {
        await updateRoom(room.id, roomData);
        toast.success('Room updated successfully');
      } else {
        await createRoom(roomData);
        toast.success('Room created successfully');
      }
      setShowCapacityConfirm(false);
      setPendingValues(null);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save room:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save room';
      toast.error(errorMessage);
    }
  };

  const confirmHighCapacity = () => {
    if (pendingValues) {
      submitRoom(pendingValues);
    }
  };

  const cancelHighCapacity = () => {
    setShowCapacityConfirm(false);
    setPendingValues(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            {isEditing ? 'Edit Room' : 'Create Room'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update room information'
              : 'Add a new room type to your hotel inventory'}
          </p>
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category/class of this room
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price per Night</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? 0 : parseFloat(value) || 0);
                    }}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormDescription>
                  Price in the default currency
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rooms</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
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
                  Number of rooms of this type in your hotel
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Room description, amenities, features..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional description of the room and its features
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
            {isEditing ? 'Update Room' : 'Create Room'}
          </Button>
        </div>
      </form>

      {/* Capacity Confirmation Dialog */}
      <Dialog open={showCapacityConfirm} onOpenChange={setShowCapacityConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm High Capacity</DialogTitle>
            <DialogDescription>
              Are you sure you want to {isEditing ? 'update' : 'create'} <strong>{pendingValues?.capacity}</strong>{' '}
              {pendingValues?.capacity === 1 ? 'room' : 'rooms'} of this type?
              <br />
              <br />
              This exceeds the recommended limit of {SENSIBLE_CAPACITY_LIMIT} rooms per type.
              Please verify this is correct for your hotel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelHighCapacity}>
              Cancel
            </Button>
            <Button onClick={confirmHighCapacity}>
              Yes, {isEditing ? 'Update' : 'Create'} Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

