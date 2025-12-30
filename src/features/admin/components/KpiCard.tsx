import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  tooltip?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  delta,
  deltaType = 'neutral',
  tooltip,
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {delta && (
          <p
            className={cn(
              'text-xs mt-1',
              deltaType === 'positive' && 'text-green-600',
              deltaType === 'negative' && 'text-red-600',
              deltaType === 'neutral' && 'text-muted-foreground'
            )}
          >
            {delta}
          </p>
        )}
        {tooltip && (
          <p className="text-xs text-muted-foreground mt-1">{tooltip}</p>
        )}
      </CardContent>
    </Card>
  );
}

