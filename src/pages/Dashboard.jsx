import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import QuickStartWizard from '../components/dashboard/QuickStartWizard'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { useSessions } from '../hooks/useSessions'

function StatCard({ icon, value, label, color = '#031631', loading = false }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 flex items-center gap-3 md:gap-4 border border-transparent transition-all hover:border-[#0e0099]/10 hover:shadow-lg"
      style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12` }}>
        <span className="material-symbols-outlined icon-filled text-[20px] md:text-[22px]" style={{ color }}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-xl md:text-2xl font-extrabold leading-none mb-0.5 truncate"
          style={{ fontFamily: 'Manrope', color: '#031631' }}>
          {loading ? (
            <div className="w-12 h-6 bg-[#eceef0] rounded-lg animate-pulse" />
          ) : value}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8293b4]">{label}</div>
      </div>
    </div>
  )
}

function timeAgo(isoDate) {
  const diff = (Date.now() - new Date(isoDate)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, isPro, sessionsLeft, isProfileReady } = useAuth()
  const { setActiveSession } = useSession()
  const { profile: masterProfile, loading: masterProfileLoading } = useMasterProfile()
  const { sessions, loading: sessionsLoading, getPacketStats } = useSessions()
  const [showRetry, setShowRetry] = useState(false)
  const [mountTime] = useState(() => performance.now())
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('jb_onboarding_skipped')
  })

  function handleSkip() {
    localStorage.setItem('jb_onboarding_skipped', 'true')
    setShowOnboarding(false)
  }

  useEffect(() => {
    let timer
    if (sessionsLoading) {
      timer = setTimeout(() => {
        setShowRetry(true)
      }, 12000)
    }
    return () => clearTimeout(timer)
  }, [sessionsLoading])

  useEffect(() => { document.title = 'JobBlitz — Dashboard' }, [])

  const firstName = (profile?.full_name || user?.email || 'there').split('@')[0].split(' ')[0]
  const avgMatchScore = sessions?.length && sessions.some(s => s.match_score)
    ? Math.round(sessions.filter(s => s.match_score).reduce((a, s) => a + s.match_score, 0) / sessions.filter(s => s.match_score).length)
    : 0

  const hasSessions = (sessions?.length || 0) > 0

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'

  // Latest packet statistics using standardized logic
  const latestSession = (sessions?.length || 0) > 0 
    ? sessions.find(s => s.packet_status !== 'draft' && s.packet_status !== 'failed') || sessions[0] 
    : null
  
  const { readyCount, isComplete, hasResume, hasCover, hasInterview, statusLabel } = getPacketStats(latestSession)
  const isGenerating = statusLabel === 'generating' || (statusLabel === 'ready' && readyCount < 3 && sessionsLoading)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky header — greeting + Settings access (mobile) + plan badge */}
        <header
          className="glass-panel border-b flex-shrink-0 z-20 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
              Dashboard
            </p>
            <h1 className="text-base md:text-lg font-black tracking-tight truncate"
              style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Good {greeting}, {firstName}.
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {/* Settings — mobile only (SideNav handles desktop) */}
            <button
              onClick={() => navigate('/app/settings')}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-[#eceef0]"
              style={{ color: '#44474d' }}>
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>

            {!isPro && (
              <button
                onClick={() => navigate('/pricing')}
                className="px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-xl border transition-all hover:shadow-md active:scale-95"
                style={{ borderColor: 'rgba(14,0,153,0.2)', color: '#0e0099', backgroundColor: 'rgba(225,224,255,0.4)' }}>
                <span className="hidden sm:inline">{sessionsLeft === Infinity ? 'Unlimited' : sessionsLeft} left · </span>Upgrade
              </button>
            )}
            {isPro && (
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
                Pro
              </span>
            )}
          </div>
        </header>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto custom-scroll px-4 md:px-8 lg:px-10 py-6 md:py-8 page-pb-mobile md:pb-10">

          {/* Onboarding wizard overlay */}
          {!hasSessions && showOnboarding && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              style={{ backgroundColor: 'rgba(247,249,251,0.85)', backdropFilter: 'blur(6px)' }}>
              <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                    style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                    <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                    First time here?
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2"
                    style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Let's get you hired.
                  </h2>
                  <p className="font-medium" style={{ color: '#8293b4' }}>
                    Take 2 minutes to set up your first application packet.
                  </p>
                </div>
                <QuickStartWizard onSkip={handleSkip} />
              </div>
            </div>
          )}

          <div className={(!hasSessions && showOnboarding) ? 'blur-sm pointer-events-none opacity-40 select-none' : ''}>

            {/* Empty state */}
            {!hasSessions && !showOnboarding ? (
              <div className="py-10 md:py-16 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 border"
                  style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
                  <span className="material-symbols-outlined text-[32px] icon-filled" style={{ color: '#0e0099' }}>
                    dashboard_customize
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-3"
                  style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  Your dashboard is ready.
                </h2>
                <p className="text-base mb-8" style={{ color: '#8293b4' }}>
                  Build your first application packet to see analytics, tailored resumes, and cover letters here.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto sm:max-w-none">
                  <button
                    onClick={() => navigate('/app/tailor')}
                    className="flex items-center justify-center gap-3 py-4 text-white font-bold rounded-2xl ai-glow-btn active:scale-95 transition-all">
                    <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                    Get Started
                  </button>
                  <button
                    onClick={() => navigate('/app/profile')}
                    className="flex items-center justify-center gap-3 py-4 font-bold rounded-2xl border transition-all hover:bg-white hover:shadow-sm"
                    style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}>
                    <span className="material-symbols-outlined text-[20px]">account_circle</span>
                    Build Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile quick-action — context-aware: continue in-progress or start new */}
                <div className="md:hidden mb-5">
                  {latestSession ? (
                    <div className="rounded-2xl p-4 space-y-3"
                      style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5 whitespace-nowrap">
                          {isGenerating ? 'Generating Packet...' : readyCount < 3 ? 'In Progress' : 'Latest Packet'}
                        </p>
                        <p className="text-sm font-black text-white truncate leading-tight">
                          {latestSession.role}
                        </p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          {latestSession.company} · {isGenerating ? 'Processing assets...' : `${readyCount} of 3 ready`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/app/session/${latestSession.id}`)}
                          className="flex-1 py-2.5 bg-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          style={{ color: '#031631' }}>
                          <span className="material-symbols-outlined icon-filled text-[15px]">
                            {isGenerating ? 'hourglass_empty' : readyCount < 3 ? 'arrow_forward' : 'folder_open'}
                          </span>
                          {isGenerating ? 'View Status' : readyCount < 3 ? 'Continue Packet' : 'Open Packet'}
                        </button>
                        <button
                          onClick={() => navigate('/app/tailor')}
                          title="New Application"
                          className="w-10 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                          style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white', backgroundColor: 'transparent' }}>
                          <span className="material-symbols-outlined icon-filled text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/app/tailor')}
                      className="w-full py-4 text-white font-bold rounded-2xl ai-glow-btn flex items-center justify-center gap-2 active:scale-95 transition-all">
                      <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                      New Application
                    </button>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-5 md:mb-6">
                  <StatCard icon="description" value={sessions?.length || 0} label="Applications" color="#031631" loading={sessionsLoading} />
                  <StatCard icon="analytics" value={avgMatchScore > 0 ? `${avgMatchScore}%` : '—'} label="Avg Match" color="#0e0099" loading={sessionsLoading} />
                  <StatCard icon="account_circle" value={`${masterProfile?.completion_pct ?? 0}%`} label="Profile" color="#2f2ebe" loading={masterProfileLoading} />
                  <StatCard icon="mail" value={sessions?.filter(s => s.cover_letters?.length > 0).length || '—'} label="Letters" color="#44474d" loading={sessionsLoading} />
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">

                  {/* Primary CTA card — desktop only (mobile uses the strip above) */}
                  <div className="hidden md:flex lg:col-span-2 rounded-2xl p-8 text-white flex-col justify-between min-h-[220px] relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)', boxShadow: '0 8px 32px rgba(14,0,153,0.2)' }}>
                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <span className="material-symbols-outlined icon-filled text-[12px]">bolt</span>
                        {latestSession && readyCount < 3 ? 'In progress' : 'Ready to tailor'}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2"
                        style={{ fontFamily: 'Manrope' }}>
                        {latestSession && readyCount < 3
                          ? `Continue: ${latestSession.role}`
                          : 'Build Your Next Packet'}
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {latestSession && readyCount < 3
                          ? `${latestSession.company} · ${readyCount} of 3 items ready`
                          : 'Tailored resume, cover letter, and interview prep — all from one analysis.'}
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 mt-6 flex-wrap">
                      {latestSession && readyCount < 3 && (
                        <button
                          onClick={() => navigate(`/app/session/${latestSession.id}`)}
                          className="px-6 py-3 bg-white font-black rounded-xl transition-all hover:shadow-xl active:scale-95 flex items-center gap-2"
                          style={{ color: '#031631' }}>
                          <span className="material-symbols-outlined icon-filled text-[18px]">arrow_forward</span>
                          Continue Packet
                        </button>
                      )}
                      {latestSession && readyCount === 3 && (
                        <button
                          onClick={() => navigate(`/app/session/${latestSession.id}`)}
                          className="px-6 py-3 bg-white font-black rounded-xl transition-all hover:shadow-xl active:scale-95 flex items-center gap-2"
                          style={{ color: '#031631' }}>
                          <span className="material-symbols-outlined icon-filled text-[18px]">folder_open</span>
                          Open Latest Packet
                        </button>
                      )}
                      <button
                        onClick={() => navigate('/app/tailor')}
                        className="px-6 py-3 font-black rounded-xl transition-all active:scale-95 flex items-center gap-2 hover:shadow-xl"
                        style={latestSession && readyCount < 3
                          ? { border: '1px solid rgba(255,255,255,0.25)', color: 'white', backgroundColor: 'transparent' }
                          : { backgroundColor: 'white', color: '#031631' }}>
                        <span className="material-symbols-outlined icon-filled text-[18px]">add</span>
                        New Application
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full translate-x-1/2 -translate-y-1/2"
                      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
                  </div>

                  {/* Master Profile status */}
                  <div className="bg-white rounded-2xl p-5 md:p-6 border border-transparent transition-all hover:border-[#0e0099]/5"
                    style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>
                        account_circle
                      </span>
                      <h3 className="font-bold text-sm" style={{ color: '#031631' }}>Master Profile</h3>
                    </div>
                    {masterProfileLoading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 rounded bg-[#eceef0] w-3/4" />
                        <div className="h-3 rounded bg-[#eceef0] w-1/2" />
                        <div className="space-y-1.5 mt-4">
                          <div className="h-2 rounded bg-[#eceef0] w-full" />
                          <div className="h-1.5 rounded bg-[#eceef0] w-full" />
                        </div>
                      </div>
                    ) : masterProfile ? (
                      <>
                        <p className="font-extrabold truncate mb-0.5" style={{ color: '#031631' }}>
                          {masterProfile.name || 'Unnamed User'}
                        </p>
                        <p className="text-xs font-semibold mb-4 truncate" style={{ color: '#8293b4' }}>
                          {masterProfile.title || 'Career Profile'}
                        </p>
                        <div className="mb-1">
                          <div className="flex justify-between text-[10px] uppercase font-black tracking-widest mb-1.5">
                            <span style={{ color: '#b0b1bd' }}>Completion</span>
                            <span style={{ color: '#0e0099' }}>{masterProfile.completion_pct}%</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${masterProfile.completion_pct}%`, background: 'linear-gradient(90deg, #0e0099, #2f2ebe)' }} />
                          </div>
                        </div>
                        <p className="text-[10px] mt-1.5 mb-3" style={{ color: '#b0b1bd' }}>
                          {masterProfile.completion_pct >= 80
                            ? 'Great coverage — your packets will be highly tailored.'
                            : 'More detail = more tailored packets.'}
                        </p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => navigate('/app/profile')}
                            className="text-xs font-bold transition-all hover:translate-x-0.5 flex items-center gap-1"
                            style={{ color: '#0e0099' }}>
                            {masterProfile.completion_pct >= 80 ? 'Edit Profile' : 'Complete Profile'}
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                          <button
                            onClick={() => navigate('/app/import')}
                            className="text-[10px] font-bold flex items-center gap-1 transition-all hover:opacity-70"
                            style={{ color: '#8293b4' }}>
                            <span className="material-symbols-outlined text-[12px]">upload_file</span>
                            Import
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm mb-4" style={{ color: '#44474d' }}>
                          Build your career vault once — use it for every application.
                        </p>
                        <button
                          onClick={() => navigate('/app/import')}
                          className="w-full py-2.5 text-white font-bold text-sm rounded-xl ai-glow-btn mb-2">
                          Import Resume
                        </button>
                        <button
                          onClick={() => navigate('/app/profile')}
                          className="w-full py-2.5 text-sm font-bold rounded-xl transition-all hover:bg-[#f2f4f6]"
                          style={{ color: '#031631' }}>
                          Build from scratch
                        </button>
                      </>
                    )}
                  </div>

                  {/* Recent Applications */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6"
                    style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#0e0099' }}>history</span>
                        <h3 className="font-bold text-sm" style={{ color: '#031631' }}>Recent Applications</h3>
                      </div>
                      {sessions.length > 0 && (
                        <button
                          onClick={() => navigate('/app/resumes')}
                          className="text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-60"
                          style={{ color: '#0e0099' }}>
                          View all
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {sessionsLoading ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                            <div className="w-9 h-9 rounded-xl bg-[#f2f4f6]" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-[#f2f4f6] rounded w-1/3" />
                              <div className="h-2 bg-[#f2f4f6] rounded w-1/4" />
                            </div>
                          </div>
                        ))
                      ) : sessions?.length > 0 ? (
                        sessions.slice(0, 4).map(session => (
                          <div
                            key={session.id}
                            className="group flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[#f7f9fb] cursor-pointer border border-transparent hover:border-[#0e0099]/5"
                            onClick={() => navigate(`/app/session/${session.id}`)}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#f2f4f6' }}>
                              <span className="material-symbols-outlined text-[18px]" style={{ color: '#8293b4' }}>description</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: '#031631' }}>{session.role}</p>
                              <p className="text-xs truncate" style={{ color: '#8293b4' }}>
                                {session.company} · {timeAgo(session.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Packet completion dots: Resume · Cover · Interview */}
                              <div className="flex items-center gap-1" title="Resume / Cover Letter / Interview Prep">
                                {[
                                  getPacketStats(session).hasResume,
                                  getPacketStats(session).hasCover,
                                  getPacketStats(session).hasInterview,
                                ].map((has, i) => (
                                  <span key={i} className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: has ? '#2e7d32' : '#eceef0' }} />
                                ))}
                              </div>
                              {session.match_score && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-lg"
                                  style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                                  {session.match_score}%
                                </span>
                              )}
                              <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: '#c5c6ce' }}>
                                chevron_right
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-semibold py-4 text-center" style={{ color: '#b0b1bd' }}>No applications yet — start one above.</p>
                      )}
                    </div>
                  </div>

                  {/* Latest Packet — continue working */}
                  <div className="bg-white rounded-2xl p-5 md:p-6 border border-transparent transition-all hover:border-[#0e0099]/5"
                    style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>folder_open</span>
                      <h3 className="font-bold text-sm" style={{ color: '#031631' }}>Latest Packet</h3>
                    </div>
                    {sessionsLoading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-[#eceef0] rounded w-3/4" />
                        <div className="h-3 bg-[#eceef0] rounded w-1/2" />
                        <div className="space-y-2 mt-5">
                          {[1, 2, 3].map(i => <div key={i} className="h-3 bg-[#eceef0] rounded" />)}
                        </div>
                      </div>
                    ) : latestSession ? (
                      <>
                        <div className="mb-4">
                          <p className="font-extrabold text-base truncate mb-0.5"
                            style={{ fontFamily: 'Manrope', color: '#031631' }}>
                            {latestSession.role}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: '#8293b4' }}>
                            {latestSession.company} · {timeAgo(latestSession.updated_at || latestSession.created_at)}
                          </p>
                          {latestSession.match_score && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-[10px] font-black"
                              style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                              {latestSession.match_score}% match
                            </span>
                          )}
                        </div>
                        <div className="space-y-2.5 mb-5">
                          {[
                            { label: 'Resume',         has: hasResume    },
                            { label: 'Cover Letter',   has: hasCover     },
                            { label: 'Interview Prep', has: hasInterview },
                          ].map(item => (
                            <div key={item.label} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.has ? '#2e7d32' : '#eceef0' }} />
                              <span className="text-xs font-semibold flex-1"
                                style={{ color: item.has ? '#031631' : '#c5c6ce' }}>
                                {item.label}
                              </span>
                              <span className="text-[9px] font-black uppercase tracking-wider"
                                style={{ color: item.has ? '#2e7d32' : '#c5c6ce' }}>
                                {item.has ? 'Ready' : 'Pending'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {readyCount === 3 ? (
                          <button
                            onClick={() => navigate(`/app/session/${latestSession.id}`)}
                            className="w-full py-2.5 font-bold rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ai-glow-btn text-white">
                            <span className="material-symbols-outlined icon-filled text-[16px]">folder_open</span>
                            Open Packet
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/app/session/${latestSession.id}`)}
                            className="w-full py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all hover:bg-[#f2f4f6]"
                            style={{ borderColor: 'rgba(197,198,206,0.2)', color: '#0e0099' }}>
                            View Details →
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="py-8 text-center">
                        <span className="material-symbols-outlined text-[28px] block mb-2" style={{ color: '#eceef0' }}>
                          folder_open
                        </span>
                        <p className="text-xs font-semibold" style={{ color: '#b0b1bd' }}>
                          Build your first packet to see it here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick links */}
                  <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    {[
                      { icon: 'description', label: 'Applications', sub: `${sessions?.length || 0} tailored ${sessions?.length === 1 ? 'resume' : 'resumes'}`, route: '/app/resumes', color: '#031631' },
                      { icon: 'mail', label: 'Cover Letters', sub: 'All saved letters', route: '/app/cover-letter', color: '#0e0099' },
                      { icon: 'psychology', label: 'Interview Prep', sub: 'STAR-method questions', route: '/app/interview', color: '#2f2ebe' },
                    ].map(card => (
                      <button
                        key={card.label}
                        onClick={() => navigate(card.route)}
                        className="bg-white rounded-2xl p-5 text-left border border-transparent transition-all hover:shadow-lg hover:border-[#0e0099]/10 group"
                        style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: `${card.color}10` }}>
                          <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: card.color }}>
                            {card.icon}
                          </span>
                        </div>
                        <p className="font-extrabold text-sm leading-tight mb-1" style={{ color: '#031631' }}>{card.label}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8293b4' }}>{card.sub}</p>
                      </button>
                    ))}
                  </div>

                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
