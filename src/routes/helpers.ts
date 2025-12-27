import type { Role } from '@/types/auth'
import { paths } from './paths'

export function getHomeForRole(role: Role | undefined) {
  if (role === 'superadmin' || role === 'super_admin') return paths.superAdminDashboard
  if (role === 'admin') return paths.adminDashboard
  if (role === 'manager') return paths.managerDashboard
  if (role === 'receptionist') return paths.receptionistDashboard
  return paths.customerHome
}

export function isRoleAllowed(role: Role | undefined, allowed: readonly Role[]) {
  if (!role) return false
  return allowed.includes(role)
}


