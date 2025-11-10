import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { getHotelSettings, updateHotelSettings } from '../mock';

const settingsFormSchema = z.object({
  logoUrl: z
    .string()
    .refine(
      (val) =>
        !val ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('data:image/'),
      {
        message: 'Must be a valid URL or data URL',
      }
    )
    .optional()
    .or(z.literal('')),
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Must be a valid time in HH:MM format',
  }),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Must be a valid time in HH:MM format',
  }),
  cancellationHours: z.number().int().min(0, 'Cancellation hours must be 0 or greater'),
  allowOnlineBooking: z.boolean(),
  requireDeposit: z.boolean(),
  depositPercentage: z.number().min(0).max(100).optional(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function Settings() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const hotelId = currentUser?.hotel_id || 1;
  const [isLoading, setIsLoading] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<any>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      logoUrl: '',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationHours: 24,
      allowOnlineBooking: true,
      requireDeposit: false,
      depositPercentage: 0,
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoUrl = form.watch('logoUrl');

  // Update preview when logoUrl changes (for URL inputs)
  useEffect(() => {
    if (logoUrl && (logoUrl.startsWith('http://') || logoUrl.startsWith('https://'))) {
      setLogoPreview(logoUrl);
    } else if (logoUrl && logoUrl.startsWith('data:image/')) {
      // Keep data URL previews (from file uploads)
      setLogoPreview(logoUrl);
    } else if (!logoUrl) {
      setLogoPreview(null);
    }
  }, [logoUrl]);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await getHotelSettings(hotelId);
        const settings = response.data;
        setCurrentSettings(settings);

        form.reset({
          logoUrl: settings.logoUrl || '',
          checkInTime: settings.checkInTime || '15:00',
          checkOutTime: settings.checkOutTime || '11:00',
          cancellationHours: settings.cancellationHours || 24,
          allowOnlineBooking: settings.allowOnlineBooking ?? true,
          requireDeposit: settings.requireDeposit ?? false,
          depositPercentage: settings.depositPercentage || 0,
          emailNotifications: settings.emailNotifications ?? true,
          smsNotifications: settings.smsNotifications ?? false,
        });

        if (settings.logoUrl) {
          setLogoPreview(settings.logoUrl);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [hotelId, form]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        form.setValue('logoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    form.setValue('logoUrl', '');
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const response = await updateHotelSettings(hotelId, {
        logoUrl: values.logoUrl || null,
        checkInTime: values.checkInTime,
        checkOutTime: values.checkOutTime,
        cancellationHours: values.cancellationHours,
        allowOnlineBooking: values.allowOnlineBooking,
        requireDeposit: values.requireDeposit,
        depositPercentage: values.requireDeposit ? values.depositPercentage : 0,
        emailNotifications: values.emailNotifications,
        smsNotifications: values.smsNotifications,
      });

      const updatedSettings = response.data;
      setCurrentSettings(updatedSettings);

      if (updatedSettings.logoUrl) {
        setLogoPreview(updatedSettings.logoUrl);
      } else {
        setLogoPreview(null);
      }

      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save settings';
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    if (currentSettings) {
      form.reset({
        logoUrl: currentSettings.logoUrl || '',
        checkInTime: currentSettings.checkInTime || '15:00',
        checkOutTime: currentSettings.checkOutTime || '11:00',
        cancellationHours: currentSettings.cancellationHours || 24,
        allowOnlineBooking: currentSettings.allowOnlineBooking ?? true,
        requireDeposit: currentSettings.requireDeposit ?? false,
        depositPercentage: currentSettings.depositPercentage || 0,
        emailNotifications: currentSettings.emailNotifications ?? true,
        smsNotifications: currentSettings.smsNotifications ?? false,
      });
      setLogoPreview(currentSettings.logoUrl || null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">
          Configure hotel-specific settings and preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative">
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your hotel's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {logoPreview ? (
                          <div className="space-y-2">
                            <div className="relative inline-block">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-20 w-auto border rounded"
                                onError={() => {
                                  toast.error('Failed to load image from URL');
                                  setLogoPreview(null);
                                  form.setValue('logoUrl', '');
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={handleRemoveLogo}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label htmlFor="logo-upload">
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Change Logo
                                  </span>
                                </Button>
                              </label>
                              <span className="text-sm text-muted-foreground">
                                Or enter a different URL
                              </span>
                            </div>
                            <Input
                              type="url"
                              placeholder="https://example.com/logo.png"
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label htmlFor="logo-upload">
                                <Button type="button" variant="outline" asChild>
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                  </span>
                                </Button>
                              </label>
                              <span className="text-sm text-muted-foreground">
                                Or enter a URL
                              </span>
                            </div>
                            <Input
                              type="url"
                              placeholder="https://example.com/logo.png"
                              {...field}
                              value={field.value || ''}
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload or provide URL for your hotel logo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Operational Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Settings</CardTitle>
              <CardDescription>Configure check-in, check-out, and cancellation policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default check-in time for guests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>
                        Default check-out time for guests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cancellationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Policy (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum hours before check-in that guests can cancel without penalty
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>Manage online booking and payment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="allowOnlineBooking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Online Booking</FormLabel>
                      <FormDescription>
                        Enable guests to make reservations through the online portal
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

              <FormField
                control={form.control}
                name="requireDeposit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Deposit</FormLabel>
                      <FormDescription>
                        Require a deposit payment at the time of booking
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

              {form.watch('requireDeposit') && (
                <FormField
                  control={form.control}
                  name="depositPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Percentage</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage of total booking amount required as deposit (0-100)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how guests receive booking confirmations and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Send booking confirmations and updates via email
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

              <FormField
                control={form.control}
                name="smsNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">SMS Notifications</FormLabel>
                      <FormDescription>
                        Send booking confirmations and updates via SMS
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
            </CardContent>
          </Card>

          <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pt-4 pb-4 mt-6 z-10">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset to Last Saved
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

