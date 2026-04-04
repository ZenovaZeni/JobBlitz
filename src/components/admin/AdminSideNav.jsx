import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoIcon from '../../assets/brand/jobblitz-icon-sidebar.png'

const adminNavItems = [
  { path: '/admin/dashboard', icon: 'monitoring', label: 'Overview' },
  { path: '/admin/logs', icon: 'terminal', label: 'System Logs' },
  { path: '/admin/users', icon: 'group', label: 'User Manager' },
]

export default function AdminSideNav() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  return (
    <nav className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 border-r bg-slate-900 border-slate-800">
      {/* Brand */}
      <div className="px-6 py-10 flex items-center gap-4">
        <img src={logoIcon} alt="JobBlitz Admin" className="w-10 h-10 object-contain grayscale brightness-200" />
        <div>
          <h1 className="text-white font-black text-lg tracking-tight">Admin</h1>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Command Center</p>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 space-y-1">
        {adminNavItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }>
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Utility Footer */}
      <div className="p-4 mt-auto border-t border-slate-800/50">
        <button onClick={() => navigate('/app/dashboard')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:bg-slate-800 transition-all">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to App
        </button>
      </div>
    </nav>
  )
}
