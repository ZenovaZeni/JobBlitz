import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import logoIcon from '../assets/brand/jobblitz-icon-sidebar.png'
import logoWordmark from '../assets/brand/jobblitz-wordmark-transparent.png'

const navItems = [
  { path: '/app/dashboard', icon: 'grid_view', label: 'Dashboard' },
  { path: '/app/profile', icon: 'account_circle', label: 'Profile' },
  { path: '/app/resumes', icon: 'description', label: 'Resumes' },
  { path: '/app/cover-letter', icon: 'mail', label: 'Cover Letters' },
  { path: '/app/interview', icon: 'psychology', label: 'Interview Prep' },
]

export default function SideNav() {
  const navigate = useNavigate()
  const { user, profile, signOut, isPro } = useAuth()

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 border-r"
      style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.12)' }}>

      {/* Brand */}
      <div className="px-6 py-10 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <img src={logoIcon} alt="JobBlitz" className="w-11 h-11 object-contain" />
          <div className="flex flex-col">
            <img src={logoWordmark} alt="JobBlitz" className="h-8 object-contain" />
            {isPro && (
              <span className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-[#031631]/60">
                Professional Edition
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 space-y-0.5">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'hover:bg-white hover:shadow-sm'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#031631' : 'transparent',
              color: isActive ? 'white' : '#44474d',
            })}>
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* New Session CTA */}
      <div className="px-3 mb-3">
        <button onClick={() => navigate('/app/tailor')}
          className="w-full py-3 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 ai-glow-btn">
          <span className="material-symbols-outlined icon-filled text-[16px]">add</span>
          New Session
        </button>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-2 space-y-0.5 border-t pt-2" style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
        {[
          { icon: 'upload_file', label: 'Import Resume', route: '/app/import' },
          { icon: 'settings', label: 'Settings', route: '/app/settings' },
        ].map(item => (
          <button key={item.route} onClick={() => navigate(item.route)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-white transition-all"
            style={{ color: '#44474d' }}>
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* User footer */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: 'rgba(3,22,49,0.04)' }}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black"
            style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: '#031631' }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color: '#75777e' }}>{isPro ? 'Pro Plan' : 'Free Plan'}</p>
          </div>
          <button onClick={handleSignOut} title="Sign out"
            className="p-1.5 rounded-lg hover:bg-[#eceef0] transition-all"
            style={{ color: '#75777e' }}>
            <span className="material-symbols-outlined text-[16px]">logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
