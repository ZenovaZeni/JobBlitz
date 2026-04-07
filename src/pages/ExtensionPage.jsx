import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'

const SUPPORTED_SITES = [
  { label: 'LinkedIn',   icon: 'work',            color: '#0077B5', bg: '#e8f4fd' },
  { label: 'Greenhouse', icon: 'eco',             color: '#2e7d32', bg: '#e8f5e9' },
  { label: 'Lever',      icon: 'business_center', color: '#7c3aed', bg: '#f3e8ff' },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: 'travel_explore',
    title: 'Browse a job posting',
    body: 'Navigate to any supported job listing on LinkedIn, Greenhouse, or Lever.',
  },
  {
    step: 2,
    icon: 'extension',
    title: 'Click the JobBlitz icon',
    body: 'The extension reads the role, company, and full job description — automatically.',
  },
  {
    step: 3,
    icon: 'bolt',
    title: 'Build your packet',
    body: 'Hit "Build My Packet" and JobBlitz opens prefilled, ready to tailor your resume.',
  },
]

const INSTALL_STEPS = [
  {
    step: 1,
    title: 'Request the beta package',
    body: 'Click "Request Download" below — we\'ll email you the extension package.',
  },
  {
    step: 2,
    title: 'Open Chrome Extensions',
    body: 'In Chrome, navigate to chrome://extensions in your address bar.',
  },
  {
    step: 3,
    title: 'Enable Developer Mode',
    body: 'Toggle "Developer mode" in the top-right corner of the extensions page.',
  },
  {
    step: 4,
    title: 'Load unpacked',
    body: 'Click "Load unpacked" and select the extension folder from the package you received.',
  },
  {
    step: 5,
    title: 'Pin to toolbar',
    body: 'Click the puzzle piece icon in Chrome and pin JobBlitz for one-click access.',
  },
]

export default function ExtensionPage() {
  const navigate = useNavigate()
  const { isPro, user, isAuthReady, isProfileReady } = useAuth()

  useEffect(() => { document.title = 'JobBlitz — Chrome Extension' }, [])

  // 1. Loading Guard — prevent white-screens while auth is hydrating
  if (!isAuthReady || (user && !isProfileReady)) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f4f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#031631] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#031631] animate-pulse">Hydrating Portal...</p>
        </div>
      </div>
    )
  }

  // 2. Auth Guard — redirect to login if session is lost
  if (isAuthReady && !user) {
    // Note: navigate to a full login page if not in extension context, 
    // but here we just redirect to our internal login
    navigate('/auth/login', { replace: true })
    return null
  }

  // 3. Subscription Guard — extension is a Pro feature
  if (!isPro) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#f2f4f6] p-8 text-center">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px] text-[#0e0099] icon-filled">workspace_premium</span>
        </div>
        <h2 className="text-xl font-black text-[#031631] mb-2 tracking-tight">Pro Portal</h2>
        <p className="text-sm text-[#8293b4] mb-8 font-medium">
          The Chrome Extension portal is available exclusively for JobBlitz Pro members.
        </p>
        <button
          onClick={() => navigate('/pricing')}
          className="w-full py-4 bg-[#031631] text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all">
          Upgrade to Pro
        </button>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="mt-4 text-xs font-bold text-[#8293b4] uppercase tracking-widest">
          Back to Dashboard
        </button>
      </div>
    )
  }

  function handleRequestAccess() {
    const subject = encodeURIComponent('JobBlitz Extension Beta Access Request')
    const body = encodeURIComponent(
      `Hi,\n\nI'd like access to the JobBlitz Chrome extension beta.\n\nEmail: ${user?.email || ''}\n\nThanks!`
    )
    window.open(`mailto:hello@jobblitz.ai?subject=${subject}&body=${body}`)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="glass-panel border-b px-4 md:px-8 py-3 md:py-4 flex items-center justify-between flex-shrink-0 z-10"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
              Pro Feature
            </p>
            <h1
              className="text-base md:text-lg font-black tracking-tight"
              style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Chrome Extension
            </h1>
          </div>
          {!isPro && (
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 text-xs font-black uppercase tracking-widest text-white rounded-xl ai-glow-btn flex items-center gap-2">
              <span className="material-symbols-outlined icon-filled text-[14px]">workspace_premium</span>
              Upgrade to Pro
            </button>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-8 pb-28">

            {/* Hero */}
            <div
              className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                    <span className="material-symbols-outlined text-[30px] text-white">extension</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Manrope' }}>
                      JobBlitz for Chrome
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Private Beta
                      </span>
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]"
                        style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Pro Only
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Stop copy-pasting job descriptions. One click captures the role, company, and full JD from any supported job board — and opens JobBlitz with your packet builder pre-filled.
                </p>
                {!isPro && (
                  <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <span className="material-symbols-outlined icon-filled text-[14px]" style={{ color: 'rgba(255,255,255,0.6)' }}>lock</span>
                    <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Upgrade to Pro to install
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Supported sites */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>
                Supported Job Boards — V1
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {SUPPORTED_SITES.map(site => (
                  <div
                    key={site.label}
                    className="rounded-xl p-4 border text-center"
                    style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.2)' }}>
                    <div
                      className="w-10 h-10 rounded-xl mx-auto mb-2.5 flex items-center justify-center"
                      style={{ backgroundColor: site.bg }}>
                      <span
                        className="material-symbols-outlined icon-filled text-[20px]"
                        style={{ color: site.color }}>
                        {site.icon}
                      </span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: '#031631' }}>{site.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#8293b4' }}>Supported</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-2.5" style={{ color: '#c5c6ce' }}>
                More boards coming in V2 — Workday, Indeed, Wellfound, and more.
              </p>
            </div>

            {/* How it works */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>
                How It Works
              </h3>
              <div className="space-y-3">
                {HOW_IT_WORKS.map(step => (
                  <div
                    key={step.step}
                    className="flex gap-4 p-4 rounded-xl border"
                    style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.2)' }}>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#e1e0ff' }}>
                      <span
                        className="material-symbols-outlined icon-filled text-[18px]"
                        style={{ color: '#0e0099' }}>
                        {step.icon}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#c5c6ce' }}>
                          Step {step.step}
                        </span>
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#031631' }}>{step.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#75777e' }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Install section — Pro gated */}
            {isPro ? (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>
                  Beta Install — Manual Setup
                </h3>
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.2)' }}>
                  {/* Install header */}
                  <div
                    className="px-6 py-4 border-b flex items-center gap-3"
                    style={{ borderColor: 'rgba(197,198,206,0.12)', backgroundColor: '#f7f9fb' }}>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#e1e0ff' }}>
                      <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>
                        download
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: '#031631' }}>
                        Install JobBlitz Extension
                      </p>
                      <p className="text-[11px]" style={{ color: '#8293b4' }}>
                        Chrome browser required · V1.0 Beta
                      </p>
                    </div>
                    <button
                      onClick={handleRequestAccess}
                      className="flex-shrink-0 px-4 py-2 text-xs font-black uppercase tracking-widest text-white rounded-xl ai-glow-btn flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      Request Download
                    </button>
                  </div>

                  {/* Step list */}
                  <div>
                    {INSTALL_STEPS.map((step, i) => (
                      <div
                        key={step.step}
                        className="flex gap-4 px-6 py-4"
                        style={{
                          borderTop: i > 0 ? '1px solid rgba(197,198,206,0.1)' : 'none',
                        }}>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-black"
                          style={{ backgroundColor: 'rgba(14,0,153,0.08)', color: '#0e0099' }}>
                          {step.step}
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: '#031631' }}>{step.title}</p>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#75777e' }}>{step.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Upgrade prompt */
              <div
                className="rounded-2xl p-8 border text-center"
                style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.2)' }}>
                <div
                  className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: '#e1e0ff' }}>
                  <span className="material-symbols-outlined icon-filled text-[28px]" style={{ color: '#0e0099' }}>
                    workspace_premium
                  </span>
                </div>
                <h3
                  className="text-base font-black mb-2"
                  style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  Pro feature
                </h3>
                <p className="text-sm max-w-sm mx-auto mb-6 leading-relaxed" style={{ color: '#75777e' }}>
                  The Chrome extension is available exclusively to Pro subscribers. Upgrade to access the beta and all Pro features — unlimited packets, cover letter tones, interview STAR prep, and more.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-3.5 text-white font-bold rounded-xl ai-glow-btn inline-flex items-center gap-2 active:scale-95 transition-all">
                  <span className="material-symbols-outlined icon-filled text-[18px]">workspace_premium</span>
                  Upgrade to Pro — $9.99/mo
                </button>
              </div>
            )}

            {/* Chrome Web Store — coming soon */}
            <div
              className="rounded-2xl p-5 border flex items-center gap-4"
              style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.2)' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#f2f4f6' }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: '#c5c6ce' }}>storefront</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#44474d' }}>Chrome Web Store</p>
                <p className="text-xs mt-0.5" style={{ color: '#8293b4' }}>
                  One-click install is coming soon — no manual setup required.
                </p>
              </div>
              <span
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full flex-shrink-0"
                style={{ backgroundColor: '#f2f4f6', color: '#8293b4' }}>
                Coming Soon
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
