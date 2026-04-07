import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ApplicationSwitcher from './ApplicationSwitcher'

import logoIcon from '../assets/brand/jobblitz-icon-sidebar.png'
import logoWordmark from '../assets/brand/jobblitz-wordmark-transparent.png'

const navItems = [
  { path: '/app/dashboard',    icon: 'grid_view',     label: 'Dashboard' },
  { path: '/app/profile',      icon: 'account_circle', label: 'Profile' },
  { path: '/app/resumes',      icon: 'description',   label: 'Applications' },
  { path: '/app/cover-letter', icon: 'mail',          label: 'Cover Letters' },
  { path: '/app/interview',    icon: 'psychology',    label: 'Interview Prep' },
]

export default function SideNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut, isSigningOut, isPro } = useAuth()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSwitcherOpen(open => !open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <>
    <ApplicationSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    <nav
      aria-label="Main navigation"
      className="hidden md:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 border-r"
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

      {/* Application Switcher trigger */}
      <div className="px-3 mb-4">
        <button
          onClick={() => setSwitcherOpen(true)}
          aria-label="Open application switcher"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:bg-white hover:shadow-sm"
          style={{ borderColor: 'rgba(197,198,206,0.35)', color: '#8293b4', backgroundColor: 'rgba(255,255,255,0.5)' }}>
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">search</span>
          <span className="flex-1 text-left text-[12px]">Open Application...</span>
          <kbd className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#eceef0', color: '#8293b4' }}>⌘K</kbd>
        </button>
      </div>

      {/* Nav items */}
      <ul className="flex-1 px-3 space-y-0.5 list-none m-0 p-0 px-3">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path === '/app/resumes' && location.pathname.startsWith('/app/session'))
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'text-white shadow-sm' : 'hover:bg-white hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: isActive ? '#031631' : 'transparent',
                  color: isActive ? 'white' : '#44474d',
                }}>
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          )
        })}

        {/* Dynamic Active Workspace Indicator */}
        {location.pathname.startsWith('/app/session/') && (
          <li className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
            <div className="px-3 mb-2 flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0e0099]">Active Workspace</span>
               <span className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
            </div>
            <div className="px-3 py-3 rounded-2xl bg-white border shadow-sm" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
               <p className="text-xs font-black text-[#031631] truncate mb-0.5 line-clamp-1">{location.pathname.split('/').pop() === 'resume' ? 'Resume Studio' : 'Command Center'}</p>
               <p className="text-[10px] font-bold text-[#8293b4] truncate">Currently Editing</p>
            </div>
          </li>
        )}
      </ul>

      {/* New Application CTA */}
      <div className="px-3 mb-3">
        <button
          onClick={() => navigate('/app/tailor')}
          aria-label="Start a new application"
          className="w-full py-3 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 ai-glow-btn">
          <span className="material-symbols-outlined icon-filled text-[16px]" aria-hidden="true">add</span>
          New Application
        </button>
      </div>

      {/* Utility links */}
      <div className="px-3 pb-2 space-y-0.5 border-t pt-2" style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
        {[
          { icon: 'upload_file', label: 'Import Resume', route: '/app/import' },
          { icon: 'settings',    label: 'Settings',      route: '/app/settings' },
        ].map(item => (
          <button
            key={item.route}
            onClick={() => navigate(item.route)}
            aria-current={location.pathname === item.route ? 'page' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-white transition-all"
            style={{ color: '#44474d' }}>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          onClick={() => navigate('/app/extension')}
          aria-current={location.pathname === '/app/extension' ? 'page' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-white transition-all"
          style={{ color: '#44474d' }}>
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">extension</span>
          <span className="flex-1 text-left">Chrome Extension</span>
          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
            Pro
          </span>
        </button>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: 'rgba(3,22,49,0.04)' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-black overflow-hidden"
            style={{ background: profile?.avatar_url ? 'none' : 'linear-gradient(135deg, #031631, #0e0099)' }}
            aria-hidden="true">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: '#031631' }}>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color: '#75777e' }}>{isPro ? 'Pro Plan' : 'Free Plan'}</p>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            aria-label="Sign out"
            className="p-1.5 rounded-lg hover:bg-[#eceef0] transition-all disabled:opacity-50"
            style={{ color: '#75777e' }}>
            {isSigningOut
              ? <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">progress_activity</span>
              : <span className="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
            }
          </button>
        </div>
      </div>
    </nav>
    </>
  )
}
