import api from '@/lib/axios';

const BASE_URL = '/receptionist';

/*
 * Dashboard
 */
export interface ReceptionistDashboardMetrics {
  arrivals: number;
  departures: number;
  inHouse: number;
  occupancy: {
    rate: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
  };
}

export const getDashboardMetrics = async (): Promise<ReceptionistDashboardMetrics> => {
  const response = await api.get(`${BASE_URL}/dashboard`);
  return response.data;
};

/*
 * Rooms
 */
export interface ReceptionistRoom {
  id: number;
  number: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetRoomsParams {
  search?: string;
  type?: string;
  isAvailable?: boolean;
  page?: number;
  per_page?: number;
}

export interface RoomsResponse {
  data: ReceptionistRoom[];
  links: any;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const getRooms = async (params?: GetRoomsParams): Promise<RoomsResponse> => {
  const response = await api.get(`${BASE_URL}/rooms`, { params });
  return response.data;
};

export interface UpdateRoomStatusParams {
  status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
}

export const updateRoomStatus = async (
  roomId: number,
  params: UpdateRoomStatusParams
): Promise<{ message: string; data: ReceptionistRoom }> => {
  const response = await api.patch(`${BASE_URL}/rooms/${roomId}/status`, params);
  return response.data;
};

/*
 * Reservations
 */
export interface ReceptionistReservation {
  id: number;
  room_id: number;
  user_id: number;
  check_in: string;
  check_out: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  guests: number;
  special_requests?: string | null;
  created_at: string;
  updated_at: string;
  room?: {
    id: number;
    type: string;
    price: number;
    capacity: number;
    description: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
    phone_number?: string | null;
  };
}

export interface GetReservationsParams {
  search?: string;
  status?: string;
  date_from?: string;
  start?: string;
  date_to?: string;
  end?: string;
  page?: number;
  per_page?: number;
}

export interface ReservationsResponse {
  data: ReceptionistReservation[];
  links: any;
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const getReservations = async (params?: GetReservationsParams): Promise<ReservationsResponse> => {
  const response = await api.get(`${BASE_URL}/reservations`, { params });
  return response.data;
};

export interface CreateWalkInReservationParams {
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  roomNumber: number; // room ID
  checkIn: string;
  checkOut: string;
  specialRequests?: string;
}

export const createWalkInReservation = async (
  params: CreateWalkInReservationParams
): Promise<{ message: string; data: ReceptionistReservation }> => {
  const response = await api.post(`${BASE_URL}/reservations`, params);
  return response.data;
};

export const confirmReservation = async (
  reservationId: number
): Promise<{ message: string; data: ReceptionistReservation }> => {
  const response = await api.patch(`${BASE_URL}/reservations/${reservationId}/confirm`);
  return response.data;
};

export const cancelReservation = async (
  reservationId: number
): Promise<{ message: string; data: ReceptionistReservation }> => {
  const response = await api.patch(`${BASE_URL}/reservations/${reservationId}/cancel`);
  return response.data;
};

export const checkInReservation = async (
  reservationId: number
): Promise<{ message: string; data: ReceptionistReservation }> => {
  const response = await api.patch(`${BASE_URL}/reservations/${reservationId}/check-in`);
  return response.data;
};

export const checkOutReservation = async (
  reservationId: number
): Promise<{ message: string; data: ReceptionistReservation }> => {
  const response = await api.patch(`${BASE_URL}/reservations/${reservationId}/check-out`);
  return response.data;
};

/*
 * Reports
 */
export interface ReceptionistReportData {
  arrivals: {
    total: number;
    list: Array<{
      id: number;
      guestName: string;
      roomNumber: string;
      checkIn: string;
      status: string;
    }>;
  };
  departures: {
    total: number;
    list: Array<{
      id: number;
      guestName: string;
      roomNumber: string;
      checkOut: string;
    }>;
  };
  inHouse: {
    total: number;
    list: Array<{
      id: number;
      guestName: string;
      roomNumber: string;
      checkIn: string;
      checkOut: string;
    }>;
  };
  occupancy: {
    rate: number;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface GetReportsParams {
  range?: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days';
}

export const getReports = async (params?: GetReportsParams): Promise<ReceptionistReportData> => {
  const response = await api.get(`${BASE_URL}/reports`, { params });
  return response.data;
};

