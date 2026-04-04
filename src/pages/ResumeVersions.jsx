import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useSessions } from '../hooks/useSessions'
import { useMasterProfile } from '../hooks/useMasterProfile'

function timeAgo(isoDate) {
  const diff = (Date.now() - new Date(isoDate)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function scoreColor(score) {
  if (!score) return '#c5c6ce'
  if (score >= 85) return '#0e0099'
  if (score >= 75) return '#2f2ebe'
  if (score >= 65) return '#44474d'
  return '#75777e'
}

// Deterministic accent color per session for card headers
const CARD_COLORS = ['#031631', '#0e0099', '#2f2ebe', '#374765', '#3c475a', '#545f72']
function accentColor(idx) { return CARD_COLORS[idx % CARD_COLORS.length] }

function ScoreBadge({ score }) {
  const color = scoreColor(score)
  return (
    <div className="relative w-9 h-9">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" stroke="#eceef0" strokeWidth="4" fill="none" />
        <circle cx="18" cy="18" r="14" stroke={color} strokeWidth="4" fill="none"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 14}`}
          strokeDashoffset={`${2 * Math.PI * 14 * (1 - (score || 0) / 100)}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black" style={{ color }}>
        {score ?? '—'}
      </span>
    </div>
  )
}

export default function ResumeVersions() {
  const navigate = useNavigate()
  const { sessions, loading } = useSessions()
  const { profile: masterProfile } = useMasterProfile()

  function openSession(session) {
    navigate(`/app/session/${session.id}`)
  }

  const avgScore = sessions.length && sessions.some(s => s.match_score)
    ? Math.round(sessions.filter(s => s.match_score).reduce((a, s) => a + s.match_score, 0) / sessions.filter(s => s.match_score).length)
    : null

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 md:py-12 overflow-y-auto pb-24 md:pb-12 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2"
              style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.02em' }}>
              Resume Portfolio
            </h1>
            <p style={{ color: '#44474d' }}>
              {loading ? 'Loading...' : sessions.length > 0
                ? `${sessions.length} tailored ${sessions.length === 1 ? 'version' : 'versions'}${avgScore ? ` · Avg match: ${avgScore}%` : ''}`
                : 'No tailored versions yet'}
            </p>
          </div>
          <button onClick={() => navigate('/app/tailor')}
            className="self-start md:self-auto px-6 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center gap-2">
            <span className="material-symbols-outlined icon-filled text-[18px]">add</span>
            New Version
          </button>
        </div>

        {/* Master Profile Banner */}
        {masterProfile && (
          <div className="mb-8 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white"
            style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className="material-symbols-outlined icon-filled text-[28px]">account_circle</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                MASTER PROFILE
              </div>
              <h3 className="font-extrabold text-xl truncate" style={{ fontFamily: 'Manrope' }}>
                {masterProfile.name || 'Unnamed Profile'}
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {masterProfile.title || 'No title set'} · {masterProfile.completion_pct ?? 0}% complete
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/app/profile')}
                className="px-5 py-2.5 bg-white rounded-xl font-bold text-sm transition-all hover:shadow-md"
                style={{ color: '#031631' }}>
                Edit Profile
              </button>
              {sessions.length > 0 && (
                <button onClick={() => navigate(`/app/session/${sessions[0].id}`)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm border transition-all hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                  View Latest
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                <div className="h-24" style={{ backgroundColor: '#eceef0' }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded-full w-3/4" style={{ backgroundColor: '#f2f4f6' }} />
                  <div className="h-3 rounded-full w-1/2" style={{ backgroundColor: '#f2f4f6' }} />
                  <div className="h-3 rounded-full w-2/3" style={{ backgroundColor: '#f2f4f6' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
              <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>description</span>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No sessions yet</h2>
              <p className="max-w-sm text-sm" style={{ color: '#44474d' }}>
                Run your first tailoring session to generate a personalized resume.
              </p>
            </div>
            <button onClick={() => navigate('/app/tailor')}
              className="px-6 py-3 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2">
              <span className="material-symbols-outlined icon-filled text-[18px]">bolt</span>
              Start Tailoring
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sessions.map((session, idx) => {
              const color = accentColor(idx)
              const isLatest = idx === 0
              return (
                <div key={session.id}
                  className="bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer hover:-translate-y-1 hover:shadow-xl group"
                  style={{
                    borderColor: 'rgba(197,198,206,0.1)',
                    boxShadow: '0 4px 20px rgba(3,22,49,0.04)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onClick={() => openSession(session)}>

                  {/* Color header */}
                  <div className="relative h-24 flex items-end pb-4 px-5" style={{ backgroundColor: color }}>
                    {isLatest && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-white"
                        style={{ color }}>
                        LATEST
                      </span>
                    )}
                    <ScoreBadge score={session.match_score} />
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-extrabold text-base tracking-tight mb-0.5 truncate"
                      style={{ fontFamily: 'Manrope', color: '#031631' }}>
                      {session.role}
                    </h3>
                    <p className="text-xs font-semibold mb-4 truncate" style={{ color }}>
                      {session.company}
                    </p>

                    {/* Skills preview */}
                    {session.matched_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {session.matched_skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: '#f2f4f6', color: '#44474d' }}>
                            {skill}
                          </span>
                        ))}
                        {session.matched_skills.length > 3 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: '#f2f4f6', color: '#75777e' }}>
                            +{session.matched_skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: '#c5c6ce' }}>
                      {timeAgo(session.created_at)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/app/session/${session.id}?tab=resume`)}
                        className="flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all hover:opacity-90 text-white"
                        style={{ backgroundColor: color }}>
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/app/session/${session.id}?tab=cover`)}
                        className="p-2 rounded-lg transition-all hover:bg-[#eceef0]"
                        style={{ color: '#44474d' }}
                        title="Cover Letter">
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                      </button>
                      <button
                        onClick={() => navigate(`/app/session/${session.id}?tab=interview`)}
                        className="p-2 rounded-lg transition-all hover:bg-[#eceef0]"
                        style={{ color: '#44474d' }}
                        title="Interview Prep">
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add new card */}
            <div onClick={() => navigate('/app/tailor')}
              className="border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-[#0e0099] group min-h-[280px]"
              style={{ borderColor: '#c5c6ce' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ backgroundColor: '#eceef0' }}>
                <span className="material-symbols-outlined text-[28px]" style={{ color: '#c5c6ce' }}>add</span>
              </div>
              <p className="font-bold text-sm" style={{ color: '#c5c6ce' }}>New Tailored Version</p>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
