import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const primaryTabs = [
  { path: '/app/dashboard', icon: 'grid_view',      label: 'Home' },
  { path: '/app/resumes',   icon: 'description',    label: 'Applications' },
]

const rightTabs = [
  { path: '/app/profile',   icon: 'account_circle', label: 'Profile' },
]

const moreTabs = [
  { path: '/app/interview',  icon: 'psychology',          label: 'Interview Prep' },
  { path: '/app/cover-letter', icon: 'mail',              label: 'Cover Letters' },
  { path: '/app/extension',  icon: 'extension',           label: 'Extension',    badge: 'Pro' },
  { path: '/app/import',     icon: 'upload_file',         label: 'Import Resume' },
  { path: '/app/settings',   icon: 'settings',            label: 'Settings' },
  { path: '/pricing',        icon: 'workspace_premium',   label: 'Plans & Pricing' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  if (!user) return null

  const isMoreActive = moreTabs.some(t => location.pathname.startsWith(t.path))

  function goTo(path) {
    setMoreOpen(false)
    navigate(path)
  }

  return (
    <>
      {/* Backdrop — dismisses More sheet on tap */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-[45] md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More sheet — slides up above the bottom nav */}
      {moreOpen && (
        <div
          className="fixed left-3 right-3 z-[46] rounded-2xl bg-white shadow-2xl overflow-hidden md:hidden"
          style={{
            bottom: 'calc(3.75rem + env(safe-area-inset-bottom))',
            border: '1px solid rgba(197,198,206,0.25)',
          }}
        >
          {/* Sheet header */}
          <div className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#c5c6ce' }}>More</span>
            <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg hover:bg-[#f2f4f6] transition-colors">
              <span className="material-symbols-outlined text-[16px]" style={{ color: '#8293b4' }}>close</span>
            </button>
          </div>

          {/* Sheet items */}
          <div className="p-2">
            <div className="grid grid-cols-2 gap-1">
              {moreTabs.map(tab => {
                const isActive = location.pathname.startsWith(tab.path)
                return (
                  <button
                    key={tab.path}
                    onClick={() => goTo(tab.path)}
                    aria-label={tab.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left select-none active:scale-[0.97] ${
                      isActive
                        ? 'bg-[#eceef0]'
                        : 'hover:bg-[#f2f4f6] active:bg-[#eceef0]'
                    }`}
                    style={{ color: isActive ? '#031631' : '#44474d' }}>
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true"
                      style={{ color: isActive ? '#0e0099' : '#8293b4' }}>
                      {tab.icon}
                    </span>
                    <span className="leading-tight flex-1">{tab.label}</span>
                    {tab.badge && (
                      <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav aria-label="Mobile navigation" className="bottom-nav md:hidden">
        <div className="flex items-center justify-around px-2 pt-2 pb-1">

          {/* Left tabs: Home + Applications */}
          {primaryTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              onClick={() => setMoreOpen(false)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all">
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[24px] transition-all ${isActive ? 'icon-filled' : ''}`}
                    style={{ color: isActive ? '#031631' : '#c5c6ce' }}
                    aria-hidden="true">
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

          {/* Center: elevated Tailor CTA */}
          <button
            onClick={() => goTo('/app/tailor')}
            aria-label="Build new application"
            className="relative -mt-5 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ai-glow-btn">
              <span className="material-symbols-outlined icon-filled text-[26px] text-white" aria-hidden="true">bolt</span>
            </div>
            <span className="text-[10px] font-bold mt-1" style={{ color: '#031631' }}>Tailor</span>
          </button>

          {/* Right: Profile */}
          {rightTabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-label={tab.label}
              onClick={() => setMoreOpen(false)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all">
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[24px] transition-all ${isActive ? 'icon-filled' : ''}`}
                    style={{ color: isActive ? '#031631' : '#c5c6ce' }}
                    aria-hidden="true">
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

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(o => !o)}
            aria-label="More options"
            aria-expanded={moreOpen}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all">
            <span
              className={`material-symbols-outlined text-[24px] transition-all ${(moreOpen || isMoreActive) ? 'icon-filled' : ''}`}
              style={{ color: (moreOpen || isMoreActive) ? '#031631' : '#c5c6ce' }}
              aria-hidden="true">
              more_horiz
            </span>
            <span className="text-[10px] font-bold transition-colors"
              style={{ color: (moreOpen || isMoreActive) ? '#031631' : '#c5c6ce' }}>
              More
            </span>
          </button>

        </div>
      </nav>
    </>
  )
}
