import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import QuickStartWizard from '../components/dashboard/QuickStartWizard'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { useSessions } from '../hooks/useSessions'

function StatCard({ icon, value, label, color = '#031631' }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-transparent transition-all hover:border-[#0e0099]/10 hover:shadow-xl" 
      style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12` }}>
        <span className="material-symbols-outlined icon-filled text-[22px]" style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-none mb-0.5" style={{ fontFamily: 'Manrope', color: '#031631' }}>{value}</div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[#8293b4]">{label}</div>
      </div>
    </div>
  )
}

function ActivityItem({ text, time, dot = '#0e0099' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
      <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: dot }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#031631' }}>{text}</p>
        <p className="text-xs font-bold text-[#b0b1bd]">{time}</p>
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

  const firstName = (profile?.full_name || user?.email || 'there').split(' ')[0]
  const avgMatchScore = sessions.length
    ? Math.round(sessions.filter(s => s.match_score).reduce((a, s) => a + s.match_score, 0) / sessions.filter(s => s.match_score).length) || 0
    : 0

  const recentActivity = sessions.slice(0, 5).map(s => ({
    text: `Tailored resume for ${s.role} at ${s.company}`,
    time: timeAgo(s.created_at),
    dot: s.match_score >= 80 ? '#0e0099' : '#44474d',
  }))

  const hasSessions = sessions.length > 0

  if (sessionsLoading) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
        <SideNav />
        <main className="flex-1 flex items-center justify-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-[#031631] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-[#031631] animate-pulse">Syncing Dashboard...</p>
           </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />
      <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 md:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-1"
              style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.025em' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}.
            </h1>
            <p className="text-sm font-semibold text-[#8293b4]">
              {hasSessions
                ? `You have ${sessions.length} active application ${sessions.length === 1 ? 'session' : 'sessions'}.`
                : 'Welcome to JobBlitz! Let\'s get your career moving.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <button onClick={() => navigate('/pricing')}
                className="px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:shadow-lg active:scale-95"
                style={{ borderColor: 'rgba(14,0,153,0.2)', color: '#0e0099', backgroundColor: '#e1e0ff' }}>
                {sessionsLeft === Infinity ? 'Unlimited' : sessionsLeft} free sessions left · Upgrade
              </button>
            )}
            {isPro && (
              <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>Pro</span>
            )}
          </div>
        </div>

        {!hasSessions ? (
          /* NEW USER WIZARDS / EMPTY STATE */
          <div className="py-6 md:py-10">
            <QuickStartWizard />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <StatCard icon="description" value={sessions.length} label="Sessions" color="#031631" />
              <StatCard icon="analytics" value={avgMatchScore > 0 ? `${avgMatchScore}%` : '—'} label="Avg Match" color="#0e0099" />
              <StatCard icon="account_circle" value={`${masterProfile?.completion_pct ?? 0}%`} label="Profile" color="#2f2ebe" />
              <StatCard icon="mail" value={sessions.filter(s => s.cover_letter).length || '—'} label="Letters" color="#44474d" />
            </div>

            {/* Main bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Primary CTA */}
              <div className="lg:col-span-2 rounded-2xl p-8 text-white flex flex-col justify-between min-h-[220px] relative overflow-hidden group shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <span className="material-symbols-outlined icon-filled text-[12px]">bolt</span>
                    Ready To Tailor
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Manrope' }}>
                    Boost Your Next App
                  </h2>
                  <p className="max-w-md" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 500 }}>
                    Create a new job session to generate a tailored resume and cover letter using your latest profile data.
                  </p>
                </div>
                <button onClick={() => navigate('/app/tailor')}
                  className="relative z-10 self-start mt-8 px-7 py-3.5 bg-white font-black rounded-xl transition-all hover:shadow-2xl active:scale-95 flex items-center gap-2 group"
                  style={{ color: '#031631' }}>
                  <span className="material-symbols-outlined icon-filled text-[18px] transition-transform group-hover:rotate-12">auto_awesome</span>
                  Start New Session
                </button>
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl" />
              </div>

              {/* Master Profile status */}
              <div className="bg-white rounded-2xl p-6 border border-transparent transition-all hover:border-[#0e0099]/5" 
                style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>account_circle</span>
                  <h3 className="font-bold text-[#031631]">Master Profile</h3>
                </div>
                {profileLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 rounded bg-[#eceef0] w-3/4" />
                    <div className="h-3 rounded bg-[#eceef0] w-1/2" />
                  </div>
                ) : masterProfile ? (
                  <>
                    <p className="font-extrabold truncate mb-0.5 text-[#031631]">{masterProfile.name || 'Unnamed User'}</p>
                    <p className="text-xs font-semibold text-[#8293b4] mb-4">{masterProfile.title || 'Career Profile'}</p>
                    {/* Mini progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] uppercase font-black tracking-widest mb-1.5">
                        <span style={{ color: '#b0b1bd' }}>Completion</span>
                        <span style={{ color: '#0e0099' }}>{masterProfile.completion_pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${masterProfile.completion_pct}%`, background: 'linear-gradient(90deg, #0e0099, #2f2ebe)' }} />
                      </div>
                    </div>
                    <button onClick={() => navigate('/app/profile')}
                      className="text-xs font-bold mt-2 transition-all hover:translate-x-1 text-[#0e0099] flex items-center gap-1">
                      Refine Profile <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium mb-4 text-[#44474d]">Build your career vault once — use it for every application.</p>
                    <button onClick={() => navigate('/app/import')}
                      className="w-full py-3 text-white font-bold text-sm rounded-xl ai-glow-btn shadow-lg">
                      Import Resume
                    </button>
                    <button onClick={() => navigate('/app/profile')}
                      className="w-full py-2.5 text-sm font-bold mt-2 transition-all hover:bg-[#f2f4f6] rounded-xl text-[#031631]">
                      Build from scratch
                    </button>
                  </>
                )}
              </div>

              {/* Recent Sessions */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#0e0099]">history</span>
                    <h3 className="font-bold text-[#031631]">Recent Sessions</h3>
                  </div>
                  {sessions.length > 0 && (
                    <button onClick={() => navigate('/app/resumes')} className="text-[11px] font-black uppercase tracking-widest text-[#0e0099] hover:opacity-70 transition-opacity">
                      View all
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {sessions.slice(0, 4).map(session => (
                    <div key={session.id} className="group flex items-center gap-4 p-3 rounded-2xl transition-all hover:bg-[#f7f9fb] border border-transparent hover:border-[#0e0099]/5 cursor-pointer"
                      onClick={() => navigate(`/app/session/${session.id}`)}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f2f4f6] group-hover:bg-white transition-colors">
                        <span className="material-symbols-outlined text-[20px] text-[#8293b4]">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate text-[#031631]">{session.role}</p>
                        <p className="text-xs font-semibold text-[#8293b4]">{session.company} · {timeAgo(session.created_at)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {session.match_score && (
                          <span className="text-xs font-black text-[#0e0099] px-2 py-0.5 rounded-lg bg-[#e1e0ff]">
                            {session.match_score}% Match
                          </span>
                        )}
                        <span className="material-symbols-outlined text-[16px] text-[#c5c6ce] opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">chevron_right</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[18px] text-[#0e0099]">insights</span>
                  <h3 className="font-bold text-[#031631]">Real-time Insights</h3>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="py-10 text-center">
                    <span className="material-symbols-outlined text-[32px] text-[#eceef0] mb-2">pending_actions</span>
                    <p className="text-xs font-semibold text-[#b0b1bd]">Your career metrics will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentActivity.map((a, i) => (
                      <ActivityItem key={i} text={a.text} time={a.time} dot={a.dot} />
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: 'description', label: 'Resume Vault', sub: `${sessions.length} Versions`, route: '/app/resumes', color: '#031631' },
                  { icon: 'mail', label: 'Cover Letters', sub: 'Saved Outlines', route: '/app/cover-letter', color: '#0e0099' },
                  { icon: 'psychology', label: 'Career Prep', sub: 'Interactive STARs', route: '/app/interview', color: '#2f2ebe' },
                ].map(card => (
                  <button key={card.label} onClick={() => navigate(card.route)}
                    className="bg-white rounded-2xl p-6 text-left border border-transparent transition-all hover:shadow-xl hover:border-[#0e0099]/10 group"
                    style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: `${card.color}10` }}>
                      <span className="material-symbols-outlined icon-filled text-[20px]" style={{ color: card.color }}>{card.icon}</span>
                    </div>
                    <p className="font-extrabold text-[#031631] text-base leading-tight mb-1">{card.label}</p>
                    <p className="text-xs font-bold text-[#8293b4] uppercase tracking-widest">{card.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
