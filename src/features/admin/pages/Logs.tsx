import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Logs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit/Activity Logs</h1>
        <p className="text-muted-foreground">
          View hotel activity and audit trail
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Hotel activity and audit records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Activity logs coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

