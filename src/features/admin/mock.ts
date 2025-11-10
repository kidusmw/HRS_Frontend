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

