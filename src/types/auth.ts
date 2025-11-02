export type Role = 'client' | 'receptionist' | 'manager' | 'admin' | 'superadmin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
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
