import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FREE_FEATURES = [
  '3 AI tailoring sessions',
  'Match score & skill gap analysis',
  'ATS-optimized resume',
  'Cover letter generation',
  'Interview STAR prep',
  'Master Profile builder',
]

const PRO_FEATURES = [
  'Unlimited tailoring sessions',
  'Match score & skill gap analysis',
  'ATS-optimized resume',
  'Cover letter (4 tones)',
  'Interview STAR prep',
  'All 3 resume templates',
  'PDF export',
  'Priority AI processing',
  'Master Profile builder',
]

const FAQS = [
  {
    q: 'What counts as a tailoring session?',
    a: 'One session = one job description analyzed. Each session generates a tailored resume, cover letter, and interview prep questions simultaneously.',
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
    a: 'We use GPT-4o mini — a state-of-the-art model optimized for professional writing. Your API key is kept secure server-side.',
  },
  {
    q: 'What if I run out of free sessions?',
    a: 'You can still view your existing tailored resumes, cover letters, and interview prep. You just need Pro to run new sessions.',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user, isPro } = useAuth()

  function handleCTA() {
    if (!user) {
      navigate('/auth/signup')
    } else {
      // Stripe integration placeholder
      alert('Stripe integration coming soon — contact us to upgrade manually.')
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
            Start free. Upgrade when ready.
          </h1>
          <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: '#44474d' }}>
            3 full tailoring sessions on us — no credit card required. Upgrade to Pro when you're ready for unlimited.
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
                <span className="text-5xl font-black" style={{ fontFamily: 'Manrope' }}>$19</span>
                <span className="text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>/month</span>
              </div>
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
              <button onClick={handleCTA}
                className="w-full py-3.5 text-sm font-bold rounded-xl transition-all active:scale-95 hover:shadow-xl"
                style={{ backgroundColor: 'white', color: '#031631' }}>
                Upgrade to Pro
              </button>
            )}
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
              ['Tailoring sessions', '3 total', 'Unlimited'],
              ['Match score + gap analysis', true, true],
              ['ATS-optimized resume', true, true],
              ['Cover letter generation', true, true],
              ['Cover letter tones', '1', '4'],
              ['Interview STAR prep', true, true],
              ['Resume templates', '1', '3'],
              ['PDF export', false, true],
              ['Priority AI processing', false, true],
            ].map(([feature, free, pro], i) => (
              <div key={i} className="grid grid-cols-3 px-6 py-4 border-b last:border-0 items-center"
                style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <span className="text-sm" style={{ color: '#031631' }}>{feature}</span>
                <div className="flex justify-center">
                  {typeof free === 'boolean'
                    ? <span className={`material-symbols-outlined icon-filled text-[20px]`}
                      style={{ color: free ? '#0e0099' : '#c5c6ce' }}>{free ? 'check_circle' : 'cancel'}</span>
                    : <span className="text-sm font-bold" style={{ color: '#44474d' }}>{free}</span>
                  }
                </div>
                <div className="flex justify-center">
                  {typeof pro === 'boolean'
                    ? <span className={`material-symbols-outlined icon-filled text-[20px]`}
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
            <p className="mb-6 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              3 full sessions included. No credit card required.
            </p>
            <button onClick={() => user ? navigate('/app/dashboard') : navigate('/auth/signup')}
              className="px-8 py-4 font-bold rounded-xl text-[#031631] transition-all active:scale-95 hover:shadow-xl text-sm"
              style={{ backgroundColor: 'white' }}>
              {user ? 'Go to Dashboard →' : 'Create Free Account →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
