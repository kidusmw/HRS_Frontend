// Mock data helpers for Admin Dashboard (hotel-scoped)

interface KpiData {
  occupancyPct: number;
  roomsAvailable: number;
  activeReservationsToday: number;
  upcomingCheckins: number;
}

interface ChartDataPoint {
  month?: string;
  week?: string;
  bookings?: number;
  occupied?: number;
  available?: number;
  revenue?: number;
}

interface NotificationItem {
  id: number;
  message: string;
  type: string;
  status: 'unread' | 'read';
  timestamp: string;
  hotelId?: number | null;
  hotelName?: string | null;
}

// Mock hotel ID - in real implementation, this comes from auth.user.hotel_id
const MOCK_HOTEL_ID = 1;

export function getKpis(hotelId: number = MOCK_HOTEL_ID): KpiData {
  return {
    occupancyPct: 72.5,
    roomsAvailable: 15,
    activeReservationsToday: 8,
    upcomingCheckins: 5,
  };
}

export function getMonthlyRevenue(hotelId: number = MOCK_HOTEL_ID): number {
  return 125000; // Mock monthly revenue
}

export function getBookingsTrend6m(
  hotelId: number = MOCK_HOTEL_ID
): ChartDataPoint[] {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  return months.map((month, index) => ({
    month,
    bookings: Math.floor(Math.random() * 50) + 30,
  }));
}

export function getWeeklyOccupancy(
  hotelId: number = MOCK_HOTEL_ID
): ChartDataPoint[] {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  return weeks.map((week) => ({
    week,
    occupied: Math.floor(Math.random() * 30) + 20,
    available: Math.floor(Math.random() * 15) + 5,
  }));
}

export function getRevenueTrend6m(
  hotelId: number = MOCK_HOTEL_ID
): ChartDataPoint[] {
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 30000) + 100000,
  }));
}

export function getHotelNotifications(
  hotelId: number = MOCK_HOTEL_ID,
  limit: number = 10
): NotificationItem[] {
  const now = new Date();
  return [
    {
      id: 1,
      message: 'New reservation created: Room 101',
      type: 'reservation',
      status: 'unread' as const,
      timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
      hotelId,
    },
    {
      id: 2,
      message: 'Check-in completed: Room 205',
      type: 'reservation',
      status: 'unread' as const,
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      hotelId,
    },
    {
      id: 3,
      message: 'Room maintenance scheduled: Room 310',
      type: 'hotel',
      status: 'read' as const,
      timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
      hotelId,
    },
    {
      id: 4,
      message: 'New staff member added: John Doe',
      type: 'user',
      status: 'unread' as const,
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      hotelId,
    },
  ].slice(0, limit);
}

// Mock user data for hotel-scoped user management
import type { UserListItem } from '@/types/admin';

let mockUsers: UserListItem[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@hotel.com',
    role: 'receptionist',
    hotelId: MOCK_HOTEL_ID,
    hotelName: 'Grand Hotel',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    phoneNumber: '+1234567890',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@hotel.com',
    role: 'manager',
    hotelId: MOCK_HOTEL_ID,
    hotelName: 'Grand Hotel',
    isActive: true,
    lastActiveAt: new Date().toISOString(),
    phoneNumber: '+1234567891',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@hotel.com',
    role: 'receptionist',
    hotelId: MOCK_HOTEL_ID,
    hotelName: 'Grand Hotel',
    isActive: false,
    lastActiveAt: null,
    phoneNumber: '+1234567892',
  },
];

export function getHotelUsers(hotelId: number = MOCK_HOTEL_ID): { data: UserListItem[] } {
  // Filter users by hotel and exclude admin/super_admin roles
  const filtered = mockUsers.filter(
    (u) => u.hotelId === hotelId && u.role !== 'admin' && u.role !== 'super_admin'
  );
  return { data: filtered };
}

export function createHotelUser(
  hotelId: number,
  userData: {
    name: string;
    email: string;
    role: 'receptionist' | 'manager';
    phoneNumber: string;
    password?: string;
  }
): Promise<UserListItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: UserListItem = {
        id: mockUsers.length + 1,
        ...userData,
        hotelId,
        hotelName: 'Grand Hotel', // Mock hotel name
        isActive: true,
        lastActiveAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      resolve(newUser);
    }, 500);
  });
}

export function updateHotelUser(
  userId: number,
  hotelId: number,
  userData: {
    name?: string;
    email?: string;
    role?: 'receptionist' | 'manager';
    phoneNumber?: string;
    password?: string;
  }
): Promise<UserListItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = mockUsers.findIndex((u) => u.id === userId && u.hotelId === hotelId);
      if (userIndex === -1) {
        reject(new Error('User not found'));
        return;
      }
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
      resolve(mockUsers[userIndex]);
    }, 500);
  });
}

export function activateHotelUser(userId: number, hotelId: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.id === userId && u.hotelId === hotelId);
      if (user) {
        user.isActive = true;
      }
      resolve();
    }, 300);
  });
}

export function deactivateHotelUser(userId: number, hotelId: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find((u) => u.id === userId && u.hotelId === hotelId);
      if (user) {
        user.isActive = false;
      }
      resolve();
    }, 300);
  });
}

export function resetHotelUserPassword(userId: number, hotelId: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock password reset - in real implementation, this would send email
      resolve();
    }, 500);
  });
}

export function deleteHotelUser(userId: number, hotelId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userIndex = mockUsers.findIndex((u) => u.id === userId && u.hotelId === hotelId);
      if (userIndex === -1) {
        reject(new Error('User not found'));
        return;
      }
      mockUsers.splice(userIndex, 1);
      resolve();
    }, 300);
  });
}

