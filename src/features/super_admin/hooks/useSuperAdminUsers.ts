import type { UserListItem } from '@/types/admin'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { activateUser, deactivateUser, deleteUser, getHotels, getUsers, resetUserPassword } from '../api'

type HotelOption = { id: string; name: string }

export function useSuperAdminUsers() {
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<UserListItem[]>([])
  const [hotels, setHotels] = useState<HotelOption[]>([])

  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [hotelFilter, setHotelFilter] = useState<string>('all')

  const loadHotels = useCallback(async () => {
    const hotelsResponse = await getHotels({ perPage: 100 })
    setHotels(hotelsResponse.data.map((h) => ({ id: h.id.toString(), name: h.name })))
  }, [])

  const loadUsers = useCallback(async () => {
    const usersResponse = await getUsers({ perPage: 0 })
    setUsers(usersResponse.data)
  }, [])

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true)
      await Promise.all([loadUsers(), loadHotels()])
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [loadHotels, loadUsers])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleActive = useCallback(
    async (user: UserListItem) => {
      try {
        if (user.isActive) {
          await deactivateUser(user.id)
          toast.success('User deactivated successfully')
        } else {
          await activateUser(user.id)
          toast.success('User activated successfully')
        }
        await loadUsers()
      } catch (error) {
        console.error('Failed to toggle user status:', error)
        toast.error('Failed to update user status')
      }
    },
    [loadUsers]
  )

  const requestPasswordReset = useCallback(
    async (userId: number) => {
      try {
        const user = users.find((u) => u.id === userId)
        await resetUserPassword(userId)
        toast.success("Password reset successfully. The new password has been sent to the user's email.")
        return { userEmail: user?.email ?? null }
      } catch (error) {
        console.error('Failed to reset password:', error)
        toast.error('Failed to reset password')
        return { userEmail: null }
      }
    },
    [users]
  )

  const removeUser = useCallback(
    async (userToDelete: UserListItem) => {
      try {
        await deleteUser(userToDelete.id)
        toast.success('User deleted successfully')
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
        await loadUsers()
      } catch (error: any) {
        console.error('Failed to delete user:', error)
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user'
        toast.error(errorMessage)
        throw error
      }
    },
    [loadUsers]
  )

  const filters = useMemo(
    () => ({
      globalFilter,
      roleFilter,
      statusFilter,
      hotelFilter,
    }),
    [globalFilter, roleFilter, statusFilter, hotelFilter]
  )

  const setFilters = useMemo(
    () => ({
      setGlobalFilter,
      setRoleFilter,
      setStatusFilter,
      setHotelFilter,
    }),
    []
  )

  return {
    isLoading,
    users,
    hotels,
    filters,
    setFilters,
    refresh,
    toggleActive,
    requestPasswordReset,
    removeUser,
  }
}


