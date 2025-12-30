import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Bed,
  Settings,
  FileText,
  Database,
  CreditCard,
} from 'lucide-react';
import { getAdminLogo } from '../api/adminApi';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Room Management',
    href: '/admin/rooms',
    icon: Bed,
  },
  {
    title: 'System Configuration',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Audit/Activity Logs',
    href: '/admin/logs',
    icon: FileText,
  },
  {
    title: 'Backup',
    href: '/admin/backups',
    icon: Database,
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const resp = await getAdminLogo();
        setLogoUrl(resp.data.logoUrl);
      } catch (error) {
        // silently ignore; sidebar will show initials fallback
      }
    };
    fetchLogo();
  }, []);

  const hotelName =
    (currentUser as any)?.hotel?.name ||
    (currentUser as any)?.hotel_name ||
    (currentUser as any)?.hotelName ||
    currentUser?.name ||
    'Hotel';

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Admin</h1>
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
      <div className="border-t p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="Hotel logo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold">
              {hotelName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{hotelName}</span>
          <span className="text-xs text-muted-foreground">Hotel</span>
        </div>
      </div>
    </div>
  );
}

