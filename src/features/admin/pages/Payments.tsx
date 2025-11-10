import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Payments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          View payments and financial data for your hotel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Hotel payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Payment management coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

