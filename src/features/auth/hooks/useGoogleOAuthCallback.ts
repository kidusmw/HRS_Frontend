import type { AppDispatch } from '@/app/store'
import { hydrateFromStorage } from '@/features/auth/authSlice'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeGoogleOAuthCode } from '../api/authApi'

export type OAuthCallbackStatus = 'loading' | 'success' | 'error'

type Options = {
  successRedirectDelayMs?: number
  errorRedirectDelayMs?: number
}

function resolveRedirectPathByRole(role: string | undefined): string {
  if (role === 'superadmin' || role === 'super_admin') return '/super-admin/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'manager') return '/manager/dashboard'
  if (role === 'receptionist') return '/receptionist/dashboard'
  return '/'
}

// Hook to handle Google OAuth callback
// Parses URL parameters, exchanges code for tokens, updates state, and redirects user
export function useGoogleOAuthCallback(options?: Options) {
  const { successRedirectDelayMs = 1500, errorRedirectDelayMs = 2000 } = options ?? {}

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const [status, setStatus] = useState<OAuthCallbackStatus>('loading')
  const [message, setMessage] = useState('')

  const ranOnce = useRef(false)

  useEffect(() => {
    // React 18 StrictMode runs effects twice in development; OAuth codes are single-use.
    if (ranOnce.current) return
    ranOnce.current = true

    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        if (error) {
          setStatus('error')
          setMessage(`Authentication failed: ${error}`)
          setTimeout(() => navigate('/login'), errorRedirectDelayMs)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          setTimeout(() => navigate('/login'), errorRedirectDelayMs)
          return
        }

        const { ok, data } = await exchangeGoogleOAuthCode({ code, state })

        if (!ok) {
          setStatus('error')
          setMessage((data as any).message || 'Authentication failed')
          setTimeout(() => navigate('/login'), errorRedirectDelayMs)
          return
        }

        setStatus('success')
        setMessage('Authentication successful!')

        const { user, access_token } = data as any

        if (access_token) {
          localStorage.setItem('auth_token', access_token)
        }
        localStorage.setItem('auth_user', JSON.stringify(user))

        // Hydrate redux from localStorage (same mechanism as app boot)
        await dispatch(hydrateFromStorage())

        const nextPath = resolveRedirectPathByRole(user?.role)
        setTimeout(() => navigate(nextPath), successRedirectDelayMs)
      } catch {
        setStatus('error')
        setMessage('Network error during authentication')
        setTimeout(() => navigate('/login'), errorRedirectDelayMs)
      }
    }

    handleOAuthCallback()
  }, [dispatch, errorRedirectDelayMs, navigate, searchParams, successRedirectDelayMs])

  return { status, message }
}


