import type { Role, User } from '@/types/auth';

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

// Normalize avatar URL to ensure it's absolute and correctly points to the backend storage if needed.
function normalizeAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  // Keep data URLs as-is (local previews / legacy values).
  if (url.startsWith('data:')) return url

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  const origin = apiBase.replace(/\/api\/?$/, '')

  // Backend may return:
  // - absolute URL (preferred)
  // - /storage/... (relative)
  // - http://localhost/storage/... (common dev misconfig when APP_URL misses port)
  try {
    const parsed = new URL(url, origin)

    // If it's a local storage asset, always serve it from the backend origin derived from VITE_API_BASE_URL.
    if (parsed.pathname.startsWith('/storage/')) {
      return `${origin}${parsed.pathname}${parsed.search}`
    }

    return parsed.toString()
  } catch {
    // Fallback: handle plain relative strings without URL parsing
    if (url.startsWith('/')) return `${origin}${url}`
    if (url.startsWith('storage/')) return `${origin}/${url}`
    return url
  }
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

