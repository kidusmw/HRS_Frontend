import { ReceptionistSidebar } from './ReceptionistSidebar';
import { ReceptionistTopbar } from './ReceptionistTopbar';

interface ReceptionistLayoutProps {
  children: React.ReactNode;
}

export function ReceptionistLayout({ children }: ReceptionistLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ReceptionistSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ReceptionistTopbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}

