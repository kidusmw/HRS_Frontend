import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import './index.css'

// Redux store
import { store } from './app/store.ts'
import { hydrateFromStorage } from './features/auth/authSlice.ts'

// React Router
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Toaster for notifications
import { Toaster } from '@/components/ui/sonner'

// Hydrate auth state from localStorage on app boot
store.dispatch(hydrateFromStorage());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </Provider>
  </StrictMode>,
)
