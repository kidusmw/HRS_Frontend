import api from '@/lib/axios'
import type { UserListItem } from '@/types/admin'
import type { PaginatedResponse, PaginationParams } from './dtos'
import { toBackendPaginationParams, toCreateUserPayload, toUpdateUserPayload } from './dtos'
import type { CreateSuperAdminUserInput, UpdateSuperAdminUserInput } from './dtos'

const BASE_URL = '/super_admin'

export interface GetUsersQueryDto extends PaginationParams {
  search?: string
  role?: string
  hotelId?: number
  status?: 'active' | 'inactive'
}

export async function getUsers(params?: GetUsersQueryDto): Promise<PaginatedResponse<UserListItem>> {
  const backendParams: Record<string, unknown> = {
    ...toBackendPaginationParams(params),
  }

  if (params?.search !== undefined) backendParams.search = params.search
  if (params?.role !== undefined) backendParams.role = params.role
  if (params?.status !== undefined) backendParams.active = params.status === 'active'
  if (params?.hotelId !== undefined) backendParams.hotelId = params.hotelId

  const response = await api.get(`${BASE_URL}/users`, { params: backendParams })
  return response.data
}

export async function getUser(id: number): Promise<{ data: UserListItem }> {
  const response = await api.get(`${BASE_URL}/users/${id}`)
  return response.data
}

export async function createUser(data: CreateSuperAdminUserInput): Promise<{ data: UserListItem }> {
  const response = await api.post(`${BASE_URL}/users`, toCreateUserPayload(data))
  return response.data
}

export async function updateUser(id: number, data: UpdateSuperAdminUserInput): Promise<{ data: UserListItem }> {
  const response = await api.put(`${BASE_URL}/users/${id}`, toUpdateUserPayload(data))
  return response.data
}

export async function activateUser(id: number): Promise<{ data: UserListItem }> {
  const response = await api.patch(`${BASE_URL}/users/${id}/activate`)
  return response.data
}

export async function deactivateUser(id: number): Promise<{ data: UserListItem }> {
  const response = await api.patch(`${BASE_URL}/users/${id}/deactivate`)
  return response.data
}

export async function resetUserPassword(id: number): Promise<{ message: string }> {
  const response = await api.post(`${BASE_URL}/users/${id}/reset-password`)
  return response.data
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`${BASE_URL}/users/${id}`)
}


