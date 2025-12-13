import { ManagerSidebar } from './ManagerSidebar';
import { ManagerTopbar } from './ManagerTopbar';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ManagerTopbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}

