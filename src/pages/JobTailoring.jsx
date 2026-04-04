import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { useSessions } from '../hooks/useSessions'
import { analyzeJobMatch, generateTailoredResume, generateCoverLetter, generateInterviewQuestions } from '../lib/openai'

// ── Circular match score ──────────────────────────────────
function MatchRing({ score, size = 120 }) {
  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const color = score >= 80 ? '#0e0099' : score >= 60 ? '#2f2ebe' : '#44474d'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke="#eceef0" strokeWidth="8" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-3xl leading-none" style={{ fontFamily: 'Manrope', color }}>{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#75777e' }}>Match</span>
      </div>
    </div>
  )
}

const STEPS = [
  { id: 1, label: 'Analyzing JD', icon: 'search' },
  { id: 2, label: 'Building match score', icon: 'analytics' },
  { id: 3, label: 'Tailoring resume', icon: 'description' },
  { id: 4, label: 'Writing cover letter', icon: 'mail' },
  { id: 5, label: 'Generating interview prep', icon: 'psychology' },
]

export default function JobTailoring() {
  const navigate = useNavigate()
  const { user, profile, isPro, updateUsage, checkAccess } = useAuth()
  const { setActiveSession } = useSession()
  const { profile: masterProfile, loading: profileLoading } = useMasterProfile()
  const { createSession, updateSession, saveResumeVersion, saveCoverLetter, saveInterviewPrep } = useSessions()

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [jdText, setJdText] = useState('')
  const [phase, setPhase] = useState('input')
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')
  const [stepErrors, setStepErrors] = useState({})
  const [results, setResults] = useState(null)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [stepData, setStepData] = useState({})
  const [showUpgradeGate, setShowUpgradeGate] = useState(false)

  const hasProfile = masterProfile && (masterProfile.experience?.length > 0 || masterProfile.summary)

  const runStep = useCallback(async (stepId, sessionId) => {
    setCurrentStep(stepId)
    setStepErrors(prev => ({ ...prev, [stepId]: null }))
    setError('')

    try {
      let currentSessionId = sessionId || activeSessionId
      let currentMatchData = stepData.matchData
      let currentTailoredResume = stepData.tailoredResume
      let currentCoverLetter = stepData.coverLetter
      let currentInterviewData = stepData.interviewData

      // Step 1: Create Session
      if (stepId === 1) {
        if (!currentSessionId) {
          const s = await createSession({ company, role, jd_text: jdText })
          currentSessionId = s.id
          setActiveSessionId(s.id)
        }
        return runStep(2, currentSessionId)
      }

      // Step 2: Build match score
      if (stepId === 2) {
        const matchData = await analyzeJobMatch({ masterProfile, jdText })
        await updateSession(currentSessionId, {
          match_score: matchData.match_score,
          matched_skills: matchData.matched_skills,
          gaps: matchData.gaps,
          ats_keywords: matchData.ats_keywords,
        })
        setStepData(prev => ({ ...prev, matchData }))
        return runStep(3, currentSessionId)
      }

      // Step 3: Tailor resume
      if (stepId === 3) {
        const tailoredResume = await generateTailoredResume({ 
          masterProfile, 
          jdText, 
          matchData: stepData.matchData, 
          company, 
          role 
        })
        await saveResumeVersion({ sessionId: currentSessionId, title: `${role} — ${company}`, content: tailoredResume })
        setStepData(prev => ({ ...prev, tailoredResume }))
        return runStep(4, currentSessionId)
      }

      // Step 4: Write cover letter
      if (stepId === 4) {
        const coverLetterText = await generateCoverLetter({ masterProfile, jdText, company, role, tone: 'Professional' })
        await saveCoverLetter({ sessionId: currentSessionId, tone: 'Professional', content: coverLetterText })
        setStepData(prev => ({ ...prev, coverLetter: coverLetterText }))
        return runStep(5, currentSessionId)
      }

      // Step 5: Generate interview prep
      if (stepId === 5) {
        const interviewData = await generateInterviewQuestions({ masterProfile, jdText, company, role })
        await saveInterviewPrep({ sessionId: currentSessionId, questions: interviewData.questions })
        
        // Finalize
        const payload = { 
          sessionId: currentSessionId, 
          company, 
          role, 
          matchData: stepData.matchData, 
          tailoredResume: stepData.tailoredResume, 
          coverLetter: stepData.coverLetter, 
          interviewData 
        }
        setActiveSession(payload)
        await updateUsage('tailor').catch(err => console.error('Usage sync failed:', err))
        setResults(payload)
        setPhase('results')
      }

    } catch (err) {
      console.error(`Step ${stepId} failed:`, err)
      
      // If it's a session limit error, show the gate immediately
      if (err.message === 'SESSION_LIMIT_REACHED') {
        setShowUpgradeGate(true)
        setPhase('input')
        return
      }

      setStepErrors(prev => ({ ...prev, [stepId]: err.message || 'AI step failed' }))
      setError(err.message || 'Something went wrong. You can retry the failed step below.')
    }
  }, [company, role, jdText, masterProfile, activeSessionId, stepData, createSession, updateSession, saveResumeVersion, saveCoverLetter, saveInterviewPrep, setActiveSession, updateUsage])

  const handleAnalyze = useCallback(() => {
    if (!company.trim() || !role.trim() || !jdText.trim()) {
      setError('Please fill in the company, role, and job description.')
      return
    }
    if (!hasProfile) {
      setError('Please build your Master Profile first — I need your experience to tailor your resume.')
      return
    }
    const access = checkAccess('tailor')
    if (!access.allowed) {
      setShowUpgradeGate(true)
      return
    }

    setError('')
    setStepErrors({})
    setStepData({})
    setActiveSessionId(null)
    setPhase('analyzing')
    runStep(1)
  }, [company, role, jdText, hasProfile, checkAccess, runStep])

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />
      <main className="flex-1 flex overflow-hidden relative">

        {/* ── UPGRADE GATE MODAL ── */}
        {showUpgradeGate && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(3,22,49,0.6)', backdropFilter: 'blur(8px)' }}>
            <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center animate-slide-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
                style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
                <span className="material-symbols-outlined icon-filled text-[14px]">auto_awesome</span>
                FREE SESSIONS USED
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-3" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                Upgrade to Pro
              </h2>
              <p className="mb-8 leading-relaxed" style={{ color: '#44474d' }}>
                You've reached your monthly limit for free sessions. Upgrade to Pro for 50 monthly tailorings,
                unlimited cover letters, and priority AI processing.
              </p>
              <div className="p-6 rounded-2xl mb-8 text-left" style={{ backgroundColor: '#f2f4f6' }}>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-black" style={{ fontFamily: 'Manrope', color: '#031631' }}>$9.99</span>
                  <span className="text-sm font-semibold mb-2" style={{ color: '#44474d' }}>/month</span>
                </div>
                <ul className="space-y-2">
                  {['50 tailoring sessions / mo', 'AI cover letter generator', 'Interview STAR prep', 'PDF export + all templates', 'Priority AI processing'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#031631' }}>
                      <span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => navigate('/pricing')}
                className="w-full py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base mb-3">
                Upgrade to Pro — $9.99/mo
              </button>
              <button onClick={() => setShowUpgradeGate(false)}
                className="w-full py-3 font-semibold text-sm transition-colors hover:opacity-70"
                style={{ color: '#75777e' }}>
                Maybe later
              </button>
            </div>
          </div>
        )}

        {/* ── INPUT PHASE ── */}
        {phase === 'input' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: JD input */}
            <div className="flex-1 flex flex-col overflow-hidden border-r" style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
              <header className="px-4 md:px-8 py-6 border-b glass-panel flex-shrink-0" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined icon-filled text-[20px]" style={{ color: '#0e0099' }}>bolt</span>
                  <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Tailor to a Job
                  </h1>
                </div>
                <p style={{ color: '#44474d' }}>Paste a job description and get a fully tailored resume, cover letter, and interview prep.</p>
                {!isPro && (
                  <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl inline-flex"
                    style={{ backgroundColor: (profile?.tailors_used || 0) >= 2 ? '#ffdad6' : '#e1e0ff' }}>
                    <span className="material-symbols-outlined icon-filled text-[14px]"
                      style={{ color: (profile?.tailors_used || 0) >= 2 ? '#93000a' : '#2f2ebe' }}>info</span>
                    <span className="text-xs font-bold"
                      style={{ color: (profile?.tailors_used || 0) >= 2 ? '#93000a' : '#2f2ebe' }}>
                      {Math.max(0, 2 - (profile?.tailors_used || 0))} free sessions remaining
                    </span>
                  </div>
                )}
              </header>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>Company</label>
                    <input value={company} onChange={e => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-0 font-medium focus:outline-none focus:ring-2 transition-all"
                      style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }}
                      placeholder="e.g. Stripe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>Role Title</label>
                    <input value={role} onChange={e => setRole(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-0 font-medium focus:outline-none focus:ring-2 transition-all"
                      style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }}
                      placeholder="e.g. Staff Product Designer" />
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
                    maxLength={15000}
                    className="w-full px-4 py-4 rounded-2xl border-0 font-medium resize-none focus:outline-none focus:ring-2 transition-all text-sm leading-relaxed"
                    style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }}
                    placeholder="Paste the full job description here — the more detail the better. Include requirements, responsibilities, and any nice-to-haves..." />
                  <p className="text-xs mt-2" style={{ color: '#c5c6ce' }}>{jdText.length} / 15,000 characters</p>
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
                      {masterProfile.name || user?.email}
                    </p>
                    <p className="text-xs font-semibold mb-3" style={{ color: '#0e0099' }}>{masterProfile.title || 'No title set'}</p>
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
                    <p className="text-sm mb-3" style={{ color: '#44474d' }}>No profile yet. Build yours first to enable AI tailoring.</p>
                    <button onClick={() => navigate('/app/profile')}
                      className="w-full py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn">
                      Build Profile
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 16px rgba(3,22,49,0.05)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#44474d' }}>You'll get</p>
                <div className="space-y-3">
                  {[
                    { icon: 'analytics', label: 'Match score + skill gap analysis' },
                    { icon: 'description', label: 'ATS-optimized tailored resume' },
                    { icon: 'mail', label: 'Personalized cover letter' },
                    { icon: 'psychology', label: '4 STAR interview answers' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e1e0ff' }}>
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
                className="w-full py-5 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ai-glow-btn flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <span className="material-symbols-outlined icon-filled text-[20px]">auto_awesome</span>
                Analyze & Tailor
              </button>

              {!isPro && sessionsLeft > 0 && (
                <p className="text-center text-xs" style={{ color: '#75777e' }}>
                  Uses 1 of your {sessionsLeft} free sessions
                </p>
              )}
            </aside>
          </div>
        )}

        {/* ── ANALYZING PHASE ── */}
        {phase === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-10 px-4">
            <div className="text-center">
              <div className="inline-flex w-20 h-20 rounded-2xl items-center justify-center mb-6 ai-glow-btn">
                <span className="material-symbols-outlined icon-filled text-[36px] text-white animate-pulse">auto_awesome</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                AI is working...
              </h2>
              <p style={{ color: '#44474d' }}>Analyzing {company} · {role}</p>
            </div>
            <div className="space-y-3 w-full max-w-sm">
              {STEPS.map(step => {
                const done = currentStep > step.id || (currentStep === 5 && results)
                const active = currentStep === step.id && !stepErrors[step.id]
                const failed = !!stepErrors[step.id]

                return (
                  <div key={step.id} className="flex items-center gap-4 p-4 rounded-xl transition-all"
                    style={{
                      backgroundColor: active || failed ? 'white' : 'transparent',
                      boxShadow: active || failed ? '0 4px 20px rgba(3,22,49,0.08)' : 'none',
                      border: failed ? '1px solid #ffdad6' : 'none'
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: done ? '#031631' : failed ? '#ffdad6' : active ? '#e1e0ff' : '#eceef0' }}>
                      {done
                        ? <span className="material-symbols-outlined icon-filled text-[16px] text-white">check</span>
                        : failed 
                        ? <span className="material-symbols-outlined icon-filled text-[16px] text-[#93000a]">report</span>
                        : <span className={`material-symbols-outlined icon-filled text-[16px] ${active ? 'animate-spin' : ''}`}
                          style={{ color: active ? '#0e0099' : '#c5c6ce' }}>
                          {active ? 'progress_activity' : step.icon}
                        </span>
                      }
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: done || active ? '#031631' : failed ? '#93000a' : '#c5c6ce' }}>
                        {step.label}
                      </p>
                      {failed && <p className="text-[10px] font-bold text-[#93000a] mt-0.5">Connection lost or AI timed out</p>}
                    </div>
                    
                    {done && <span className="text-xs font-bold" style={{ color: '#0e0099' }}>Done</span>}
                    {active && <span className="text-xs font-bold animate-pulse" style={{ color: '#0e0099' }}>Working...</span>}
                    {failed && (
                      <button 
                        onClick={() => runStep(step.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#93000a] text-white text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {error && (
              <div className="max-w-sm w-full p-4 rounded-2xl flex items-center gap-3 bg-white border border-[#ffdad6] shadow-sm animate-slide-in">
                <span className="material-symbols-outlined icon-filled text-[20px] text-[#93000a]">error</span>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#93000a] uppercase tracking-widest">Error</p>
                  <p className="text-xs font-medium text-[#031631]">{error}</p>
                </div>
                <button onClick={() => setPhase('input')} className="text-[10px] font-black uppercase text-[#8293b4]">Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* ── RESULTS PHASE ── */}
        {phase === 'results' && results && (
          <div className="flex-1 overflow-y-auto custom-scroll">
            <header className="px-4 md:px-8 py-6 border-b glass-panel sticky top-0 z-10" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#0e0099' }}>Analysis Complete</p>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    {role} · {company}
                  </h2>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setPhase('input'); setResults(null) }}
                    className="px-4 py-2 text-sm font-bold border rounded-xl hover:bg-[#eceef0] transition-all"
                    style={{ color: '#031631' }}>
                    New Analysis
                  </button>
                  <button onClick={() => navigate(`/app/session/${results.sessionId}`)}
                    className="px-5 py-2 text-white text-sm font-bold rounded-xl ai-glow-btn flex items-center gap-1.5">
                    <span className="material-symbols-outlined icon-filled text-[16px]">rocket_launch</span>
                    Open Command Center
                  </button>
                </div>
              </div>
            </header>

            <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6"
                style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
                <MatchRing score={results.matchData.match_score} />
                <div className="text-center">
                  <p className="font-extrabold text-lg" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    {results.matchData.match_score >= 80 ? 'Strong Match' : results.matchData.match_score >= 60 ? 'Good Fit' : 'Some Gaps'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#44474d' }}>{results.matchData.summary}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>check_circle</span>
                  <h3 className="font-bold" style={{ color: '#031631' }}>Matched Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.matchData.matched_skills?.map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>{skill}</span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#031631' }}>key</span>
                  <h3 className="font-bold" style={{ color: '#031631' }}>ATS Keywords Added</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.matchData.ats_keywords?.map(kw => (
                    <span key={kw} className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#eceef0', color: '#44474d' }}>{kw}</span>
                  ))}
                </div>
              </div>

              {results.matchData.gaps?.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#44474d' }}>warning</span>
                    <h3 className="font-bold" style={{ color: '#031631' }}>Skill Gaps & Suggestions</h3>
                  </div>
                  <div className="space-y-3">
                    {results.matchData.gaps.map((gap, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: gap.severity === 'high' ? '#ffdad6' : '#f2f4f6' }}>
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: gap.severity === 'high' ? '#93000a' : gap.severity === 'medium' ? '#0e0099' : '#44474d' }} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#031631' }}>{gap.label}</p>
                          <p className="text-xs mt-0.5" style={{ color: '#44474d' }}>{gap.suggestion}</p>
                        </div>
                        <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: gap.severity === 'high' ? '#93000a' : '#eceef0',
                            color: gap.severity === 'high' ? 'white' : '#44474d',
                          }}>{gap.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
                <h3 className="font-bold mb-4" style={{ color: '#031631' }}>Next Steps</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'description', label: 'Edit Resume', route: `/app/session/${results.sessionId}?tab=resume`, color: '#031631' },
                    { icon: 'mail', label: 'Refine Cover Letter', route: `/app/session/${results.sessionId}?tab=cover`, color: '#0e0099' },
                    { icon: 'psychology', label: 'Practice Interview', route: `/app/session/${results.sessionId}?tab=interview`, color: '#2f2ebe' },
                  ].map(a => (
                    <button key={a.label} onClick={() => navigate(a.route)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-[#f2f4f6]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${a.color}14` }}>
                        <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: a.color }}>{a.icon}</span>
                      </div>
                      <span className="font-semibold text-sm" style={{ color: '#031631' }}>{a.label}</span>
                      <span className="material-symbols-outlined ml-auto text-[18px]" style={{ color: '#c5c6ce' }}>chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold" style={{ color: '#031631' }}>Cover Letter Preview</h3>
                  <button onClick={() => navigate(`/app/session/${results.sessionId}?tab=cover`)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:bg-[#eceef0]"
                    style={{ color: '#0e0099' }}>
                    Open Full Editor →
                  </button>
                </div>
                <div className="p-5 rounded-xl leading-relaxed text-sm whitespace-pre-wrap line-clamp-6"
                  style={{ backgroundColor: '#f7f9fb', color: '#44474d' }}>
                  {results.coverLetter}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
