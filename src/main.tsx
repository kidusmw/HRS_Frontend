import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import './index.css'
import api from '@/lib/axios'

// Redux store
import { store } from './app/store.ts'
import { hydrateFromStorage } from './features/auth/authSlice.ts'

// React Router
import { BrowserRouter, Route, Routes } from 'react-router-dom'

// Toaster for notifications
import { Toaster } from '@/components/ui/sonner'

type PublicSystemSettings = {
  systemName: string
  systemLogoUrl: string | null
}

async function applySystemBranding() {
  try {
    const res = await api.get<{ data: PublicSystemSettings }>('/system/settings')
    const settings = res.data.data

    if (settings.systemName) document.title = settings.systemName

    if (settings.systemLogoUrl) {
      const link =
        (document.querySelector('#app-favicon') as HTMLLinkElement | null) ??
        (document.querySelector("link[rel~='icon']") as HTMLLinkElement | null)

      if (link) {
        const url = settings.systemLogoUrl
        link.href = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
      }
    }
  } catch {
    // keep fallback title/favicon
  }
}

// Hydrate auth state from localStorage on app boot
store.dispatch(hydrateFromStorage());

// Apply system branding (favicon/title) without blocking initial render
applySystemBranding()

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
