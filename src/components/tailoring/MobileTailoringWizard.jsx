import { useState } from 'react'
import { JD_MAX_CHARS } from '../../config/constants'

const MIN_JD_CHARS = 100

// ── Step progress dots ────────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:  i < current ? 20 : i === current ? 20 : 8,
            height: 8,
            backgroundColor: i < current ? '#031631' : i === current ? '#0e0099' : '#eceef0',
          }}
        />
      ))}
      <span className="text-xs font-bold ml-1" style={{ color: '#75777e' }}>
        {current + 1} of {total}
      </span>
    </div>
  )
}

// ── Pinned action bar ─────────────────────────────────────────────────────────
function ActionBar({ onBack, onNext, nextLabel, nextDisabled, showBack }) {
  return (
    <div
      className="flex-shrink-0 px-5 pt-3 pb-safe border-t"
      style={{
        backgroundColor: 'white',
        borderColor: 'rgba(197,198,206,0.15)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)',
      }}
    >
      <div className="flex gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-5 py-4 font-bold rounded-2xl border transition-all active:scale-95"
            style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#44474d' }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ai-glow-btn flex items-center justify-center gap-2 disabled:opacity-40 disabled:active:scale-100"
        >
          {nextLabel}
          <span className="material-symbols-outlined icon-filled text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MobileTailoringWizard({
  company, setCompany,
  role, setRole,
  jdText, setJdText,
  hasProfile,
  masterProfile,
  profile,
  sessionsLeft,
  isPro,
  profileLoading,
  handleAnalyze,
  navigate,
  error,
}) {
  const [step, setStep] = useState(0) // 0, 1, 2

  const canAdvanceStep0 = company.trim().length > 0 && role.trim().length > 0
  const canAdvanceStep1 = jdText.trim().length >= MIN_JD_CHARS
  const jdCharsLeft = MIN_JD_CHARS - jdText.length

  function next() {
    if (step < 2) setStep(s => s + 1)
    else handleAnalyze()
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#f7f9fb' }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 px-5 pt-5 pb-4 glass-panel border-b"
        style={{ borderColor: 'rgba(197,198,206,0.1)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>bolt</span>
            <span className="text-base font-extrabold" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Build a Packet
            </span>
          </div>
          {!isPro && sessionsLeft <= 3 && (
            <div
              className="px-2.5 py-1 rounded-full text-[11px] font-bold"
              style={{
                backgroundColor: sessionsLeft <= 1 ? '#ffdad6' : '#e1e0ff',
                color: sessionsLeft <= 1 ? '#93000a' : '#2f2ebe',
              }}
            >
              {sessionsLeft} left
            </div>
          )}
        </div>
        <StepDots current={step} total={3} />
      </header>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Step 0: Job info ── */}
        {step === 0 && (
          <div className="px-5 py-7 space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                What role are you targeting?
              </h2>
              <p className="text-sm" style={{ color: '#75777e' }}>
                Just the company and title — we'll use the full job description next.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>
                  Company
                </label>
                <input
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-0 font-medium focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 12px rgba(3,22,49,0.07)' }}
                  placeholder="e.g. Stripe"
                  autoComplete="organization"
                  enterKeyHint="next"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#44474d' }}>
                  Role Title
                </label>
                <input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-0 font-medium focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 12px rgba(3,22,49,0.07)' }}
                  placeholder="e.g. Senior Software Engineer"
                  autoComplete="off"
                  enterKeyHint="done"
                  onKeyDown={e => e.key === 'Enter' && canAdvanceStep0 && next()}
                />
              </div>
            </div>

            {/* What you'll get */}
            <div
              className="p-4 rounded-2xl space-y-3"
              style={{ backgroundColor: 'rgba(225,224,255,0.3)', border: '1px solid rgba(14,0,153,0.08)' }}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#2f2ebe' }}>
                Your packet includes
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: 'description', label: 'Tailored resume'     },
                  { icon: 'query_stats', label: 'Match score'          },
                  { icon: 'mail',        label: 'Cover letter'         },
                  { icon: 'psychology',  label: 'Interview prep'       },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(14,0,153,0.08)' }}
                    >
                      <span className="material-symbols-outlined icon-filled text-[14px]" style={{ color: '#0e0099' }}>{f.icon}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#031631' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Job description ── */}
        {step === 1 && (
          <div className="px-5 py-7 space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                Paste the job description
              </h2>
              <p className="text-sm" style={{ color: '#75777e' }}>
                For {role} at {company}. The more detail, the better the packet.
              </p>
            </div>

            <div>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                rows={12}
                maxLength={JD_MAX_CHARS}
                className="w-full px-4 py-4 rounded-2xl border-0 font-medium resize-none focus:outline-none focus:ring-2 transition-all text-sm leading-relaxed"
                style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 12px rgba(3,22,49,0.07)' }}
                placeholder="Paste the full job posting here — requirements, responsibilities, qualifications…"
                autoComplete="off"
              />
              <div className="flex justify-between mt-2 px-1">
                {!canAdvanceStep1 && jdText.length > 0 ? (
                  <p className="text-xs font-medium" style={{ color: '#75777e' }}>
                    {jdCharsLeft} more character{jdCharsLeft !== 1 ? 's' : ''} needed
                  </p>
                ) : (
                  <span />
                )}
                <p className="text-xs ml-auto" style={{ color: '#c5c6ce' }}>
                  {jdText.length.toLocaleString()} / {JD_MAX_CHARS.toLocaleString()}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                <span className="material-symbols-outlined icon-filled text-[16px]">error</span>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Confirm & launch ── */}
        {step === 2 && (
          <div className="px-5 py-7 space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                Ready to build
              </h2>
              <p className="text-sm" style={{ color: '#75777e' }}>
                {role} at {company}
              </p>
            </div>

            {/* Profile card */}
            <div className="p-4 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 2px 12px rgba(3,22,49,0.07)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined icon-filled text-[15px]" style={{ color: '#0e0099' }}>account_circle</span>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#44474d' }}>Using your profile</span>
              </div>
              {profileLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 rounded" style={{ backgroundColor: '#eceef0', width: '60%' }} />
                  <div className="h-3 rounded" style={{ backgroundColor: '#eceef0', width: '40%' }} />
                </div>
              ) : hasProfile ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-sm" style={{ color: '#031631', fontFamily: 'Manrope' }}>
                      {masterProfile?.name || profile?.email}
                    </p>
                    <p className="text-xs" style={{ color: '#0e0099' }}>
                      {masterProfile?.title || 'Profile ready'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#e1e0ff' }}>
                    <span className="material-symbols-outlined icon-filled text-[12px]" style={{ color: '#0e0099' }}>check_circle</span>
                    <span className="text-[11px] font-bold" style={{ color: '#0e0099' }}>Ready</span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-3" style={{ color: '#44474d' }}>No profile yet — build one first.</p>
                  <button
                    onClick={() => navigate('/app/profile')}
                    className="w-full py-3 text-white text-sm font-bold rounded-xl ai-glow-btn"
                  >
                    Build Profile
                  </button>
                </div>
              )}
            </div>

            {/* JD confirmation */}
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: '#f2f4f6', border: '1px solid rgba(197,198,206,0.2)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#44474d' }}>Job description</span>
                <button
                  onClick={() => setStep(1)}
                  className="text-[11px] font-bold"
                  style={{ color: '#0e0099' }}
                >
                  Edit
                </button>
              </div>
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#75777e' }}>
                {jdText}
              </p>
            </div>

            {/* Sessions remaining */}
            {!isPro && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{
                  backgroundColor: sessionsLeft <= 1 ? '#ffdad6' : '#e1e0ff',
                  color: sessionsLeft <= 1 ? '#93000a' : '#2f2ebe',
                }}
              >
                <span className="material-symbols-outlined icon-filled text-[15px]">info</span>
                <span className="text-xs font-bold">
                  This uses 1 of your {sessionsLeft} free packet{sessionsLeft !== 1 ? 's' : ''} this month
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                <span className="material-symbols-outlined icon-filled text-[16px]">error</span>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Pinned action bar ── */}
      <ActionBar
        showBack={step > 0}
        onBack={() => setStep(s => s - 1)}
        onNext={next}
        nextLabel={step === 2 ? 'Build My Packet' : 'Next'}
        nextDisabled={
          (step === 0 && !canAdvanceStep0) ||
          (step === 1 && !canAdvanceStep1) ||
          (step === 2 && !hasProfile)
        }
      />
    </div>
  )
}
