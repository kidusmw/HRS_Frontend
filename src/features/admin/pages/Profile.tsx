import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile and account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Profile management coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

