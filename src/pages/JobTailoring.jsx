import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import SideNav from '../components/SideNav'
import { useTailorEngine, TAILOR_STEPS } from '../hooks/useTailorEngine'
import { UpgradeGateModal } from '../components/tailoring/UpgradeGateModal'
import { TailoringSteps } from '../components/tailoring/TailoringSteps'
import MobileTailoringWizard from '../components/tailoring/MobileTailoringWizard'
import { useTypewriter } from '../hooks/useTypewriter'
import { JD_MAX_CHARS } from '../config/constants'
import { AtelierTemplate } from '../components/ResumeTemplates'

// ── Circular match score ──────────────────────────────────────────────────────
function MatchRing({ score, size = 120 }) {
  const safeScore = isNaN(score) || score == null ? 0 : Number(score)
  const r = size / 2 - 10
  const circ = 2 * Math.PI * r
  const color = safeScore >= 80 ? '#0e0099' : safeScore >= 60 ? '#2f2ebe' : '#44474d'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#eceef0" strokeWidth="8" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - safeScore / 100)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-3xl leading-none" style={{ fontFamily: 'Manrope', color }}>
          {safeScore}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#75777e' }}>
          Match
        </span>
      </div>
    </div>
  )
}

// ── Progressive preview cards (shown during analysis as steps complete) ───────

function MatchPreview({ matchData }) {
  const score = matchData.match_score || 0
  const color = score >= 80 ? '#0e0099' : score >= 60 ? '#2f2ebe' : '#44474d'
  const bg    = score >= 80 ? '#e1e0ff'  : score >= 60 ? '#e1e0ff'  : '#eceef0'
  const label = score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Fit' : 'Some Gaps'
  const summary = useTypewriter(matchData.summary || '', { wordsPerTick: 2, tickMs: 28 })

  return (
    <div className="w-full animate-slide-in" style={{ animationFillMode: 'both' }}>
      <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'rgba(197,198,206,0.2)', boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
        <div className="flex items-center gap-4 mb-4">
          <MatchRing score={score} size={64} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-black" style={{ color, fontFamily: 'Manrope' }}>{score}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: bg, color }}>{label}</span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#0e0099' }}>Match analysis complete</p>
          </div>
        </div>
        {summary && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#44474d' }}>{summary}</p>
        )}
        {matchData.matched_skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matchData.matched_skills.slice(0, 4).map(skill => (
              <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ResumePreview({ resumeData }) {
  // Show the tailored summary — most informative single piece of the resume
  const raw = resumeData?.summary || resumeData?.experience?.[0]?.bullets?.[0] || ''
  // Limit to first 2 sentences for a tight preview
  const dotIdx = raw.indexOf('. ', 60)
  const previewText = dotIdx > 0 ? raw.slice(0, dotIdx + 1) : raw.slice(0, 180)
  const revealed = useTypewriter(previewText, { wordsPerTick: 2, tickMs: 24 })

  return (
    <div className="w-full animate-slide-in" style={{ animationFillMode: 'both' }}>
      <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'rgba(14,0,153,0.12)', boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e1e0ff' }}>
            <span className="material-symbols-outlined icon-filled text-[14px]" style={{ color: '#0e0099' }}>description</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#0e0099' }}>Resume tailored</p>
        </div>
        {resumeData.title && (
          <p className="text-xs font-bold mb-2" style={{ color: '#031631' }}>{resumeData.title}</p>
        )}
        {revealed && (
          <p className="text-sm leading-relaxed" style={{ color: '#44474d' }}>
            {revealed}
            <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: '#0e0099', opacity: revealed === previewText ? 0 : 1 }} />
          </p>
        )}
      </div>
    </div>
  )
}

function CoverPreview({ text }) {
  // Show first sentence of the cover letter
  const dotIdx = text.indexOf('. ')
  const previewText = dotIdx > 0 && dotIdx < 220 ? text.slice(0, dotIdx + 1) : text.slice(0, 180)
  const revealed = useTypewriter(previewText, { wordsPerTick: 2, tickMs: 24 })

  return (
    <div className="w-full animate-slide-in" style={{ animationFillMode: 'both' }}>
      <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'rgba(197,198,206,0.2)', boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
            <span className="material-symbols-outlined text-[14px]" style={{ color: '#031631' }}>mail</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#44474d' }}>Cover letter written</p>
        </div>
        {revealed && (
          <p className="text-sm leading-relaxed italic" style={{ color: '#44474d' }}>
            "{revealed}
            <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: '#44474d', opacity: revealed === previewText ? 0 : 1 }} />
            "
          </p>
        )}
      </div>
    </div>
  )
}

// ── Results view ──────────────────────────────────────────────────────────────
function ResultsView({ results, role, company, navigate, onReset }) {
  const [tab, setTab] = useState('resume')
  const [detailsOpen, setDetailsOpen] = useState(false)

  const score = results.matchData?.match_score || 0
  const scoreLabel = score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Fit' : 'Some Gaps'
  const scoreColor = score >= 80 ? '#0e0099' : score >= 60 ? '#2f2ebe' : '#44474d'
  const scoreBg    = score >= 80 ? '#e1e0ff'  : score >= 60 ? '#e1e0ff'  : '#eceef0'

  const tabs = [
    { id: 'resume',    label: 'Tailored Resume', short: 'Resume',    icon: 'description' },
    { id: 'cover',     label: 'Cover Letter',    short: 'Cover',     icon: 'mail'        },
    { id: 'interview', label: 'Interview Prep',  short: 'Interview', icon: 'psychology'  },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Sticky header ── */}
      <header className="px-4 md:px-8 py-5 border-b glass-panel flex-shrink-0 z-10"
        style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 min-w-0">
            {/* Inline score badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: scoreBg }}>
              <span className="text-sm font-black" style={{ color: scoreColor }}>{score}</span>
              <span className="text-xs font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#75777e' }}>Packet ready</p>
              <h2 className="text-lg md:text-xl font-extrabold tracking-tight truncate"
                style={{ fontFamily: 'Manrope', color: '#031631' }}>
                {role} · {company}
              </h2>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={onReset}
              className="p-2 md:px-4 md:py-2 text-sm font-bold border rounded-xl hover:bg-[#eceef0] transition-all flex items-center gap-1.5"
              style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.4)' }}>
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden md:inline">New Packet</span>
            </button>
            <button
              onClick={() => navigate(`/app/session/${results.sessionId}`)}
              className="px-4 md:px-5 py-2 text-white text-sm font-bold rounded-xl ai-glow-btn flex items-center gap-1.5">
              <span className="material-symbols-outlined icon-filled text-[16px]">open_in_full</span>
              <span className="hidden sm:inline">Open in Editor</span>
              <span className="sm:hidden">Editor</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div className="px-4 md:px-8 border-b flex-shrink-0" style={{ borderColor: 'rgba(197,198,206,0.1)', backgroundColor: 'white' }}>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-3 md:px-4 py-3.5 text-sm font-bold transition-all relative"
              style={{ color: tab === t.id ? '#031631' : '#75777e' }}>
              <span className="material-symbols-outlined icon-filled text-[16px]">{t.icon}</span>
              <span className="hidden md:inline">{t.label}</span>
              <span className="md:hidden">{t.short}</span>
              {tab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: '#0e0099' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto custom-scroll page-pb-mobile" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">

          {/* ── Resume tab ── */}
          {tab === 'resume' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
                    Tailored for this role
                  </p>
                  <h3 className="text-lg font-extrabold" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    {role} at {company}
                  </h3>
                </div>
                <button
                  onClick={() => navigate(`/app/session/${results.sessionId}?tab=resume`)}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all hover:bg-[#e1e0ff] flex items-center gap-1.5"
                  style={{ color: '#0e0099' }}>
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
              </div>

              {/* Document card */}
              <div className="bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: 'rgba(197,198,206,0.2)', boxShadow: '0 4px 32px rgba(3,22,49,0.07)' }}>
                {/* Document toolbar */}
                <div className="px-6 py-3 border-b flex items-center gap-3"
                  style={{ backgroundColor: '#f7f9fb', borderColor: 'rgba(197,198,206,0.15)' }}>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(197,198,206,0.5)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(197,198,206,0.5)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(197,198,206,0.5)' }} />
                  </div>
                  <div className="flex-1 h-5 rounded-md mx-4" style={{ backgroundColor: 'rgba(197,198,206,0.2)' }} />
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: '#e1e0ff' }}>
                    <span className="material-symbols-outlined icon-filled text-[11px]" style={{ color: '#0e0099' }}>check_circle</span>
                    <span className="text-[10px] font-bold" style={{ color: '#0e0099' }}>ATS optimized</span>
                  </div>
                </div>
                {/* Scaled resume preview */}
                <div className="overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
                  <div style={{
                    transform: 'scale(0.6)',
                    transformOrigin: 'top center',
                    width: '794px',
                    marginLeft: 'calc(50% - 397px)',
                    marginBottom: `${Math.round(794 * 1.414 * (0.6 - 1))}px`,
                  }}>
                    <AtelierTemplate resume={results.tailoredResume} />
                  </div>
                </div>
              </div>

              {/* Matched keywords strip */}
              {results.matchData?.ats_keywords?.length > 0 && (
                <div className="mt-4 p-4 rounded-xl flex flex-wrap items-center gap-x-3 gap-y-2"
                  style={{ backgroundColor: '#e1e0ff' }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest flex-shrink-0" style={{ color: '#2f2ebe' }}>
                    Keywords woven in
                  </span>
                  {results.matchData.ats_keywords.map(kw => (
                    <span key={kw} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white"
                      style={{ color: '#0e0099' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Cover letter tab ── */}
          {tab === 'cover' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
                    Matches your resume
                  </p>
                  <h3 className="text-lg font-extrabold" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Cover Letter
                  </h3>
                </div>
                <button
                  onClick={() => navigate(`/app/session/${results.sessionId}?tab=cover`)}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all hover:bg-[#e1e0ff] flex items-center gap-1.5"
                  style={{ color: '#0e0099' }}>
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
              </div>
              <div className="bg-white rounded-2xl border overflow-hidden"
                style={{ borderColor: 'rgba(197,198,206,0.2)', boxShadow: '0 4px 32px rgba(3,22,49,0.07)' }}>
                <div className="px-8 md:px-14 py-10">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans"
                    style={{ color: '#031631', fontFamily: 'Inter, sans-serif', lineHeight: '1.8' }}>
                    {results.coverLetter || 'Cover letter is loading — open the editor to view.'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* ── Interview prep tab ── */}
          {tab === 'interview' && (
            <div>
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
                  Tied to this role
                </p>
                <h3 className="text-lg font-extrabold" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  Interview Prep
                </h3>
              </div>
              <div className="space-y-4">
                {(results.interviewData?.questions || []).map((q, i) => (
                  <InterviewCard key={i} question={q} index={i} />
                ))}
                {(!results.interviewData?.questions?.length) && (
                  <div className="bg-white rounded-2xl border p-8 text-center"
                    style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                    <p className="text-sm" style={{ color: '#75777e' }}>
                      Open the editor to view your interview prep.
                    </p>
                    <button
                      onClick={() => navigate(`/app/session/${results.sessionId}?tab=interview`)}
                      className="mt-3 px-5 py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn">
                      Open Interview Prep
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Match details (collapsible) ── */}
          <div className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
            <button
              className="w-full flex items-center justify-between px-6 py-4 text-left"
              onClick={() => setDetailsOpen(o => !o)}>
              <div className="flex items-center gap-3">
                <MatchRing score={score} size={44} />
                <div>
                  <p className="font-bold text-sm" style={{ color: '#031631' }}>{scoreLabel}</p>
                  <p className="text-xs" style={{ color: '#75777e' }}>{results.matchData?.summary}</p>
                </div>
              </div>
              <span className="material-symbols-outlined transition-transform flex-shrink-0"
                style={{ color: '#75777e', transform: detailsOpen ? 'rotate(180deg)' : 'none' }}>
                expand_more
              </span>
            </button>

            {detailsOpen && (
              <div className="px-6 pb-6 space-y-5 border-t" style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
                <div className="pt-5 grid md:grid-cols-2 gap-5">
                  {/* Matched skills */}
                  {results.matchData?.matched_skills?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#44474d' }}>
                        Matched skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {results.matchData.matched_skills.map(skill => (
                          <span key={skill} className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gaps */}
                  {results.matchData?.gaps?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: '#44474d' }}>
                        Gaps to address
                      </p>
                      <div className="space-y-2">
                        {results.matchData.gaps.map((gap, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
                            style={{ backgroundColor: gap.severity === 'high' ? '#ffdad6' : '#f2f4f6' }}>
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: gap.severity === 'high' ? '#93000a' : '#0e0099' }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs" style={{ color: '#031631' }}>{gap.label}</p>
                              {gap.suggestion && (
                                <p className="text-xs mt-0.5" style={{ color: '#44474d' }}>{gap.suggestion}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Individual interview question card ────────────────────────────────────────
function InterviewCard({ question, index }) {
  const [open, setOpen] = useState(false)
  const q = typeof question === 'string' ? { question } : question
  const typeColor = q.type === 'behavioral' ? '#2f2ebe' : q.type === 'technical' ? '#031631' : '#44474d'
  const typeBg    = q.type === 'behavioral' ? '#e1e0ff'  : q.type === 'technical' ? '#d6e3ff'  : '#eceef0'

  return (
    <div className="bg-white rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: open ? 'rgba(14,0,153,0.2)' : 'rgba(197,198,206,0.2)', boxShadow: '0 2px 16px rgba(3,22,49,0.04)' }}>
      <button className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-sm font-black flex-shrink-0 mt-0.5" style={{ color: '#c5c6ce', fontFamily: 'Manrope' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            {q.type && (
              <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-2"
                style={{ backgroundColor: typeBg, color: typeColor }}>
                {q.type}
              </span>
            )}
            <p className="font-semibold text-sm leading-snug" style={{ color: '#031631' }}>
              {q.question || q.q || 'Interview question'}
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined flex-shrink-0 transition-transform mt-0.5"
          style={{ color: '#75777e', fontSize: 20, transform: open ? 'rotate(180deg)' : 'none' }}>
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <div className="h-px mb-5" style={{ backgroundColor: '#f2f4f6' }} />
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#0e0099' }}>
            Suggested STAR answer
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#44474d' }}>
            {q.star_answer || q.answer || q.context || 'Open the full editor to view this answer.'}
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function JobTailoring() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { sessions, loading: sessionsLoading } = useSessions()
  const hasStartedRef = useRef(false)

  const {
    company, setCompany,
    role, setRole,
    jdText, setJdText,
    phase, setPhase,
    currentStep,
    error,
    stepErrors,
    results, setResults,
    stepData,
    showUpgradeGate, setShowUpgradeGate,
    masterProfile,
    profileLoading,
    hasProfile,
    profile,
    isPro,
    sessionsLeft,
    handleAnalyze,
    runStep,
    startFromSession,
  } = useTailorEngine()

  useEffect(() => {
    const sid = searchParams.get('session')
    if (sid && !sessionsLoading && !hasStartedRef.current && hasProfile) {
      hasStartedRef.current = true
      const s = sessions.find(x => x.id === sid)
      if (s) {
        startFromSession(s)
        setSearchParams({})
      }
    }
  }, [searchParams, sessions, sessionsLoading, startFromSession, setSearchParams, hasProfile])

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />
      <main className="flex-1 flex overflow-hidden relative">

        {/* ── UPGRADE GATE MODAL ── */}
        {showUpgradeGate && (
          <UpgradeGateModal onDismiss={() => setShowUpgradeGate(false)} />
        )}

        {/* ── INPUT PHASE ── */}
        {phase === 'input' && (
          <>
          {/* Mobile wizard — shown on small screens only */}
          <div className="flex-1 flex flex-col overflow-hidden md:hidden">
            <MobileTailoringWizard
              company={company} setCompany={setCompany}
              role={role} setRole={setRole}
              jdText={jdText} setJdText={setJdText}
              hasProfile={hasProfile}
              masterProfile={masterProfile}
              profile={profile}
              sessionsLeft={sessionsLeft}
              isPro={isPro}
              profileLoading={profileLoading}
              handleAnalyze={handleAnalyze}
              navigate={navigate}
              error={error}
            />
          </div>
          {/* Desktop two-column layout */}
          <div className="flex-1 hidden md:flex flex-row overflow-hidden">
            {/* Left: JD input */}
            <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
              <header className="px-4 md:px-8 py-6 border-b glass-panel flex-shrink-0" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined icon-filled text-[20px]" style={{ color: '#0e0099' }}>bolt</span>
                  <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Build an Application Packet
                  </h1>
                </div>
                <p style={{ color: '#44474d' }}>
                  Paste a job description and get a tailored resume, cover letter, and interview prep — all from one analysis.
                </p>
                {!isPro && (
                  <div
                    className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl inline-flex"
                    style={{ backgroundColor: sessionsLeft <= 1 ? '#ffdad6' : '#e1e0ff' }}
                  >
                    <span
                      className="material-symbols-outlined icon-filled text-[14px]"
                      style={{ color: sessionsLeft <= 1 ? '#93000a' : '#2f2ebe' }}
                    >
                      info
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: sessionsLeft <= 1 ? '#93000a' : '#2f2ebe' }}
                    >
                      {sessionsLeft} free packet{sessionsLeft !== 1 ? 's' : ''} remaining this month
                    </span>
                  </div>
                )}
              </header>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>
                      Company
                    </label>
                    <input
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-0 font-medium focus:outline-none focus:ring-2 transition-all"
                      style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }}
                      placeholder="e.g. Stripe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>
                      Role Title
                    </label>
                    <input
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-0 font-medium focus:outline-none focus:ring-2 transition-all"
                      style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }}
                      placeholder="e.g. Staff Product Designer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>
                    Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    rows={20}
                    maxLength={JD_MAX_CHARS}
                    className="w-full px-4 py-4 rounded-2xl border-0 font-medium resize-none focus:outline-none focus:ring-2 transition-all text-sm leading-relaxed"
                    style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }}
                    placeholder="Paste the full job description here — the more detail the better. Include requirements, responsibilities, and any nice-to-haves..."
                  />
                  <p className="text-xs mt-2" style={{ color: '#c5c6ce' }}>
                    {jdText.length} / {JD_MAX_CHARS.toLocaleString()} characters
                  </p>
                </div>

                {error && (
                  <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                    <span className="material-symbols-outlined icon-filled text-[18px]">error</span>
                    <p className="text-sm font-semibold">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Profile preview + CTA */}
            <aside className="w-full md:w-80 flex-shrink-0 flex flex-col overflow-y-auto p-6 space-y-5 border-t md:border-t-0" style={{ backgroundColor: '#f2f4f6' }}>
              <div className="p-5 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 16px rgba(3,22,49,0.05)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>account_circle</span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#44474d' }}>Master Profile</span>
                </div>
                {profileLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 rounded" style={{ backgroundColor: '#eceef0', width: '70%' }} />
                    <div className="h-3 rounded" style={{ backgroundColor: '#eceef0', width: '50%' }} />
                  </div>
                ) : hasProfile ? (
                  <>
                    <p className="font-extrabold mb-0.5" style={{ color: '#031631', fontFamily: 'Manrope' }}>
                      {masterProfile.name || profile?.email}
                    </p>
                    <p className="text-xs font-semibold mb-3" style={{ color: '#0e0099' }}>
                      {masterProfile.title || 'No title set'}
                    </p>
                    <div className="space-y-1">
                      {[
                        `${masterProfile.experience?.length || 0} roles`,
                        `${masterProfile.skills?.length || 0} skills`,
                        `${masterProfile.completion_pct || 0}% complete`,
                      ].map(stat => (
                        <div key={stat} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#0e0099' }} />
                          <span className="text-xs" style={{ color: '#44474d' }}>{stat}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-sm mb-3" style={{ color: '#44474d' }}>
                      No profile yet. Build yours first to enable tailoring.
                    </p>
                    <button
                      onClick={() => navigate('/app/profile')}
                      className="w-full py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn"
                    >
                      Build Profile
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 16px rgba(3,22,49,0.05)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#44474d' }}>Your packet includes</p>
                <div className="space-y-3">
                  {[
                    { icon: 'description', label: 'Tailored resume'            },
                    { icon: 'query_stats', label: 'Match score + keyword gaps' },
                    { icon: 'mail',        label: 'Matching cover letter'       },
                    { icon: 'psychology',  label: '4 STAR interview answers'    },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e1e0ff' }}>
                        <span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>{f.icon}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#031631' }}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!hasProfile || !company || !role || !jdText}
                className="w-full py-5 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ai-glow-btn flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                Build My Packet
              </button>

              {!isPro && sessionsLeft > 0 && (
                <p className="text-center text-xs" style={{ color: '#75777e' }}>
                  Uses 1 of your {sessionsLeft} free packet{sessionsLeft !== 1 ? 's' : ''} this month
                </p>
              )}
            </aside>
          </div>
          </>
        )}

        {/* ── ANALYZING PHASE ── */}
        {phase === 'analyzing' && (
          <div className="flex-1 overflow-y-auto custom-scroll page-pb-mobile">
            <div className="flex flex-col items-center px-4 pt-12 pb-10 gap-6 max-w-md mx-auto w-full">

              {/* Header */}
              <div className="text-center">
                <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5 ai-glow-btn">
                  <span className="material-symbols-outlined icon-filled text-[30px] text-white animate-pulse">bolt</span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  Building your packet…
                </h2>
                <p className="text-sm" style={{ color: '#75777e' }}>
                  {role} at {company}
                </p>
              </div>

              {/* Step list */}
              <TailoringSteps
                steps={TAILOR_STEPS}
                currentStep={currentStep}
                stepErrors={stepErrors}
                results={results}
                onRetry={runStep}
              />

              {/* ── Progressive previews — appear as each step completes ── */}
              {stepData.matchData && (
                <MatchPreview matchData={stepData.matchData} />
              )}
              {stepData.tailoredResume && (
                <ResumePreview resumeData={stepData.tailoredResume} />
              )}
              {stepData.coverLetter && (
                <CoverPreview text={stepData.coverLetter} />
              )}

              {/* Error */}
              {error && (
                <div className="w-full p-4 rounded-2xl flex items-center gap-3 bg-white border border-[#ffdad6] shadow-sm animate-slide-in">
                  <span className="material-symbols-outlined icon-filled text-[20px] text-[#93000a]">error</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-[#93000a] uppercase tracking-widest">Step failed</p>
                    <p className="text-xs font-medium text-[#031631]">{error}</p>
                  </div>
                  <button
                    onClick={() => setPhase('input')}
                    className="text-[10px] font-black uppercase text-[#8293b4]"
                  >
                    Cancel
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── RESULTS PHASE ── */}
        {phase === 'results' && results && (
          <ResultsView
            results={results}
            role={role}
            company={company}
            navigate={navigate}
            onReset={() => { setPhase('input'); setResults(null) }}
          />
        )}
      </main>
    </div>
  )
}
