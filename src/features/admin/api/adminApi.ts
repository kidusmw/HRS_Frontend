import api from '@/lib/axios';
import type { UserListItem, RoomListItem, CreateRoomDto, UpdateRoomDto, PaymentListItem, AuditLogItem } from '@/types/admin';

const BASE_URL = '/admin';

/*
* Dashboard
*/ 
export interface AdminDashboardMetrics {
  kpis: {
    occupancyPct: number;
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
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'receptionist' | 'manager';
  password?: string;
  phoneNumber?: string;
  active?: boolean;
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

export const createRoom = async (data: CreateRoomDto): Promise<{ data: RoomListItem }> => {
  // Convert camelCase to snake_case for backend
  // Note: isAvailable is not sent - it defaults to true on backend and is managed by receptionists/managers
  const payload: any = {
    type: data.type,
    price: data.price,
    capacity: data.capacity,
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

