import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { HotelListItem } from '@/types/admin';
import { createHotel, updateHotel, getUsers } from '../api/superAdminApi';
import { toast } from 'sonner';

const hotelFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  description: z.string().optional(),
  adminId: z.number().nullable().optional(),
});

type HotelFormValues = z.infer<typeof hotelFormSchema>;

interface HotelFormProps {
  hotel?: HotelListItem | null;
  onSuccess: (updatedHotel?: HotelListItem) => void;
  onCancel: () => void;
}

export function HotelForm({ hotel, onSuccess, onCancel }: HotelFormProps) {
  const isEditing = !!hotel;
  const [admins, setAdmins] = useState<{ id: number; name: string; email: string }[]>([]);

  const form = useForm<HotelFormValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: {
      name: hotel?.name || '',
      city: hotel?.city || '',
      country: hotel?.country || '',
      phoneNumber: hotel?.phoneNumber || '',
      email: hotel?.email || '',
      description: '',
      adminId: hotel?.adminId || null,
    },
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await getUsers({ role: 'admin', perPage: 100 });
        setAdmins(
          response.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          }))
        );
      } catch (error) {
        console.error('Failed to load admins:', error);
      }
    };
    fetchAdmins();
  }, []);

  // Reset form values when the hotel being edited changes
  // Use a ref to track the hotel ID to prevent unnecessary resets
  const hotelIdRef = useRef<number | null>(null);

  useEffect(() => {
    const currentHotelId = hotel?.id ?? null;

    // Only reset if the hotel ID actually changed (prevents reset on every render)
    if (hotelIdRef.current !== currentHotelId) {
      hotelIdRef.current = currentHotelId;

      if (hotel) {
        // Reset all form fields with fresh hotel data
        form.reset({
          name: hotel.name || '',
          city: hotel.city || '',
          country: hotel.country || '',
          phoneNumber: hotel.phoneNumber || '',
          email: hotel.email || '',
          description: '',
          adminId: hotel.adminId ?? null,
        });
      } else {
        // Reset to empty values for new hotel
        form.reset({
          name: '',
          city: '',
          country: '',
          phoneNumber: '',
          email: '',
          description: '',
          adminId: null,
        });
      }
    }
  }, [hotel?.id, form]);

  const onSubmit = async (values: HotelFormValues) => {
    try {
      if (isEditing && hotel?.id) {
        const updateData = {
          name: values.name,
          city: values.city,
          country: values.country,
          phoneNumber: values.phoneNumber,
          email: values.email,
          description: values.description || null,
          adminId: values.adminId ?? null,
        };
        const response = await updateHotel(hotel.id, updateData);
        toast.success('Hotel updated successfully');
        // Pass the updated hotel to onSuccess so it can immediately update the state
        onSuccess(response.data);
      } else {
        const response = await createHotel({
          name: values.name,
          city: values.city,
          country: values.country,
          phoneNumber: values.phoneNumber,
          email: values.email,
          description: values.description || null,
          adminId: values.adminId ?? null,
        });
        toast.success('Hotel created successfully');
        // Pass the new hotel to onSuccess
        onSuccess(response.data);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save hotel';
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hotel Name</FormLabel>
              <FormControl>
                <Input placeholder="Grand Hotel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="New York" {...field} value={field.value || ''} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Country
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="United States" {...field} value={field.value || ''} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="info@hotel.com" {...field} />
                </FormControl>
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
                  placeholder="Brief description of the hotel..."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional description of the hotel and its amenities
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adminId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Admin</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === 'null' ? null : Number(value))
                }
                value={field.value?.toString() || 'null'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">No Admin (assign later)</SelectItem>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.name} ({admin.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Assign an existing admin user to manage this hotel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

