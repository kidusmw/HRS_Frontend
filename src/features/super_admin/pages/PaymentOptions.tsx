import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';
import { getSystemSettings } from '../api';

export function PaymentOptions() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      // Fetch to validate access and keep page consistent with backend settings,
      // even though payment methods are currently read-only.
      await getSystemSettings();
    } catch (error) {
      console.error(error);
      toast.error('Failed to load payment options');
    } finally {
      setIsLoading(false);
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
              <span className="text-sm font-medium text-green-700">Always enabled</span>
            </div>
          </div>

          <div className="border-t" />

          {/* Stripe */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Stripe
              </Label>
              <p className="text-sm text-muted-foreground">
                Stripe payment integration will be available in future updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </div>
          </div>

          <div className="border-t" />

          {/* Telebirr */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Telebirr
              </Label>
              <p className="text-sm text-muted-foreground">
                Telebirr payment integration will be available in future updates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Coming soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

