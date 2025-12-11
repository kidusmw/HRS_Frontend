export type Role = 'client' | 'receptionist' | 'manager' | 'admin' | 'superadmin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  hotel_id?: number | null; // snake_case from login payload
  hotelId?: number | null; // camelCase from profile resource
  hotelName?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null; // fallback for legacy shape
  isActive?: boolean;
  lastActiveAt?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  access_token?: string;
  token_type?: string;
  message?: string;
}
