// Mock data for receptionist UI

export interface MockReservation {
  id: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  amount: number;
  channel: string;
  createdAt: string;
  specialRequests?: string;
}

export interface MockRoom {
  id: number;
  number: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
}

export interface MockGuest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

// Mock reservations
export const mockReservations: MockReservation[] = [
  {
    id: 1001,
    guestName: 'John Smith',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+1-555-0101',
    roomNumber: '101',
    roomType: 'Standard',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    status: 'confirmed',
    amount: 450,
    channel: 'web',
    createdAt: '2024-01-10T10:00:00Z',
    specialRequests: 'Late check-in requested',
  },
  {
    id: 1002,
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@email.com',
    guestPhone: '+1-555-0102',
    roomNumber: '205',
    roomType: 'Deluxe',
    checkIn: '2024-01-15',
    checkOut: '2024-01-17',
    status: 'checked_in',
    amount: 600,
    channel: 'ota',
    createdAt: '2024-01-08T14:30:00Z',
  },
  {
    id: 1003,
    guestName: 'Michael Brown',
    guestEmail: 'm.brown@email.com',
    guestPhone: '+1-555-0103',
    roomNumber: '312',
    roomType: 'Suite',
    checkIn: '2024-01-16',
    checkOut: '2024-01-20',
    status: 'pending',
    amount: 1200,
    channel: 'walk-in',
    createdAt: '2024-01-14T09:15:00Z',
  },
  {
    id: 1004,
    guestName: 'Emily Davis',
    guestEmail: 'emily.d@email.com',
    guestPhone: '+1-555-0104',
    roomNumber: '108',
    roomType: 'Standard',
    checkIn: '2024-01-12',
    checkOut: '2024-01-15',
    status: 'checked_out',
    amount: 450,
    channel: 'web',
    createdAt: '2024-01-05T11:20:00Z',
  },
  {
    id: 1005,
    guestName: 'David Wilson',
    guestEmail: 'd.wilson@email.com',
    guestPhone: '+1-555-0105',
    roomNumber: '401',
    roomType: 'Executive',
    checkIn: '2024-01-17',
    checkOut: '2024-01-19',
    status: 'confirmed',
    amount: 800,
    channel: 'ota',
    createdAt: '2024-01-11T16:45:00Z',
  },
  {
    id: 1006,
    guestName: 'Lisa Anderson',
    guestEmail: 'lisa.a@email.com',
    guestPhone: '+1-555-0106',
    roomNumber: '202',
    roomType: 'Deluxe',
    checkIn: '2024-01-18',
    checkOut: '2024-01-22',
    status: 'pending',
    amount: 1000,
    channel: 'web',
    createdAt: '2024-01-13T08:30:00Z',
  },
  {
    id: 1007,
    guestName: 'Robert Taylor',
    guestEmail: 'r.taylor@email.com',
    guestPhone: '+1-555-0107',
    roomNumber: '305',
    roomType: 'Suite',
    checkIn: '2024-01-10',
    checkOut: '2024-01-12',
    status: 'cancelled',
    amount: 1200,
    channel: 'ota',
    createdAt: '2024-01-05T13:00:00Z',
  },
];

// Mock rooms
export const mockRooms: MockRoom[] = [
  {
    id: 1,
    number: '101',
    type: 'Standard',
    price: 150,
    capacity: 2,
    description: 'Comfortable standard room with city view',
    status: 'occupied',
  },
  {
    id: 2,
    number: '102',
    type: 'Standard',
    price: 150,
    capacity: 2,
    description: 'Comfortable standard room with city view',
    status: 'available',
  },
  {
    id: 3,
    number: '103',
    type: 'Standard',
    price: 150,
    capacity: 2,
    description: 'Comfortable standard room with city view',
    status: 'maintenance',
  },
  {
    id: 4,
    number: '201',
    type: 'Deluxe',
    price: 200,
    capacity: 3,
    description: 'Spacious deluxe room with balcony',
    status: 'available',
  },
  {
    id: 5,
    number: '202',
    type: 'Deluxe',
    price: 200,
    capacity: 3,
    description: 'Spacious deluxe room with balcony',
    status: 'occupied',
  },
  {
    id: 6,
    number: '205',
    type: 'Deluxe',
    price: 200,
    capacity: 3,
    description: 'Spacious deluxe room with balcony',
    status: 'occupied',
  },
  {
    id: 7,
    number: '301',
    type: 'Suite',
    price: 300,
    capacity: 4,
    description: 'Luxurious suite with living area and kitchenette',
    status: 'available',
  },
  {
    id: 8,
    number: '305',
    type: 'Suite',
    price: 300,
    capacity: 4,
    description: 'Luxurious suite with living area and kitchenette',
    status: 'available',
  },
  {
    id: 9,
    number: '312',
    type: 'Suite',
    price: 300,
    capacity: 4,
    description: 'Luxurious suite with living area and kitchenette',
    status: 'occupied',
  },
  {
    id: 10,
    number: '401',
    type: 'Executive',
    price: 400,
    capacity: 2,
    description: 'Premium executive room with office space',
    status: 'available',
  },
  {
    id: 11,
    number: '402',
    type: 'Executive',
    price: 400,
    capacity: 2,
    description: 'Premium executive room with office space',
    status: 'unavailable',
  },
  {
    id: 12,
    number: '108',
    type: 'Standard',
    price: 150,
    capacity: 2,
    description: 'Comfortable standard room with city view',
    status: 'available',
  },
];

// Mock guests
export const mockGuests: MockGuest[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    address: '123 Main St, City, State 12345',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0102',
    address: '456 Oak Ave, City, State 12346',
  },
  {
    id: 3,
    name: 'Michael Brown',
    email: 'm.brown@email.com',
    phone: '+1-555-0103',
    address: '789 Pine Rd, City, State 12347',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '+1-555-0104',
    address: '321 Elm St, City, State 12348',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'd.wilson@email.com',
    phone: '+1-555-0105',
    address: '654 Maple Dr, City, State 12349',
  },
];

// Helper functions
export function getReservationsByStatus(status: MockReservation['status']): MockReservation[] {
  return mockReservations.filter((r) => r.status === status);
}

export function getReservationsByDateRange(startDate: string, endDate: string): MockReservation[] {
  return mockReservations.filter((r) => {
    return r.checkIn >= startDate && r.checkIn <= endDate;
  });
}

export function getRoomsByStatus(status: MockRoom['status']): MockRoom[] {
  return mockRooms.filter((r) => r.status === status);
}

export function getAvailableRooms(): MockRoom[] {
  return mockRooms.filter((r) => r.status === 'available');
}

export function getGuestById(id: number): MockGuest | undefined {
  return mockGuests.find((g) => g.id === id);
}

