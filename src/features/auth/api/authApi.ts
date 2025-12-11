import { api } from '@/lib/axios';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '@/types/auth';
import { mapUserDto } from '@/features/auth/mappers/userMapper';

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/register', data);
  const payload = response.data;
  return payload.user ? { ...payload, user: mapUserDto(payload.user) } : payload;
};

export const verifyEmail = async (url: string): Promise<AuthResponse> => {
  const response = await api.get(url);
  const payload = response.data;
  return payload.user ? { ...payload, user: mapUserDto(payload.user) } : payload;
};

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/login', data);
  const payload = response.data;
  return { ...payload, user: mapUserDto(payload.user) };
};

export const logoutUser = async (): Promise<void> => {
  await api.post('/logout');
};

export const getGoogleRedirectUrl = async (): Promise<{ redirect_url: string }> => {
  const response = await api.get('/auth/google/redirect');
  return response.data;
};

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

export const getProfile = async (): Promise<{ data: User }> => {
  const response = await api.get('/profile');
  const raw = (response.data as any).data ?? response.data;
  return { data: mapUserDto(raw) };
};

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
    // eslint-disable-next-line no-console
    console.debug('updateProfile formData', Array.from(formData.entries()));
  }

  const response = await api.post('/profile', formData);
  const raw = (response.data as any).data ?? response.data;
  return { data: mapUserDto(raw) };
};

export const updatePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> => {
  const response = await api.put('/profile/password', payload);
  return response.data;
};
