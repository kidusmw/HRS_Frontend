import { mapUserDto } from '@/features/auth/mappers/userMapper';
import { api } from '@/lib/axios';
import type { AuthResponse, GoogleOAuthCallbackResponse, LoginCredentials, RegisterData, User } from '@/types/auth';

// Registration and Authentication
export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/register', data);
  const payload = response.data;
  return payload.user ? { ...payload, user: mapUserDto(payload.user) } : payload;
};

// Email verification
export const verifyEmail = async (url: string): Promise<AuthResponse> => {
  const response = await api.get(url);
  const payload = response.data;
  return payload.user ? { ...payload, user: mapUserDto(payload.user) } : payload;
};

// Login and Logout
export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/login', data);
  const payload = response.data;
  return { ...payload, user: mapUserDto(payload.user) };
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/logout');
};

// Google OAuth
export const getGoogleRedirectUrl = async (): Promise<{ redirect_url: string }> => {
  const response = await api.get('/auth/google/redirect');
  return response.data;
};

export async function exchangeGoogleOAuthCode(params: {
  code: string
  state?: string | null
}): Promise<{ ok: boolean; data: GoogleOAuthCallbackResponse }> {
  try {
    const response = await api.get<GoogleOAuthCallbackResponse>('/auth/google/callback', {
      params: { code: params.code, state: params.state ?? '' },
    })
    return { ok: true, data: response.data }
  } catch (err: any) {
    const status = err?.response?.status
    const data = (err?.response?.data ?? {}) as GoogleOAuthCallbackResponse
    return { ok: Boolean(status), data }
  }
}

// Password reset
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post('/password/forgot', { email });
  return response.data;
};

export const resetPassword = async (data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> => {
  const response = await api.post('/password/reset', data);
  return response.data;
};

/*
 * Profile (authenticated user)
 */

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phoneNumber?: string | null;
  avatar?: File | null;
  removeAvatar?: boolean;
}

// Get current user profile
export const getProfile = async (): Promise<{ data: User }> => {
  const response = await api.get('/profile');
  const raw = (response.data as any).data ?? response.data;
  return { data: mapUserDto(raw) };
};

// Update current user profile
export const updateProfile = async (payload: UpdateProfilePayload): Promise<{ data: User }> => {
  const formData = new FormData();
  if (payload.name !== undefined) formData.append('name', payload.name);
  if (payload.email !== undefined) formData.append('email', payload.email);
  if (payload.phoneNumber !== undefined) {
    formData.append('phoneNumber', payload.phoneNumber ?? '');
  }
  if (payload.removeAvatar) formData.append('removeAvatar', '1');
  if (payload.avatar instanceof File) formData.append('avatar', payload.avatar);
  // Spoof PUT for multipart (PHP only parses files on POST)
  formData.append('_method', 'PUT');

  if (import.meta.env.DEV) {
    // Debug: log outgoing form-data fields
     
    console.debug('updateProfile formData', Array.from(formData.entries()));
  }

  const response = await api.post('/profile', formData);
  const raw = (response.data as any).data ?? response.data;
  return { data: mapUserDto(raw) };
};

// Update current user password
export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put('/profile/password', payload);
  return response.data;
};