import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { AuditLogItem } from '@/types/admin'
import { getHotels, getLogs, getUsers } from '../api'

type Option = { id: number; name: string }

type PaginationState = {
  page: number
  perPage: number
  total: number
  lastPage: number
}

export function useSuperAdminLogs() {
  const [sorting, setSorting] = useState([{ id: 'timestamp', desc: true }])
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [userFilter, setUserFilter] = useState<string>('all')
  const [hotelFilter, setHotelFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')

  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [users, setUsers] = useState<Option[]>([])
  const [hotels, setHotels] = useState<Option[]>([])
  const [actions, setActions] = useState<string[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
  })

  const loadFilterData = useCallback(async () => {
    try {
      const [usersResponse, hotelsResponse] = await Promise.all([getUsers({ perPage: 100 }), getHotels({ perPage: 100 })])
      setUsers(usersResponse.data.map((u) => ({ id: u.id, name: u.name })))
      setHotels(hotelsResponse.data.map((h) => ({ id: h.id, name: h.name })))
    } catch (error) {
      console.error('Failed to load filter data:', error)
    }
  }, [])

  useEffect(() => {
    loadFilterData()
  }, [loadFilterData])

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }))
  }, [dateFrom, dateTo, userFilter, hotelFilter, actionFilter])

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: {
        userId?: number
        hotelId?: number
        action?: string
        from?: string
        to?: string
        page?: number
        perPage?: number
      } = {
        page: pagination.page,
        perPage: pagination.perPage,
      }

      if (userFilter !== 'all') params.userId = parseInt(userFilter)

      if (hotelFilter === 'global') {
        params.hotelId = 0
      } else if (hotelFilter !== 'all') {
        params.hotelId = parseInt(hotelFilter)
      }

      if (actionFilter !== 'all') params.action = actionFilter
      if (dateFrom) params.from = format(dateFrom, 'yyyy-MM-dd')
      if (dateTo) params.to = format(dateTo, 'yyyy-MM-dd')

      const response = await getLogs(params)
      setLogs(response.data)

      const uniqueActions = Array.from(new Set(response.data.map((log) => log.action.split('.')[0])))
      setActions(uniqueActions)

      if (response.meta && typeof response.meta === 'object') {
        const meta = response.meta as {
          current_page?: number
          per_page?: number
          total?: number
          last_page?: number
        }
        setPagination((prev) => ({
          ...prev,
          page: meta.current_page || prev.page,
          perPage: meta.per_page || prev.perPage,
          total: meta.total || 0,
          lastPage: meta.last_page || prev.lastPage,
        }))
      }
    } catch (error) {
      console.error('Failed to load logs:', error)
      toast.error('Failed to load logs')
    } finally {
      setIsLoading(false)
    }
  }, [actionFilter, dateFrom, dateTo, hotelFilter, pagination.page, pagination.perPage, userFilter])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const exportCsv = useCallback(() => {
    const headers = ['Timestamp', 'User', 'Action', 'Hotel', 'Metadata']
    const rows = logs.map((log) => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.userName,
      log.action,
      log.hotelName || 'Global',
      log.meta ? JSON.stringify(log.meta) : '',
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Logs exported successfully')
  }, [logs])

  const data = useMemo(() => logs, [logs])

  return {
    sorting,
    setSorting,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    userFilter,
    setUserFilter,
    hotelFilter,
    setHotelFilter,
    actionFilter,
    setActionFilter,
    isLoading,
    logs,
    data,
    users,
    hotels,
    actions,
    pagination,
    setPagination,
    exportCsv,
  }
}


