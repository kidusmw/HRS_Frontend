import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthPromptDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to reserve</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          You can explore without signing in. To reserve, please login or create an account.
        </p>
        <div className="flex flex-wrap gap-2 pt-4">
          <Button
            onClick={() =>
              navigate('/login', { state: { from: location.pathname + location.search } })
            }
          >
            Login
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate('/register', { state: { from: location.pathname + location.search } })
            }
          >
            Create account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

