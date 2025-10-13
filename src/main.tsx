import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// React Router
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from './features/auth/pages/LoginPage.tsx'
import NotFoundPage from './features/shared/NotFoundPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={ router } />
  </StrictMode>,
)
