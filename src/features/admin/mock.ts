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

export function getHotelRooms(hotelId: number = MOCK_HOTEL_ID): { data: RoomListItem[] } {
  const filtered = mockRooms.filter((r) => r.hotelId === hotelId);
  return { data: filtered };
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

export function getHotelReservations(hotelId: number = MOCK_HOTEL_ID): { data: ReservationListItem[] } {
  const filtered = mockReservations.filter((r) => r.hotelId === hotelId);
  return { data: filtered };
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

