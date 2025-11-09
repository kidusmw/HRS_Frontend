import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { SystemSettingsDto } from '@/types/admin';
import { getSystemSettings, updateSystemSettings } from '../api/superAdminApi';

const settingsFormSchema = z.object({
  systemName: z.string().min(1, 'System name is required'),
  systemLogoUrl: z
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
  defaultCurrency: z.string().min(1, 'Default currency is required'),
  defaultTimezone: z.string().min(1, 'Default timezone is required'),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const currencies = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'ETB', name: 'Ethiopian Birr (Br)' },
];

const timezones = [
  'UTC',
  'Africa/Addis_Ababa',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

export function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<SystemSettingsDto | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      systemName: '',
      systemLogoUrl: '',
      defaultCurrency: 'USD',
      defaultTimezone: 'UTC',
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await getSystemSettings();
        const settings = response.data;
        setCurrentSettings(settings);
        
        // Reset form with fetched settings
        // Ensure UTC is default if no timezone is set
        const timezone = settings.defaultTimezone && settings.defaultTimezone.trim() !== '' 
          ? settings.defaultTimezone 
          : 'UTC';
        
        form.reset({
          systemName: settings.systemName || '',
          systemLogoUrl: settings.systemLogoUrl || '',
          defaultCurrency: settings.defaultCurrency || 'USD',
          defaultTimezone: timezone,
        });
        
        // Set logo preview if URL exists
        if (settings.systemLogoUrl) {
          setLogoPreview(settings.systemLogoUrl);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For MVP: Create a data URL for preview and storage
      // In production, upload to server and get URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        form.setValue('systemLogoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    form.setValue('systemLogoUrl', '');
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const response = await updateSystemSettings({
        systemName: values.systemName,
        systemLogoUrl: values.systemLogoUrl || null,
        defaultCurrency: values.defaultCurrency,
        defaultTimezone: values.defaultTimezone,
      });
      
      const updatedSettings = response.data;
      setCurrentSettings(updatedSettings);
      
      // Update logo preview if URL exists
      if (updatedSettings.systemLogoUrl) {
        setLogoPreview(updatedSettings.systemLogoUrl);
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
        systemName: currentSettings.systemName || '',
        systemLogoUrl: currentSettings.systemLogoUrl || '',
        defaultCurrency: currentSettings.defaultCurrency || 'USD',
        defaultTimezone: currentSettings.defaultTimezone || 'UTC',
      });
      setLogoPreview(currentSettings.systemLogoUrl || null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure global system settings and branding
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>
            These settings apply to the entire system and are managed by Super Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="systemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel Reservation System" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name displayed throughout the system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="systemLogoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {logoPreview ? (
                          <div className="relative inline-block">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-20 w-auto border rounded"
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
                        ) : (
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
                        )}
                        {!logoPreview && (
                          <Input
                            type="url"
                            placeholder="https://example.com/logo.png"
                            {...field}
                            value={field.value || ''}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload or provide URL for the system logo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default currency for all hotels
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultTimezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'UTC'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Default timezone for new hotels
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  Reset to Last Saved
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How your settings will appear</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            {logoPreview && (
              <img src={logoPreview} alt="Logo" className="h-10 w-auto" />
            )}
            <div>
              <h3 className="font-semibold">
                {form.watch('systemName') || 'System Name'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Default Currency: {form.watch('defaultCurrency') || 'USD'} | Default
                Timezone: {form.watch('defaultTimezone') || 'UTC'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

