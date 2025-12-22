import api from '@/lib/axios';

const BASE_URL = '/manager';

/*
 * Dashboard
 */
export interface ManagerDashboardMetrics {
  kpis: {
    occupancyPct: number;
    roomsAvailable: number;
    activeReservationsToday: number;
    upcomingCheckins: number;
  };
  bookingTrends: Array<{ month: string; bookings: number }>;
  revenueTrends: Array<{ month: string; revenue: number }>;
  alertsOpen: number;
}

export const getDashboardMetrics = async (): Promise<ManagerDashboardMetrics> => {
  // #region agent log
  const url = `${BASE_URL}/dashboard`;
  fetch('http://127.0.0.1:7243/ingest/e2b6fcbc-3ef6-4016-afd7-573e5fddb1c8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'managerApi.ts:21',message:'getDashboardMetrics called',data:{url,baseUrl:BASE_URL,fullUrl:`${api.defaults.baseURL}${url}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  try {
    const response = await api.get(url);
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e2b6fcbc-3ef6-4016-afd7-573e5fddb1c8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'managerApi.ts:26',message:'getDashboardMetrics success',data:{status:response.status,hasData:!!response.data,dataKeys:response.data?Object.keys(response.data):[]},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return response.data;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e2b6fcbc-3ef6-4016-afd7-573e5fddb1c8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'managerApi.ts:31',message:'getDashboardMetrics error',data:{status:error.response?.status,statusText:error.response?.statusText,message:error.message,url:error.config?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    throw error;
  }
};

/*
 * Employees
 */
export interface ManagerEmployee {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  shift: 'morning' | 'evening' | 'night';
  underSupervision: boolean;
  status: 'active' | 'inactive';
  managerName?: string | null;
}

export interface GetEmployeesParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface EmployeesResponse {
  data: ManagerEmployee[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const getEmployees = async (params?: GetEmployeesParams): Promise<EmployeesResponse> => {
  const response = await api.get(`${BASE_URL}/employees`, { params });
  return response.data;
};

/*
 * Attendance
 */
export interface ManagerAttendance {
  id: number;
  employeeId: number;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'on_leave';
  note?: string | null;
}

export interface GetAttendanceParams {
  date?: string;
  user_id?: number;
  page?: number;
  per_page?: number;
}

export interface AttendanceResponse {
  data: ManagerAttendance[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface CreateAttendanceDto {
  user_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  note?: string | null;
}

export const getAttendance = async (params?: GetAttendanceParams): Promise<AttendanceResponse> => {
  const response = await api.get(`${BASE_URL}/attendance`, { params });
  return response.data;
};

export const createAttendance = async (data: CreateAttendanceDto): Promise<{ data: ManagerAttendance }> => {
  const response = await api.post(`${BASE_URL}/attendance`, data);
  return response.data;
};

/*
 * Overrides
 */
export interface ManagerOverride {
  id: number;
  reservation_id: number;
  manager_id: number;
  new_status: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  reservation?: {
    id: number;
    room_id: number;
    user_id: number | null;
    check_in: string;
    check_out: string;
    status: string;
    guests: number;
  };
}

export interface GetOverridesParams {
  booking_id?: number;
  page?: number;
  per_page?: number;
}

export interface OverridesResponse {
  data: ManagerOverride[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface CreateOverrideDto {
  booking_id: number;
  new_status: 'confirmed' | 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
  note?: string | null;
}

export const getOverrides = async (params?: GetOverridesParams): Promise<OverridesResponse> => {
  const response = await api.get(`${BASE_URL}/overrides`, { params });
  return response.data;
};

export const createOverride = async (data: CreateOverrideDto): Promise<{ data: ManagerOverride }> => {
  const response = await api.post(`${BASE_URL}/overrides`, data);
  return response.data;
};

/*
 * Activities (Receptionist Activities)
 */
export interface ReceptionistActivity {
  id: number;
  type: 'reservation' | 'room' | 'check_in' | 'check_out' | 'cancellation' | 'confirmation' | 'other';
  action: string;
  description: string;
  receptionist: {
    id: number;
    name: string;
    email: string;
  } | null;
  reservation_id: number | null;
  room_id: number | null;
  meta: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

export interface GetActivitiesParams {
  booking_id?: number;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

export interface ActivitiesResponse {
  data: ReceptionistActivity[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const getActivities = async (params?: GetActivitiesParams): Promise<ActivitiesResponse> => {
  const response = await api.get(`${BASE_URL}/activities`, { params });
  return response.data;
};

/*
 * Alerts
 */
export interface ManagerAlert {
  id: number;
  type: 'system' | 'hotel' | 'overbooking' | 'payment' | 'maintenance';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export interface GetAlertsParams {
  status?: 'open' | 'acknowledged' | 'resolved';
  severity?: 'info' | 'warning' | 'critical';
  page?: number;
  per_page?: number;
}

export interface AlertsResponse {
  data: ManagerAlert[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export const getAlerts = async (params?: GetAlertsParams): Promise<AlertsResponse> => {
  const response = await api.get(`${BASE_URL}/alerts`, { params });
  return response.data;
};

/*
 * Bookings
 */
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

export interface GetBookingsParams {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface BookingsResponse {
  data: ManagerBooking[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
  status_counts?: {
    pending: number;
    confirmed: number;
    checked_in: number;
    checked_out: number;
    cancelled: number;
  };
  total_active?: number;
}

export const getBookings = async (params?: GetBookingsParams): Promise<BookingsResponse> => {
  const response = await api.get(`${BASE_URL}/bookings`, { params });
  return response.data;
};

/*
 * Reports
 */
export type ReportRange = 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'six_months' | 'yearly';

export interface ManagerReport {
  occupancy: {
    rate: number;
    roomsOccupied: number;
    roomsAvailable: number;
  };
  revenue: {
    total: number;
    byRoomType: Array<{ type: string; revenue: number }>;
  };
  bookings: {
    total: number;
    bySource: Array<{ source: string; count: number }>;
    cancellations: number;
  };
  metrics: {
    adr: number; // Average Daily Rate
    revpar: number; // Revenue Per Available Room
  };
}

export interface GetReportsParams {
  range: ReportRange;
}

export const getReports = async (params: GetReportsParams): Promise<{ data: ManagerReport }> => {
  const response = await api.get(`${BASE_URL}/reports`, { params });
  return response.data;
};

/*
 * Occupancy
 */
export interface ManagerOccupancy {
  label: string;
  occupancyRate: number;
  roomsOccupied: number;
  roomsAvailable: number;
}

export const getOccupancy = async (): Promise<{ data: ManagerOccupancy[] }> => {
  const response = await api.get(`${BASE_URL}/occupancy`);
  return response.data;
};

/*
 * Notifications
 */
export interface ManagerNotification {
  id: number;
  message: string;
  type: 'reservation' | 'user' | 'attendance' | 'alert' | 'hotel' | 'settings' | 'system';
  status: 'read' | 'unread';
  timestamp: string;
  hotelId?: number;
  hotelName?: string;
}

export interface GetNotificationsParams {
  limit?: number;
}

export interface NotificationsResponse {
  data: ManagerNotification[];
}

export const getNotifications = async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
  const response = await api.get(`${BASE_URL}/notifications`, { params });
  return response.data;
};

export const markNotificationRead = async (id: number): Promise<{ message: string }> => {
  const response = await api.patch(`${BASE_URL}/notifications/${id}/read`);
  return response.data;
};

