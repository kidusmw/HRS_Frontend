import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Note: Using Dialog instead of AlertDialog if alert-dialog doesn't exist
import { HotelForm } from '@/features/super_admin/components/HotelForm';
import { DeleteHotelDialog } from '@/features/super_admin/components/hotels/DeleteHotelDialog';
import { HotelsTable } from '@/features/super_admin/components/hotels/HotelsTable';
import { useSuperAdminHotels } from '@/features/super_admin/hooks/useSuperAdminHotels';

export function Hotels() {
  const hotelsState = useSuperAdminHotels();
  const {
    isLoading,
    data,
    globalFilter,
    setGlobalFilter,
    adminFilter,
    setAdminFilter,
    isDialogOpen,
    setIsDialogOpen,
    selectedHotel,
    deleteDialog,
    setDeleteDialog,
    openCreate,
    openEdit,
    openDelete,
    confirmDelete,
    onFormSuccess,
  } = hotelsState;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotels</h1>
          <p className="text-muted-foreground">
            Manage hotel properties and configurations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedHotel ? 'Edit Hotel' : 'Create Hotel'}
              </DialogTitle>
              <DialogDescription>
                {selectedHotel
                  ? 'Update hotel information and settings'
                  : 'Add a new hotel to the system'}
              </DialogDescription>
            </DialogHeader>
            <HotelForm
              key={selectedHotel ? `hotel-${selectedHotel.id}` : 'hotel-new'}
              hotel={selectedHotel}
              onSuccess={onFormSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <HotelsTable
            data={data}
            globalFilter={globalFilter}
            adminFilter={adminFilter}
            onGlobalFilterChange={setGlobalFilter}
            onAdminFilterChange={setAdminFilter}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteHotelDialog
        open={deleteDialog.open}
        hotel={deleteDialog.hotel}
        onOpenChange={(open) => setDeleteDialog(open ? deleteDialog : { open: false, hotel: null })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

