export type Role = 'client' | 'receptionist' | 'manager' | 'admin' | 'superadmin' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  hotelId?: number | null;
  hotelName?: string | null;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
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
  phoneNumber: string;
}

export interface AuthResponse {
  user: User;
  access_token?: string;
  token_type?: string;
  message?: string;
}

export type GoogleOAuthCallbackResponse = {
  message?: string
  user?: User
  access_token?: string
  token_type?: string
  error?: string
}
