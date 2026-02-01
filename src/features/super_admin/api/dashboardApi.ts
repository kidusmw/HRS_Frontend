import api from '@/lib/axios'
import type { DashboardMetrics } from '@/types/admin'

const BASE_URL = '/super_admin'

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await api.get(`${BASE_URL}/dashboard/metrics`)
  return response.data
}