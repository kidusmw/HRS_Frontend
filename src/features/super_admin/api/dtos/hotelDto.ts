import type { CreateHotelDto, UpdateHotelDto } from '@/types/admin'

// Prepare data for creating a hotel, including an optional logo file
export function toCreateHotelFormData(data: CreateHotelDto): FormData {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('city', data.city)
  formData.append('country', data.country)
  formData.append('phone', data.phoneNumber)
  formData.append('email', data.email)
  if (data.description) formData.append('description', data.description)
  if (data.logo) formData.append('logo', data.logo)
  if (data.adminId !== undefined && data.adminId !== null) {
    formData.append('primary_admin_id', data.adminId.toString())
  } else if (data.adminId === null) {
    formData.append('primary_admin_id', '')
  }
  return formData
}

// Build a clean JSON update payload without sending unchanged fields.
export function toUpdateHotelPayload(data: UpdateHotelDto): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (data.name) payload.name = data.name
  if (data.city) payload.city = data.city
  if (data.country) payload.country = data.country
  if (data.phoneNumber) payload.phone = data.phoneNumber
  if (data.email) payload.email = data.email
  if (data.description !== undefined) payload.description = data.description || null
  if (data.adminId !== undefined) {
    payload.primary_admin_id = data.adminId ?? null
  }
  return payload
}

// Handle updating a hotel when a new logo is uploaded.
export function toUpdateHotelFormData(payload: Record<string, unknown>, logo: File): FormData {
  const formData = new FormData()
  Object.keys(payload).forEach((key) => {
    const value = payload[key]
    if (value === undefined) return
    if (value === null) return
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  })
  formData.append('logo', logo)
  return formData
}