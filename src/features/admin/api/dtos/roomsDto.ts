export type GetRoomsQueryDto = {
  search?: string
  type?: string
  isAvailable?: boolean
  page?: number
  perPage?: number
}

export type GetRoomsQueryParams = {
  search?: string
  type?: string
  isAvailable?: boolean
  page?: number
  per_page?: number
}

// convert GetRoomsQueryDto to GetRoomsQueryParams 
export function toGetRoomsParams(dto?: GetRoomsQueryDto): GetRoomsQueryParams | undefined {
  if (!dto) return undefined

  const params: GetRoomsQueryParams = {}

  if (dto.search && dto.search.trim()) params.search = dto.search.trim()
  if (dto.type && dto.type.trim()) params.type = dto.type.trim()
  if (dto.isAvailable !== undefined) params.isAvailable = dto.isAvailable

  if (dto.page !== undefined) params.page = dto.page
  if (dto.perPage !== undefined) params.per_page = dto.perPage

  return params
}


