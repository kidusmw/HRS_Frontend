import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { ReceptionistLayout } from '@/features/receptionist/layout/ReceptionistLayout';

interface ReceptionistRouteProps {
  children: React.ReactNode;
}

export function ReceptionistRoute({ children }: ReceptionistRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isReceptionist = isAuthenticated && user?.role === 'receptionist';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isReceptionist) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ReceptionistLayout>{children}</ReceptionistLayout>;
}

