import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import logoWordmark from '../assets/brand/jobblitz-wordmark-transparent.png'
import DemoSection from '../components/landing/DemoSection'

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [openFaq, setOpenFaq] = useState(null)

  useEffect(() => {
    if (!loading && user) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const faqs = [
    {
      q: "Won't it sound like it was written by a machine?",
      a: "The outputs are reframings of your experience, not text generated from nothing. We restructure your words around what the job actually values. If you wrote 'managed a team,' we don't invent details — we surface why that experience matters for this specific role.",
    },
    {
      q: "I apply to very different types of roles.",
      a: "One profile, unlimited packets. The same background gets read differently for a product role versus an engineering one — different parts of your experience get surfaced each time. Nothing is fabricated.",
    },
    {
      q: "My resume is already tailored. Is this worth it?",
      a: "Worth running through for the cover letter alone. Most candidates spend 30–45 minutes writing a matching one from scratch. JobBlitz generates it in under 2 minutes, tied to the same experience your resume references. The match score is a useful second opinion too.",
    },
    {
      q: "What does 'free' actually mean?",
      a: "5 complete packets per month — tailored resume, cover letter, and interview prep — at no cost. No credit card to sign up. The only thing behind a paywall is volume: 50 packets/month on the Pro plan.",
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f9fb', fontFamily: 'Inter, sans-serif' }}>

      {/* ===== TOP NAV ===== */}
      <header className="glass-panel sticky top-0 z-50 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src={logoWordmark} alt="JobBlitz" className="h-7 w-fit object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold tracking-tight" style={{ fontFamily: 'Manrope' }}>
            <a href="#packet" className="transition-colors hover:opacity-70" style={{ color: '#1A2B47', borderBottom: '2px solid #1A2B47', paddingBottom: '2px' }}>What's in a Packet</a>
            <a href="#how-it-works" className="transition-colors hover:opacity-70" style={{ color: '#5c6d8c' }}>How It Works</a>
            <a href="/pricing" className="transition-colors hover:opacity-70" style={{ color: '#5c6d8c' }}>Pricing</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => navigate('/auth/login')}
              className="px-3 sm:px-5 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80"
              style={{ color: '#5c6d8c' }}>
              Login
            </button>
            <button onClick={() => navigate('/auth/signup')}
              className="px-4 sm:px-6 py-2.5 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 ai-glow-btn whitespace-nowrap">
              Get Started Free
            </button>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0e0099 0%, transparent 70%)' }} />

        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left */}
          <div className="z-10 animate-slide-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
              <span className="material-symbols-outlined icon-filled text-[14px]">colors_spark</span>
              ONE PASTE. ONE COMPLETE PACKET.
            </div>
            <h1 className="font-black text-[1.65rem] sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6"
              style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.02em' }}>
              Paste a job description.{' '}
              <span style={{ color: '#0e0099' }}>Get a complete application packet in under 2 minutes.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-xl mb-8 sm:mb-10 leading-relaxed" style={{ color: '#44474d' }}>
              Most applications are a generic resume and a cover letter written from scratch — disconnected,
              inconsistent, and forgettable. JobBlitz generates a tailored resume, a matching cover letter,
              and interview prep from the same job analysis. All three read as one coherent application.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button onClick={() => navigate('/app/import')}
                className="px-6 sm:px-8 py-3.5 sm:py-4 text-white text-sm sm:text-base font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn">
                Build my first packet free
              </button>
              <a href="#live-demo"
                className="px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-95 cursor-pointer"
                style={{ backgroundColor: '#eceef0', color: '#031631' }}>
                <span className="material-symbols-outlined">south</span>
                See it work on a real job
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 sm:mt-10">
              {[
                { icon: 'check_circle', label: 'Free to start — no credit card' },
                { icon: 'lock', label: 'Your resume data stays private' },
                { icon: 'link', label: 'All three outputs from one analysis' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>{icon}</span>
                  <span className="text-sm font-medium" style={{ color: '#44474d' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Mockup */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-full opacity-20 blur-3xl"
              style={{ background: 'linear-gradient(135deg, #e1e0ff, #d6e3ff)' }} />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border"
              style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
              {/* Browser chrome */}
              <div className="h-8 flex items-center px-4 gap-1.5" style={{ backgroundColor: '#f2f4f6', borderBottom: '1px solid #eceef0' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(186,26,26,0.2)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(84,95,114,0.2)' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(3,22,49,0.2)' }} />
                <div className="flex-1 mx-4 h-4 rounded-sm" style={{ backgroundColor: '#e6e8ea' }} />
              </div>
              {/* App preview */}
              <div className="flex" style={{ aspectRatio: '4/3' }}>
                {/* Mini sidebar */}
                <div className="w-14 flex flex-col items-center py-4 gap-5" style={{ backgroundColor: '#f2f4f6', borderRight: '1px solid #eceef0' }}>
                  <span className="material-symbols-outlined icon-filled text-[20px]" style={{ color: '#031631' }}>dashboard</span>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: 'rgba(68,71,77,0.3)' }}>description</span>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: 'rgba(68,71,77,0.3)' }}>psychology</span>
                </div>
                {/* Content */}
                <div className="flex-1 p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="h-4 w-36 rounded" style={{ backgroundColor: '#eceef0' }} />
                      <div className="h-3 w-24 rounded" style={{ backgroundColor: '#f2f4f6' }} />
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: '#031631' }}>Save</div>
                  </div>
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded w-full" style={{ backgroundColor: '#eceef0' }} />
                      <div className="h-3 rounded w-4/5" style={{ backgroundColor: '#eceef0' }} />
                      <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(225,224,255,0.4)', border: '1px solid rgba(14,0,153,0.08)' }}>
                        <div className="flex items-center gap-1 mb-2">
                          <span className="material-symbols-outlined icon-filled text-[12px]" style={{ color: '#0e0099' }}>link</span>
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#0e0099' }}>MATCHED TO THIS ROLE</span>
                        </div>
                        <div className="h-2 rounded mb-1" style={{ backgroundColor: 'rgba(14,0,153,0.12)' }} />
                        <div className="h-2 rounded w-4/5" style={{ backgroundColor: 'rgba(14,0,153,0.08)' }} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl"
                      style={{ backgroundColor: '#f2f4f6', minWidth: '80px' }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg"
                        style={{ border: '3px solid #0e0099', color: '#0e0099' }}>
                        94%
                      </div>
                      <div className="text-[8px] font-bold uppercase tracking-wider mt-1" style={{ color: '#44474d' }}>Match</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRANSPARENCY BAR ===== */}
      <div className="py-5 border-y" style={{ backgroundColor: '#f2f4f6', borderColor: '#eceef0' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 flex flex-wrap gap-x-6 sm:gap-x-10 gap-y-3 justify-center items-center">
          {[
            { icon: 'bolt', text: 'Structured output — not keyword stuffing' },
            { icon: 'visibility_off', text: 'Your data is never sold or shared' },
            { icon: 'price_check', text: 'Transparent pricing — no surprise charges' },
            { icon: 'all_inclusive', text: '5 complete packets free, every month' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <span className="material-symbols-outlined icon-filled text-[15px]" style={{ color: '#0e0099' }}>{icon}</span>
              <span className="text-xs font-semibold" style={{ color: '#44474d' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== LIVE DEMO ===== */}
      <DemoSection />

      {/* ===== WHAT'S IN A PACKET ===== */}
      <section id="packet" className="py-16 md:py-24" style={{ backgroundColor: '#f2f4f6' }}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
              <span className="material-symbols-outlined icon-filled text-[12px]">inventory_2</span>
              WHAT'S IN EVERY PACKET
            </div>
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-4" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Four outputs. One job paste. One coherent story.
            </h2>
            <p className="max-w-2xl mx-auto text-base leading-relaxed" style={{ color: '#44474d' }}>
              Every packet is generated from the same analysis of your background and the job description.
              That's why your resume, cover letter, and interview answers all reference the same experience —
              they were built together, not in separate steps.
            </p>
          </div>
          <div className="grid md:grid-cols-12 gap-4 sm:gap-6">

            {/* Wide card — Resume */}
            <div className="md:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 card-shadow border hover:shadow-md transition-all"
              style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold mb-5"
                    style={{ backgroundColor: '#eceef0', color: '#44474d' }}>
                    <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center text-white" style={{ backgroundColor: '#031631' }}>1</span>
                    PACKET OUTPUT
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Your resume, rewritten for this role
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#44474d' }}>
                    JobBlitz surfaces the parts of your experience most relevant to the role and restructures
                    your bullets around the job's language and requirements. Your words — not templates.
                    The result reads like you wrote it for this job, because in effect, you did.
                  </p>
                  <button onClick={() => navigate('/app/import')}
                    className="mt-6 flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                    style={{ color: '#0e0099' }}>
                    Build your first packet free <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="flex-1 w-full h-48 rounded-2xl overflow-hidden" style={{ backgroundColor: '#f7f9fb', border: '1px solid #eceef0' }}>
                  <div className="w-full h-full p-5 flex flex-col gap-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#c5c6ce' }}>Resume bullet — before</div>
                    <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: '#eceef0', color: '#75777e' }}>
                      "Led backend development on multiple projects and collaborated with cross-functional teams."
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#0e0099' }}>After — matched to this role</div>
                    <div className="p-3 rounded-xl text-xs leading-relaxed font-medium" style={{ backgroundColor: 'rgba(225,224,255,0.4)', border: '1px solid rgba(14,0,153,0.12)', color: '#031631' }}>
                      "Redesigned the payments reconciliation pipeline for a platform processing $3M/month — cut failure rate by 41% and reduced manual review time by 70%."
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Match score card */}
            <div className="md:col-span-4 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold mb-8"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                  <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>2</span>
                  PACKET OUTPUT
                </div>
                <span className="material-symbols-outlined icon-filled text-white mb-4 block" style={{ fontSize: 28 }}>query_stats</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>Know where you stand before you apply</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(178,195,218,1)' }}>
                  See how well your tailored resume matches the job — which keywords land,
                  what's missing, and whether a targeted rewrite is worth it. No surprises after you submit.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>Match score</span><span>85%</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: '#c0c1ff' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Cover letter card */}
            <div className="md:col-span-4 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col text-white"
              style={{ backgroundColor: '#0e0099' }}>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold mb-8"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                  <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>3</span>
                  PACKET OUTPUT
                </div>
                <span className="material-symbols-outlined text-white mb-4 block" style={{ fontSize: 28 }}>mail</span>
              </div>
              <div className="mt-auto">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>A cover letter that matches your resume</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Not written from scratch. Generated from the same job analysis — so both documents
                  reference the same experience and metrics. They read as one application,
                  not two documents you wrote separately.
                </p>
              </div>
            </div>

            {/* Wide card — Interview prep */}
            <div className="md:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 card-shadow border hover:shadow-md transition-all"
              style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 h-48 w-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#f7f9fb', border: '1px solid #eceef0' }}>
                  <div className="w-full h-full flex flex-col p-5 gap-2">
                    {[
                      { q: '"Tell me about a time you led a team under pressure."', tag: 'BEHAVIORAL' },
                      { q: '"Walk me through how you\'d approach a payments reliability incident."', tag: 'TECHNICAL' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3 flex-1 border" style={{ borderColor: '#eceef0' }}>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded tracking-wider mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>{item.tag}</span>
                        <p className="text-xs font-medium" style={{ color: '#031631' }}>{item.q}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold mb-5"
                    style={{ backgroundColor: '#eceef0', color: '#44474d' }}>
                    <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center text-white" style={{ backgroundColor: '#031631' }}>4</span>
                    PACKET OUTPUT
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Interview prep tied to the same job
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#44474d' }}>
                    Four role-specific questions with STAR-method answers drawn from the same experience
                    in your resume. Walk in knowing what to say — not just that you applied.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16 pb-8"
            style={{ borderBottom: '1px solid rgba(197,198,206,0.15)' }}>
            <div>
              <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                How a packet comes together
              </h2>
              <p style={{ color: '#44474d' }}>Three inputs. One coherent output. Usually under 2 minutes.</p>
            </div>
            <div className="hidden md:block text-8xl font-black" style={{ color: '#eceef0' }}>PROCESS</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: '01',
                title: 'Import your experience once',
                desc: 'Upload a resume, paste your work history, or describe your background. JobBlitz structures your experience, pulls out your metrics, and builds the foundation every packet is generated from. You never rewrite your history again.',
                action: () => navigate('/app/import'),
                cta: 'Import your resume →',
              },
              {
                num: '02',
                title: 'Paste any job description',
                desc: 'Drop in a job posting. JobBlitz reads the role\'s requirements, identifies what from your background matters most, and builds a job-specific analysis — the same one that drives all four packet outputs.',
                action: () => navigate('/app/tailor'),
                cta: 'Build your first packet →',
              },
              {
                num: '03',
                title: 'Receive your complete packet',
                desc: 'A tailored resume, a cover letter that references the same experience, and interview prep tied to the same role — all from one analysis. Everything tells the same story. Ready to submit.',
                action: () => navigate('/app/dashboard'),
                cta: 'See the dashboard →',
              },
            ].map(step => (
              <div key={step.num} className="space-y-5">
                <div className="text-6xl font-black" style={{ color: 'rgba(14,0,153,0.08)', fontFamily: 'Manrope' }}>{step.num}</div>
                <h3 className="text-xl font-bold" style={{ fontFamily: 'Manrope', color: '#031631' }}>{step.title}</h3>
                <p className="leading-relaxed" style={{ color: '#44474d' }}>{step.desc}</p>
                <button onClick={step.action}
                  className="text-sm font-bold transition-all hover:gap-3 flex items-center gap-2"
                  style={{ color: '#0e0099' }}>
                  {step.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OBJECTIONS / FAQ ===== */}
      <section className="py-16 md:py-24 px-4 md:px-8" style={{ backgroundColor: '#f2f4f6' }}>
        <div className="max-w-screen-md mx-auto">
          <div className="mb-12">
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl mb-3" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Common questions
            </h2>
            <p style={{ color: '#44474d' }}>Honest answers — no marketing copy.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border overflow-hidden transition-all"
                style={{ borderColor: openFaq === i ? 'rgba(14,0,153,0.2)' : 'rgba(197,198,206,0.2)' }}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-bold text-base" style={{ color: '#031631' }}>{faq.q}</span>
                  <span className="material-symbols-outlined flex-shrink-0 transition-transform duration-300"
                    style={{ color: '#0e0099', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <div className="h-px mb-5" style={{ backgroundColor: '#eceef0' }} />
                    <p className="leading-relaxed" style={{ color: '#44474d' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto rounded-2xl sm:rounded-[3rem] overflow-hidden relative"
          style={{ backgroundColor: '#031631' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(14,0,153,0.4) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#0e0099', transform: 'translate(30%, 30%)' }} />
          <div className="relative z-10 px-5 sm:px-8 py-14 sm:py-20 md:py-32 text-center max-w-3xl mx-auto">
            <h2 className="font-bold text-2xl sm:text-4xl md:text-5xl text-white mb-6 leading-tight"
              style={{ fontFamily: 'Manrope' }}>
              One complete packet. Every job. In under 2 minutes.
            </h2>
            <p className="text-lg mb-4 leading-relaxed" style={{ color: '#8293b4' }}>
              Build your profile once. Every application after that is a tailored resume, matching cover letter,
              and interview prep — in the time it takes to read the job description.
            </p>
            <p className="text-sm mb-12 font-semibold" style={{ color: 'rgba(193,200,214,0.7)' }}>
              5 complete packets free every month. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/app/import')}
                className="px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold rounded-2xl shadow-xl transition-all active:scale-95 hover:brightness-110"
                style={{ backgroundColor: '#e1e0ff', color: '#07006c' }}>
                Build my first packet free
              </button>
              <button onClick={() => navigate('/pricing')}
                className="px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold rounded-2xl transition-all active:scale-95 hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                See Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: '#f7f9fb', borderTop: '1px solid #eceef0' }}>
        <div className="w-full px-4 md:px-8 py-10 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoWordmark} alt="JobBlitz" className="h-6 w-fit object-contain" />
            <p className="text-xs tracking-wide" style={{ color: '#5c6d8c' }}>© 2026 JobBlitz AI. Built for the modern job search.</p>
          </div>
          <div className="flex gap-8">
            <a href="/privacy" className="text-xs tracking-wide transition-all hover:opacity-100" style={{ color: '#5c6d8c' }}>Privacy Policy</a>
            <a href="/terms" className="text-xs tracking-wide transition-all hover:opacity-100" style={{ color: '#5c6d8c' }}>Terms of Service</a>
          </div>
          <div className="flex gap-3">
            {['language', 'share'].map(icon => (
              <div key={icon} className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:opacity-70"
                style={{ backgroundColor: '#eceef0', color: '#44474d' }}>
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
