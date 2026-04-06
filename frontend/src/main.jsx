import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster position='top-right' toastOptions={{
        style: { background: '#1f2937', color: '#f9fafb', border: '1px solid #374151'},
        success: { iconTheme: { primary: '#10b981', secondary: '#f9fafb' } },
        error: { iconTheme: { primary: '#ef4444',  secondary: '#f9fafb' } },
      }}
      />
    </AuthProvider>
  </StrictMode>,
)
