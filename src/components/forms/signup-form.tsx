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
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { registerUserThunk } from "@/features/auth/authSlice"
import { getGoogleRedirectUrl } from "@/features/auth/api/authApi"
import type { AppDispatch, RootState } from "@/app/store"
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import type { RegisterData } from "@/types/auth"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phoneNumber: "",
  })
  const [errors, setErrors] = useState<Partial<RegisterData>>({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  // Redirect to appropriate dashboard based on role
  useEffect(() => {
    if (isAuthenticated && user) {
      // Route super_admin users to super-admin dashboard
      if (user.role === 'superadmin' || user.role === 'super_admin') {
        navigate('/super-admin/dashboard')
      } else if (user.role === 'admin') {
        // Route admin users to admin dashboard
        navigate('/admin/dashboard')
      } else if (user.role === 'manager') {
        // Route manager users to manager dashboard
        navigate('/manager/dashboard')
      } else {
        // Route other users (clients) to customer portal
        navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password"
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be in E.164 format (e.g., +251912345678)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await dispatch(registerUserThunk(formData)).unwrap()
      setIsSuccess(true)
      setFormData({ name: "", email: "", password: "", password_confirmation: "", phoneNumber: "" })
    } catch (error) {
      // Error is handled by Redux state
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { redirect_url } = await getGoogleRedirectUrl()
      // Redirect in the same window instead of opening popup
      window.location.href = redirect_url
    } catch (error) {
      console.error('Google login failed:', error)
    }
  }

  if (isSuccess) {
    return (
      <form className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold">Registration Successful!</h1>
            <p className="text-muted-foreground text-sm">
              Please check your email and click the verification link to complete your registration.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsSuccess(false)}
              className="mt-4"
            >
              Register Another Account
            </Button>
          </div>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input 
            id="name" 
            name="name"
            type="text" 
            placeholder="John Doe" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </Field>
        
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
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </Field>
        
        <Field>
          <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
          <Input 
            id="phoneNumber" 
            name="phoneNumber"
            type="tel" 
            placeholder="+251912345678" 
            value={formData.phoneNumber}
            onChange={handleChange}
            required 
          />
          <FieldDescription>
            Enter your phone number in E.164 format (e.g., +251912345678)
          </FieldDescription>
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
        </Field>
        
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
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
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </Field>
        
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <div className="relative">
            <Input 
              id="confirm-password" 
              name="password_confirmation"
              type={showPasswordConfirmation ? "text" : "password"} 
              value={formData.password_confirmation}
              onChange={handleChange}
              required 
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              disabled={loading}
            >
              {showPasswordConfirmation ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <FieldDescription>Please confirm your password.</FieldDescription>
          {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
        </Field>
        
        <Field>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Spinner />
                Creating Account...
              </>
            ) : (
              "Create Account"
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
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link to={'/login'}>Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
