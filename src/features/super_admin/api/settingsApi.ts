import api from '@/lib/axios'
import type { SystemSettingsDto } from '@/types/admin'

const BASE_URL = '/super_admin'

export async function getSystemSettings(): Promise<{ data: SystemSettingsDto }> {
  const response = await api.get(`${BASE_URL}/settings/system`)
  return response.data
}

export async function updateSystemSettings(data: SystemSettingsDto & { logo?: File }): Promise<{ data: SystemSettingsDto }> {
  if (data.logo) {
    const formData = new FormData()
    formData.append('systemName', data.systemName)
    formData.append('defaultCurrency', data.defaultCurrency)
    formData.append('defaultTimezone', data.defaultTimezone)
    formData.append('logo', data.logo)

    // IMPORTANT: Laravel's `boolean` validator does NOT accept "true"/"false" strings.
    // When using FormData, booleans become strings, so send "1"/"0" instead.
    if (data.chapaEnabled !== undefined) formData.append('chapaEnabled', data.chapaEnabled ? '1' : '0')
    if (data.stripeEnabled !== undefined) formData.append('stripeEnabled', data.stripeEnabled ? '1' : '0')
    if (data.telebirrEnabled !== undefined) formData.append('telebirrEnabled', data.telebirrEnabled ? '1' : '0')

    const response = await api.post(`${BASE_URL}/settings/system`, formData)
    return response.data
  }

  // Remove systemLogoUrl from payload - only file uploads allowed
  const { systemLogoUrl, ...payload } = data
  const response = await api.put(`${BASE_URL}/settings/system`, payload)
  return response.data
}

export async function getHotelSettings(hotelId: number): Promise<unknown> {
  const response = await api.get(`${BASE_URL}/settings/hotel/${hotelId}`)
  return response.data
}

export async function updateHotelSettings(hotelId: number, data: Record<string, unknown>): Promise<unknown> {
  const response = await api.put(`${BASE_URL}/settings/hotel/${hotelId}`, data)
  return response.data
}


