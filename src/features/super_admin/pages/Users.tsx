import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { UserListItem } from '@/types/admin'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { UserForm } from '@/features/super_admin/components/UserForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteUserDialog } from '@/features/super_admin/components/users/DeleteUserDialog'
import { UsersTable } from '@/features/super_admin/components/users/UsersTable'
import { useSuperAdminUsers } from '@/features/super_admin/hooks/useSuperAdminUsers'

export function Users() {
  const usersState = useSuperAdminUsers()
  const { users, hotels, isLoading, filters, setFilters } = usersState

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{
    open: boolean;
    userId: number | null;
    userEmail: string | null;
  }>({ open: false, userId: null, userEmail: null });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: UserListItem | null;
  }>({ open: false, user: null });

  const handleEditUser = (user: UserListItem) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }

  const handleFormSuccess = async () => {
    setIsDrawerOpen(false)
    setSelectedUser(null)
    await usersState.refresh()
  }

  const handleDeleteUser = (user: UserListItem) => {
    setDeleteDialog({ open: true, user })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.user) return
    const userToDelete = deleteDialog.user
    await usersState.removeUser(userToDelete)
    setDeleteDialog({ open: false, user: null })
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={handleCreateUser}>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col max-h-[90vh]">
            <ScrollArea className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-2xl p-6">
                <UserForm
                  user={selectedUser}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setIsDrawerOpen(false)}
                />
              </div>
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <UsersTable
            users={users}
            hotels={hotels}
            globalFilter={filters.globalFilter}
            roleFilter={filters.roleFilter}
            statusFilter={filters.statusFilter}
            hotelFilter={filters.hotelFilter}
            onGlobalFilterChange={setFilters.setGlobalFilter}
            onRoleFilterChange={setFilters.setRoleFilter}
            onStatusFilterChange={setFilters.setStatusFilter}
            onHotelFilterChange={setFilters.setHotelFilter}
            onEdit={handleEditUser}
            onToggleActive={usersState.toggleActive}
            onResetPassword={async (userId) => {
              const result = await usersState.requestPasswordReset(userId)
              setResetPasswordDialog({
                open: true,
                userId,
                userEmail: result.userEmail,
              })
            }}
            onDelete={handleDeleteUser}
          />
        </>
      )}

      {/* Reset Password Dialog */}
      <Dialog
        open={resetPasswordDialog.open}
        onOpenChange={(open: boolean) =>
          setResetPasswordDialog({ open, userId: null, userEmail: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              The password has been reset and sent to the user's email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A new password has been generated and sent to:
            </p>
            <p className="font-medium text-sm break-all">
              {resetPasswordDialog.userEmail || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              The user will receive an email with their new password and instructions to change it.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                setResetPasswordDialog({ open: false, userId: null, userEmail: null })
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        onOpenChange={(open) => setDeleteDialog(open ? deleteDialog : { open: false, user: null })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

