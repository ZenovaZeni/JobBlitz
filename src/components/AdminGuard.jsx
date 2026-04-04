import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * A route guard that only allows users with the 'admin' app_role to proceed.
 * Unauthorized users are redirected to the main dashboard.
 */
export default function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e0099]"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    console.warn('Unauthorized admin access attempt:', user?.email)
    return <Navigate to="/app/dashboard" replace />
  }

  return children || <Outlet />
}
