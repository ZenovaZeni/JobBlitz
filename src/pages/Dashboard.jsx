import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import QuickStartWizard from '../components/dashboard/QuickStartWizard'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { useSessions } from '../hooks/useSessions'

function StatCard({ icon, value, label, color = '#031631' }) {
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
          {value}
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
  const { user, profile, isPro, sessionsLeft } = useAuth()
  const { setActiveSession } = useSession()
  const { profile: masterProfile, loading: profileLoading } = useMasterProfile()
  const { sessions, loading: sessionsLoading } = useSessions()
  const [showRetry, setShowRetry] = useState(false)
  const [forceEntry, setForceEntry] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('jb_onboarding_skipped')
  })

  function handleSkip() {
    localStorage.setItem('jb_onboarding_skipped', 'true')
    setShowOnboarding(false)
  }

  useEffect(() => {
    let timer
    if (sessionsLoading && !forceEntry) {
      timer = setTimeout(() => {
        setShowRetry(true)
      }, 12000)
    }
    return () => clearTimeout(timer)
  }, [sessionsLoading, forceEntry])

  const firstName = (profile?.full_name || user?.email || 'there').split('@')[0].split(' ')[0]
  const avgMatchScore = sessions?.length && sessions.some(s => s.match_score)
    ? Math.round(sessions.filter(s => s.match_score).reduce((a, s) => a + s.match_score, 0) / sessions.filter(s => s.match_score).length)
    : 0

  const recentActivity = sessions?.slice(0, 5).map(s => ({
    text: `Tailored resume for ${s.role} at ${s.company}`,
    time: timeAgo(s.created_at),
    dot: s.match_score >= 80 ? '#0e0099' : '#44474d',
  })) || []

  const hasSessions = (sessions?.length || 0) > 0

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'

  if (sessionsLoading && !forceEntry) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
        <SideNav />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {!showRetry ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#031631] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-[#031631] animate-pulse">Syncing Dashboard…</p>
            </div>
          ) : (
            <div className="max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-amber-100">
                <span className="material-symbols-outlined text-amber-500 text-3xl">sync_problem</span>
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: '#031631' }}>Sync is taking a while</h2>
              <p className="text-sm font-medium mb-8" style={{ color: '#8293b4' }}>
                We're having trouble reaching the database. You can try refreshing or enter the dashboard anyway.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-4 text-white font-bold rounded-2xl ai-glow-btn">
                  Retry Sync
                </button>
                <button 
                  onClick={() => setForceEntry(true)}
                  className="w-full py-3 text-sm font-bold rounded-2xl transition-all hover:bg-white"
                  style={{ color: '#031631' }}>
                  Enter Dashboard Anyway
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

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
        <main className="flex-1 overflow-y-auto custom-scroll px-4 md:px-8 lg:px-10 py-6 md:py-8 pb-24 md:pb-10">

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
                    Take 2 minutes to set up your first tailoring session.
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
                  Start your first tailoring session to see analytics, tailored resumes, and cover letters here.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto sm:max-w-none">
                  <button
                    onClick={() => navigate('/app/tailor')}
                    className="flex items-center justify-center gap-3 py-4 text-white font-bold rounded-2xl ai-glow-btn active:scale-95 transition-all">
                    <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                    Start First Session
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
                {/* Mobile quick-action — Start New Session immediately visible on phone */}
                <div className="md:hidden mb-5">
                  <button
                    onClick={() => navigate('/app/tailor')}
                    className="w-full py-4 text-white font-bold rounded-2xl ai-glow-btn flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                    Start New Session
                  </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
                  <StatCard icon="description" value={sessions.length} label="Sessions" color="#031631" />
                  <StatCard icon="analytics" value={avgMatchScore > 0 ? `${avgMatchScore}%` : '—'} label="Avg Match" color="#0e0099" />
                  <StatCard icon="account_circle" value={`${masterProfile?.completion_pct ?? 0}%`} label="Profile" color="#2f2ebe" />
                  <StatCard icon="mail" value={sessions.filter(s => s.cover_letter).length || '—'} label="Letters" color="#44474d" />
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

                  {/* Primary CTA card — desktop only (mobile uses the strip above) */}
                  <div className="hidden md:flex lg:col-span-2 rounded-2xl p-8 text-white flex-col justify-between min-h-[200px] relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)', boxShadow: '0 8px 32px rgba(14,0,153,0.2)' }}>
                    <div className="relative z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                        <span className="material-symbols-outlined icon-filled text-[12px]">bolt</span>
                        Ready to tailor
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2"
                        style={{ fontFamily: 'Manrope' }}>
                        Boost Your Next Application
                      </h2>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}>
                        Generate a tailored resume and cover letter for any job in seconds.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/app/tailor')}
                      className="relative z-10 self-start mt-6 px-6 py-3 bg-white font-black rounded-xl transition-all hover:shadow-xl active:scale-95 flex items-center gap-2"
                      style={{ color: '#031631' }}>
                      <span className="material-symbols-outlined icon-filled text-[18px]">auto_awesome</span>
                      Start New Session
                    </button>
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
                    {profileLoading ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 rounded bg-[#eceef0] w-3/4" />
                        <div className="h-3 rounded bg-[#eceef0] w-1/2" />
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
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => navigate('/app/profile')}
                            className="text-xs font-bold transition-all hover:translate-x-0.5 flex items-center gap-1"
                            style={{ color: '#0e0099' }}>
                            Refine Profile
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

                  {/* Recent Sessions */}
                  <div className="lg:col-span-2 bg-white rounded-2xl p-5 md:p-6"
                    style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#0e0099' }}>history</span>
                        <h3 className="font-bold text-sm" style={{ color: '#031631' }}>Recent Sessions</h3>
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
                      {sessions.slice(0, 4).map(session => (
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
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-2xl p-5 md:p-6"
                    style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#0e0099' }}>timeline</span>
                      <h3 className="font-bold text-sm" style={{ color: '#031631' }}>Recent Activity</h3>
                    </div>
                    {recentActivity.length === 0 ? (
                      <div className="py-8 text-center">
                        <span className="material-symbols-outlined text-[28px] block mb-2" style={{ color: '#eceef0' }}>
                          pending_actions
                        </span>
                        <p className="text-xs font-semibold" style={{ color: '#b0b1bd' }}>
                          Activity will appear here after your first session.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {recentActivity.map((a, i) => (
                          <div key={i} className="flex items-start gap-3 py-3 border-b last:border-0"
                            style={{ borderColor: 'rgba(197,198,206,0.08)' }}>
                            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: a.dot }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: '#031631' }}>{a.text}</p>
                              <p className="text-[10px] font-bold mt-0.5" style={{ color: '#b0b1bd' }}>{a.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick links */}
                  <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    {[
                      { icon: 'description', label: 'Resume Portfolio', sub: `${sessions.length} tailored versions`, route: '/app/resumes', color: '#031631' },
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
