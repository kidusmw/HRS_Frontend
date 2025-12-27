export const paths = {
  // Public / customer
  customerHome: '/',
  hotelDetail: '/hotels/:id',
  customerProfile: '/profile',
  customerReservations: '/reservations',
  paymentReturn: '/payment/return',

  // Auth
  login: '/login',
  register: '/register',
  verifyEmail: '/verify',
  resetPassword: '/reset-password',
  oauthGoogleCallback: '/oauth/google/callback',

  // Super Admin
  superAdminRoot: '/super-admin',
  superAdminDashboard: '/super-admin/dashboard',
  superAdminUsers: '/super-admin/users',
  superAdminHotels: '/super-admin/hotels',
  superAdminLogs: '/super-admin/logs',
  superAdminBackups: '/super-admin/backups',
  superAdminSettings: '/super-admin/settings',
  superAdminPaymentOptions: '/super-admin/payment-options',
  superAdminProfile: '/super-admin/profile',

  // Admin
  adminRoot: '/admin',
  adminDashboard: '/admin/dashboard',
  adminUsers: '/admin/users',
  adminRooms: '/admin/rooms',
  adminSettings: '/admin/settings',
  adminLogs: '/admin/logs',
  adminProfile: '/admin/profile',
  adminBackups: '/admin/backups',
  adminPayments: '/admin/payments',

  // Manager
  managerRoot: '/manager',
  managerDashboard: '/manager/dashboard',
  managerBookings: '/manager/bookings',
  managerReports: '/manager/reports',
  managerOccupancy: '/manager/occupancy',
  managerOperations: '/manager/operations',
  managerProfile: '/manager/profile',
  managerEmployees: '/manager/employees',
  managerOverrides: '/manager/overrides',

  // Receptionist
  receptionistRoot: '/receptionist',
  receptionistDashboard: '/receptionist/dashboard',
  receptionistReservations: '/receptionist/reservations',
  receptionistRooms: '/receptionist/rooms',
  receptionistReports: '/receptionist/reports',
  receptionistProfile: '/receptionist/profile',
} as const


