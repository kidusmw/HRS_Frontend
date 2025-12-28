export interface PaginationParams {
  page?: number
  perPage?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  links?: unknown
  meta?: PaginationMeta
}

export function toBackendPaginationParams(params?: PaginationParams): Record<string, unknown> {
  if (!params) return {}
  const result: Record<string, unknown> = {}
  if (params.page !== undefined) result.page = params.page
  if (params.perPage !== undefined) result.per_page = params.perPage
  return result
}


