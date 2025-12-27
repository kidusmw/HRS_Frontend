import type { ReactElement, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'
import type { Role } from '@/types/auth'
import { getHomeForRole, isRoleAllowed } from '../helpers'
import { paths } from '../paths'

type Props = {
  allowed: readonly Role[]
  layout?: (children: ReactNode) => ReactElement
  children: ReactNode
}

export function RoleGuard({ allowed, layout, children }: Props) {
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace />
  }

  if (!isRoleAllowed(user?.role, allowed)) {
    return <Navigate to={getHomeForRole(user?.role)} replace />
  }

  return layout ? layout(children) : <>{children}</>
}


