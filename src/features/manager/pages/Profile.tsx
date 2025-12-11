import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

export function Profile() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manager profile overview (read-only for now)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Role:</span>
            <Badge variant="secondary" className="capitalize">
              {user?.role}
            </Badge>
          </div>
          <div className="text-muted-foreground">
            Hotel: {user?.hotelName || 'N/A'} (ID: {user?.hotelId ?? '—'})
          </div>
          <div className="text-muted-foreground">
            Phone: {user?.phoneNumber || 'Not provided'}
          </div>
          <p className="text-xs text-muted-foreground">
            This page is a placeholder. Wire it to profile update APIs when ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

