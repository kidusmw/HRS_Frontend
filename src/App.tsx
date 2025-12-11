import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import GoogleOAuthPopup from './features/auth/pages/GoogleOAuthPopup'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import { SuperAdminRoute } from './components/SuperAdminRoute'
import { AdminRoute } from './components/AdminRoute'
import { ManagerRoute } from './components/ManagerRoute'
import NotFoundPage from './features/shared/NotFoundPage'
import { Dashboard } from './features/super_admin/pages/Dashboard'
import { Users } from './features/super_admin/pages/Users'
import { Hotels } from './features/super_admin/pages/Hotels'
import { Logs } from './features/super_admin/pages/Logs'
import { Backups } from './features/super_admin/pages/Backups'
import { Settings } from './features/super_admin/pages/Settings'
import { Profile } from './features/super_admin/pages/Profile'
import { Preferences } from './features/super_admin/pages/Preferences'
import { Dashboard as AdminDashboard } from './features/admin/pages/Dashboard'
import { Users as AdminUsers } from './features/admin/pages/Users'
import { Rooms } from './features/admin/pages/Rooms'
import { Settings as AdminSettings } from './features/admin/pages/Settings'
import { Logs as AdminLogs } from './features/admin/pages/Logs'
import { Profile as AdminProfile } from './features/admin/pages/Profile'
import { Backups as AdminBackups } from './features/admin/pages/Backups'
import { Payments } from './features/admin/pages/Payments'
import { Dashboard as ManagerDashboard } from './features/manager/pages/Dashboard'
import { Bookings as ManagerBookings } from './features/manager/pages/Bookings'
import { Reports as ManagerReports } from './features/manager/pages/Reports'
import { Occupancy as ManagerOccupancy } from './features/manager/pages/Occupancy'
import { Operations as ManagerOperations } from './features/manager/pages/Operations'
import { Profile as ManagerProfile } from './features/manager/pages/Profile'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to="/login" replace />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/verify' element={<VerifyEmailPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      <Route path='/oauth/google/popup' element={<GoogleOAuthPopup />} />
      <Route 
        path='/dashboard' 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/super-admin"
        element={<Navigate to="/super-admin/dashboard" replace />}
      />
      <Route
        path="/super-admin/dashboard"
        element={
          <SuperAdminRoute>
            <Dashboard />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/users"
        element={
          <SuperAdminRoute>
            <Users />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/hotels"
        element={
          <SuperAdminRoute>
            <Hotels />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/logs"
        element={
          <SuperAdminRoute>
            <Logs />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/backups"
        element={
          <SuperAdminRoute>
            <Backups />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/settings"
        element={
          <SuperAdminRoute>
            <Settings />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/profile"
        element={
          <SuperAdminRoute>
            <Profile />
          </SuperAdminRoute>
        }
      />
      <Route
        path="/super-admin/preferences"
        element={
          <SuperAdminRoute>
            <Preferences />
          </SuperAdminRoute>
        }
      />
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <AdminRoute>
            <Rooms />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <AdminRoute>
            <AdminLogs />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <AdminRoute>
            <AdminProfile />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/backups"
        element={
          <AdminRoute>
            <AdminBackups />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminRoute>
            <Payments />
          </AdminRoute>
        }
      />
      {/* Manager Routes */}
      <Route
        path="/manager"
        element={<Navigate to="/manager/dashboard" replace />}
      />
      <Route
        path="/manager/dashboard"
        element={
          <ManagerRoute>
            <ManagerDashboard />
          </ManagerRoute>
        }
      />
      <Route
        path="/manager/bookings"
        element={
          <ManagerRoute>
            <ManagerBookings />
          </ManagerRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <ManagerRoute>
            <ManagerReports />
          </ManagerRoute>
        }
      />
      <Route
        path="/manager/occupancy"
        element={
          <ManagerRoute>
            <ManagerOccupancy />
          </ManagerRoute>
        }
      />
      <Route
        path="/manager/operations"
        element={
          <ManagerRoute>
            <ManagerOperations />
          </ManagerRoute>
        }
      />
      <Route
        path="/manager/profile"
        element={
          <ManagerRoute>
            <ManagerProfile />
          </ManagerRoute>
        }
      />
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
