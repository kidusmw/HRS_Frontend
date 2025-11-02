import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Database,
  Settings,
} from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/super-admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    href: '/super-admin/users',
    icon: Users,
  },
  {
    title: 'Hotels',
    href: '/super-admin/hotels',
    icon: Building2,
  },
  {
    title: 'Logs',
    href: '/super-admin/logs',
    icon: FileText,
  },
  {
    title: 'Backups',
    href: '/super-admin/backups',
    icon: Database,
  },
  {
    title: 'Settings',
    href: '/super-admin/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Super Admin</h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
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

