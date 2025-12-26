import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/app/store'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const GoogleOAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        if (error) {
          setStatus('error')
          setMessage('Authentication failed: ' + error)
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        // Call the backend callback endpoint with the code
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google/callback?code=${code}&state=${state}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Authentication successful!')
          
          const { user, access_token } = data
          
          // Store in localStorage
          if (access_token) {
            localStorage.setItem('auth_token', access_token)
          }
          localStorage.setItem('auth_user', JSON.stringify(user))
          
          // Directly update Redux state
          dispatch({
            type: 'auth/loginUserThunk/fulfilled',
            payload: {
              user,
              access_token,
            }
          })
          
          // Navigate based on role
          setTimeout(() => {
            if (user.role === 'superadmin' || user.role === 'super_admin') {
              navigate('/super-admin/dashboard')
            } else if (user.role === 'admin') {
              navigate('/admin/dashboard')
            } else if (user.role === 'manager') {
              navigate('/manager/dashboard')
            } else {
              navigate('/')
            }
          }, 1500)
        } else {
          setStatus('error')
          setMessage(data.message || 'Authentication failed')
          setTimeout(() => navigate('/login'), 2000)
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error during authentication')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex flex-col items-center text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authenticating with Google</h1>
              <p className="text-gray-600">Please wait while we complete your sign-in...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleOAuthCallback
