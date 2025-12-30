import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  CalendarRange,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
  { title: 'Bookings', href: '/manager/bookings', icon: CalendarRange },
  { title: 'Reports', href: '/manager/reports', icon: FileText },
  { title: 'Occupancy & Alerts', href: '/manager/occupancy', icon: Bell },
  { title: 'Operations', href: '/manager/operations', icon: Activity },
  { title: 'Employees', href: '/manager/employees', icon: Users },
  { title: 'Overrides', href: '/manager/overrides', icon: ShieldCheck },
];

export function ManagerSidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Manager</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href || location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

