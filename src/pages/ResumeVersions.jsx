import { useEffect } from 'react'
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

  useEffect(() => { document.title = 'JobBlitz — My Applications' }, [])

  const avgScore = sessions.length && sessions.some(s => s.match_score)
    ? Math.round(sessions.filter(s => s.match_score).reduce((a, s) => a + s.match_score, 0) / sessions.filter(s => s.match_score).length)
    : null

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Glass-panel sticky header */}
        <header className="glass-panel border-b px-4 md:px-8 py-3 md:py-4 flex items-center justify-between flex-shrink-0 z-10"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>Applications</p>
            <h1 className="text-base md:text-lg font-black truncate tracking-tight"
              style={{ fontFamily: 'Manrope', color: '#031631' }}>
              My Applications
              {!loading && sessions.length > 0 && (
                <span className="ml-2 text-sm font-semibold" style={{ color: '#8293b4' }}>
                  {sessions.length} {sessions.length === 1 ? 'application' : 'applications'}{avgScore ? ` · ${avgScore}% avg` : ''}
                </span>
              )}
            </h1>
          </div>
          <button onClick={() => navigate('/app/tailor')}
            className="flex-shrink-0 px-4 py-2 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center gap-2">
            <span className="material-symbols-outlined icon-filled text-[16px]">add</span>
            <span className="hidden sm:inline">New Application</span>
            <span className="sm:hidden">New</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scroll page-pb-mobile md:pb-8">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8">

        {/* Master Profile Banner */}
        {masterProfile && (
          <div className="mb-8 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white"
            style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <span className="material-symbols-outlined icon-filled text-[28px]">account_circle</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Master Profile
              </div>
              <h3 className="font-extrabold text-xl truncate" style={{ fontFamily: 'Manrope' }}>
                {masterProfile.name || 'Unnamed Profile'}
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {masterProfile.title || 'No title set'} · {masterProfile.completion_pct ?? 0}% complete
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                This profile powers every packet you generate.
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
                  Open Latest Packet
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
          <div className="flex flex-col items-center justify-center py-20 gap-8 text-center px-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f2f4f6, #eceef0)' }}>
              <span className="material-symbols-outlined text-[40px]" style={{ color: '#8293b4' }}>description</span>
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-black mb-3 tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                No applications yet
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#75777e' }}>
                Paste a job description and get a complete application packet — tailored resume, cover letter, and interview prep — in one step.
              </p>
              {/* What you'll get */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
                {[
                  { icon: 'description', label: 'Tailored Resume', sub: 'Rewritten to match the role' },
                  { icon: 'mail', label: 'Cover Letter', sub: 'Personalized to the company' },
                  { icon: 'psychology', label: 'Interview Prep', sub: 'STAR-method questions' },
                ].map(f => (
                  <div key={f.label} className="p-3 rounded-xl text-left"
                    style={{ backgroundColor: 'white', boxShadow: '0 2px 8px rgba(3,22,49,0.04)' }}>
                    <span className="material-symbols-outlined text-[20px] mb-1.5 block" style={{ color: '#0e0099' }}>{f.icon}</span>
                    <p className="text-xs font-black text-[#031631] mb-0.5">{f.label}</p>
                    <p className="text-[10px] text-[#8293b4]">{f.sub}</p>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => navigate('/app/tailor')}
              className="px-8 py-3.5 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2 shadow-lg active:scale-95 transition-all">
              <span className="material-symbols-outlined icon-filled text-[18px]">bolt</span>
              Build Your First Packet
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
                    {/* packet_status badge — shown for non-ready terminal states */}
                    {session.packet_status === 'generating' && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1"
                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#0e0099' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0e0099] animate-pulse" />
                        Generating
                      </span>
                    )}
                    {session.packet_status === 'failed' && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full"
                        style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                        Failed
                      </span>
                    )}
                    {session.packet_status === 'applied' && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#2e7d32' }}>
                        Applied
                      </span>
                    )}
                    {isLatest && session.packet_status !== 'generating' && (
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

                    <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: '#c5c6ce' }}>
                      Added {timeAgo(session.created_at)}
                    </p>

                    {/* Packet completion — which of the 3 are ready */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {[
                        { key: 'resume',    label: 'Resume',    has: session.resume_versions?.length > 0 },
                        { key: 'cover',     label: 'Cover',     has: session.cover_letters?.length > 0    },
                        { key: 'interview', label: 'Interview', has: session.interview_prep?.length > 0   },
                      ].map(item => (
                        <span key={item.key}
                          className="px-2 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            backgroundColor: item.has ? '#e8f5e9' : '#f2f4f6',
                            color: item.has ? '#2e7d32' : '#c5c6ce',
                          }}>
                          {item.label}
                        </span>
                      ))}
                    </div>

                    {/* Tab shortcuts — labeled, color-coded by availability */}
                    <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'rgba(197,198,206,0.1)' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/app/session/${session.id}?tab=cover`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: session.cover_letters?.length > 0 ? '#e1e0ff' : '#f2f4f6',
                          color: session.cover_letters?.length > 0 ? '#0e0099' : '#c5c6ce',
                        }}
                        title="Open Cover Letter">
                        <span className="material-symbols-outlined text-[12px]">mail</span>
                        Cover Letter
                      </button>
                      <button
                        onClick={() => navigate(`/app/session/${session.id}?tab=interview`)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:opacity-80"
                        style={{
                          backgroundColor: session.interview_prep?.length > 0 ? '#e1e0ff' : '#f2f4f6',
                          color: session.interview_prep?.length > 0 ? '#0e0099' : '#c5c6ce',
                        }}
                        title="Open Interview Prep">
                        <span className="material-symbols-outlined text-[12px]">psychology</span>
                        Interview
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
              <p className="font-bold text-sm" style={{ color: '#c5c6ce' }}>New Application</p>
            </div>
          </div>
        )}
        </div>
      </main>
      </div>
    </div>
  )
}
