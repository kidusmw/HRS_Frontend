import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const GoogleOAuthPopup = () => {
  const [searchParams] = useSearchParams()
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
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('No authorization code received')
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
          
          // Send success message to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: data.user,
            access_token: data.access_token
          }, window.location.origin)
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close()
          }, 1500)
        } else {
          setStatus('error')
          setMessage(data.message || 'Authentication failed')
          
          // Send error message to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: data.message || 'Authentication failed'
          }, window.location.origin)
        }
      } catch (error) {
        setStatus('error')
        setMessage('Network error during authentication')
        
        // Send error message to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'Network error during authentication'
        }, window.location.origin)
      }
    }

    handleOAuthCallback()
  }, [searchParams])

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
              <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">This window will close automatically...</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GoogleOAuthPopup
