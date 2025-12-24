import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CreditCard, Loader2 } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '../api/superAdminApi';
import type { SystemSettingsDto } from '@/types/admin';

export function PaymentOptions() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettingsDto | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await getSystemSettings();
      setSettings(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: 'chapaEnabled' | 'stripeEnabled' | 'telebirrEnabled', value: boolean) => {
    if (!settings) return;

    // Don't allow toggling Stripe or Telebirr (future updates)
    if (key === 'stripeEnabled' || key === 'telebirrEnabled') {
      toast.info('This payment method will be available in future updates');
      return;
    }

    try {
      setIsSaving(true);
      const updatedSettings = { ...settings, [key]: value };
      await updateSystemSettings({ [key]: value });
      setSettings(updatedSettings);
      toast.success('Payment option updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update payment option');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Options</h1>
          <p className="text-muted-foreground">Configure payment methods for all hotels</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Options</h1>
        <p className="text-muted-foreground">
          Configure payment methods for all hotels. These settings apply system-wide.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payment Methods</CardTitle>
          </div>
          <CardDescription>
            Enable or disable payment methods for online bookings across all hotels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chapa */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chapa-toggle" className="text-base font-medium">
                Chapa
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable Chapa payment gateway for online bookings
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Switch
                id="chapa-toggle"
                checked={settings?.chapaEnabled ?? false}
                onCheckedChange={(checked) => handleToggle('chapaEnabled', checked)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="border-t" />

          {/* Stripe */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="stripe-toggle" className="text-base font-medium">
                Stripe
              </Label>
              <p className="text-sm text-muted-foreground">
                Stripe payment integration will be available in future updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="stripe-toggle"
                checked={false}
                disabled={true}
              />
            </div>
          </div>

          <div className="border-t" />

          {/* Telebirr */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="telebirr-toggle" className="text-base font-medium">
                Telebirr
              </Label>
              <p className="text-sm text-muted-foreground">
                Telebirr payment integration will be available in future updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="telebirr-toggle"
                checked={false}
                disabled={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

