import { Outlet } from 'react-router-dom'
import AdminSideNav from '../../components/admin/AdminSideNav'

/**
 * AdminLayout
 * 
 * Provides the structural frame for all admin pages.
 */
export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-blue-600/30">
      {/* Sidebar - fixed width */}
      <AdminSideNav />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen max-h-screen overflow-y-auto custom-scrollbar relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]"></div>
        </div>

        {/* Content container */}
        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
