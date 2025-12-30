import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/app/store'
import { clearAuth } from '@/features/auth/authSlice'
import { CustomerHeader } from './CustomerHeader'
import { CustomerFooter } from './CustomerFooter'

export function CustomerLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    // Clear session if user is not a customer/client
    if (user && user.role !== 'client') {
      dispatch(clearAuth())
    }
  }, [user, dispatch])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CustomerHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  )
}

