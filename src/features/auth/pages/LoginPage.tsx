import { LoginForm } from "../components/LoginForm"
import LoginHero from "../components/LoginHero"

const LoginPage = () => {
    return (
        <div className="flex min-h-screen">
            {/* Left side - Hero section */}
            <LoginHero />

            {/* Right side - Login form */}
            <div className="flex w-full items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 lg:w-1/2">
            <LoginForm />
      </div>
        </div>
    )
}

export default LoginPage