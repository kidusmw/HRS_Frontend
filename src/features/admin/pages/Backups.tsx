import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Backups() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backup</h1>
        <p className="text-muted-foreground">
          Manage hotel data backups and exports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>Hotel backup operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Backup management coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

