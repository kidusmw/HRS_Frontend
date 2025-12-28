import api from '@/lib/axios'
import type { HotelListItem, CreateHotelDto, UpdateHotelDto } from '@/types/admin'
import type { PaginatedResponse, PaginationParams } from './dtos'
import { toBackendPaginationParams, toCreateHotelFormData, toUpdateHotelFormData, toUpdateHotelPayload } from './dtos'

const BASE_URL = '/super_admin'

export interface GetHotelsQueryDto extends PaginationParams {
  search?: string
  timezone?: string
  hasAdmin?: boolean
}

export async function getHotels(params?: GetHotelsQueryDto): Promise<PaginatedResponse<HotelListItem>> {
  const backendParams: Record<string, unknown> = {
    ...toBackendPaginationParams(params),
  }

  if (params?.search !== undefined) backendParams.search = params.search
  if (params?.timezone !== undefined) backendParams.timezone = params.timezone
  if (params?.hasAdmin !== undefined) backendParams.hasAdmin = params.hasAdmin

  const response = await api.get(`${BASE_URL}/hotels`, { params: backendParams })
  return response.data
}

export async function getHotel(id: number): Promise<{ data: HotelListItem }> {
  const response = await api.get(`${BASE_URL}/hotels/${id}`)
  return response.data
}

export async function createHotel(data: CreateHotelDto): Promise<{ data: HotelListItem }> {
  const formData = toCreateHotelFormData(data)
  const response = await api.post(`${BASE_URL}/hotels`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function updateHotel(id: number, data: UpdateHotelDto): Promise<{ data: HotelListItem }> {
  const payload = toUpdateHotelPayload(data)

  // PUT + FormData needs method spoofing with POST for Laravel.
  if (data.logo) {
    const formData = toUpdateHotelFormData(payload, data.logo)
    const response = await api.post(`${BASE_URL}/hotels/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { _method: 'PUT' },
    })
    return response.data
  }

  const response = await api.put(`${BASE_URL}/hotels/${id}`, payload)
  return response.data
}

export async function deleteHotel(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/hotels/${id}`)
}


