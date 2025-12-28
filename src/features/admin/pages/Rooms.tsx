import { useState, useEffect, useRef, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoomForm } from '@/features/admin/components/RoomForm';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import type { RoomListItem, RoomImage } from '@/types/admin';
import {
  getRooms,
  deleteRoom,
  getRoomImages,
  createRoomImages,
  updateRoomImage,
  deleteRoomImage,
} from '../api/adminApi';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'];

function getTypeBadgeVariant(type: string) {
  switch (type.toLowerCase()) {
    case 'suite':
    case 'presidential':
      return 'default';
    case 'deluxe':
    case 'executive':
      return 'secondary';
    default:
      return 'outline';
  }
}

const createColumns = (
  handleEditRoom: (room: RoomListItem) => void,
  handleDeleteRoom: (room: RoomListItem) => void,
  handleManageImages: (room: RoomListItem) => void
): ColumnDef<RoomListItem>[] => [
  {
    accessorKey: 'type',
    header: 'Type',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant={getTypeBadgeVariant(type)}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.getValue('price') as number;
      return (
        <span className="font-medium">
          {price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'ETB',
          })}
        </span>
      );
    },
  },
  {
    accessorKey: 'capacity',
    header: 'Quantity',
    cell: ({ row }) => {
      const capacity = row.getValue('capacity') as number;
      return (
        <span className="text-muted-foreground">
          {capacity} {capacity === 1 ? 'room' : 'rooms'}
        </span>
      );
    },
  },
  {
    accessorKey: 'isAvailable',
    header: 'Status',
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
    cell: ({ row }) => {
      const isAvailable = row.getValue('isAvailable') as boolean;
      return (
        <Badge variant={isAvailable ? 'default' : 'secondary'}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null;
      return (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {description || 'No description'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const room = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditRoom(room)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleManageImages(room)}>
              Manage Images
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteRoom(room)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function Rooms() {

  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [meta, setMeta] = useState<{
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number | null
    to: number | null
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    room: RoomListItem | null;
  }>({ open: false, room: null });
  const [imagesDialog, setImagesDialog] = useState<{
    open: boolean;
    room: RoomListItem | null;
  }>({ open: false, room: null });
  const [roomImages, setRoomImages] = useState<RoomImage[]>([]);
  const [roomImagesLoading, setRoomImagesLoading] = useState(false);
  const [uploadingRoomImages, setUploadingRoomImages] = useState(false);
  const [roomImageFiles, setRoomImageFiles] = useState<File[]>([]);
  const [roomImagePreviews, setRoomImagePreviews] = useState<string[]>([]);
  const roomImageInputRef = useRef<HTMLInputElement | null>(null);
  const [savingRoomImageOrder, setSavingRoomImageOrder] = useState(false);
  const [draggingRoomImageId, setDraggingRoomImageId] = useState<number | null>(null);
  const [draggingPendingIdx, setDraggingPendingIdx] = useState<number | null>(null);

  const handleCloseImagesDialog = () => {
    setImagesDialog({ open: false, room: null });
    setRoomImages([]);
    setRoomImageFiles([]);
    setRoomImagePreviews([]);
    setDraggingRoomImageId(null);
    setDraggingPendingIdx(null);
    if (roomImageInputRef.current) {
      roomImageInputRef.current.value = '';
    }
  };

  const handleImagesDialogDone = () => {
    toast.success('Room images updated');
    handleCloseImagesDialog();
  };

  const roomsQuery = useMemo(() => {
    const dto: {
      search?: string
      type?: string
      isAvailable?: boolean
      page: number
      perPage: number
    } = {
      page,
      perPage,
    }

    if (search.trim()) dto.search = search.trim()
    if (typeFilter !== 'all') dto.type = typeFilter
    if (statusFilter === 'available') dto.isAvailable = true
    if (statusFilter === 'unavailable') dto.isAvailable = false

    return dto
  }, [page, perPage, search, statusFilter, typeFilter])

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await getRooms(roomsQuery);
      setRooms(response.data);
      setMeta((response as any).meta ?? null);
    } catch (error: any) {
      console.error('Failed to load rooms:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to load rooms';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch rooms (server-side pagination + server-side filters)
  useEffect(() => {
    fetchRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsQuery]);

  const handleEditRoom = (room: RoomListItem) => {
    setSelectedRoom(room);
    setIsDrawerOpen(true);
  };

  const handleManageImages = async (room: RoomListItem) => {
    setImagesDialog({ open: true, room });
    setRoomImages([]);
    setRoomImageFiles([]);
    setRoomImagePreviews([]);
    try {
      setRoomImagesLoading(true);
      const resp = await getRoomImages({ room_id: room.id, per_page: 50 });
      setRoomImages(resp.data);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to load room images';
      toast.error(msg);
    } finally {
      setRoomImagesLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    setIsDrawerOpen(false);
    setSelectedRoom(null);
    // Refresh rooms list
    await fetchRooms()
  };

  const handleDeleteRoom = (room: RoomListItem) => {
    setDeleteDialog({ open: true, room });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.room) return;
    const roomToDelete = deleteDialog.room;
    try {
      await deleteRoom(roomToDelete.id);
      toast.success('Room deleted successfully');
      setDeleteDialog({ open: false, room: null });
      // Refresh rooms list - remove from state immediately and then fetch fresh data
      setRooms((prevRooms) => prevRooms.filter((r) => r.id !== roomToDelete.id));
      // Fetch fresh data to ensure sync
      await fetchRooms()
    } catch (error: any) {
      console.error('Failed to delete room:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete room';
      toast.error(errorMessage);
    }
  };

  const columns = createColumns(handleEditRoom, handleDeleteRoom, handleManageImages);

  const table = useReactTable({
    data: rooms,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleCreateRoom = () => {
    setSelectedRoom(null);
    setIsDrawerOpen(true);
  };

  // Room images helpers
  useEffect(() => {
    if (!roomImageFiles.length) {
      roomImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setRoomImagePreviews([]);
      return;
    }
    roomImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    const previews = roomImageFiles.map((f) => URL.createObjectURL(f));
    setRoomImagePreviews(previews);
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [roomImageFiles]);

  const handleRoomImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files ? Array.from(event.target.files) : [];
    setRoomImageFiles(list);
  };

  const reorderPendingRoomImages = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    const newFiles = Array.from(roomImageFiles);
    const [removed] = newFiles.splice(startIndex, 1);
    newFiles.splice(endIndex, 0, removed);
    setRoomImageFiles(newFiles);
  };

  const handlePendingDragStart = (index: number) => setDraggingPendingIdx(index);
  const handlePendingDragOver = (e: React.DragEvent<HTMLDivElement>, overIndex: number) => {
    e.preventDefault();
    if (draggingPendingIdx === null || draggingPendingIdx === overIndex) return;
    reorderPendingRoomImages(draggingPendingIdx, overIndex);
    setDraggingPendingIdx(overIndex);
  };
  const handlePendingDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingPendingIdx(null);
  };

  const reorderRoomImages = (list: RoomImage[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result.map((img, idx) => ({ ...img, displayOrder: idx + 1 }));
  };

  const handleRoomImageDragStart = (id: number) => setDraggingRoomImageId(id);
  const handleRoomImageDragOver = (e: React.DragEvent<HTMLDivElement>, overId: number) => {
    e.preventDefault();
    if (draggingRoomImageId === null || draggingRoomImageId === overId) return;
    const fromIndex = roomImages.findIndex((img) => img.id === draggingRoomImageId);
    const toIndex = roomImages.findIndex((img) => img.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    setRoomImages(reorderRoomImages(roomImages, fromIndex, toIndex));
  };
  const handleRoomImageDrop = async () => {
    if (draggingRoomImageId === null) return;
    setDraggingRoomImageId(null);
    try {
      setSavingRoomImageOrder(true);
      await Promise.all(
        roomImages.map((img) =>
          updateRoomImage(img.id, { displayOrder: img.displayOrder })
        )
      );
      toast.success('Room image order updated');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update order';
      toast.error(msg);
      if (imagesDialog.room) {
        const resp = await getRoomImages({ room_id: imagesDialog.room.id, per_page: 50 });
        setRoomImages(resp.data);
      }
    } finally {
      setSavingRoomImageOrder(false);
    }
  };

  const handleUploadRoomImages = async () => {
    if (!imagesDialog.room) return;
    // Fallback in case state didn't capture files (e.g., same file reselected)
    const files =
      roomImageFiles.length > 0
        ? roomImageFiles
        : Array.from(roomImageInputRef.current?.files ?? []);

    if (!files.length) {
      toast.error('Select at least one image');
      return;
    }

    try {
      setUploadingRoomImages(true);
      await createRoomImages({
        roomId: imagesDialog.room.id,
        images: files,
      });
      toast.success('Room images uploaded');
      setRoomImageFiles([]);
      setRoomImagePreviews([]);
      if (roomImageInputRef.current) {
        roomImageInputRef.current.value = '';
      }
      const resp = await getRoomImages({ room_id: imagesDialog.room.id, per_page: 50 });
      setRoomImages(resp.data);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to upload images';
      toast.error(msg);
    } finally {
      setUploadingRoomImages(false);
    }
  };

  const handleToggleRoomImage = async (img: RoomImage) => {
    try {
      const resp = await updateRoomImage(img.id, { isActive: !img.isActive });
      setRoomImages((prev) => prev.map((item) => (item.id === img.id ? resp.data : item)));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update image';
      toast.error(msg);
    }
  };

  const handleAltRoomImage = async (img: RoomImage, alt: string) => {
    try {
      const resp = await updateRoomImage(img.id, { altText: alt });
      setRoomImages((prev) => prev.map((item) => (item.id === img.id ? resp.data : item)));
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update image';
      toast.error(msg);
    }
  };

  const handleDeleteRoomImage = async (img: RoomImage) => {
    try {
      await deleteRoomImage(img.id);
      setRoomImages((prev) => prev.filter((item) => item.id !== img.id));
      toast.success('Room image deleted');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to delete image';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">
            Manage hotel rooms, types, and availability
          </p>
        </div>
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={handleCreateRoom}>
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DrawerTrigger>
          <DrawerContent className="flex flex-col max-h-[90vh]">
            <ScrollArea className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-2xl p-6">
                <RoomForm
                  room={selectedRoom}
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
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No rooms found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Room Images Dialog */}
          <Dialog
            open={imagesDialog.open}
            onOpenChange={(open) =>
          open ? setImagesDialog({ open, room: imagesDialog.room }) : handleCloseImagesDialog()
            }
          >
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Room Images</DialogTitle>
                <DialogDescription>
                  {imagesDialog.room ? `Manage images for ${imagesDialog.room.type}` : ''}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleRoomImageFileChange}
                    className="sm:w-1/2"
                  />
                  <Button onClick={handleUploadRoomImages} disabled={uploadingRoomImages}>
                    {uploadingRoomImages ? 'Uploading...' : 'Upload Selected Images'}
                  </Button>
                </div>

                {roomImagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Selected (not yet uploaded):</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {roomImagePreviews.map((url, idx) => (
                        <div
                          key={url}
                          className="rounded-lg border p-3 space-y-2 cursor-move"
                          draggable
                          onDragStart={() => handlePendingDragStart(idx)}
                          onDragOver={(e) => handlePendingDragOver(e, idx)}
                          onDrop={handlePendingDrop}
                        >
                          <img src={url} alt={`Selected ${idx + 1}`} className="h-24 w-full rounded-md object-cover" />
                          <p className="text-xs text-muted-foreground truncate">
                            {(roomImageFiles && roomImageFiles[idx]?.name) || `Image ${idx + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {roomImagesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading images...</p>
                ) : roomImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {roomImages.map((image) => (
                      <div
                        key={image.id}
                        className="rounded-lg border p-3 space-y-3 cursor-move"
                        draggable
                        onDragStart={() => handleRoomImageDragStart(image.id)}
                        onDragOver={(e) => handleRoomImageDragOver(e, image.id)}
                        onDrop={handleRoomImageDrop}
                      >
                        {image.imageUrl ? (
                          <img
                            src={image.imageUrl}
                            alt={image.altText ?? ''}
                            className="h-32 w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-28 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                            No preview
                          </div>
                        )}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`room-img-active-${image.id}`}
                                checked={image.isActive}
                                onCheckedChange={() => handleToggleRoomImage(image)}
                              />
                              <Label htmlFor={`room-img-active-${image.id}`}>Active</Label>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRoomImage(image)}
                            >
                              Delete
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`room-img-alt-${image.id}`}>Description</Label>
                            <Input
                              id={`room-img-alt-${image.id}`}
                              defaultValue={image.altText ?? ''}
                              onBlur={(e) => handleAltRoomImage(image, e.target.value)}
                              placeholder="Short description for accessibility / SEO"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">Order: {image.displayOrder}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {roomImages.length > 0 && (
                  <div className="mt-2 flex items-center justify-end">
                    {savingRoomImageOrder && (
                      <span className="text-xs text-muted-foreground">Saving order...</span>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseImagesDialog}>
                  Close
                </Button>
                <Button onClick={handleImagesDialogDone}>
                  Done
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {meta ? (
                <span>
                  Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total}
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={isLoading || page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => (meta ? Math.min(meta.last_page, p + 1) : p + 1))}
              disabled={isLoading || (meta ? page >= meta.last_page : false)}
            >
              Next
            </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => setDeleteDialog({ open, room: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
              {deleteDialog.room && (
                <>
                  <br />
                  <strong>Room Type:</strong> {deleteDialog.room.type}
                  <br />
                  <strong>Price:</strong>{' '}
                  {deleteDialog.room.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, room: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
