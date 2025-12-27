import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import { paths } from '../paths'

type Props = {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  return isAuthenticated ? <>{children}</> : <Navigate to={paths.login} replace />
}


