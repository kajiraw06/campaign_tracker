import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import { AuthProvider, useAuth } from './AuthContext.jsx'

function Root() {
  const { user, role, loading, killSwitch } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg"
            width="32" height="32" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span className="text-sm text-slate-500 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  // Kill switch — block non-admins with a maintenance screen
  if (killSwitch && role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.364 5.636a9 9 0 1 1-12.728 0"/>
                  <line x1="12" y1="2" x2="12" y2="12"/>
                </svg>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping"/>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500"/>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Under Maintenance</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The system is currently offline for scheduled maintenance.<br/>
            We'll be back shortly. Thank you for your patience.
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            <span className="text-xs text-slate-400 font-medium">System Offline</span>
          </div>
        </div>
      </div>
    );
  }

  return user ? <App /> : <Login />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>,
)
