import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { BackupItem } from '@/types/admin'
import { downloadBackup, getBackups, getHotels, runFullBackup, runHotelBackup } from '../api'

type HotelOption = { id: number; name: string }

type PaginationState = {
  page: number
  perPage: number
  total: number
  lastPage: number
}

export function useSuperAdminBackups() {
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }])
  const [selectedHotelId, setSelectedHotelId] = useState<string>('')
  const [isFullBackupDialogOpen, setIsFullBackupDialogOpen] = useState(false)
  const [isHotelBackupDialogOpen, setIsHotelBackupDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningBackup, setIsRunningBackup] = useState(false)
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [hotels, setHotels] = useState<HotelOption[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: 6,
    total: 0,
    lastPage: 1,
  })

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const hotelsResponse = await getHotels({ perPage: 100 })
        setHotels(hotelsResponse.data.map((h) => ({ id: h.id, name: h.name })))
      } catch (error) {
        console.error('Failed to load hotels:', error)
      }
    }
    fetchHotels()
  }, [])

  const refreshBackups = useCallback(async () => {
    try {
      const response = await getBackups({ page: pagination.page, perPage: pagination.perPage })
      setBackups(response.data)
      if (response.meta && typeof response.meta === 'object') {
        const meta = response.meta as {
          total?: number
          last_page?: number
          per_page?: number
          current_page?: number
        }
        setPagination((prev) => ({
          ...prev,
          total: meta.total ?? prev.total,
          lastPage: meta.last_page ?? prev.lastPage,
          perPage: meta.per_page ?? prev.perPage,
          page: meta.current_page ?? prev.page,
        }))
      }
    } catch (error) {
      console.error('Failed to refresh backups:', error)
    }
  }, [pagination.page, pagination.perPage])

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setIsLoading(true)
        await refreshBackups()
      } catch (error) {
        console.error('Failed to load backups:', error)
        toast.error('Failed to load backups')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBackups()
  }, [refreshBackups])

  const handleDownload = useCallback(async (backup: BackupItem) => {
    if (!backup.path || backup.status !== 'success') {
      toast.error('Backup file not available')
      return
    }

    try {
      const blob = await downloadBackup(backup.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download =
        backup.path.split('/').pop() || `backup-${backup.id}.${backup.type === 'full' ? 'zip' : 'json'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Backup downloaded successfully')
    } catch (error: any) {
      console.error('Download failed:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download backup'
      toast.error(errorMessage)
    }
  }, [])

  const handleFullBackup = useCallback(async () => {
    try {
      setIsRunningBackup(true)
      const response = await runFullBackup()
      const newBackup = response.data

      const backupWithRunningStatus = { ...newBackup, status: 'running' as const }
      setBackups((prev) => [backupWithRunningStatus, ...prev])
      setIsFullBackupDialogOpen(false)
      toast.success('Full backup started successfully')

      setTimeout(() => {
        setBackups((prev) =>
          prev.map((b) => (b.id === backupWithRunningStatus.id ? { ...b, status: 'success' as const } : b))
        )
        refreshBackups()
      }, 5000)
    } catch (error: any) {
      console.error('Backup failed:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start backup'
      toast.error(errorMessage)
    } finally {
      setIsRunningBackup(false)
    }
  }, [refreshBackups])

  const handleHotelBackup = useCallback(async () => {
    if (!selectedHotelId) return
    try {
      setIsRunningBackup(true)
      const hotelId = parseInt(selectedHotelId)
      const response = await runHotelBackup(hotelId)
      const newBackup = response.data

      const backupWithRunningStatus = { ...newBackup, status: 'running' as const }
      setBackups((prev) => [backupWithRunningStatus, ...prev])
      setIsHotelBackupDialogOpen(false)
      setSelectedHotelId('')
      toast.success('Hotel backup started successfully')

      setTimeout(() => {
        setBackups((prev) =>
          prev.map((b) => (b.id === backupWithRunningStatus.id ? { ...b, status: 'success' as const } : b))
        )
        refreshBackups()
      }, 5000)
    } catch (error: any) {
      console.error('Backup failed:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start backup'
      toast.error(errorMessage)
    } finally {
      setIsRunningBackup(false)
    }
  }, [refreshBackups, selectedHotelId])

  const data = useMemo(() => backups, [backups])

  return {
    sorting,
    setSorting,
    selectedHotelId,
    setSelectedHotelId,
    isFullBackupDialogOpen,
    setIsFullBackupDialogOpen,
    isHotelBackupDialogOpen,
    setIsHotelBackupDialogOpen,
    isLoading,
    isRunningBackup,
    backups,
    data,
    hotels,
    pagination,
    setPagination,
    handleDownload,
    handleFullBackup,
    handleHotelBackup,
  }
}


