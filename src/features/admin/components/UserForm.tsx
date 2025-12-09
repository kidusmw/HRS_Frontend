import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
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
import type { UserListItem } from '@/types/admin';
import {
  createUser,
  updateUser,
} from '../api/adminApi';
import { toast } from 'sonner';

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['receptionist', 'manager']),
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

const roles: Array<'receptionist' | 'manager'> = ['receptionist', 'manager'];

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: (user?.role === 'receptionist' || user?.role === 'manager')
        ? user.role
        : 'receptionist',
      phoneNumber: user?.phoneNumber || '',
      password: '',
      generatePassword: !isEditing,
      isActive: user?.isActive ?? true,
    },
  });

  const generatePassword = form.watch('generatePassword');

  useEffect(() => {
    if (isEditing && user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: (user.role === 'receptionist' || user.role === 'manager')
          ? user.role
          : 'receptionist',
        phoneNumber: user.phoneNumber || '',
        password: '',
        generatePassword: false,
        isActive: user.isActive,
      });
    }
  }, [user, isEditing, form]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && user) {
        // Update user
        const updateData: any = {
          name: values.name,
          email: values.email,
          role: values.role,
          phoneNumber: values.phoneNumber,
          active: values.isActive,
        };

        // Only include password if it was provided and not auto-generated
        if (!values.generatePassword && values.password && values.password.length >= 8) {
          updateData.password = values.password;
        }

        await updateUser(user.id, updateData);
        toast.success('User updated successfully');
      } else {
        // Create user
        const createData: any = {
          name: values.name,
          email: values.email,
          role: values.role,
          phoneNumber: values.phoneNumber,
          active: values.isActive,
        };

        // Only include password if not auto-generated
        if (!values.generatePassword && values.password && values.password.length >= 8) {
          createData.password = values.password;
        }

        await createUser(createData);
        toast.success('User created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save user';
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">
            {isEditing ? 'Edit User' : 'Create User'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update user information and permissions'
              : 'Add a new staff member to your hotel'}
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+1234567890" {...field} />
              </FormControl>
              <FormDescription>
                Contact phone number for this user
              </FormDescription>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Receptionist: Front desk operations. Manager: Hotel management and oversight.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={form.control}
            name="generatePassword"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Auto-generate Password</FormLabel>
                  <FormDescription>
                    Generate a secure password automatically. The user will receive it via email.
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
        )}

        {(!generatePassword || isEditing) && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {isEditing
                    ? 'Leave blank to keep the current password'
                    : 'Password must be at least 8 characters'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Inactive users cannot log in to the system
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

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

