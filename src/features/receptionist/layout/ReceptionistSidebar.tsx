import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarRange,
  Bed,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', href: '/receptionist/dashboard', icon: LayoutDashboard },
  { title: 'Reservations', href: '/receptionist/reservations', icon: CalendarRange },
  { title: 'Rooms', href: '/receptionist/rooms', icon: Bed },
  { title: 'Reports', href: '/receptionist/reports', icon: FileText },
];

export function ReceptionistSidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">Receptionist</h1>
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

