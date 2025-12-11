import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { ManagerLayout } from '@/features/manager/layout/ManagerLayout';

interface ManagerRouteProps {
  children: React.ReactNode;
}

export function ManagerRoute({ children }: ManagerRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isManager = isAuthenticated && user?.role === 'manager';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ManagerLayout>{children}</ManagerLayout>;
}

