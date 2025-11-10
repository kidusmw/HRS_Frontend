import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">
          Configure hotel-specific settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hotel Settings</CardTitle>
          <CardDescription>Manage your hotel configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              System configuration coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

