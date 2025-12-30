import api from '@/lib/axios'
import type { AuditLogItem } from '@/types/admin'
import type { PaginatedResponse, PaginationParams } from './dtos'
import { toBackendPaginationParams } from './dtos'

const BASE_URL = '/super_admin'

export interface GetLogsQueryDto extends PaginationParams {
  userId?: number
  hotelId?: number
  action?: string
  from?: string
  to?: string
}

export async function getLogs(params?: GetLogsQueryDto): Promise<PaginatedResponse<AuditLogItem>> {
  const backendParams: Record<string, unknown> = {
    ...toBackendPaginationParams(params),
  }
  if (params?.userId !== undefined) backendParams.userId = params.userId
  if (params?.hotelId !== undefined) backendParams.hotelId = params.hotelId
  if (params?.action !== undefined) backendParams.action = params.action
  if (params?.from !== undefined) backendParams.from = params.from
  if (params?.to !== undefined) backendParams.to = params.to

  const response = await api.get(`${BASE_URL}/logs`, { params: backendParams })
  return response.data
}

export async function getLog(id: number): Promise<{ data: AuditLogItem }> {
  const response = await api.get(`${BASE_URL}/logs/${id}`)
  return response.data
}


