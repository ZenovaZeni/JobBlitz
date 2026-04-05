import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PRO_PRICE, PRO_PRICE_LABEL } from '../config/constants'
import { PLAN_LIMITS } from '../lib/planLimits'

const FREE_LIMIT = PLAN_LIMITS.free.monthly_tailors
const PRO_LIMIT  = PLAN_LIMITS.pro.monthly_tailors

const FREE_FEATURES = [
  `${FREE_LIMIT} complete application packets / mo`,
  'Tailored resume per job',
  'Matching cover letter per job',
  'ATS match score + skill gap analysis',
  'Interview STAR prep',
  'Master Profile builder',
]

const PRO_FEATURES = [
  `${PRO_LIMIT} complete application packets / mo`,
  'Tailored resume per job',
  'Cover letter — 4 tone options',
  'ATS match score + skill gap analysis',
  'Interview STAR prep',
  'All 3 resume templates',
  'PDF export',
  'Priority AI processing',
  'Master Profile builder',
]

const FAQS = [
  {
    q: 'What counts as one session?',
    a: `One session = one job description analyzed. Each session produces a tailored resume, a matching cover letter, and interview prep questions — simultaneously. Free plan includes ${FREE_LIMIT} sessions per month.`,
  },
  {
    q: 'Does the resume and cover letter actually match?',
    a: 'Yes — that\'s the core difference. Both are generated from your same profile data, so they reference the same experience, metrics, and framing. They read as one coherent application, not two separate documents.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel anytime from your Settings page. Your Pro access continues until the end of the billing period.',
  },
  {
    q: 'Is my data private?',
    a: 'Absolutely. Your profile and resume data are encrypted and stored securely. We never share your data with employers or third parties.',
  },
  {
    q: 'What AI model powers JobBlitz?',
    a: 'We use GPT-4o mini — optimized for professional writing. Your data is used only to generate your content and is never used to train any model.',
  },
  {
    q: `What happens when I use all ${FREE_LIMIT} free sessions?`,
    a: 'You can still view and edit everything from your existing sessions. You need Pro to run new tailoring jobs once you hit the monthly limit.',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user, isPro, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Pricing | JobBlitz'
  }, [])

  async function handleCTA() {
    if (!user) {
      navigate('/auth/signup')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID },
      })

      if (error) throw error
      if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
      alert(`Checkout failed: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f9fb', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <header className="glass-panel sticky top-0 z-50 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-screen-xl mx-auto">
          <button onClick={() => navigate('/')} className="text-xl font-black tracking-tighter" style={{ fontFamily: 'Manrope', color: '#031631' }}>
            JobBlitz
          </button>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate('/app/dashboard')}
                className="px-5 py-2.5 text-white text-sm font-bold rounded-lg ai-glow-btn">
                Go to Dashboard
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/auth/login')}
                  className="px-5 py-2 text-sm font-semibold rounded-lg" style={{ color: '#5c6d8c' }}>
                  Login
                </button>
                <button onClick={() => navigate('/auth/signup')}
                  className="px-5 py-2.5 text-white text-sm font-bold rounded-lg ai-glow-btn">
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8">

        {/* Hero */}
        <div className="text-center pt-20 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
            <span className="material-symbols-outlined icon-filled text-[14px]">auto_awesome</span>
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-5"
            style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.02em' }}>
            Start free. Upgrade when you need more.
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#44474d' }}>
            Free plan includes <strong style={{ color: '#031631' }}>{FREE_LIMIT} complete application packets per month</strong> — each one is a tailored resume, matching cover letter, and interview prep for one job. Enough to feel the difference before committing to anything.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">

          {/* Free */}
          <div className="bg-white rounded-3xl p-8 border" style={{ borderColor: 'rgba(197,198,206,0.2)', boxShadow: '0 4px 24px rgba(3,22,49,0.05)' }}>
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#75777e' }}>Free</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black" style={{ fontFamily: 'Manrope', color: '#031631' }}>$0</span>
                <span className="text-sm font-semibold mb-2" style={{ color: '#75777e' }}>forever</span>
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: '#75777e' }}>
                {FREE_LIMIT} sessions / mo · No credit card required
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: '#44474d' }}>
                  <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#c5c6ce' }}>check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => user ? navigate('/app/dashboard') : navigate('/auth/signup')}
              className="w-full py-3.5 text-sm font-bold rounded-xl border-2 transition-all hover:bg-[#f2f4f6]"
              style={{ borderColor: '#031631', color: '#031631' }}>
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-3xl p-8 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)', boxShadow: '0 8px 40px rgba(14,0,153,0.3)' }}>
            <div className="absolute top-5 right-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Pro</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black" style={{ fontFamily: 'Manrope' }}>{PRO_PRICE}</span>
                <span className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>/month</span>
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {PRO_LIMIT} sessions / mo · Cancel anytime
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: 'rgba(255,255,255,0.8)' }}>check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full py-3.5 text-sm font-bold rounded-xl text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}>
                You're on Pro ✓
              </div>
            ) : (
              <button onClick={handleCTA} disabled={loading}
                className="w-full py-3.5 text-sm font-bold rounded-xl transition-all active:scale-95 hover:shadow-xl flex items-center justify-center gap-2"
                style={{ backgroundColor: 'white', color: '#031631' }}>
                {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                Upgrade to Pro — {PRO_PRICE_LABEL}
              </button>
            )}
          </div>
        </div>

        {/* What's in a session */}
        <div className="max-w-3xl mx-auto mb-16 rounded-2xl p-8"
          style={{ backgroundColor: '#f2f4f6' }}>
          <h3 className="font-extrabold text-lg mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
            What's included in one session?
          </h3>
          <p className="text-sm mb-6" style={{ color: '#44474d' }}>
            One session = one job description analyzed. Everything below is generated simultaneously, from the same profile, in about 2 minutes.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: 'description', label: 'Tailored Resume',       desc: 'Rewritten bullets, prioritized skills, ATS keywords — specific to that job.' },
              { icon: 'mail',        label: 'Matching Cover Letter', desc: 'Same experience and metrics as your resume. Reads as one application.' },
              { icon: 'query_stats', label: 'ATS Match Score',       desc: 'Know where you stand before you apply. See your skill gaps.' },
              { icon: 'psychology',  label: 'Interview STAR Prep',   desc: '4 role-specific questions with fully written answers from your experience.' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3 bg-white rounded-xl p-4"
                style={{ boxShadow: '0 2px 8px rgba(3,22,49,0.04)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#e1e0ff' }}>
                  <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>{f.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: '#031631' }}>{f.label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#75777e' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature comparison */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-extrabold tracking-tight text-center mb-10"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>
            Full comparison
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.05)' }}>
            <div className="grid grid-cols-3 px-6 py-4 border-b" style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
              <div className="font-bold text-sm" style={{ color: '#44474d' }}>Feature</div>
              <div className="text-center font-bold text-sm" style={{ color: '#44474d' }}>Free</div>
              <div className="text-center font-bold text-sm" style={{ color: '#0e0099' }}>Pro</div>
            </div>
            {[
              ['Sessions / month', `${FREE_LIMIT}`, `${PRO_LIMIT}`],
              ['Tailored resume per session', true, true],
              ['Matching cover letter per session', true, true],
              ['ATS match score + gap analysis', true, true],
              ['Interview STAR prep', true, true],
              ['Cover letter tone options', '1', '4'],
              ['Resume templates', '1', '3'],
              ['PDF export', false, true],
              ['Priority AI processing', false, true],
            ].map(([feature, free, pro], i) => (
              <div key={i} className="grid grid-cols-3 px-6 py-4 border-b last:border-0 items-center"
                style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <span className="text-sm" style={{ color: '#031631' }}>{feature}</span>
                <div className="flex justify-center">
                  {typeof free === 'boolean'
                    ? <span className="material-symbols-outlined icon-filled text-[20px]"
                        style={{ color: free ? '#0e0099' : '#c5c6ce' }}>{free ? 'check_circle' : 'cancel'}</span>
                    : <span className="text-sm font-bold" style={{ color: '#44474d' }}>{free}</span>
                  }
                </div>
                <div className="flex justify-center">
                  {typeof pro === 'boolean'
                    ? <span className="material-symbols-outlined icon-filled text-[20px]"
                        style={{ color: pro ? '#0e0099' : '#c5c6ce' }}>{pro ? 'check_circle' : 'cancel'}</span>
                    : <span className="text-sm font-bold" style={{ color: '#0e0099' }}>{pro}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-24">
          <h2 className="text-2xl font-extrabold tracking-tight text-center mb-10"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 4px 16px rgba(3,22,49,0.04)' }}>
                <h3 className="font-bold mb-2" style={{ color: '#031631' }}>{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#44474d' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pb-24">
          <div className="inline-block px-12 py-10 rounded-3xl text-white"
            style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)', boxShadow: '0 8px 40px rgba(14,0,153,0.3)' }}>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3" style={{ fontFamily: 'Manrope' }}>
              Start tailoring for free
            </h2>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {FREE_LIMIT} complete application packets every month — no credit card required.
            </p>
            <button onClick={() => user ? navigate('/app/dashboard') : navigate('/auth/signup')}
              className="px-8 py-4 font-bold rounded-xl text-[#031631] transition-all active:scale-95 hover:shadow-xl text-sm"
              style={{ backgroundColor: 'white' }}>
              {user ? 'Go to Dashboard →' : 'Start for Free →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
