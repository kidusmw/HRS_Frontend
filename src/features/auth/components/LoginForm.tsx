import { useState } from "react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login:", { email, password })
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-12 shadow-lg">
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-md border-2 border-gray-300 px-4 text-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Password input */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-md border-2 border-gray-300 px-4 text-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        {/* Remember me and Forgot password */}
        <button type="button" className="text-sm text-blue-600 hover:underline">
            Forgot password?
        </button>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="h-11 flex-1 rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Login
          </button>
          <button
            type="button"
            className="h-11 flex-1 rounded-md border-2 border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}
