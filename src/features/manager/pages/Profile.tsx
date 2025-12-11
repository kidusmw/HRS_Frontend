import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { Mail, Shield, Calendar } from 'lucide-react';

export function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Quick manager profile overview (lightweight, mocked)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Account
            </CardTitle>
            <CardDescription>Manager details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">
                {user?.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Hotel & dates
            </CardTitle>
            <CardDescription>Hotel mapping and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Hotel:</span>
              <span className="font-medium">
                {user?.hotelName || 'N/A'} (ID: {user?.hotelId ?? '—'})
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Created:</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Last active:</span>
              <span>{user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : '—'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Reachable details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{user?.phoneNumber || 'Not provided'}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            This is a lightweight profile view. For full editing, reuse admin profile flow later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

