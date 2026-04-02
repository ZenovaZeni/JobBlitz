import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { useSessions } from '../hooks/useSessions'

function StatCard({ icon, value, label, color = '#031631' }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}12` }}>
        <span className="material-symbols-outlined icon-filled text-[22px]" style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-none mb-0.5" style={{ fontFamily: 'Manrope', color: '#031631' }}>{value}</div>
        <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#75777e' }}>{label}</div>
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
        <p className="text-xs" style={{ color: '#75777e' }}>{time}</p>
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

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />
      <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 md:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-1"
              style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.02em' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName}.
            </h1>
            <p style={{ color: '#44474d' }}>
              {sessions.length === 0
                ? 'Start by building your master profile or importing your resume.'
                : `You have ${sessions.length} tailoring ${sessions.length === 1 ? 'session' : 'sessions'} saved.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <button onClick={() => navigate('/pricing')}
                className="px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:shadow-sm"
                style={{ borderColor: 'rgba(14,0,153,0.2)', color: '#0e0099', backgroundColor: '#e1e0ff' }}>
                {sessionsLeft === Infinity ? 'Unlimited' : sessionsLeft} free sessions left · Upgrade
              </button>
            )}
            {isPro && (
              <span className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>Pro</span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard icon="description" value={sessions.length} label="Sessions" color="#031631" />
          <StatCard icon="analytics" value={avgMatchScore > 0 ? `${avgMatchScore}%` : '—'} label="Avg Match" color="#0e0099" />
          <StatCard icon="account_circle" value={`${masterProfile?.completion_pct ?? 0}%`} label="Profile" color="#2f2ebe" />
          <StatCard icon="mail" value="—" label="Letters" color="#44474d" />
        </div>

        {/* Main bento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Primary CTA */}
          <div className="lg:col-span-2 rounded-2xl p-8 text-white flex flex-col justify-between min-h-[220px]"
            style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <span className="material-symbols-outlined icon-filled text-[12px]">bolt</span>
                AI-POWERED
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Manrope' }}>
                Tailor to a New Job
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                Paste a job description and get a tailored resume, cover letter, and interview prep in minutes.
              </p>
            </div>
            <button onClick={() => navigate('/app/tailor')}
              className="self-start mt-6 px-6 py-3 bg-white font-bold rounded-xl transition-all hover:shadow-lg flex items-center gap-2"
              style={{ color: '#031631' }}>
              <span className="material-symbols-outlined icon-filled text-[18px]">auto_awesome</span>
              Start Session
            </button>
          </div>

          {/* Master Profile status */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>account_circle</span>
              <h3 className="font-bold" style={{ color: '#031631' }}>Master Profile</h3>
            </div>
            {profileLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 rounded bg-[#eceef0] w-3/4" />
                <div className="h-3 rounded bg-[#eceef0] w-1/2" />
              </div>
            ) : masterProfile ? (
              <>
                <p className="font-extrabold truncate mb-0.5" style={{ color: '#031631' }}>{masterProfile.name || 'Unnamed'}</p>
                <p className="text-xs mb-4" style={{ color: '#44474d' }}>{masterProfile.title || 'No title'}</p>
                {/* Mini progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#44474d' }}>Completion</span>
                    <span className="font-bold" style={{ color: '#0e0099' }}>{masterProfile.completion_pct}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${masterProfile.completion_pct}%`, background: 'linear-gradient(90deg, #0e0099, #2f2ebe)' }} />
                  </div>
                </div>
                <button onClick={() => navigate('/app/profile')}
                  className="text-xs font-bold mt-2 transition-colors hover:opacity-70"
                  style={{ color: '#0e0099' }}>
                  Continue editing →
                </button>
              </>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: '#44474d' }}>Build your career vault once — use it for every application.</p>
                <button onClick={() => navigate('/app/import')}
                  className="w-full py-3 text-white font-bold text-sm rounded-xl ai-glow-btn">
                  Import Resume
                </button>
                <button onClick={() => navigate('/app/profile')}
                  className="w-full py-2.5 text-sm font-bold mt-2 transition-all hover:bg-[#f2f4f6] rounded-xl"
                  style={{ color: '#031631' }}>
                  Build from scratch
                </button>
              </>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: '#031631' }}>Recent Sessions</h3>
              {sessions.length > 0 && (
                <button onClick={() => navigate('/app/resumes')} className="text-xs font-bold"
                  style={{ color: '#0e0099' }}>View all →</button>
              )}
            </div>
            {sessionsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-12 rounded-xl" style={{ backgroundColor: '#f2f4f6' }} />)}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>description</span>
                <p className="text-sm" style={{ color: '#44474d' }}>No sessions yet. Tailor your first resume to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 4).map(session => (
                  <div key={session.id} className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-[#f7f9fb] cursor-pointer"
                    onClick={() => {
                      setActiveSession({ sessionId: session.id, company: session.company, role: session.role, matchData: { match_score: session.match_score, matched_skills: session.matched_skills, gaps: session.gaps, ats_keywords: session.ats_keywords } })
                      navigate('/app/editor')
                    }}>
                    <div className="w-2 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: session.match_score >= 80 ? '#0e0099' : '#c5c6ce' }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#031631' }}>{session.role}</p>
                      <p className="text-xs" style={{ color: '#44474d' }}>{session.company} · {timeAgo(session.created_at)}</p>
                    </div>
                    {session.match_score && (
                      <span className="text-sm font-black flex-shrink-0" style={{ fontFamily: 'Manrope', color: '#0e0099' }}>
                        {session.match_score}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#031631' }}>Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-sm" style={{ color: '#75777e' }}>Your activity will appear here.</p>
            ) : (
              recentActivity.map((a, i) => (
                <ActivityItem key={i} text={a.text} time={a.time} dot={a.dot} />
              ))
            )}
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {[
              { icon: 'description', label: 'Resume Portfolio', sub: `${sessions.length} versions`, route: '/app/resumes' },
              { icon: 'mail', label: 'Cover Letters', sub: 'Manage all letters', route: '/app/cover-letter' },
              { icon: 'psychology', label: 'Interview Prep', sub: 'Practice STAR answers', route: '/app/interview' },
            ].map(card => (
              <button key={card.label} onClick={() => navigate(card.route)}
                className="bg-white rounded-2xl p-6 text-left transition-all hover:shadow-md hover:-translate-y-0.5 group"
                style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                <span className="material-symbols-outlined icon-filled text-[24px] mb-3 block" style={{ color: '#c5c6ce' }}>{card.icon}</span>
                <p className="font-bold" style={{ color: '#031631' }}>{card.label}</p>
                <p className="text-xs mt-1" style={{ color: '#75777e' }}>{card.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
