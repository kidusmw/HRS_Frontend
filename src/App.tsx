import { Route, Routes, Navigate } from 'react-router-dom'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import GoogleOAuthPopup from './features/auth/pages/GoogleOAuthPopup'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import NotFoundPage from './features/shared/NotFoundPage'

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
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
