import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import GoogleOAuthPopup from './features/auth/pages/GoogleOAuthPopup'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import { SuperAdminRoute } from './components/SuperAdminRoute'
import NotFoundPage from './features/shared/NotFoundPage'
import { Dashboard } from './features/super_admin/pages/Dashboard'
import { Users } from './features/super_admin/pages/Users'
import { Hotels } from './features/super_admin/pages/Hotels'
import { Logs } from './features/super_admin/pages/Logs'
import { Backups } from './features/super_admin/pages/Backups'
import { Settings } from './features/super_admin/pages/Settings'
import { Profile } from './features/super_admin/pages/Profile'
import { Preferences } from './features/super_admin/pages/Preferences'

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
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
