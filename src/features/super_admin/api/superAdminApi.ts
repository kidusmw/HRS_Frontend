import api from '@/lib/axios';
import type {
  DashboardMetrics,
  UserListItem,
  HotelListItem,
  AuditLogItem,
  BackupItem,
  SystemSettingsDto,
  NotificationItem,
  CreateUserDto,
  UpdateUserDto,
  CreateHotelDto,
  UpdateHotelDto,
} from '@/types/admin';

const BASE_URL = '/super_admin';

// Dashboard
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await api.get(`${BASE_URL}/dashboard/metrics`);
  return response.data;
};

// Users
export const getUsers = async (params?: {
  search?: string;
  role?: string;
  hotelId?: number;
  status?: 'active' | 'inactive';
  page?: number;
  perPage?: number;
}): Promise<{
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

export const createUser = async (
  data: CreateUserDto & { generatePassword?: boolean; active?: boolean }
): Promise<{ data: UserListItem }> => {
  // Convert camelCase to snake_case for backend
  const payload: any = {
    name: data.name,
    email: data.email,
    role: data.role,
    password: data.password,
    generatePassword: data.generatePassword,
    phone_number: data.phoneNumber,
    active: data.active,
  };
  
  // Convert hotelId to hotel_id
  if (data.hotelId !== undefined && data.hotelId !== null) {
    payload.hotel_id = data.hotelId;
  }
  
  const response = await api.post(`${BASE_URL}/users`, payload);
  return response.data;
};

export const updateUser = async (
  id: number,
  data: UpdateUserDto & { active?: boolean; password?: string }
): Promise<{ data: UserListItem }> => {
  // Convert camelCase to snake_case for backend
  const payload: any = {};
  
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.role !== undefined) payload.role = data.role;
  if (data.password !== undefined && data.password !== '') payload.password = data.password;
  if (data.phoneNumber !== undefined) payload.phone_number = data.phoneNumber;
  if (data.active !== undefined) payload.active = data.active;
  
  // Convert hotelId to hotel_id
  if (data.hotelId !== undefined) {
    payload.hotel_id = data.hotelId ?? null;
  }
  
  const response = await api.put(`${BASE_URL}/users/${id}`, payload);
  return response.data;
};

export const activateUser = async (id: number): Promise<{ data: UserListItem }> => {
  const response = await api.patch(`${BASE_URL}/users/${id}/activate`);
  return response.data;
};

export const deactivateUser = async (id: number): Promise<{ data: UserListItem }> => {
  const response = await api.patch(`${BASE_URL}/users/${id}/deactivate`);
  return response.data;
};

export const resetUserPassword = async (
  id: number
): Promise<{ message: string }> => {
  const response = await api.post(`${BASE_URL}/users/${id}/reset-password`);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/users/${id}`);
};

// Hotels
export const getHotels = async (params?: {
  search?: string;
  timezone?: string;
  hasAdmin?: boolean;
  page?: number;
  perPage?: number;
}): Promise<{
  data: HotelListItem[];
  links: unknown;
  meta: unknown;
}> => {
  const response = await api.get(`${BASE_URL}/hotels`, { params });
  return response.data;
};

export const getHotel = async (id: number): Promise<{ data: HotelListItem }> => {
  const response = await api.get(`${BASE_URL}/hotels/${id}`);
  return response.data;
};

export const createHotel = async (data: CreateHotelDto): Promise<{ data: HotelListItem }> => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('city', data.city);
  formData.append('country', data.country);
  formData.append('phone', data.phoneNumber);
  formData.append('email', data.email);
  if (data.description) formData.append('description', data.description);
  if (data.logo) formData.append('logo', data.logo);
  if (data.adminId !== undefined && data.adminId !== null) {
    formData.append('primary_admin_id', data.adminId.toString());
  } else if (data.adminId === null) {
    formData.append('primary_admin_id', '');
  }

  const response = await api.post(`${BASE_URL}/hotels`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateHotel = async (
  id: number,
  data: UpdateHotelDto
): Promise<{ data: HotelListItem }> => {
  // For updates, we use JSON unless there's a file upload
  // PUT requests with FormData don't work well in Laravel
  const payload: any = {};
  
  if (data.name) payload.name = data.name;
  if (data.city) payload.city = data.city;
  if (data.country) payload.country = data.country;
  if (data.phoneNumber) payload.phone = data.phoneNumber;
  if (data.email) payload.email = data.email;
  if (data.description !== undefined) payload.description = data.description || null;
  if (data.adminId !== undefined) {
    payload.primary_admin_id = data.adminId ?? null;
  }
  
  // If there's a logo file, we need to use FormData
  if (data.logo) {
    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== undefined && payload[key] !== null) {
        if (typeof payload[key] === 'object') {
          formData.append(key, JSON.stringify(payload[key]));
        } else {
          formData.append(key, payload[key].toString());
        }
      }
    });
    formData.append('logo', data.logo);
    
    const response = await api.post(`${BASE_URL}/hotels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        _method: 'PUT', // Laravel method spoofing
      },
    });
    return response.data;
  }
  
  // No file upload, use JSON (which works properly with PUT)
  const response = await api.put(`${BASE_URL}/hotels/${id}`, payload);
  return response.data;
};

export const deleteHotel = async (id: number): Promise<void> => {
  await api.delete(`${BASE_URL}/hotels/${id}`);
};

// Audit Logs
export const getLogs = async (params?: {
  userId?: number;
  hotelId?: number;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}): Promise<{
  data: AuditLogItem[];
  links: unknown;
  meta: unknown;
}> => {
  // Convert perPage to per_page for backend (other params stay as camelCase)
  const backendParams: Record<string, unknown> = {};
  if (params) {
    Object.keys(params).forEach((key) => {
      if (key === 'perPage') {
        backendParams['per_page'] = params.perPage;
      } else {
        backendParams[key] = params[key as keyof typeof params];
      }
    });
  }
  const response = await api.get(`${BASE_URL}/logs`, { params: backendParams });
  return response.data;
};

export const getLog = async (id: number): Promise<{ data: AuditLogItem }> => {
  const response = await api.get(`${BASE_URL}/logs/${id}`);
  return response.data;
};

// Backups
export const getBackups = async (params?: {
  page?: number;
  perPage?: number;
}): Promise<{
  data: BackupItem[];
  links: unknown;
  meta: unknown;
}> => {
  // Convert perPage to per_page for backend
  const backendParams: Record<string, unknown> = {};
  if (params) {
    Object.keys(params).forEach((key) => {
      if (key === 'perPage') {
        backendParams['per_page'] = params.perPage;
      } else {
        backendParams[key] = params[key as keyof typeof params];
      }
    });
  }
  const response = await api.get(`${BASE_URL}/backups`, { params: backendParams });
  return response.data;
};

export const runFullBackup = async (): Promise<{ data: BackupItem }> => {
  const response = await api.post(`${BASE_URL}/backups/full`);
  return response.data;
};

export const runHotelBackup = async (hotelId: number): Promise<{ data: BackupItem }> => {
  const response = await api.post(`${BASE_URL}/backups/hotel/${hotelId}`);
  return response.data;
};

export const downloadBackup = async (id: number): Promise<Blob> => {
  const response = await api.get(`${BASE_URL}/backups/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Settings
export const getSystemSettings = async (): Promise<{ data: SystemSettingsDto }> => {
  const response = await api.get(`${BASE_URL}/settings/system`);
  return response.data;
};

export const updateSystemSettings = async (
  data: SystemSettingsDto & { logo?: File }
): Promise<{ data: SystemSettingsDto }> => {
  // Always use FormData when logo is provided, otherwise use JSON
  if (data.logo) {
    const formData = new FormData();
    formData.append('systemName', data.systemName);
    formData.append('logo', data.logo);
    if (data.chapaEnabled !== undefined) {
      formData.append('chapaEnabled', data.chapaEnabled.toString());
    }
    if (data.stripeEnabled !== undefined) {
      formData.append('stripeEnabled', data.stripeEnabled.toString());
    }
    if (data.telebirrEnabled !== undefined) {
      formData.append('telebirrEnabled', data.telebirrEnabled.toString());
    }

    // Don't set Content-Type header - let axios set it automatically with boundary
    const response = await api.post(`${BASE_URL}/settings/system`, formData);
    return response.data;
  } else {
    // Remove systemLogoUrl from payload - only file uploads allowed
    const { systemLogoUrl, ...payload } = data;
    const response = await api.put(`${BASE_URL}/settings/system`, payload);
    return response.data;
  }
};

export const getHotelSettings = async (hotelId: number): Promise<unknown> => {
  const response = await api.get(`${BASE_URL}/settings/hotel/${hotelId}`);
  return response.data;
};

export const updateHotelSettings = async (
  hotelId: number,
  data: Record<string, unknown>
): Promise<unknown> => {
  const response = await api.put(`${BASE_URL}/settings/hotel/${hotelId}`, data);
  return response.data;
};

// Notifications
export const getNotifications = async (params?: {
  limit?: number;
}): Promise<{
  data: NotificationItem[];
}> => {
  const response = await api.get(`${BASE_URL}/notifications`, { params });
  return response.data;
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`${BASE_URL}/notifications/${id}/read`);
};

