export type ManagerBookingStatus =
  | 'confirmed'
  | 'pending'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export interface ManagerBooking {
  id: number;
  guestName: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: ManagerBookingStatus;
  amount: number;
  channel: 'web' | 'walk-in' | 'phone' | 'ota';
  createdAt: string;
}

export interface ManagerOccupancy {
  label: string;
  occupancyRate: number;
  roomsOccupied: number;
  roomsAvailable: number;
}

export interface ManagerAlert {
  id: number;
  type: 'system' | 'hotel' | 'overbooking' | 'payment' | 'maintenance';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export interface ManagerOperation {
  id: number;
  receptionistName: string;
  action: string;
  bookingId: number;
  timestamp: string;
  details: string;
  status: 'completed' | 'pending' | 'flagged';
  type?: 'override' | 'standard';
}

export interface ManagerEmployee {
  id: number;
  name: string;
  email: string;
  phone?: string;
  shift: 'morning' | 'evening' | 'night';
  underSupervision: boolean;
  status: 'active' | 'inactive';
}

export interface ManagerAttendance {
  id: number;
  employeeId: number;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'on_leave';
  note?: string;
}

export const managerBookings: ManagerBooking[] = [
  {
    id: 101,
    guestName: 'Alice Johnson',
    roomNumber: '302',
    roomType: 'Deluxe King',
    checkIn: '2025-12-11',
    checkOut: '2025-12-14',
    status: 'confirmed',
    amount: 720,
    channel: 'web',
    createdAt: '2025-12-10T09:30:00Z',
  },
  {
    id: 102,
    guestName: 'Brian Smith',
    roomNumber: '210',
    roomType: 'Standard Queen',
    checkIn: '2025-12-11',
    checkOut: '2025-12-12',
    status: 'checked_in',
    amount: 180,
    channel: 'walk-in',
    createdAt: '2025-12-11T07:45:00Z',
  },
  {
    id: 103,
    guestName: 'Cynthia Lee',
    roomNumber: '415',
    roomType: 'Suite',
    checkIn: '2025-12-12',
    checkOut: '2025-12-15',
    status: 'pending',
    amount: 1100,
    channel: 'ota',
    createdAt: '2025-12-10T13:10:00Z',
  },
  {
    id: 104,
    guestName: 'David Green',
    roomNumber: '118',
    roomType: 'Standard Twin',
    checkIn: '2025-12-10',
    checkOut: '2025-12-11',
    status: 'checked_out',
    amount: 150,
    channel: 'phone',
    createdAt: '2025-12-09T16:40:00Z',
  },
  {
    id: 105,
    guestName: 'Elena Gomez',
    roomNumber: '507',
    roomType: 'Executive Suite',
    checkIn: '2025-12-14',
    checkOut: '2025-12-18',
    status: 'cancelled',
    amount: 0,
    channel: 'web',
    createdAt: '2025-12-08T12:20:00Z',
  },
  {
    id: 106,
    guestName: 'Farid Khan',
    roomNumber: '221',
    roomType: 'Standard Queen',
    checkIn: '2025-12-11',
    checkOut: '2025-12-13',
    status: 'confirmed',
    amount: 360,
    channel: 'ota',
    createdAt: '2025-12-09T08:05:00Z',
  },
];

export const managerOccupancy: ManagerOccupancy[] = [
  {
    label: 'Today',
    occupancyRate: 82,
    roomsOccupied: 98,
    roomsAvailable: 22,
  },
  {
    label: 'Tomorrow',
    occupancyRate: 76,
    roomsOccupied: 91,
    roomsAvailable: 29,
  },
  {
    label: 'This Week',
    occupancyRate: 79,
    roomsOccupied: 550,
    roomsAvailable: 146,
  },
];

export const managerAlerts: ManagerAlert[] = [
  {
    id: 1,
    type: 'overbooking',
    severity: 'critical',
    message: 'Potential overbooking detected on 2025-12-12 (2 rooms).',
    createdAt: '2025-12-10T11:00:00Z',
    status: 'open',
  },
  {
    id: 2,
    type: 'payment',
    severity: 'warning',
    message: 'Unsettled folio for booking #102 after early check-in.',
    createdAt: '2025-12-11T08:15:00Z',
    status: 'acknowledged',
  },
  {
    id: 3,
    type: 'maintenance',
    severity: 'info',
    message: 'Room 415 requires HVAC filter replacement before next check-in.',
    createdAt: '2025-12-10T17:45:00Z',
    status: 'open',
  },
  {
    id: 4,
    type: 'system',
    severity: 'info',
    message: 'Night audit scheduled at 2:00 AM.',
    createdAt: '2025-12-11T06:30:00Z',
    status: 'resolved',
  },
];

export const managerOperations: ManagerOperation[] = [
  {
    id: 9001,
    receptionistName: 'Rosa P.',
    action: 'Check-in',
    bookingId: 102,
    timestamp: '2025-12-11T07:50:00Z',
    details: 'Early check-in approved; deposit collected.',
    status: 'completed',
    type: 'standard',
  },
  {
    id: 9002,
    receptionistName: 'Leo V.',
    action: 'Room change request',
    bookingId: 101,
    timestamp: '2025-12-11T09:40:00Z',
    details: 'Requested upgrade to Deluxe King; awaiting manager confirmation.',
    status: 'pending',
    type: 'standard',
  },
  {
    id: 9003,
    receptionistName: 'Nora L.',
    action: 'Cancellation',
    bookingId: 105,
    timestamp: '2025-12-10T12:10:00Z',
    details: 'Cancelled by guest within policy window; no fee applied.',
    status: 'completed',
    type: 'standard',
  },
  {
    id: 9004,
    receptionistName: 'Rosa P.',
    action: 'Override reservation',
    bookingId: 103,
    timestamp: '2025-12-11T10:05:00Z',
    details: 'Manual override to hold Suite despite OTA mismatch.',
    status: 'flagged',
    type: 'override',
  },
  {
    id: 9005,
    receptionistName: 'Leo V.',
    action: 'Override reservation',
    bookingId: 106,
    timestamp: '2025-12-11T11:25:00Z',
    details: 'Override to honor VIP late arrival after cutoff.',
    status: 'completed',
    type: 'override',
  },
];

export function summarizeBookings(bookings: ManagerBooking[]) {
  const total = bookings.length;
  const byStatus = bookings.reduce<Record<ManagerBookingStatus, number>>(
    (acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    },
    {
      confirmed: 0,
      pending: 0,
      checked_in: 0,
      checked_out: 0,
      cancelled: 0,
    }
  );

  return { total, byStatus };
}

export const managerEmployees: ManagerEmployee[] = [
  {
    id: 201,
    name: 'Rosa Peterson',
    email: 'rosa.peterson@example.com',
    phone: '+1-555-1101',
    shift: 'morning',
    underSupervision: true,
    status: 'active',
  },
  {
    id: 202,
    name: 'Leo Vasquez',
    email: 'leo.vasquez@example.com',
    phone: '+1-555-1102',
    shift: 'evening',
    underSupervision: true,
    status: 'active',
  },
  {
    id: 203,
    name: 'Nora Lin',
    email: 'nora.lin@example.com',
    phone: '+1-555-1103',
    shift: 'night',
    underSupervision: false,
    status: 'active',
  },
  {
    id: 204,
    name: 'Brandon Kim',
    email: 'brandon.kim@example.com',
    phone: '+1-555-1104',
    shift: 'morning',
    underSupervision: false,
    status: 'inactive',
  },
];

export const managerAttendance: ManagerAttendance[] = [
  {
    id: 1,
    employeeId: 201,
    date: '2025-12-11',
    status: 'present',
    note: 'On time',
  },
  {
    id: 2,
    employeeId: 202,
    date: '2025-12-11',
    status: 'late',
    note: 'Arrived 15 minutes late',
  },
  {
    id: 3,
    employeeId: 203,
    date: '2025-12-11',
    status: 'present',
  },
  {
    id: 4,
    employeeId: 204,
    date: '2025-12-11',
    status: 'absent',
    note: 'Scheduled day off',
  },
  {
    id: 5,
    employeeId: 201,
    date: '2025-12-10',
    status: 'present',
  },
  {
    id: 6,
    employeeId: 202,
    date: '2025-12-10',
    status: 'present',
  },
  {
    id: 7,
    employeeId: 203,
    date: '2025-12-10',
    status: 'on_leave',
    note: 'Approved leave',
  },
];

