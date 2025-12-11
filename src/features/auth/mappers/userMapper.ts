import type { User } from '@/types/auth';
import type { Role } from '@/types/auth';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: Role | string;
  hotelId?: number | null;
  hotel_id?: number | null;
  hotelName?: string | null;
  hotel_name?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  phoneNumber?: string | null;
  phone_number?: string | null;
  isActive?: boolean;
  active?: boolean;
  lastActiveAt?: string | null;
  last_active_at?: string | null;
  emailVerifiedAt?: string | null;
  email_verified_at?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

function normalizeAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  // If backend returns a relative path like /storage/..., prefix with API origin
  if (url.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
  }
  return url;
}

export function mapUserDto(user: UserDto): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: (user.role === 'superadmin' ? 'super_admin' : user.role) as Role,
    hotelId: user.hotelId ?? user.hotel_id ?? null,
    hotelName: user.hotelName ?? user.hotel_name ?? null,
    avatarUrl: normalizeAvatarUrl(user.avatarUrl ?? user.avatar_url ?? null),
    phoneNumber: user.phoneNumber ?? user.phone_number ?? null,
    isActive: user.isActive ?? user.active,
    lastActiveAt: user.lastActiveAt ?? user.last_active_at ?? null,
    emailVerifiedAt: user.emailVerifiedAt ?? user.email_verified_at ?? null,
    createdAt: user.createdAt ?? user.created_at,
    updatedAt: user.updatedAt ?? user.updated_at,
  };
}

