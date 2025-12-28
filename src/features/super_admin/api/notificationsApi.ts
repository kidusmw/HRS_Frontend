import api from '@/lib/axios'
import type { NotificationItem } from '@/types/admin'

const BASE_URL = '/super_admin'

export async function getNotifications(params?: { limit?: number }): Promise<{ data: NotificationItem[] }> {
  const response = await api.get(`${BASE_URL}/notifications`, { params })
  return response.data
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`${BASE_URL}/notifications/${id}/read`)
}


