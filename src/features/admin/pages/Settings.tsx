import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { HotelImage } from '@/types/admin';
import {
  getHotelImages,
  createHotelImages,
  updateHotelImage,
  deleteHotelImage,
  getAdminSettings,
  updateAdminSettings,
  getAdminLogo,
  uploadAdminLogo,
} from '../api/adminApi';

const settingsFormSchema = z.object({
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Must be a valid time in HH:MM format',
  }),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Must be a valid time in HH:MM format',
  }),
  cancellationHours: z.number().int().min(0, 'Cancellation hours must be 0 or greater'),
  allowOnlineBooking: z.boolean(),
  emailNotifications: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSettings, setCurrentSettings] = useState<any>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [images, setImages] = useState<HotelImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPreviews, setSelectedPreviews] = useState<string[]>([]);
  const [imagePage, setImagePage] = useState(1);
  const [imageLastPage, setImageLastPage] = useState(1);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggingPreview, setDraggingPreview] = useState<number | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      checkInTime: '15:00',
      checkOutTime: '11:00',
      cancellationHours: 24,
      allowOnlineBooking: true,
      emailNotifications: true,
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch hotel images (gallery)
  const fetchImages = async (pageParam: number = 1) => {
    try {
      setImagesLoading(true);
      const response = await getHotelImages({ page: pageParam, per_page: 12 });
      setImages(response.data);
      const meta = response.meta as { current_page: number; last_page: number };
      setImagePage(meta.current_page);
      setImageLastPage(meta.last_page);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load hotel images');
    } finally {
      setImagesLoading(false);
    }
  };

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const [settingsResponse, logoResponse] = await Promise.all([
          getAdminSettings(),
          getAdminLogo(),
        ]);
        const settings = settingsResponse.data;
        const logo = logoResponse.data;
        setCurrentSettings(settings);

        form.reset({
          checkInTime: settings.checkInTime || '15:00',
          checkOutTime: settings.checkOutTime || '11:00',
          cancellationHours: settings.cancellationHours || 24,
          allowOnlineBooking: settings.allowOnlineBooking ?? true,
          emailNotifications: settings.emailNotifications ?? true,
        });

        if (logo.logoUrl) {
          setLogoPreview(logo.logoUrl);
          setLogoFile(null);
        } else {
          setLogoPreview(null);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  // Initial load of images
  useEffect(() => {
    void fetchImages(1);
  }, []);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setLogoPreview(objectUrl);
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files ? Array.from(event.target.files) : [];
    setFiles(list);
  };

  useEffect(() => {
    if (!files || files.length === 0) {
      selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedPreviews([]);
      return;
    }
    selectedPreviews.forEach((url) => URL.revokeObjectURL(url));
    const previews = files.map((file) => URL.createObjectURL(file));
    setSelectedPreviews(previews);
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleUploadImages = async () => {
    if (!files || files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setUploadingImages(true);
      // eslint-disable-next-line no-console
      console.log('[gallery] uploading images', files.map((f) => ({ name: f.name, size: f.size, type: f.type })));
      await createHotelImages({
        images: files,
      });
      // eslint-disable-next-line no-console
      console.log('[gallery] uploaded images');

      toast.success('Images uploaded successfully');
      setFiles([]);
      setSelectedPreviews([]);
      await fetchImages(imagePage);
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleToggleImageActive = async (image: HotelImage) => {
    try {
      const updated = await updateHotelImage(image.id, { isActive: !image.isActive });
      setImages((prev) => prev.map((img) => (img.id === image.id ? updated.data : img)));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update image status');
    }
  };

  const handleAltTextChange = async (image: HotelImage, altText: string) => {
    try {
      const updated = await updateHotelImage(image.id, { altText });
      setImages((prev) => prev.map((img) => (img.id === image.id ? updated.data : img)));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update image description');
    }
  };

  const handleDeleteImage = async (image: HotelImage) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await deleteHotelImage(image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success('Image deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete image');
    }
  };

  const handlePrevImagePage = () => {
    if (imagePage > 1) {
      void fetchImages(imagePage - 1);
    }
  };

  const handleNextImagePage = () => {
    if (imagePage < imageLastPage) {
      void fetchImages(imagePage + 1);
    }
  };

  // Reorder pending (not yet uploaded) files/previews
  const reorderPending = (startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    const newFiles = Array.from(files);
    const [removedFile] = newFiles.splice(startIndex, 1);
    newFiles.splice(endIndex, 0, removedFile);
    setFiles(newFiles);
  };

  const handlePreviewDragStart = (index: number) => setDraggingPreview(index);

  const handlePreviewDragOver = (event: React.DragEvent<HTMLDivElement>, overIndex: number) => {
    event.preventDefault();
    if (draggingPreview === null || draggingPreview === overIndex) return;
    reorderPending(draggingPreview, overIndex);
    setDraggingPreview(overIndex);
  };

  const handlePreviewDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingPreview(null);
  };

  const reorderImages = (list: HotelImage[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result.map((img, idx) => ({ ...img, displayOrder: idx + 1 }));
  };

  const handleDragStart = (id: number) => setDraggingId(id);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, overId: number) => {
    event.preventDefault();
    if (draggingId === null || draggingId === overId) return;
    const fromIndex = images.findIndex((img) => img.id === draggingId);
    const toIndex = images.findIndex((img) => img.id === overId);
    if (fromIndex === -1 || toIndex === -1) return;
    setImages(reorderImages(images, fromIndex, toIndex));
  };

  const handleDrop = async () => {
    if (draggingId === null) return;
    setDraggingId(null);
    try {
      setSavingOrder(true);
      await Promise.all(
        images.map((img) =>
          updateHotelImage(img.id, { displayOrder: img.displayOrder })
        )
      );
      toast.success('Image order updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order');
      // refresh from server to restore order
      await fetchImages(imagePage);
    } finally {
      setSavingOrder(false);
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      // If there are queued gallery images, upload them first
      if (files.length > 0) {
        setUploadingImages(true);
        await createHotelImages({ images: files });
        setFiles([]);
        setSelectedPreviews([]);
        await fetchImages(imagePage);
      }

      // Upload logo separately if provided
      if (logoFile) {
        await uploadAdminLogo(logoFile);
      }

      // Save settings (JSON)
      const settingsPayload = {
        checkInTime: values.checkInTime,
        checkOutTime: values.checkOutTime,
        cancellationHours: values.cancellationHours,
        allowOnlineBooking: values.allowOnlineBooking,
        emailNotifications: values.emailNotifications,
      };

      const response = await updateAdminSettings(settingsPayload);
      const updatedSettings = response.data;
      setCurrentSettings(updatedSettings);

      // Refresh logo from server in case it changed
      const logoResp = await getAdminLogo();
      setLogoPreview(logoResp.data.logoUrl || null);
      setLogoFile(null);

      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleReset = () => {
    if (currentSettings) {
      form.reset({
        checkInTime: currentSettings.checkInTime || '15:00',
        checkOutTime: currentSettings.checkOutTime || '11:00',
        cancellationHours: currentSettings.cancellationHours || 24,
        allowOnlineBooking: currentSettings.allowOnlineBooking ?? true,
        emailNotifications: currentSettings.emailNotifications ?? true,
      });
      setLogoPreview(currentSettings.logoUrl || null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">
          Configure hotel-specific settings and preferences
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="space-y-6 relative"
        >
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your hotel's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                  <FormItem>
                    <FormLabel>Hotel Logo</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {logoPreview ? (
                          <div className="space-y-2">
                            <div className="relative inline-block">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-20 w-auto border rounded"
                                onError={() => {
                              toast.error('Failed to load image');
                                  setLogoPreview(null);
                              handleRemoveLogo();
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={handleRemoveLogo}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label htmlFor="logo-upload">
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Change Logo
                                  </span>
                                </Button>
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                              />
                              <label htmlFor="logo-upload">
                                <Button type="button" variant="outline" asChild>
                                  <span>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                  </span>
                                </Button>
                              </label>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>Upload your hotel logo (image file)</FormDescription>
              </FormItem>
            </CardContent>
          </Card>

          {/* Hotel Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Gallery</CardTitle>
              <CardDescription>Upload and manage images displayed for this hotel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageFileChange}
                  className="sm:w-1/2"
                />
                <Button onClick={handleUploadImages} disabled={uploadingImages}>
                  {uploadingImages ? 'Uploading...' : 'Upload Selected Images'}
                </Button>
              </div>
          {selectedPreviews.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">Selected (not yet uploaded):</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {selectedPreviews.map((url, idx) => (
                  <div
                    key={url}
                    className="rounded-lg border p-2 space-y-2 cursor-move"
                    draggable
                    onDragStart={() => handlePreviewDragStart(idx)}
                    onDragOver={(e) => handlePreviewDragOver(e, idx)}
                    onDrop={handlePreviewDrop}
                  >
                    <img
                      src={url}
                      alt={`Selected ${idx + 1}`}
                      className="h-20 w-full rounded-md object-cover"
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {(files && files[idx]?.name) || `Image ${idx + 1}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

              {imagesLoading ? (
                <p className="text-sm text-muted-foreground">Loading images...</p>
              ) : images.length === 0 ? (
                <p className="text-sm text-muted-foreground">No images uploaded yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="rounded-lg border p-2 space-y-2 cursor-move"
                      draggable
                      onDragStart={() => handleDragStart(image.id)}
                      onDragOver={(e) => handleDragOver(e, image.id)}
                      onDrop={handleDrop}
                    >
                      {image.imageUrl ? (
                        <img
                          src={image.imageUrl}
                          alt={image.altText ?? ''}
                          className="h-28 w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-28 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                          No preview
                            </div>
                      )}
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <FormLabel htmlFor={`img-alt-${image.id}`}>Description</FormLabel>
                            <Input
                            id={`img-alt-${image.id}`}
                            defaultValue={image.altText ?? ''}
                            onBlur={(e) => handleAltTextChange(image, e.target.value)}
                            placeholder="Short description for accessibility / SEO"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`img-active-${image.id}`}
                              checked={image.isActive}
                              onCheckedChange={() => handleToggleImageActive(image)}
                            />
                            <FormLabel htmlFor={`img-active-${image.id}`}>Active</FormLabel>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteImage(image)}
                          >
                            Delete
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Order: {image.displayOrder}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevImagePage}
                    disabled={imagePage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {imagePage} of {imageLastPage}
                  </span>
                  {savingOrder && (
                    <span className="text-xs text-muted-foreground">Saving order...</span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextImagePage}
                    disabled={imagePage >= imageLastPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operational Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Settings</CardTitle>
              <CardDescription>Configure check-in, check-out, and cancellation policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="checkInTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Default check-in time for guests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Default check-out time for guests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cancellationHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Policy (Hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="24"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        value={field.value || ''}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum hours before check-in that guests can cancel without penalty
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">
                These operational settings will be changeable in future versions.
              </p>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>Manage online booking and payment preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="allowOnlineBooking"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Online Booking</FormLabel>
                      <FormDescription>
                        Enable guests to make reservations through the online portal
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how guests receive booking confirmations and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Send booking confirmations and updates via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Save Settings Button */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pt-4 pb-4 mt-6 z-10">
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset to Last Saved
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

