import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { HotelListItem } from '@/types/admin'
import { deleteHotel, getHotels } from '../api'

export function useSuperAdminHotels() {
  const [isLoading, setIsLoading] = useState(true)
  const [hotels, setHotels] = useState<HotelListItem[]>([])

  const [globalFilter, setGlobalFilter] = useState('')
  const [adminFilter, setAdminFilter] = useState<string>('all')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<HotelListItem | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; hotel: HotelListItem | null }>({
    open: false,
    hotel: null,
  })

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getHotels({ perPage: 100 })
      setHotels(response.data)
    } catch (error) {
      console.error('Failed to load hotels:', error)
      toast.error('Failed to load hotels')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openCreate = useCallback(() => {
    setSelectedHotel(null)
    setIsDialogOpen(true)
  }, [])

  const openEdit = useCallback((hotel: HotelListItem) => {
    setSelectedHotel(hotel)
    setIsDialogOpen(true)
  }, [])

  const openDelete = useCallback((hotel: HotelListItem) => {
    setDeleteDialog({ open: true, hotel })
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteDialog.hotel) return
    const hotelToDelete = deleteDialog.hotel
    try {
      await deleteHotel(hotelToDelete.id)
      toast.success('Hotel deleted successfully')
      setDeleteDialog({ open: false, hotel: null })
      setHotels((prev) => prev.filter((h) => h.id !== hotelToDelete.id))
      await refresh()
    } catch (error: any) {
      console.error('Failed to delete hotel:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete hotel'
      toast.error(errorMessage)
    }
  }, [deleteDialog.hotel, refresh])

  const onFormSuccess = useCallback(
    async (updatedHotel?: HotelListItem) => {
      setIsDialogOpen(false)
      setSelectedHotel(null)

      if (updatedHotel) {
        setHotels((prev) => {
          const index = prev.findIndex((h) => h.id === updatedHotel.id)
          if (index !== -1) {
            const next = [...prev]
            next[index] = updatedHotel
            return next
          }
          return [...prev, updatedHotel]
        })
      }

      try {
        await refresh()
      } catch {
        // refresh already toasts; no-op
      }
    },
    [refresh]
  )

  const data = useMemo(() => [...hotels], [hotels])

  return {
    isLoading,
    hotels,
    data,
    globalFilter,
    setGlobalFilter,
    adminFilter,
    setAdminFilter,
    isDialogOpen,
    setIsDialogOpen,
    selectedHotel,
    deleteDialog,
    setDeleteDialog,
    openCreate,
    openEdit,
    openDelete,
    confirmDelete,
    onFormSuccess,
    refresh,
  }
}


