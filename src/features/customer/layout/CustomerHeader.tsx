import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'
import type { RootState } from '@/app/store'

export function CustomerHeader() {
  const user = useSelector((state: RootState) => state.auth.user)
  const isCustomer = user?.role === 'client'

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-primary">
          StayFinder
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore Hotels
          </Link>
          {isCustomer ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/reservations" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Reservations
              </Link>
              <span className="text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
      <Separator />
    </header>
  )
}

