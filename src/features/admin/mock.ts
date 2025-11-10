// Mock data helpers for Admin Dashboard (hotel-scoped)
import type { AuditLogItem, BackupItem } from '@/types/admin';

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

export function getHotelUsers(hotelId: number = MOCK_HOTEL_ID): Promise<{ data: UserListItem[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter users by hotel and exclude admin/super_admin roles
      const filtered = mockUsers.filter(
        (u) => u.hotelId === hotelId && u.role !== 'admin' && u.role !== 'super_admin'
      );
      resolve({ data: filtered });
    }, 300);
  });
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

// Mock room data for hotel-scoped room management
import type { RoomListItem } from '@/types/admin';

let mockRooms: RoomListItem[] = [
  {
    id: 1,
    hotelId: MOCK_HOTEL_ID,
    type: 'Standard',
    price: 99.99,
    isAvailable: true,
    capacity: 2,
    description: 'Comfortable standard room with basic amenities',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    hotelId: MOCK_HOTEL_ID,
    type: 'Deluxe',
    price: 149.99,
    isAvailable: true,
    capacity: 3,
    description: 'Spacious deluxe room with premium amenities',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    hotelId: MOCK_HOTEL_ID,
    type: 'Suite',
    price: 249.99,
    isAvailable: false,
    capacity: 4,
    description: 'Luxurious suite with separate living area',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    hotelId: MOCK_HOTEL_ID,
    type: 'Standard',
    price: 89.99,
    isAvailable: true,
    capacity: 1,
    description: 'Single occupancy standard room',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getHotelRooms(hotelId: number = MOCK_HOTEL_ID): Promise<{ data: RoomListItem[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockRooms.filter((r) => r.hotelId === hotelId);
      resolve({ data: filtered });
    }, 300);
  });
}

export function createHotelRoom(
  hotelId: number,
  roomData: {
    type: string;
    price: number;
    isAvailable: boolean;
    capacity: number;
    description?: string | null;
  }
): Promise<RoomListItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRoom: RoomListItem = {
        id: mockRooms.length + 1,
        hotelId,
        ...roomData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRooms.push(newRoom);
      resolve(newRoom);
    }, 500);
  });
}

export function updateHotelRoom(
  roomId: number,
  hotelId: number,
  roomData: {
    type?: string;
    price?: number;
    isAvailable?: boolean;
    capacity?: number;
    description?: string | null;
  }
): Promise<RoomListItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const roomIndex = mockRooms.findIndex((r) => r.id === roomId && r.hotelId === hotelId);
      if (roomIndex === -1) {
        reject(new Error('Room not found'));
        return;
      }
      mockRooms[roomIndex] = {
        ...mockRooms[roomIndex],
        ...roomData,
        updatedAt: new Date().toISOString(),
      };
      resolve(mockRooms[roomIndex]);
    }, 500);
  });
}

export function deleteHotelRoom(roomId: number, hotelId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const roomIndex = mockRooms.findIndex((r) => r.id === roomId && r.hotelId === hotelId);
      if (roomIndex === -1) {
        reject(new Error('Room not found'));
        return;
      }
      mockRooms.splice(roomIndex, 1);
      resolve();
    }, 300);
  });
}

// Mock reservation data for hotel-scoped reservation management
import type { ReservationListItem, ReservationStatus } from '@/types/admin';

let mockReservations: ReservationListItem[] = [
  {
    id: 1,
    hotelId: MOCK_HOTEL_ID,
    roomId: 1,
    roomType: 'Standard',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'confirmed',
    guests: 2,
    specialRequests: 'Late check-in requested',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    hotelId: MOCK_HOTEL_ID,
    roomId: 2,
    roomType: 'Deluxe',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    guests: 3,
    specialRequests: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    hotelId: MOCK_HOTEL_ID,
    roomId: 3,
    roomType: 'Suite',
    userId: null,
    userName: 'Walk-in Guest',
    userEmail: null,
    checkIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'confirmed',
    guests: 4,
    specialRequests: 'Extra towels needed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    hotelId: MOCK_HOTEL_ID,
    roomId: 1,
    roomType: 'Standard',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    checkIn: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    guests: 2,
    specialRequests: 'Early check-in preferred',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getHotelReservations(hotelId: number = MOCK_HOTEL_ID): Promise<{ data: ReservationListItem[] }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockReservations.filter((r) => r.hotelId === hotelId);
      resolve({ data: filtered });
    }, 300);
  });
}

export function createHotelReservation(
  hotelId: number,
  reservationData: {
    roomId: number;
    userId?: number | null;
    checkIn: string;
    checkOut: string;
    status: ReservationStatus;
    guests: number;
    specialRequests?: string | null;
  }
): Promise<ReservationListItem> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const room = mockRooms.find((r) => r.id === reservationData.roomId && r.hotelId === hotelId);
      const user = reservationData.userId
        ? mockUsers.find((u) => u.id === reservationData.userId && u.hotelId === hotelId)
        : null;
      
      const newReservation: ReservationListItem = {
        id: mockReservations.length + 1,
        hotelId,
        roomId: reservationData.roomId,
        roomType: room?.type || null,
        userId: reservationData.userId || null,
        userName: user?.name || 'Walk-in Guest',
        userEmail: user?.email || null,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        status: reservationData.status,
        guests: reservationData.guests,
        specialRequests: reservationData.specialRequests || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockReservations.push(newReservation);
      resolve(newReservation);
    }, 500);
  });
}

export function updateHotelReservation(
  reservationId: number,
  hotelId: number,
  reservationData: {
    roomId?: number;
    userId?: number | null;
    checkIn?: string;
    checkOut?: string;
    status?: ReservationStatus;
    guests?: number;
    specialRequests?: string | null;
  }
): Promise<ReservationListItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reservationIndex = mockReservations.findIndex(
        (r) => r.id === reservationId && r.hotelId === hotelId
      );
      if (reservationIndex === -1) {
        reject(new Error('Reservation not found'));
        return;
      }
      
      const room = reservationData.roomId
        ? mockRooms.find((r) => r.id === reservationData.roomId && r.hotelId === hotelId)
        : null;
      const user = reservationData.userId
        ? mockUsers.find((u) => u.id === reservationData.userId && u.hotelId === hotelId)
        : null;
      
      mockReservations[reservationIndex] = {
        ...mockReservations[reservationIndex],
        ...reservationData,
        roomType: room?.type || mockReservations[reservationIndex].roomType,
        userName: user?.name || mockReservations[reservationIndex].userName,
        userEmail: user?.email || mockReservations[reservationIndex].userEmail,
        updatedAt: new Date().toISOString(),
      };
      resolve(mockReservations[reservationIndex]);
    }, 500);
  });
}

export function deleteHotelReservation(reservationId: number, hotelId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reservationIndex = mockReservations.findIndex(
        (r) => r.id === reservationId && r.hotelId === hotelId
      );
      if (reservationIndex === -1) {
        reject(new Error('Reservation not found'));
        return;
      }
      mockReservations.splice(reservationIndex, 1);
      resolve();
    }, 300);
  });
}

export function updateHotelReservationStatus(
  reservationId: number,
  hotelId: number,
  status: ReservationStatus
): Promise<ReservationListItem> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const reservationIndex = mockReservations.findIndex(
        (r) => r.id === reservationId && r.hotelId === hotelId
      );
      if (reservationIndex === -1) {
        reject(new Error('Reservation not found'));
        return;
      }
      mockReservations[reservationIndex] = {
        ...mockReservations[reservationIndex],
        status,
        updatedAt: new Date().toISOString(),
      };
      resolve(mockReservations[reservationIndex]);
    }, 300);
  });
}

// Hotel Settings Mock Data
interface HotelSettings {
  logoUrl: string | null;
  checkInTime: string;
  checkOutTime: string;
  cancellationHours: number;
  allowOnlineBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// Mock hotel settings storage (in real app, this comes from backend)
const mockHotelSettings: Record<number, HotelSettings> = {
  1: {
    logoUrl: null,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    cancellationHours: 24,
    allowOnlineBooking: true,
    requireDeposit: false,
    depositPercentage: 0,
    emailNotifications: true,
    smsNotifications: false,
  },
};

export function getHotelSettings(hotelId: number = MOCK_HOTEL_ID): Promise<{ data: HotelSettings }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const settings = mockHotelSettings[hotelId] || {
        logoUrl: null,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellationHours: 24,
        allowOnlineBooking: true,
        requireDeposit: false,
        depositPercentage: 0,
        emailNotifications: true,
        smsNotifications: false,
      };
      resolve({ data: settings });
    }, 300);
  });
}

export function updateHotelSettings(
  hotelId: number,
  settings: Partial<HotelSettings>
): Promise<{ data: HotelSettings }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentSettings = mockHotelSettings[hotelId] || {
        logoUrl: null,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellationHours: 24,
        allowOnlineBooking: true,
        requireDeposit: false,
        depositPercentage: 0,
        emailNotifications: true,
        smsNotifications: false,
      };

      const updatedSettings: HotelSettings = {
        ...currentSettings,
        ...settings,
      };

      mockHotelSettings[hotelId] = updatedSettings;
      resolve({ data: updatedSettings });
    }, 500);
  });
}

// Hotel Audit Logs Mock Data
const mockHotelLogs: AuditLogItem[] = [
  // Hotel ID 1 logs
  {
    id: 1,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userName: 'John Doe',
    userId: 1,
    action: 'user.created',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { user_id: 5, user_name: 'Jane Smith', role: 'receptionist' },
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userName: 'John Doe',
    userId: 1,
    action: 'room.updated',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { room_id: 1, changes: { price: { old: 100, new: 120 } } },
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'Jane Manager',
    userId: 2,
    action: 'reservation.confirmed',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { reservation_id: 1, room_id: 1, user_id: 3 },
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'John Doe',
    userId: 1,
    action: 'user.updated',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { user_id: 2, changes: { role: { old: 'receptionist', new: 'manager' } } },
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'Jane Manager',
    userId: 2,
    action: 'room.created',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { room_id: 3, room_type: 'Deluxe', price: 150 },
  },
  {
    id: 6,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'John Doe',
    userId: 1,
    action: 'reservation.cancelled',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { reservation_id: 2, reason: 'Guest request' },
  },
  {
    id: 7,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'Jane Manager',
    userId: 2,
    action: 'user.deleted',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { user_id: 4, user_name: 'Old Staff' },
  },
  {
    id: 8,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'John Doe',
    userId: 1,
    action: 'room.updated',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { room_id: 2, changes: { isAvailable: { old: true, new: false } } },
  },
  {
    id: 9,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'Jane Manager',
    userId: 2,
    action: 'reservation.created',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { reservation_id: 3, room_id: 1, user_id: 5 },
  },
  {
    id: 10,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'John Doe',
    userId: 1,
    action: 'user.activated',
    hotelId: 1,
    hotelName: 'Grand Hotel',
    meta: { user_id: 3 },
  },
  // Hotel ID 2 logs
  {
    id: 11,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'user.created',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { user_id: 7, user_name: 'New Staff', role: 'receptionist' },
  },
  {
    id: 12,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'room.updated',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { room_id: 1, changes: { price: { old: 80, new: 100 } } },
  },
  {
    id: 13,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'reservation.confirmed',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { reservation_id: 1, room_id: 1, user_id: 8 },
  },
  {
    id: 14,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'user.updated',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { user_id: 7, changes: { role: { old: 'receptionist', new: 'manager' } } },
  },
  {
    id: 15,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'room.created',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { room_id: 2, room_type: 'Standard', price: 90 },
  },
  {
    id: 16,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'reservation.cancelled',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { reservation_id: 2, reason: 'Guest cancellation' },
  },
  {
    id: 17,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'user.deleted',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { user_id: 9, user_name: 'Removed Staff' },
  },
  {
    id: 18,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'room.updated',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { room_id: 1, changes: { isAvailable: { old: false, new: true } } },
  },
  {
    id: 19,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'reservation.created',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { reservation_id: 3, room_id: 2, user_id: 8 },
  },
  {
    id: 20,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userName: 'test A',
    userId: 6,
    action: 'user.activated',
    hotelId: 2,
    hotelName: 'Test Hotel',
    meta: { user_id: 7 },
  },
];

interface GetHotelLogsParams {
  userId?: number;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}

export function getHotelLogs(
  hotelId: number = MOCK_HOTEL_ID,
  params: GetHotelLogsParams = {}
): Promise<{
  data: AuditLogItem[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('getHotelLogs called with hotelId:', hotelId, 'type:', typeof hotelId);
      console.log('mockHotelLogs count:', mockHotelLogs.length);
      console.log('mockHotelLogs hotelIds:', mockHotelLogs.map(log => ({ id: log.id, hotelId: log.hotelId, hotelIdType: typeof log.hotelId })));
      // Filter logs by hotel - ensure both are numbers for comparison
      const hotelIdNum = Number(hotelId);
      let filtered = mockHotelLogs.filter((log) => Number(log.hotelId) === hotelIdNum);
      console.log('Filtered logs count:', filtered.length);
      console.log('Filtered logs:', filtered);

      // Apply filters
      if (params.userId) {
        filtered = filtered.filter((log) => log.userId === params.userId);
      }

      if (params.action) {
        filtered = filtered.filter((log) =>
          log.action.toLowerCase().includes(params.action!.toLowerCase())
        );
      }

      if (params.from) {
        const fromDate = new Date(params.from);
        filtered = filtered.filter(
          (log) => new Date(log.timestamp) >= fromDate
        );
      }

      if (params.to) {
        const toDate = new Date(params.to);
        toDate.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate);
      }

      // Sort by timestamp descending
      filtered.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Pagination
      const page = params.page || 1;
      const perPage = params.perPage || 10;
      const total = filtered.length;
      const lastPage = Math.ceil(total / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = filtered.slice(startIndex, endIndex);

      resolve({
        data: paginatedData,
        meta: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: lastPage,
        },
      });
    }, 300);
  });
}

// Hotel Backups Mock Data
const mockHotelBackups: BackupItem[] = [
  {
    id: 1,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'success',
    sizeBytes: 2457600, // ~2.4 MB
    path: '/backups/hotel-2-2025-11-09.json',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'success',
    sizeBytes: 2380800, // ~2.3 MB
    path: '/backups/hotel-2-2025-11-08.json',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'success',
    sizeBytes: 2519040, // ~2.5 MB
    path: '/backups/hotel-2-2025-11-07.json',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'failed',
    sizeBytes: null,
    path: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'success',
    sizeBytes: 2293760, // ~2.2 MB
    path: '/backups/hotel-2-2025-11-06.json',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'success',
    sizeBytes: 2621440, // ~2.6 MB
    path: '/backups/hotel-2-2025-11-05.json',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    type: 'hotel',
    hotelId: 2,
    hotelName: 'Test Hotel',
    status: 'success',
    sizeBytes: 2162688, // ~2.1 MB
    path: '/backups/hotel-2-2025-11-04.json',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

interface GetHotelBackupsParams {
  page?: number;
  perPage?: number;
}

export function getHotelBackups(
  hotelId: number = MOCK_HOTEL_ID,
  params: GetHotelBackupsParams = {}
): Promise<{
  data: BackupItem[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter backups by hotel
      let filtered = mockHotelBackups.filter((backup) => backup.hotelId === hotelId);

      // Sort by createdAt descending
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Pagination
      const page = params.page || 1;
      const perPage = params.perPage || 5;
      const total = filtered.length;
      const lastPage = Math.ceil(total / perPage);
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedData = filtered.slice(startIndex, endIndex);

      resolve({
        data: paginatedData,
        meta: {
          current_page: page,
          per_page: perPage,
          total,
          last_page: lastPage,
        },
      });
    }, 300);
  });
}

export function runHotelBackup(
  hotelId: number = MOCK_HOTEL_ID
): Promise<{ data: BackupItem }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBackup: BackupItem = {
        id: Date.now(), // Use timestamp as ID for new backups
        type: 'hotel',
        hotelId,
        hotelName: 'Test Hotel', // In real app, fetch from hotel data
        status: 'queued',
        sizeBytes: null,
        path: null,
        createdAt: new Date().toISOString(),
      };
      
      // Add to mock data
      mockHotelBackups.unshift(newBackup);
      
      resolve({ data: newBackup });
    }, 500);
  });
}

export function downloadHotelBackup(id: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const backup = mockHotelBackups.find((b) => b.id === id);
      if (!backup || backup.status !== 'success' || !backup.path) {
        reject(new Error('Backup not found or not available'));
        return;
      }

      // Create a mock JSON blob
      const mockData = {
        hotel: {
          id: backup.hotelId,
          name: backup.hotelName,
        },
        rooms: [],
        reservations: [],
        users: [],
        settings: {},
        exportedAt: backup.createdAt,
      };

      const jsonString = JSON.stringify(mockData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      resolve(blob);
    }, 500);
  });
}

