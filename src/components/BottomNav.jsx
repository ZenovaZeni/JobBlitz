import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabs = [
  { path: '/app/dashboard', icon: 'grid_view', label: 'Home' },
  { path: '/app/resumes', icon: 'description', label: 'Resumes' },
  { path: '/app/profile', icon: 'account_circle', label: 'Profile' },
  { path: '/app/interview', icon: 'psychology', label: 'Prep' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) return null

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {/* Left 2 tabs */}
        {tabs.slice(0, 2).map(tab => (
          <NavLink key={tab.path} to={tab.path}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all touch-target">
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[24px] transition-all ${isActive ? 'icon-filled' : ''}`}
                  style={{ color: isActive ? '#031631' : '#c5c6ce' }}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-bold transition-colors"
                  style={{ color: isActive ? '#031631' : '#c5c6ce' }}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Center elevated Tailor button */}
        <button onClick={() => navigate('/app/tailor')}
          className="relative -mt-5 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ai-glow-btn">
            <span className="material-symbols-outlined icon-filled text-[26px] text-white">bolt</span>
          </div>
          <span className="text-[10px] font-bold mt-1" style={{ color: '#031631' }}>Tailor</span>
        </button>

        {/* Right 2 tabs */}
        {tabs.slice(2).map(tab => (
          <NavLink key={tab.path} to={tab.path}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all touch-target">
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[24px] transition-all ${isActive ? 'icon-filled' : ''}`}
                  style={{ color: isActive ? '#031631' : '#c5c6ce' }}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-bold transition-colors"
                  style={{ color: isActive ? '#031631' : '#c5c6ce' }}>
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
