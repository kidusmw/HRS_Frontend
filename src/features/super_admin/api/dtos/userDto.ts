import type { CreateUserDto, UpdateUserDto } from '@/types/admin'

// DTO for creating a super admin user, with optional password generation and active status
export type CreateSuperAdminUserInput = CreateUserDto & {
  generatePassword?: boolean
  active?: boolean
}

// DTO for updating a super admin user, with optional active status and password
export type UpdateSuperAdminUserInput = UpdateUserDto & {
  active?: boolean
  password?: string
}

// Prepare payload for creating a super admin user
export function toCreateUserPayload(data: CreateSuperAdminUserInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    role: data.role,
    password: data.password,
    generatePassword: data.generatePassword,
    phone_number: data.phoneNumber,
    active: data.active,
  }
  // Optionally assign a hotel if provided
  if (data.hotelId !== undefined && data.hotelId !== null) {
    payload.hotel_id = data.hotelId
  }

  return payload
}

// Prepare payload for updating a super admin user
export function toUpdateUserPayload(data: UpdateSuperAdminUserInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (data.name !== undefined) payload.name = data.name
  if (data.email !== undefined) payload.email = data.email
  if (data.role !== undefined) payload.role = data.role
  if (data.password !== undefined && data.password !== '') payload.password = data.password
  if (data.phoneNumber !== undefined) payload.phone_number = data.phoneNumber
  if (data.active !== undefined) payload.active = data.active

  // Allow clearing hotel assignment by sending null
  if (data.hotelId !== undefined) {
    payload.hotel_id = data.hotelId ?? null
  }

  return payload
}


