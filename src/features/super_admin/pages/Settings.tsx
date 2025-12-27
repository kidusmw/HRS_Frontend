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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { SystemSettingsDto } from '@/types/admin';
import { getSystemSettings, updateSystemSettings } from '../api/superAdminApi';

const settingsFormSchema = z.object({
  systemName: z.string().min(1, 'System name is required'),
  // Removed systemLogoUrl - only file uploads allowed
  // Currency and timezone are fixed to USD/UTC, no longer editable
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<SystemSettingsDto | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      systemName: '',
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await getSystemSettings();
        const settings = response.data;
        setCurrentSettings(settings);
        
        // Reset form with fetched settings
        form.reset({
          systemName: settings.systemName || '',
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
      // Store the file for upload
      setLogoFile(file);
      
      // Create a preview using FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      const payload: any = {
        systemName: values.systemName,
        defaultCurrency: 'ETB', // Always ETB
        defaultTimezone: 'UTC', // Always UTC
      };

      // Include logo file if uploaded
      if (logoFile) {
        payload.logo = logoFile;
      }

      const response = await updateSystemSettings(payload);
      
      const updatedSettings = response.data;
      setCurrentSettings(updatedSettings);
      
      // Update logo preview if URL exists
      if (updatedSettings.systemLogoUrl) {
        setLogoPreview(updatedSettings.systemLogoUrl);
      } else {
        setLogoPreview(null);
      }
      
      // Clear logo file after successful upload
      setLogoFile(null);
      
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
      });
      setLogoPreview(currentSettings.systemLogoUrl || null);
      setLogoFile(null);
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
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Upload the system logo image file
                </FormDescription>
              </FormItem>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                    <span className="text-sm font-semibold">ETB</span>
                    <span className="text-xs text-muted-foreground">(Ethiopian Birr)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System currency is fixed to ETB
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Timezone</label>
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                    <span className="text-sm font-semibold">UTC</span>
                    <span className="text-xs text-muted-foreground">(Coordinated Universal Time)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System timezone is fixed to UTC
                  </p>
                </div>
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
                Default Currency: ETB | Default Timezone: UTC
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

