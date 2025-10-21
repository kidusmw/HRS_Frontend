import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { loginUserThunk, hydrateFromStorage } from "@/features/auth/authSlice"
import { getGoogleRedirectUrl, forgotPassword } from "@/features/auth/api/authApi"
import type { AppDispatch, RootState } from "@/app/store"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff } from "lucide-react"
import type { LoginCredentials } from "@/types/auth"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({})
  
  // Forgot password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("")
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await dispatch(loginUserThunk(formData)).unwrap()
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      // Error is handled by Redux state
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError("Email is required")
      return
    }
    
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordError("Please enter a valid email address")
      return
    }

    setForgotPasswordLoading(true)
    setForgotPasswordError("")
    setForgotPasswordMessage("")

    try {
      const response = await forgotPassword(forgotPasswordEmail)
      setForgotPasswordMessage(response.message)
      setForgotPasswordEmail("") // Clear the form
    } catch (error) {
      setForgotPasswordError("Something went wrong. Please try again.")
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { redirect_url } = await getGoogleRedirectUrl()
      
      // Open popup window for Google OAuth
      const popup = window.open(
        redirect_url,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Listen for the popup to close or send a message
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          // Check if we have auth data in localStorage (set by popup)
          const token = localStorage.getItem('auth_token')
          const user = localStorage.getItem('auth_user')
          if (token && user) {
            // Hydrate Redux state and navigate
            dispatch(hydrateFromStorage())
          }
        }
      }, 1000)

      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { user, access_token } = event.data
          localStorage.setItem('auth_token', access_token)
          localStorage.setItem('auth_user', JSON.stringify(user))
          dispatch(hydrateFromStorage())
          popup.close()
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          console.error('Google auth error:', event.data.error)
          popup.close()
          clearInterval(checkClosed)
          window.removeEventListener('message', messageHandler)
        }
      }

      window.addEventListener('message', messageHandler)
    } catch (error) {
      console.error('Google login failed:', error)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            name="email"
            type="email" 
            placeholder="m@example.com" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </Field>
        
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset your password</DialogTitle>
                  <DialogDescription>
                    Enter your email address and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Field>
                    <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="m@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                    {forgotPasswordError && (
                      <p className="text-red-500 text-sm mt-1">{forgotPasswordError}</p>
                    )}
                  </Field>
                  
                  {forgotPasswordMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                      {forgotPasswordMessage}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setForgotPasswordOpen(false)
                        setForgotPasswordEmail("")
                        setForgotPasswordMessage("")
                        setForgotPasswordError("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={forgotPasswordLoading}>
                      {forgotPasswordLoading ? (
                        <>
                          <Spinner />
                          Sending...
                        </>
                      ) : (
                        "Send reset link"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Input 
              id="password" 
              name="password"
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={handleChange}
              required 
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </Field>
        
        <Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Spinner />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </Field>
        
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link to={'/register'} className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
