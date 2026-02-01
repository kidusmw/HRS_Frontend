// DTOs related to pagination for Super Admin feature
export interface PaginationParams {
  page?: number
  perPage?: number
}

// Metadata about the pagination state
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

// Generic paginated response structure
export interface PaginatedResponse<T> {
  data: T[]
  links?: unknown
  meta?: PaginationMeta
}

// Convert frontend pagination params to backend expected format
// E.g., { page: 2, perPage: 10 } => { page: 2, per_page: 10 }
export function toBackendPaginationParams(params?: PaginationParams): Record<string, unknown> {
  if (!params) return {}
  const result: Record<string, unknown> = {}
  if (params.page !== undefined) result.page = params.page
  if (params.perPage !== undefined) result.per_page = params.perPage
  return result
}