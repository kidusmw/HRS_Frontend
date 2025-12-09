import api from '@/lib/axios';

const BASE_URL = '/admin';

// Dashboard
export interface AdminDashboardMetrics {
  kpis: {
    occupancyPct: number;
    roomsAvailable: number;
    activeReservationsToday: number;
    upcomingCheckins: number;
  };
  monthlyRevenue: number;
  bookingTrends: Array<{ month: string; bookings: number }>;
  weeklyOccupancy: Array<{ week: string; occupied: number; available: number }>;
  revenueTrends: Array<{ month: string; revenue: number }>;
}

export const getDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  const response = await api.get(`${BASE_URL}/dashboard/metrics`);
  return response.data;
};

