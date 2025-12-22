import api from '@/lib/axios';
import type {
  UserListItem,
  RoomListItem,
  CreateRoomDto,
  UpdateRoomDto,
  PaymentListItem,
  AuditLogItem,
  BackupItem,
  HotelImage,
  RoomImage,
  NotificationItem,
} from '@/types/admin';

const BASE_URL = '/admin';

/*
 * Settings
 */

export interface AdminSettings {
  checkInTime: string;
  checkOutTime: string;
  cancellationHours: number;
  allowOnlineBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Update Admin Settings Dto
// This is the data that is sent to the backend when updating the admin settings
// It is a partial of the AdminSettings interface meaning that only the fields that are provided will be updated.
export interface UpdateAdminSettingsDto extends Partial<AdminSettings> {
}

export const getAdminSettings = async (): Promise<{ data: AdminSettings }> => {
  const response = await api.get(`${BASE_URL}/settings`);
  return response.data;
};

export const updateAdminSettings = async (
  data: UpdateAdminSettingsDto
): Promise<{ data: AdminSettings }> => {
  const response = await api.put(`${BASE_URL}/settings`, data);
  return response.data;
};

/*
 * Hotel Logo
 */

export interface AdminLogo {
  hotelId: number;
  logoUrl: string | null;
}

export const getAdminLogo = async (): Promise<{ data: AdminLogo }> => {
  const response = await api.get(`${BASE_URL}/hotel-logo`);
  return response.data;
};

export const uploadAdminLogo = async (logoFile: File): Promise<{ data: AdminLogo }> => {
  const formData = new FormData();
  formData.append('logo', logoFile);

  const response = await api.post(`${BASE_URL}/hotel-logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/*
* Dashboard
*/ 
export interface AdminDashboardMetrics {
  kpis: {
    occupancyPct: number;
    occupancyChangeFromLastMonth?: number;
    occupancyChangeFormatted?: string;
    roomsAvailable: number;
    activeReservationsToday: number;
    upcomingCheckins: number;
  };
  monthlyRevenue: number;
  bookingTrends: Array<{ month: string; bookings: number }>;
  weeklyOccupancy: Array<{ week: string; occupied: number; available: number }>;
  revenueTrends: Array<{ month: string; revenue: number }>;
}

export const getDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  const response = await api.get(`${BASE_URL}/dashboard/metrics`);
  return response.data;
};

/*
* Users
*/ 

export interface GetUsersParams {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  perPage?: number;
}

export const getUsers = async (params?: GetUsersParams): Promise<{
  data: UserListItem[];
  links: unknown;
  meta: unknown;
}> => {
  const response = await api.get(`${BASE_URL}/users`, { params });
  return response.data;
};

export const getUser = async (id: number): Promise<{ data: UserListItem }> => {
  const response = await api.get(`${BASE_URL}/users/${id}`);
  return response.data;
};

export interface CreateUserDto {
  name: string;
  email: string;
  role: 'receptionist' | 'manager';
  password?: string;
  phoneNumber?: string;
  active?: boolean;
  supervisorId?: number | null;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'receptionist' | 'manager';
  password?: string;
  phoneNumber?: string;
  active?: boolean;
  supervisorId?: number | null;
}

export const createUser = async (data: CreateUserDto): Promise<{ data: UserListItem }> => {
  // Convert camelCase to snake_case for backend
  const payload: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    phoneNumber: data.phoneNumber,
    active: data.active,
  };

  if (data.supervisorId !== undefined) {
    payload.supervisor_id = data.supervisorId;
  }
  
  if (data.password) {
    payload.password = data.password;
  }
  
  const response = await api.post(`${BASE_URL}/users`, payload);
  return response.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserDto
): Promise<{ data: UserListItem }> => {
  // Convert camelCase to snake_case for backend
  const payload: any = {};
  
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.role !== undefined) payload.role = data.role;
  if (data.password !== undefined && data.password !== '') payload.password = data.password;
  if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber;
  if (data.active !== undefined) payload.active = data.active;
  if (data.supervisorId !== undefined) payload.supervisor_id = data.supervisorId;
  
  const response = await api.put(`${BASE_URL}/users/${id}`, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/users/${id}`);
};

/*
* Rooms
*/ 

export interface GetRoomsParams {
  search?: string;
  type?: string;
  isAvailable?: boolean;
  page?: number;
  perPage?: number;
}

export const getRooms = async (params?: GetRoomsParams): Promise<{
  data: RoomListItem[];
  links: unknown;
  meta: unknown;
}> => {
  const response = await api.get(`${BASE_URL}/rooms`, { params });
  return response.data;
};

export const getRoom = async (id: number): Promise<{ data: RoomListItem }> => {
  const response = await api.get(`${BASE_URL}/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: CreateRoomDto): Promise<{ message: string; data: RoomListItem[]; count: number }> => {
  // Convert camelCase to snake_case for backend
  // Note: isAvailable is not sent - it defaults to true on backend and is managed by receptionists/managers
  // capacity here means "number of rooms to create"
  const payload: any = {
    type: data.type,
    price: data.price,
    capacity: data.capacity, // Number of rooms to create
  };
  
  if (data.description !== undefined) {
    payload.description = data.description || null;
  }
  
  const response = await api.post(`${BASE_URL}/rooms`, payload);
  return response.data;
};

export const updateRoom = async (
  id: number,
  data: UpdateRoomDto
): Promise<{ data: RoomListItem }> => {
  // Convert camelCase to snake_case for backend
  const payload: any = {};
  
  if (data.type !== undefined) payload.type = data.type;
  if (data.price !== undefined) payload.price = data.price;
  if (data.isAvailable !== undefined) payload.isAvailable = data.isAvailable;
  if (data.capacity !== undefined) payload.capacity = data.capacity;
  if (data.description !== undefined) payload.description = data.description || null;
  
  const response = await api.put(`${BASE_URL}/rooms/${id}`, payload);
  return response.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/rooms/${id}`);
};

/*
* Payments
*/ 

export interface GetPaymentsParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

export const getPayments = async (params?: GetPaymentsParams): Promise<{
  data: PaymentListItem[];
  links: unknown;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}> => {
  const response = await api.get(`${BASE_URL}/payments`, { params });
  return response.data;
};

export const getPayment = async (id: number): Promise<{ data: PaymentListItem }> => {
  const response = await api.get(`${BASE_URL}/payments/${id}`);
  return response.data;
};

/*
* Logs
*/ 

// Get Logs Params 
export interface GetLogsParams {
  userId?: number;
  action?: string;
  from?: string; // Date string in YYYY-MM-DD format
  to?: string; // Date string in YYYY-MM-DD format
  page?: number;
  per_page?: number;
}

// Get Logs 
// Fetches logs from the database through pahinated api
export const getLogs = async (params?: GetLogsParams): Promise<{
  data: AuditLogItem[]; // Array of audit log items
  links: unknown; // Links to the next and previous pages
  meta: {
    current_page: number; // Current page
    from: number | null; // Start index of the current page
    last_page: number; // Total number of pages
    per_page: number; // Number of items per page
    to: number | null; // End index of the current page
    total: number; // Total number of items
  };
}> => {
  // Fetch logs from the database through paginated api with the given params
  const response = await api.get(`${BASE_URL}/logs`, { params });
  return response.data;
};

// Get Log 
// Fetches a single log from the database by id
export const getLog = async (id: number): Promise<{ data: AuditLogItem }> => {
  // Fetch a single log from the database by id
  const response = await api.get(`${BASE_URL}/logs/${id}`);
  return response.data;
};

/*
 * Backups
 */ 

export interface GetBackupsParams {
  page?: number;
  per_page?: number;
}

// Get Backups 
// Fetches backups from the database through paginated api
export const getBackups = async (params?: GetBackupsParams): Promise<{
  data: BackupItem[];
  links: unknown;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}> => {
  const response = await api.get(`${BASE_URL}/backups`, { params });
  return response.data;
};

// Create Backup 
// Creates a new backup for the hotel
export const createBackup = async (): Promise<{ data: BackupItem }> => {
  const response = await api.post(`${BASE_URL}/backups`);
  return response.data;
};

// Download Backup 
// Downloads a backup file from the database by id. Download file is a blob.
// Blob is a binary large object. This is a file that is stored in the database.
export const downloadBackup = async (id: number): Promise<Blob> => {
  const response = await api.get(`${BASE_URL}/backups/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

/*
 * Hotel Images (Gallery)
 */

export interface GetHotelImagesParams {
  only_active?: boolean;
  page?: number;
  per_page?: number;
}

export const getHotelImages = async (
  params?: GetHotelImagesParams
): Promise<{
  data: HotelImage[];
  links: unknown;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}> => {
  const response = await api.get(`${BASE_URL}/hotel-images`, { params });
  return response.data;
};

export interface CreateHotelImagesDto {
  images: File[];
  altText?: (string | null)[];
  displayOrder?: (number | null)[];
  isActive?: (boolean | null)[];
}

export const createHotelImages = async (
  payload: CreateHotelImagesDto
): Promise<{
  data: HotelImage[];
}> => {
  const formData = new FormData();

  payload.images.forEach((file) => {
    formData.append('images[]', file);
  });

  if (payload.altText) {
    payload.altText.forEach((text) => {
      formData.append('alt_text[]', text ?? '');
    });
  }

  if (payload.displayOrder) {
    payload.displayOrder.forEach((order) => {
      if (order != null) {
        formData.append('display_order[]', String(order));
      } else {
        formData.append('display_order[]', '');
      }
    });
  }

  if (payload.isActive) {
    payload.isActive.forEach((active) => {
      if (active != null) {
        formData.append('is_active[]', active ? '1' : '0');
      } else {
        formData.append('is_active[]', '');
      }
    });
  }

  const response = await api.post(`${BASE_URL}/hotel-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export interface UpdateHotelImageDto {
  altText?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export const updateHotelImage = async (
  id: number,
  data: UpdateHotelImageDto
): Promise<{ data: HotelImage }> => {
  const payload: any = {};

  if (data.altText !== undefined) payload.alt_text = data.altText;
  if (data.displayOrder !== undefined) payload.display_order = data.displayOrder;
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  const response = await api.put(`${BASE_URL}/hotel-images/${id}`, payload);
  return response.data;
};

export const deleteHotelImage = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/hotel-images/${id}`);
};

/*
 * Room Images (Gallery)
 */

export interface GetRoomImagesParams {
  room_id: number;
  only_active?: boolean;
  page?: number;
  per_page?: number;
}

export const getRoomImages = async (
  params: GetRoomImagesParams
): Promise<{
  data: RoomImage[];
  links: unknown;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}> => {
  const response = await api.get(`${BASE_URL}/room-images`, { params });
  return response.data;
};

export interface CreateRoomImagesDto {
  roomId: number;
  images: File[];
  altText?: (string | null)[];
  displayOrder?: (number | null)[];
  isActive?: (boolean | null)[];
}

export const createRoomImages = async (
  payload: CreateRoomImagesDto
): Promise<{
  data: RoomImage[];
}> => {
  const formData = new FormData();
  formData.append('room_id', String(payload.roomId));

  payload.images.forEach((file) => {
    formData.append('images[]', file);
  });

  if (payload.altText) {
    payload.altText.forEach((text) => {
      formData.append('alt_text[]', text ?? '');
    });
  }

  if (payload.displayOrder) {
    payload.displayOrder.forEach((order) => {
      if (order != null) {
        formData.append('display_order[]', String(order));
      } else {
        formData.append('display_order[]', '');
      }
    });
  }

  if (payload.isActive) {
    payload.isActive.forEach((active) => {
      if (active != null) {
        formData.append('is_active[]', active ? '1' : '0');
      } else {
        formData.append('is_active[]', '');
      }
    });
  }

  const response = await api.post(`${BASE_URL}/room-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export interface UpdateRoomImageDto {
  altText?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export const updateRoomImage = async (
  id: number,
  data: UpdateRoomImageDto
): Promise<{ data: RoomImage }> => {
  const payload: any = {};

  if (data.altText !== undefined) payload.alt_text = data.altText;
  if (data.displayOrder !== undefined) payload.display_order = data.displayOrder;
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  const response = await api.put(`${BASE_URL}/room-images/${id}`, payload);
  return response.data;
};

export const deleteRoomImage = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/room-images/${id}`);
};

/*
 * Notifications (admin)
 */
export const getAdminNotifications = async (params?: { limit?: number }): Promise<{ data: NotificationItem[] }> => {
  const response = await api.get(`${BASE_URL}/notifications`, { params });
  return response.data;
};

export const markAdminNotificationRead = async (id: number): Promise<{ message: string }> => {
  const response = await api.patch(`${BASE_URL}/notifications/${id}/read`);
  return response.data;
};


