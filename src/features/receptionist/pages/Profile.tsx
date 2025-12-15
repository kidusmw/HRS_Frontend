import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';
import { logoutUserThunk, setUser } from '@/features/auth/authSlice';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Shield, Calendar, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProfile, updatePassword, updateProfile } from '@/features/auth/api/authApi';

const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  avatar: z.instanceof(File).optional().or(z.literal('')),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      avatar: undefined,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const resolvedAvatar = avatarPreview || user?.avatarUrl || null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const resp = await getProfile();
        dispatch(setUser(resp.data));
        profileForm.reset({
          name: resp.data.name,
          email: resp.data.email,
          phoneNumber: resp.data.phoneNumber || '',
          avatar: undefined,
        });
        setAvatarPreview(resp.data.avatarUrl || null);
        setRemoveAvatar(false);
      } catch (error: any) {
        console.error('Failed to load profile:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        profileForm.setError('avatar', {
          type: 'manual',
          message: 'Please select an image file',
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        profileForm.setError('avatar', {
          type: 'manual',
          message: 'Image size must be less than 5MB',
        });
        return;
      }
      // Set the file in the form
      profileForm.setValue('avatar', file, { shouldValidate: true });
      setRemoveAvatar(false);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setRemoveAvatar(true);
    profileForm.setValue('avatar', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmitProfile = async (values: ProfileFormValues) => {
    try {
      const resp = await updateProfile({
        name: values.name,
        email: values.email,
        phoneNumber: values.phoneNumber || null,
        avatar: values.avatar instanceof File ? values.avatar : null,
        removeAvatar,
      });
      dispatch(setUser(resp.data));
      profileForm.reset({
        name: resp.data.name,
        email: resp.data.email,
        phoneNumber: resp.data.phoneNumber || '',
        avatar: undefined,
      });
      setAvatarPreview(resp.data.avatarUrl || null);
      setRemoveAvatar(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      const validation = (error as any)?.response?.data?.errors as Record<string, string[]> | undefined;
      const firstValidationError = validation ? Object.values(validation)?.[0]?.[0] : null;
      const message =
        firstValidationError ||
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Failed to update profile';
      toast.error(message);
    }
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to change password';
      toast.error(message);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'superadmin' || role === 'super_admin') return 'default';
    if (role === 'admin') return 'secondary';
    if (role === 'manager') return 'outline';
    if (role === 'receptionist') return 'outline';
    return 'outline';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>Your account information and verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              {resolvedAvatar ? (
                <AvatarImage src={resolvedAvatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {user.emailVerifiedAt ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Email verified</span>
                    <span className="text-xs">
                      {format(new Date(user.emailVerifiedAt), 'PP')}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Email not verified</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since</span>
              </div>
              <p className="font-medium">
                {user.createdAt
                  ? format(new Date(user.createdAt), 'PP')
                  : 'N/A'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Account ID</span>
              </div>
              <p className="font-medium">#{user.id}</p>
            </div>
            {user.hotelName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Hotel</span>
                </div>
                <p className="font-medium">{user.hotelName}</p>
              </div>
            )}
            {user.phoneNumber && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Phone</span>
                </div>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your name, email address, phone number, and profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6" encType="multipart/form-data">
              <FormField
                control={profileForm.control}
                name="avatar"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        {resolvedAvatar ? (
                          <AvatarImage src={resolvedAvatar} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="text-xl">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleAvatarChange(e);
                              onChange(e.target.files?.[0]);
                            }}
                            className="cursor-pointer"
                          />
                          {resolvedAvatar && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveAvatar}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <FormDescription>
                          Upload a profile picture. JPG, PNG or GIF. Max 5MB.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
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
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      You will need to verify your email if you change it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
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

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={profileForm.formState.isSubmitting || loadingProfile}
                >
                  {profileForm.formState.isSubmitting || loadingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and choose a new one
                </DialogDescription>
              </DialogHeader>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Must be at least 8 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Danger Zone</AlertTitle>
        <AlertDescription>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="font-medium mb-1">Sign Out</p>
              <p className="text-sm opacity-90">
                Sign out of your account. You can sign back in at any time.
              </p>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="ml-4">
              Sign Out
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

