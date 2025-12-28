import api from '@/lib/axios'
import type { BackupItem } from '@/types/admin'
import type { PaginatedResponse, PaginationParams } from './dtos'
import { toBackendPaginationParams } from './dtos'

const BASE_URL = '/super_admin'

export async function getBackups(params?: PaginationParams): Promise<PaginatedResponse<BackupItem>> {
  const response = await api.get(`${BASE_URL}/backups`, { params: toBackendPaginationParams(params) })
  return response.data
}

export async function runFullBackup(): Promise<{ data: BackupItem }> {
  const response = await api.post(`${BASE_URL}/backups/full`)
  return response.data
}

export async function runHotelBackup(hotelId: number): Promise<{ data: BackupItem }> {
  const response = await api.post(`${BASE_URL}/backups/hotel/${hotelId}`)
  return response.data
}

export async function downloadBackup(id: number): Promise<Blob> {
  const response = await api.get(`${BASE_URL}/backups/${id}/download`, {
    responseType: 'blob',
  })
  return response.data
}


