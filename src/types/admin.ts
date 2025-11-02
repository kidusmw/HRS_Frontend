// SuperAdmin TypeScript types matching the UI contracts

export type Role = 'client' | 'receptionist' | 'manager' | 'admin' | 'super_admin';

export interface DashboardMetrics {
  hotels: number;
  usersByRole: Record<Role, number>;
  totalBookings: number;
  rooms: { available: number; occupied: number };
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: Role;
  hotelId?: number | null;
  hotelName?: string | null;
  isActive: boolean;
  lastActiveAt?: string | null;
  phoneNumber?: string | null;
}

export interface HotelListItem {
  id: number;
  name: string;
  address: string;
  timezone: string;
  adminName?: string | null;
  roomsCount: number;
  phoneNumber?: string | null;
  email?: string | null;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  userName: string;
  userId: number;
  action: string;
  hotelId?: number | null;
  hotelName?: string | null;
  meta?: unknown;
}

export interface BackupItem {
  id: number;
  type: 'full' | 'hotel';
  hotelId?: number | null;
  hotelName?: string | null;
  status: 'queued' | 'running' | 'success' | 'failed';
  sizeBytes?: number | null;
  path?: string | null;
  createdAt: string;
}

export interface SystemSettingsDto {
  systemName: string;
  systemLogoUrl?: string | null;
  defaultCurrency: string;
  defaultTimezone: string;
}

export interface NotificationItem {
  id: number;
  message: string;
  type: string;
  status: 'unread' | 'read';
  timestamp: string;
  hotelId?: number | null;
  hotelName?: string | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
  hotelId?: number | null;
  phoneNumber?: string | null;
  password?: string | null; // Auto-generated if not provided
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: Role;
  hotelId?: number | null;
  phoneNumber?: string | null;
}

export interface CreateHotelDto {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  description?: string | null;
  timezone: string;
  logo?: File | null;
  adminId?: number | null;
}

export interface UpdateHotelDto {
  name?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  description?: string | null;
  timezone?: string;
  logo?: File | null;
  adminId?: number | null;
}

