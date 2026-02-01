import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    label: string;
  };
}

export function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  trend,
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {Icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          {description && <Skeleton className="h-4 w-32" />}
        </CardContent>
      </Card>
    );
  } 

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.value > 0 ? '+' : ''}
            {trend.value} {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}