import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps /app/* routes — redirects unauthenticated users to /auth/login
 */
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
            <span className="text-white font-black text-xl" style={{ fontFamily: 'Manrope' }}>JB</span>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#44474d' }}>Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth/login" replace />
  return children
}
