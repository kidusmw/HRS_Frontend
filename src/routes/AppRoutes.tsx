import { Navigate, Route, Routes } from 'react-router-dom'
import { paths } from './paths'
import { RoleGuard } from './guards/RoleGuard'

// Auth
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import GoogleOAuthCallback from '@/features/auth/pages/GoogleOAuthCallback'

// Shared
import NotFoundPage from '@/features/shared/NotFoundPage'

// Customer
import { CustomerLayout } from '@/features/customer/layout/CustomerLayout'
import { Explore as CustomerExplore } from '@/features/customer/pages/Explore'
import { HotelDetail as CustomerHotelDetail } from '@/features/customer/pages/HotelDetail'
import { Profile as CustomerProfile } from '@/features/customer/pages/Profile'
import { PaymentReturn as CustomerPaymentReturn } from '@/features/customer/pages/PaymentReturn'
import { Reservations as CustomerReservations } from '@/features/customer/pages/Reservations'

// Super Admin
import { AdminLayout as SuperAdminLayout } from '@/features/super_admin/layout/AdminLayout'
import { Dashboard } from '@/features/super_admin/pages/Dashboard'
import { Users } from '@/features/super_admin/pages/Users'
import { Hotels } from '@/features/super_admin/pages/Hotels'
import { Logs } from '@/features/super_admin/pages/Logs'
import { Backups } from '@/features/super_admin/pages/Backups'
import { Settings } from '@/features/super_admin/pages/Settings'
import { PaymentOptions } from '@/features/super_admin/pages/PaymentOptions'
import { Profile } from '@/features/super_admin/pages/Profile'

// Admin
import { AdminLayout } from '@/features/admin/layout/AdminLayout'
import { Dashboard as AdminDashboard } from '@/features/admin/pages/Dashboard'
import { Users as AdminUsers } from '@/features/admin/pages/Users'
import { Rooms } from '@/features/admin/pages/Rooms'
import { Settings as AdminSettings } from '@/features/admin/pages/Settings'
import { Logs as AdminLogs } from '@/features/admin/pages/Logs'
import { Profile as AdminProfile } from '@/features/admin/pages/Profile'
import { Backups as AdminBackups } from '@/features/admin/pages/Backups'
import { Payments } from '@/features/admin/pages/Payments'

// Manager
import { ManagerLayout } from '@/features/manager/layout/ManagerLayout'
import { Dashboard as ManagerDashboard } from '@/features/manager/pages/Dashboard'
import { Bookings as ManagerBookings } from '@/features/manager/pages/Bookings'
import { Reports as ManagerReports } from '@/features/manager/pages/Reports'
import { Occupancy as ManagerOccupancy } from '@/features/manager/pages/Occupancy'
import { Operations as ManagerOperations } from '@/features/manager/pages/Operations'
import { Profile as ManagerProfile } from '@/features/manager/pages/Profile'
import { Employees as ManagerEmployees } from '@/features/manager/pages/Employees'
import { Overrides as ManagerOverrides } from '@/features/manager/pages/Overrides'

// Receptionist
import { ReceptionistLayout } from '@/features/receptionist/layout/ReceptionistLayout'
import { Dashboard as ReceptionistDashboard } from '@/features/receptionist/pages/Dashboard'
import { Reservations as ReceptionistReservations } from '@/features/receptionist/pages/Reservations'
import { Rooms as ReceptionistRooms } from '@/features/receptionist/pages/Rooms'
import { Reports as ReceptionistReports } from '@/features/receptionist/pages/Reports'
import { Profile as ReceptionistProfile } from '@/features/receptionist/pages/Profile'

export function AppRoutes() {
  const superAdminLayout = (c: React.ReactNode) => <SuperAdminLayout>{c}</SuperAdminLayout>
  const adminLayout = (c: React.ReactNode) => <AdminLayout>{c}</AdminLayout>
  const managerLayout = (c: React.ReactNode) => <ManagerLayout>{c}</ManagerLayout>
  const receptionistLayout = (c: React.ReactNode) => <ReceptionistLayout>{c}</ReceptionistLayout>

  return (
    <Routes>
      {/* Customer/Public shell */}
      <Route element={<CustomerLayout />}>
        <Route path={paths.customerHome} element={<CustomerExplore />} />
        <Route path={paths.hotelDetail} element={<CustomerHotelDetail />} />
        <Route path={paths.customerProfile} element={<CustomerProfile />} />
        <Route path={paths.customerReservations} element={<CustomerReservations />} />
        <Route path={paths.paymentReturn} element={<CustomerPaymentReturn />} />
      </Route>

      {/* Auth */}
      <Route path={paths.login} element={<LoginPage />} />
      <Route path={paths.register} element={<RegisterPage />} />
      <Route path={paths.verifyEmail} element={<VerifyEmailPage />} />
      <Route path={paths.resetPassword} element={<ResetPasswordPage />} />
      <Route path={paths.oauthGoogleCallback} element={<GoogleOAuthCallback />} />

      {/* Super Admin */}
      <Route path={paths.superAdminRoot} element={<Navigate to={paths.superAdminDashboard} replace />} />
      <Route
        path={paths.superAdminDashboard}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Dashboard />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminUsers}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Users />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminHotels}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Hotels />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminLogs}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Logs />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminBackups}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Backups />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminSettings}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Settings />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminPaymentOptions}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <PaymentOptions />
          </RoleGuard>
        }
      />
      <Route
        path={paths.superAdminProfile}
        element={
          <RoleGuard allowed={['superadmin', 'super_admin']} layout={superAdminLayout}>
            <Profile />
          </RoleGuard>
        }
      />

      {/* Admin */}
      <Route path={paths.adminRoot} element={<Navigate to={paths.adminDashboard} replace />} />
      <Route
        path={paths.adminDashboard}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <AdminDashboard />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminUsers}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <AdminUsers />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminRooms}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <Rooms />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminSettings}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <AdminSettings />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminLogs}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <AdminLogs />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminProfile}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <AdminProfile />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminBackups}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <AdminBackups />
          </RoleGuard>
        }
      />
      <Route
        path={paths.adminPayments}
        element={
          <RoleGuard allowed={['admin']} layout={adminLayout}>
            <Payments />
          </RoleGuard>
        }
      />

      {/* Manager */}
      <Route path={paths.managerRoot} element={<Navigate to={paths.managerDashboard} replace />} />
      <Route
        path={paths.managerDashboard}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerDashboard />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerBookings}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerBookings />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerReports}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerReports />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerOccupancy}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerOccupancy />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerOperations}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerOperations />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerProfile}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerProfile />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerEmployees}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerEmployees />
          </RoleGuard>
        }
      />
      <Route
        path={paths.managerOverrides}
        element={
          <RoleGuard allowed={['manager']} layout={managerLayout}>
            <ManagerOverrides />
          </RoleGuard>
        }
      />

      {/* Receptionist */}
      <Route path={paths.receptionistRoot} element={<Navigate to={paths.receptionistDashboard} replace />} />
      <Route
        path={paths.receptionistDashboard}
        element={
          <RoleGuard allowed={['receptionist']} layout={receptionistLayout}>
            <ReceptionistDashboard />
          </RoleGuard>
        }
      />
      <Route
        path={paths.receptionistReservations}
        element={
          <RoleGuard allowed={['receptionist']} layout={receptionistLayout}>
            <ReceptionistReservations />
          </RoleGuard>
        }
      />
      <Route
        path={paths.receptionistRooms}
        element={
          <RoleGuard allowed={['receptionist']} layout={receptionistLayout}>
            <ReceptionistRooms />
          </RoleGuard>
        }
      />
      <Route
        path={paths.receptionistReports}
        element={
          <RoleGuard allowed={['receptionist']} layout={receptionistLayout}>
            <ReceptionistReports />
          </RoleGuard>
        }
      />
      <Route
        path={paths.receptionistProfile}
        element={
          <RoleGuard allowed={['receptionist']} layout={receptionistLayout}>
            <ReceptionistProfile />
          </RoleGuard>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}


