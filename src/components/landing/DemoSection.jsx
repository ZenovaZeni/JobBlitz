import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { runDemoPreview } from '../../lib/demo'

const MIN_JD_CHARS = 100

const LOADING_STEPS = [
  { label: 'Reading job description…', delay: 0 },
  { label: 'Matching your profile…', delay: 1800 },
  { label: 'Crafting your tailored bullet…', delay: 4200 },
]

function DemoMatchRing({ score }) {
  const radius = 42
  const circ = 2 * Math.PI * radius
  const filled = (score / 100) * circ
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="112" height="112" viewBox="0 0 112 112" className="rotate-[-90deg]">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ marginTop: '-80px' }}>
        <span className="text-3xl font-extrabold" style={{ color: '#031631', fontFamily: 'Manrope' }}>{score}</span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#75777e' }}>match</span>
      </div>
    </div>
  )
}

function LoadingAnimation() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const timers = LOADING_STEPS.slice(1).map((step, i) =>
      setTimeout(() => setActiveStep(i + 1), step.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="py-12 flex flex-col items-center gap-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
        <span className="material-symbols-outlined icon-filled text-white text-[28px] animate-spin"
          style={{ animationDuration: '1.2s' }}>auto_awesome</span>
      </div>
      <div className="space-y-3 w-full max-w-xs">
        {LOADING_STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
              i < activeStep ? 'bg-green-500' : i === activeStep ? 'bg-indigo-600' : 'bg-gray-200'
            }`}>
              {i < activeStep
                ? <span className="material-symbols-outlined icon-filled text-white text-[14px]">check</span>
                : i === activeStep
                  ? <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  : <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              }
            </div>
            <span className={`text-sm font-medium transition-all duration-500 ${
              i <= activeStep ? 'text-gray-800' : 'text-gray-400'
            }`}>{step.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs font-medium mt-2" style={{ color: '#75777e' }}>Usually under 10 seconds…</p>
    </div>
  )
}

function ResultView({ result, onReset }) {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#75777e' }}>
            Your preview for
          </p>
          <h3 className="text-xl font-extrabold leading-tight" style={{ color: '#031631', fontFamily: 'Manrope' }}>
            {result.role}
            {result.company && result.company !== 'this company' && (
              <span className="font-normal text-gray-500"> at {result.company}</span>
            )}
          </h3>
        </div>
        {/* Match ring */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 112, height: 112 }}>
          <DemoMatchRing score={result.match_score} />
        </div>
      </div>

      {/* Matched skills */}
      {result.matched_skills?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.matched_skills.map(skill => (
            <span key={skill} className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>{skill}</span>
          ))}
          {result.top_gap && (
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
              Gap: {result.top_gap}
            </span>
          )}
        </div>
      )}

      {/* Before / after bullet */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(197,198,206,0.3)' }}>
        <div className="px-4 py-2 border-b text-xs font-bold uppercase tracking-widest"
          style={{ backgroundColor: '#f7f9fb', color: '#75777e', borderColor: 'rgba(197,198,206,0.3)' }}>
          Tailored resume bullet
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#c5c6ce' }}>Before</p>
            <p className="text-sm leading-relaxed" style={{ color: '#44474d' }}>
              {result.original_bullet}
            </p>
          </div>
          <div className="h-px" style={{ backgroundColor: 'rgba(197,198,206,0.3)' }} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: '#2f2ebe' }}>After ✦</p>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: '#031631' }}>
              {result.tailored_bullet}
            </p>
          </div>
        </div>
      </div>

      {/* Cover letter opener */}
      <div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(197,198,206,0.3)' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: '#75777e' }}>
          Cover letter opener
        </p>
        <p className="text-sm leading-relaxed italic" style={{ color: '#031631' }}>
          "{result.cover_opener}"
        </p>
      </div>

      {/* Ghost gate */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: 130 }}>
        <div className="p-4 space-y-2 select-none pointer-events-none" aria-hidden="true">
          {['Full tailored resume (all bullets rewritten)', 'Complete cover letter draft', 'Interview STAR stories', 'Skills gap action plan'].map(line => (
            <div key={line} className="flex items-center gap-3">
              <span className="material-symbols-outlined icon-filled text-[16px] text-green-500">check_circle</span>
              <div className="h-3.5 rounded-full blur-sm flex-1" style={{ backgroundColor: '#c5c6ce', maxWidth: '70%' }} />
            </div>
          ))}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(to bottom, rgba(247,249,251,0) 0%, rgba(247,249,251,0.85) 30%, rgba(247,249,251,1) 60%)' }}>
          <div className="mt-auto pb-4 flex flex-col items-center gap-3 w-full px-4">
            <p className="text-sm font-bold text-center" style={{ color: '#031631' }}>
              Get your full application packet — free
            </p>
            <button
              onClick={() => navigate('/auth/signup')}
              className="w-full max-w-xs py-3.5 text-white font-bold rounded-xl shadow-xl active:scale-95 transition-all ai-glow-btn text-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined icon-filled text-[16px]">bolt</span>
              Create free account
            </button>
            <p className="text-xs" style={{ color: '#75777e' }}>No credit card · 5 full packets free / month</p>
          </div>
        </div>
      </div>

      <button onClick={onReset}
        className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
        style={{ color: '#0e0099' }}>
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Try a different job
      </button>
    </div>
  )
}

export default function DemoSection() {
  const [phase, setPhase] = useState('idle') // idle | loading | result | error
  const [jdText, setJdText] = useState('')
  const [userRole, setUserRole] = useState('')
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const sectionRef = useRef(null)

  const charsLeft = MIN_JD_CHARS - jdText.length
  const canSubmit = jdText.length >= MIN_JD_CHARS

  async function handleRun() {
    if (!canSubmit) return
    setPhase('loading')
    setErrorMsg('')
    try {
      const data = await runDemoPreview({ jdText, userRole })
      setResult(data)
      setPhase('result')
      setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setPhase('error')
    }
  }

  function handleReset() {
    setPhase('idle')
    setResult(null)
    setErrorMsg('')
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  return (
    <section id="live-demo" ref={sectionRef} className="py-20 px-6" style={{ backgroundColor: '#f7f9fb' }}>
      <div className="max-w-2xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
            <span className="material-symbols-outlined icon-filled text-[12px]">bolt</span>
            LIVE DEMO — NO ACCOUNT NEEDED
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>
            See it work on any real job
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: '#44474d' }}>
            Paste a job description below. We'll show you a real tailored bullet and cover letter opener — in under 15 seconds.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border bg-white shadow-lg overflow-hidden"
          style={{ borderColor: 'rgba(197,198,206,0.3)' }}>
          <div className="p-6 md:p-8">

            {phase === 'idle' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#031631' }}>
                    Paste a job description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    rows={8}
                    placeholder="Paste the full job description here — title, responsibilities, qualifications, and all…"
                    className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none text-sm leading-relaxed"
                    style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                  />
                  {!canSubmit && jdText.length > 0 && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: '#75777e' }}>
                      {charsLeft} more character{charsLeft !== 1 ? 's' : ''} needed for a meaningful analysis
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#031631' }}>
                    Your role or background <span className="font-normal" style={{ color: '#75777e' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={userRole}
                    onChange={e => setUserRole(e.target.value)}
                    placeholder="e.g. 'Software engineer with 4 years in fintech'"
                    className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm bg-white"
                    style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: '#75777e' }}>
                    Leave blank to use our sample profile
                  </p>
                </div>

                <button
                  onClick={handleRun}
                  disabled={!canSubmit}
                  className="w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                  <span className="material-symbols-outlined icon-filled text-[18px]">auto_awesome</span>
                  Preview my tailored application
                </button>
              </div>
            )}

            {phase === 'loading' && <LoadingAnimation />}

            {phase === 'result' && result && (
              <ResultView result={result} onReset={handleReset} />
            )}

            {phase === 'error' && (
              <div className="py-8 flex flex-col items-center gap-5 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: '#ffdad6' }}>
                  <span className="material-symbols-outlined icon-filled text-[28px]" style={{ color: '#93000a' }}>error</span>
                </div>
                <div>
                  <p className="font-bold mb-1" style={{ color: '#031631' }}>Something went wrong</p>
                  <p className="text-sm" style={{ color: '#44474d' }}>{errorMsg}</p>
                </div>
                <button onClick={handleReset}
                  className="px-6 py-3 font-bold rounded-xl text-white ai-glow-btn active:scale-95 transition-all">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>

        {phase === 'idle' && (
          <p className="text-center text-xs mt-5" style={{ color: '#75777e' }}>
            We use a sample profile for the demo. Sign up to use yours.
          </p>
        )}
      </div>
    </section>
  )
}
