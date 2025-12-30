import { MoreHorizontal } from 'lucide-react'
import type { UserListItem } from '@/types/admin'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Props = {
  user: UserListItem
  onEdit: (user: UserListItem) => void
  onToggleActive: (user: UserListItem) => void
  onResetPassword: (userId: number) => void
  onDelete: (user: UserListItem) => void
}

export function UserActions({ user, onEdit, onToggleActive, onResetPassword, onDelete }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(user)}>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleActive(user)}>
          {user.isActive ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onResetPassword(user.id)}>Reset Password</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive focus:text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


