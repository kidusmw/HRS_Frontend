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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { UserListItem, Role } from '@/types/admin';
import { createUser, updateUser, getHotels } from '../api/superAdminApi';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'super_admin']),
  hotelId: z.number().nullable().optional(),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  generatePassword: z.boolean(),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: UserListItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const roles: Role[] = ['admin', 'super_admin'];

// Helper function to normalize role - convert receptionist/manager to admin
function normalizeRole(role: string | undefined): 'admin' | 'super_admin' {
  if (role === 'super_admin' || role === 'superadmin') {
    return 'super_admin';
  }
  // Convert receptionist, manager, or any other role to admin
  return 'admin';
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user;
  const [hotels, setHotels] = useState<{ id: number; name: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await getHotels({ perPage: 100 });
        setHotels(response.data.map((h) => ({ id: h.id, name: h.name })));
      } catch (error) {
        console.error('Failed to load hotels:', error);
        toast.error('Failed to load hotels');
      }
    };
    fetchHotels();
  }, []);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      // If editing a client, keep their role as admin (clients can't be edited via this form)
      // Note: client role is not in the schema, but we handle it in defaultValues
      // The backend will prevent changing TO client or creating clients
      // Also normalize receptionist/manager roles to admin
      role: user?.role && user.role !== 'client' && roles.includes(user.role as Role)
        ? (user.role as 'admin' | 'super_admin')
        : normalizeRole(user?.role),
      hotelId: user?.hotelId || null,
      phoneNumber: user?.phoneNumber || '',
      password: '',
      generatePassword: !isEditing,
      isActive: user?.isActive ?? true,
    },
  });

  // Use a ref to track the user ID to prevent unnecessary resets
  const userIdRef = useRef<number | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ?? null;

    // Only reset if the user ID actually changed (prevents reset on every render)
    if (userIdRef.current !== currentUserId) {
      userIdRef.current = currentUserId;

      if (user) {
        // Reset all form fields with fresh user data
        form.reset({
          name: user.name || '',
          email: user.email || '',
          role: user.role && user.role !== 'client' && roles.includes(user.role as Role)
            ? (user.role as 'admin' | 'super_admin')
            : normalizeRole(user.role),
          hotelId: user.hotelId || null,
          phoneNumber: user.phoneNumber || '',
          password: '',
          generatePassword: false,
          isActive: user.isActive ?? true,
        });
      } else {
        // Reset to empty values for new user
        form.reset({
          name: '',
          email: '',
          role: 'admin',
          hotelId: null,
          phoneNumber: '',
          password: '',
          generatePassword: true,
          isActive: true,
        });
      }
    }
  }, [user?.id, form]);

  const generatePassword = form.watch('generatePassword');
  const selectedRole = form.watch('role');

  // Some roles require hotel assignment
  const requiresHotel = selectedRole === 'admin';

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && user) {
        // Update user - don't send password if not provided
        // If user is a client, don't allow changing their role (clients must self-register)
        const updateData: any = {
          name: values.name,
          email: values.email,
          hotelId: values.hotelId || null,
          // Phone number is required for creation, but can be empty for updates (will be sent as empty string, backend handles it)
          phoneNumber: values.phoneNumber || '',
          active: values.isActive,
        };
        
        // Only update role if user is not a client (clients can't have their role changed)
        // Always include role in update if user is not a client to ensure role changes are saved
        if (user.role !== 'client') {
          updateData.role = values.role;
        }
        
        if (values.password && values.password.length >= 8) {
          updateData.password = values.password;
        }
        await updateUser(user.id, updateData);
        toast.success('User updated successfully');
      } else {
        // Create user
        const createData = {
          name: values.name,
          email: values.email,
          role: values.role,
          hotelId: values.hotelId || null,
          phoneNumber: values.phoneNumber || undefined,
          generatePassword: values.generatePassword,
          active: values.isActive,
          ...(values.generatePassword ? {} : { password: values.password }),
        };
        await createUser(createData);
        toast.success('User created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save user';
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Edit User' : 'Create User'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update user information and permissions'
              : 'Create a new user account'}
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Only show non-client roles - clients must self-register */}
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {requiresHotel && (
          <FormField
            control={form.control}
            name="hotelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hotel</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === 'null' ? null : Number(value))
                  }
                  value={field.value?.toString() || 'null'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hotel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="null">No Hotel</SelectItem>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the hotel this user will be assigned to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone Number
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1234567890"
                  {...field}
                  value={field.value || ''}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <>
            <FormField
              control={form.control}
              name="generatePassword"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Auto-generate Password
                    </FormLabel>
                    <FormDescription>
                      Generate a secure random password and email it to the user
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!generatePassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter password"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Inactive users cannot log in to the system
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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

