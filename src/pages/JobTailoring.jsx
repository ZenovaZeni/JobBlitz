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
// ── Results view (Success / Celebration) ──────────────────────────────────────
function ResultsView({ results, role, company, navigate, onReset }) {
  const score = results.matchData?.match_score || 0
  const scoreLabel = score >= 80 ? 'Strong Match' : score >= 60 ? 'Good Fit' : 'Some Gaps'
  const scoreColor = score >= 80 ? '#0e0099' : score >= 60 ? '#2f2ebe' : '#44474d'
  
  const hasResume    = !!results.tailoredResume
  const hasCover     = !!results.coverLetter
  const hasInterview = !!(results.interviewData?.questions?.length)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f9fb]">
      <div className="flex-1 overflow-y-auto custom-scroll page-pb-mobile">
        
        {/* Celebration Hero */}
        <section className="relative py-12 md:py-20 px-4 overflow-hidden text-center"
                 style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
          <div className="max-w-3xl mx-auto relative z-10 animate-slide-up">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-white/20 shadow-2xl">
              <span className="material-symbols-outlined text-[40px] text-white icon-filled">rocket_launch</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'Manrope' }}>
              Your Packet is Ready!
            </h1>
            <p className="text-lg md:text-xl text-white/70 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
              We've analyzed the <span className="text-white font-bold">{role}</span> role at <span className="text-white font-bold">{company}</span> and tailored every asset for maximum impact.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate(`/app/session/${results.sessionId}`)}
                className="w-full sm:w-auto px-10 py-5 bg-white text-[#031631] font-black rounded-2xl shadow-2xl active:scale-95 transition-all text-lg flex items-center justify-center gap-3">
                <span className="material-symbols-outlined icon-filled">dashboard_customize</span>
                Open Workspace
              </button>
              <button onClick={onReset} className="w-full sm:w-auto px-6 py-5 text-white/80 font-bold hover:text-white transition-all text-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">add</span>
                Build Another
              </button>
            </div>
          </div>
          
          {/* Background Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/10 pointer-events-none" />
        </section>

        <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-12 mb-20 relative z-20 space-y-8">
          
          {/* Match Analysis Summary */}
          <div className="bg-white rounded-3xl p-6 md:p-10 border flex flex-col md:flex-row gap-10 items-center" 
               style={{ borderColor: 'rgba(197,198,206,0.2)', boxShadow: '0 12px 40px rgba(3,22,49,0.08)' }}>
            <div className="flex-shrink-0 text-center">
              <MatchRing score={score} size={160} />
              <div className="mt-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block" 
                   style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                {scoreLabel}
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-extrabold mb-4" style={{ fontFamily: 'Manrope', color: '#031631' }}>Smart Match Analysis</h3>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#44474d' }}>
                {results.matchData?.summary || "Tailoring complete. We've optimized your profile to highlight the skills and experience most relevant to this role."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {(results.matchData?.matched_skills || []).slice(0, 10).map(skill => (
                  <span key={skill} className="px-4 py-2 rounded-xl text-sm font-bold border" style={{ backgroundColor: '#fcfdfe', color: '#031631', borderColor: 'rgba(197,198,206,0.2)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Asset Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Resume Preview */}
            <div className="bg-white rounded-3xl p-8 border flex flex-col group transition-all hover:shadow-xl hover:border-[#0e0099]/20" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#e1e0ff] flex items-center justify-center">
                  <span className="material-symbols-outlined icon-filled text-[#0e0099] text-[24px]">description</span>
                </div>
                <h4 className="font-extrabold text-lg" style={{ color: '#031631' }}>Tailored Resume</h4>
              </div>
              <div className="flex-1 space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#f7f9fb] border border-dashed border-[#c5c6ce]">
                  <p className="text-xs font-bold text-[#8293b4] uppercase tracking-widest mb-2">Strategy</p>
                  <p className="text-sm font-medium text-[#44474d] leading-relaxed">
                    Emphasized experience with {results.matchData?.matched_skills?.[0] || 'core requirements'} and updated summary metrics.
                  </p>
                </div>
              </div>
              <button onClick={() => navigate(`/app/session/${results.sessionId}?tab=resume`)}
                      className="w-full py-4 rounded-2xl border-2 font-black text-sm transition-all bg-[#0e0099] text-white hover:bg-[#031631] border-transparent">
                Edit & Export Resume
              </button>
            </div>

            {/* Cover Letter Preview */}
            <div className="bg-white rounded-3xl p-8 border flex flex-col group transition-all hover:shadow-xl hover:border-[#0e0099]/20" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#eceef0] flex items-center justify-center">
                  <span className="material-symbols-outlined icon-filled text-[#031631] text-[24px]">mail</span>
                </div>
                <h4 className="font-extrabold text-lg" style={{ color: '#031631' }}>Cover Letter</h4>
              </div>
              <div className="flex-1 space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#f7f9fb] border border-dashed border-[#c5c6ce]">
                   <p className="text-xs font-bold text-[#8293b4] uppercase tracking-widest mb-2">Snippet</p>
                   <p className="text-sm font-medium text-[#44474d] italic leading-relaxed line-clamp-3">
                     "{results.coverLetter?.split('\n').find(l => l.length > 40) || 'A personalized letter connecting your background...'}"
                   </p>
                </div>
              </div>
              <button onClick={() => navigate(`/app/session/${results.sessionId}?tab=cover`)}
                      className="w-full py-4 rounded-2xl border-2 font-black text-sm transition-all hover:bg-[#f2f4f6]"
                      style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.3)' }}>
                Personalize Letter
              </button>
            </div>

            {/* Interview Prep Preview */}
            <div className="bg-white rounded-3xl p-8 border flex flex-col group transition-all hover:shadow-xl hover:border-[#0e0099]/20" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#d6e3ff] flex items-center justify-center">
                  <span className="material-symbols-outlined icon-filled text-[#0e0099] text-[24px]">psychology</span>
                </div>
                <h4 className="font-extrabold text-lg" style={{ color: '#031631' }}>Interview Prep</h4>
              </div>
              <div className="flex-1 space-y-4 mb-8">
                <div className="p-4 rounded-xl bg-[#f7f9fb] border border-dashed border-[#c5c6ce]">
                  <p className="text-xs font-bold text-[#8293b4] uppercase tracking-widest mb-2">Likely Question</p>
                  <p className="text-sm font-bold text-[#031631] leading-relaxed">
                    "{results.interviewData?.questions?.[0]?.question || "Tell me about a time you handled a difficult project..."}"
                  </p>
                </div>
              </div>
              <button onClick={() => navigate(`/app/session/${results.sessionId}?tab=interview`)}
                      className="w-full py-4 rounded-2xl border-2 font-black text-sm transition-all hover:bg-[#f2f4f6]"
                      style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.3)' }}>
                Start Prep Session
              </button>
            </div>

          </div>

          <div className="text-center py-10">
             <button onClick={() => navigate(`/app/session/${results.sessionId}`)}
                     className="text-[#0e0099] font-black uppercase tracking-[0.2em] text-xs flex items-center gap-2 mx-auto hover:gap-3 transition-all">
                Enter Full Packet Workspace
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
             </button>
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
    <div className="bg-white rounded-3xl border overflow-hidden transition-all group"
      style={{ borderColor: open ? 'rgb(14,0,153,0.3)' : 'rgba(197,198,206,0.2)', boxShadow: open ? '0 8px 32px rgba(3,22,49,0.08)' : '0 2px 12px rgba(3,22,49,0.03)' }}>
      <button className="w-full flex items-start justify-between gap-4 px-6 md:px-8 py-5 md:py-6 text-left"
        onClick={() => setOpen(o => !o)}>
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
               style={{ backgroundColor: open ? '#0e0099' : '#f2f4f6', transition: 'all 0.3s' }}>
            <span className="text-sm font-black" style={{ color: open ? 'white' : '#75777e', fontFamily: 'Manrope' }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-2">
              {q.type && (
                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                  style={{ backgroundColor: typeBg, color: typeColor }}>
                  {q.type}
                </span>
              )}
              {!open && q.star_answer && (
                <span className="text-[10px] font-bold text-[#2e7d32] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] icon-filled">check_circle</span>
                  Answer Ready
                </span>
              )}
            </div>
            <p className="font-extrabold text-base leading-snug group-hover:text-[#0e0099] transition-colors" style={{ color: '#031631', fontFamily: 'Manrope' }}>
              {q.question || q.q || 'Interview question'}
            </p>
            {!open && (q.star_answer || q.answer) && (
              <p className="text-xs mt-2 text-[#8293b4] line-clamp-1 italic">
                "{q.star_answer?.split('.')[0]}..."
              </p>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 mt-1" 
             style={{ borderColor: 'rgba(197,198,206,0.3)' }}>
          <span className="material-symbols-outlined transition-transform"
            style={{ color: '#75777e', fontSize: 18, transform: open ? 'rotate(180deg)' : 'none' }}>
            expand_more
          </span>
        </div>
      </button>
      {open && (
        <div className="px-8 pb-8 animate-slide-down">
          <div className="h-px mb-6" style={{ backgroundColor: '#f2f4f6' }} />
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="md:col-span-3 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#0e0099' }}>
                  Suggested STAR answer
                </p>
                <div className="p-5 rounded-2xl bg-[#f7f9fb] border border-[#0e0099]/5">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium" style={{ color: '#031631' }}>
                    {q.star_answer || q.answer || q.context || 'Open the full editor to view this answer.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#e1e0ff]/50 border border-[#0e0099]/10">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#0e0099' }}>Talking Points</p>
                <ul className="space-y-2">
                  {(q.highlights || ['Highlight results', 'Show tech impact', 'Mention teamwork']).map((h, i) => (
                    <li key={i} className="text-[11px] font-semibold flex items-start gap-1.5" style={{ color: '#44474d' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0e0099] mt-1 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-2.5 rounded-xl border border-[#0e0099]/20 text-[#0e0099] text-[11px] font-bold hover:bg-[#e1e0ff] transition-all">
                Copy Answer
              </button>
            </div>
          </div>
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
  const hasStartedRef   = useRef(false)
  const prefillAppliedRef = useRef(false)

  useEffect(() => { document.title = 'JobBlitz — Build a Packet' }, [])

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

  // ── Extension prefill ─────────────────────────────────────────────────────
  // Reads ?company, ?role, ?jd injected by the JobBlitz Chrome extension.
  // Runs once on mount; cleans the URL afterward so bookmarks stay clean.
  useEffect(() => {
    if (prefillAppliedRef.current) return
    const c   = searchParams.get('company')
    const r   = searchParams.get('role')
    const jd  = searchParams.get('jd')
    if (!c && !r && !jd) return
    prefillAppliedRef.current = true
    if (c)  setCompany(c)
    if (r)  setRole(r)
    if (jd) setJdText(jd)
    setSearchParams({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
            <aside className="w-full md:w-96 flex-shrink-0 flex flex-col overflow-hidden border-t md:border-t-0" style={{ backgroundColor: '#f2f4f6' }}>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">
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
                    <div className="text-center py-4">
                      <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] flex items-center justify-center mx-auto mb-3">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#8293b4' }}>account_circle</span>
                      </div>
                      <p className="text-xs font-semibold mb-3 leading-relaxed" style={{ color: '#75777e' }}>
                        Your profile is empty. Build it first so we can tailor your resume to each role.
                      </p>
                      <button
                        onClick={() => navigate('/app/profile')}
                        className="w-full py-2.5 text-white text-xs font-bold rounded-xl ai-glow-btn"
                      >
                        Build My Profile →
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 16px rgba(3,22,49,0.05)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#44474d' }}>Packet includes</p>
                  <div className="space-y-3">
                    {[
                      { icon: 'description', label: 'Tailored resume'             },
                      { icon: 'query_stats', label: 'Match score + keyword gaps'  },
                      { icon: 'mail',        label: 'Personalized cover letter'   },
                      { icon: 'psychology',  label: 'STAR interview prep'         },
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
              </div>

              {/* Sticky CTA footer — always visible */}
              <div className="p-6 border-t space-y-3 flex-shrink-0" style={{ borderColor: 'rgba(197,198,206,0.15)', backgroundColor: '#f2f4f6' }}>
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
              </div>
            </aside>
          </div>
          </>
        )}

        {/* ── ANALYZING PHASE ── */}
        {phase === 'analyzing' && (
          <div className="flex-1 overflow-y-auto custom-scroll page-pb-mobile">
            <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-12">

              {/* Header row */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-11 h-11 rounded-xl flex-shrink-0 ai-glow-btn flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined icon-filled text-[20px] text-white animate-pulse">bolt</span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Building your packet
                  </h2>
                  <p className="text-sm truncate" style={{ color: '#75777e' }}>
                    {role} · {company}
                  </p>
                </div>
              </div>

              {/* Two-column on md+: steps left, live previews right */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">

                {/* Left col — step tracker */}
                <div className="w-full md:w-72 flex-shrink-0">
                  <TailoringSteps
                    steps={TAILOR_STEPS}
                    currentStep={currentStep}
                    stepErrors={stepErrors}
                    results={results}
                    onRetry={runStep}
                  />
                </div>

                {/* Right col — live content previews */}
                <div className="flex-1 min-w-0 space-y-4">

                  {stepData.matchData && <MatchPreview matchData={stepData.matchData} />}
                  {stepData.tailoredResume && <ResumePreview resumeData={stepData.tailoredResume} />}
                  {stepData.coverLetter && <CoverPreview text={stepData.coverLetter} />}

                  {/* Skeleton placeholders while first step is running */}
                  {!stepData.matchData && (
                    <div className="space-y-4 animate-pulse">
                      <div className="bg-white rounded-2xl border p-5 space-y-3"
                        style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ backgroundColor: '#eceef0' }} />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-3 rounded" style={{ backgroundColor: '#eceef0', width: '40%' }} />
                            <div className="h-2.5 rounded" style={{ backgroundColor: '#eceef0', width: '25%' }} />
                          </div>
                        </div>
                        <div className="h-2.5 rounded" style={{ backgroundColor: '#eceef0', width: '100%' }} />
                        <div className="h-2.5 rounded" style={{ backgroundColor: '#eceef0', width: '90%' }} />
                        <div className="h-2.5 rounded" style={{ backgroundColor: '#eceef0', width: '75%' }} />
                      </div>
                      <div className="bg-white rounded-2xl border p-5 space-y-3"
                        style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                        <div className="h-3 rounded" style={{ backgroundColor: '#eceef0', width: '50%' }} />
                        <div className="h-2.5 rounded" style={{ backgroundColor: '#eceef0', width: '100%' }} />
                        <div className="h-2.5 rounded" style={{ backgroundColor: '#eceef0', width: '85%' }} />
                      </div>
                    </div>
                  )}

                  {/* Error banner */}
                  {error && (
                    <div className="w-full p-4 rounded-2xl flex items-start gap-3 bg-white border border-[#ffdad6] shadow-sm animate-slide-in">
                      <span className="material-symbols-outlined icon-filled text-[20px] text-[#93000a] flex-shrink-0 mt-0.5">error</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-[#93000a] uppercase tracking-widest mb-0.5">Step failed</p>
                        <p className="text-xs font-medium text-[#031631] leading-relaxed">{error}</p>
                        <p className="text-[11px] text-[#75777e] mt-1">Use the Retry button on the failed step, or cancel to start over.</p>
                      </div>
                      <button
                        onClick={() => setPhase('input')}
                        className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest text-[#8293b4] hover:text-[#031631] transition-colors px-2 py-1 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

              </div>
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
