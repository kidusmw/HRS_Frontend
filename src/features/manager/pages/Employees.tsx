import { useMemo, useState } from 'react';
import { Users, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { managerEmployees } from '@/features/manager/mock';

export function Employees() {
  const [onlySupervised, setOnlySupervised] = useState(true);

  const filtered = useMemo(() => {
    if (!onlySupervised) return managerEmployees;
    return managerEmployees.filter((emp) => emp.underSupervision);
  }, [onlySupervised]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">
            Receptionists under your supervision and their shifts (mock data)
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          {filtered.length} listed
        </Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              Filters
            </CardTitle>
            <CardDescription>Limit to employees under your supervision</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="supervision-toggle"
              checked={onlySupervised}
              onCheckedChange={setOnlySupervised}
            />
            <Label htmlFor="supervision-toggle">Under my supervision</Label>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((emp) => (
          <Card key={emp.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{emp.name}</span>
                <Badge variant={emp.status === 'active' ? 'secondary' : 'outline'}>
                  {emp.status}
                </Badge>
              </CardTitle>
              <CardDescription>{emp.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shift</span>
                <Badge variant="outline" className="capitalize">
                  {emp.shift}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{emp.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Supervision</span>
                <Badge variant={emp.underSupervision ? 'default' : 'outline'}>
                  {emp.underSupervision ? 'Under my supervision' : 'Not assigned'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No employees match this filter.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

