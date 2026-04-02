import { useNavigate } from 'react-router-dom'

function FeatureCard({ icon, title, desc, accent = false, wide = false }) {
  return (
    <div className={`rounded-3xl p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-md
      ${wide ? 'md:col-span-8' : 'md:col-span-4'}
      ${accent ? 'text-white' : 'bg-white border card-shadow'}
    `}
      style={accent ? { background: 'linear-gradient(135deg, #031631, #0e0099)' } : {}}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
        ${accent ? 'bg-white/10' : ''}`}
        style={!accent ? { backgroundColor: '#d6e3ff' } : {}}>
        <span className="material-symbols-outlined text-[24px]"
          style={{ color: accent ? 'white' : '#031631' }}>{icon}</span>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: accent ? 'white' : '#031631' }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: accent ? 'rgba(255,255,255,0.7)' : '#44474d' }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f9fb', fontFamily: 'Inter, sans-serif' }}>

      {/* ===== TOP NAV ===== */}
      <header className="glass-panel sticky top-0 z-50 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-xl font-black tracking-tighter cursor-pointer"
            style={{ fontFamily: 'Manrope', color: '#1A2B47' }}>
            JobBlitz
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold tracking-tight" style={{ fontFamily: 'Manrope' }}>
            <a href="#features" className="transition-colors hover:opacity-70" style={{ color: '#1A2B47', borderBottom: '2px solid #1A2B47', paddingBottom: '2px' }}>Product</a>
            <a href="#how-it-works" className="transition-colors hover:opacity-70" style={{ color: '#5c6d8c' }}>How It Works</a>
            <a href="/pricing" className="transition-colors hover:opacity-70" style={{ color: '#5c6d8c' }}>Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/auth/login')}
              className="px-5 py-2 text-sm font-semibold rounded-lg transition-all hover:opacity-80"
              style={{ color: '#5c6d8c' }}>
              Login
            </button>
            <button onClick={() => navigate('/auth/signup')}
              className="px-6 py-2.5 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 ai-glow-btn">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #0e0099 0%, transparent 70%)' }} />

        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left */}
          <div className="z-10 animate-slide-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
              <span className="material-symbols-outlined icon-filled text-[14px]">colors_spark</span>
              AI-POWERED CAREER CURATION
            </div>
            <h1 className="font-black text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6"
              style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.02em' }}>
              Tailor your resume for every job{' '}
              <span style={{ color: '#0e0099' }}>without starting over.</span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: '#44474d' }}>
              Import your experience once, match it to any job description, and generate a better resume,
              cover letter, and interview prep in minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/app/import')}
                className="px-8 py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn">
                Get Started for Free
              </button>
              <button onClick={() => navigate('/app/dashboard')}
                className="px-8 py-4 font-bold rounded-xl flex items-center gap-2 transition-all hover:shadow-md active:scale-95"
                style={{ backgroundColor: '#eceef0', color: '#031631' }}>
                <span className="material-symbols-outlined">play_circle</span>
                Try Demo
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {['photo-1568602471122', 'photo-1500648767791', 'photo-1494790108377'].map((img, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                    <img src={`https://images.unsplash.com/${img}-be9c29b29330?w=40&h=40&fit=crop&crop=face`}
                      alt="" className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'} />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium" style={{ color: '#44474d' }}>
                <span className="font-bold" style={{ color: '#031631' }}>10,000+</span> professionals accelerating their job search
              </p>
            </div>
          </div>

          {/* Right: Product Mockup — hidden on mobile to save space */}
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
                          <span className="material-symbols-outlined icon-filled text-[12px]" style={{ color: '#0e0099' }}>auto_awesome</span>
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: '#0e0099' }}>AI SUGGESTION</span>
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

      {/* ===== TRUST BAR ===== */}
      <div className="py-6 border-y" style={{ backgroundColor: '#f2f4f6', borderColor: '#eceef0' }}>
        <div className="max-w-screen-xl mx-auto px-8 flex flex-wrap gap-8 justify-center items-center">
          {['Google', 'Stripe', 'Airbnb', 'Apple', 'Meta', 'Netflix'].map(co => (
            <span key={co} className="text-sm font-bold tracking-widest uppercase"
              style={{ color: 'rgba(68,71,77,0.35)' }}>{co}</span>
          ))}
        </div>
      </div>

      {/* ===== FEATURES BENTO ===== */}
      <section id="features" className="py-16 md:py-24" style={{ backgroundColor: '#f2f4f6' }}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl mb-4" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Precision tools for the modern candidate
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: '#44474d' }}>
              Skip the generic templates. Use specialized AI agents designed to handle the nuances of technical and creative hiring.
            </p>
          </div>
          <div className="grid md:grid-cols-12 gap-6">
            {/* Wide card */}
            <div className="md:col-span-8 bg-white rounded-3xl p-8 card-shadow border hover:shadow-md transition-all"
              style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#d6e3ff' }}>
                    <span className="material-symbols-outlined" style={{ color: '#031631' }}>bolt</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope', color: '#031631' }}>Tailor in Seconds</h3>
                  <p className="leading-relaxed" style={{ color: '#44474d' }}>
                    Our AI analyzes job descriptions instantly, highlighting the skills and experiences you need to emphasize to beat the ATS and reach a human recruiter.
                  </p>
                  <button onClick={() => navigate('/app/tailor')}
                    className="mt-6 flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                    style={{ color: '#0e0099' }}>
                    Try it now <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="flex-1 w-full h-48 rounded-2xl overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                  {/* Abstract visual */}
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-end p-4 gap-1">
                      {[60, 80, 45, 90, 70, 85, 50, 95].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t transition-all"
                          style={{ height: `${h}%`, backgroundColor: i === 7 ? '#0e0099' : `rgba(3,22,49,${0.05 + i * 0.04})` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accent card */}
            <div className="md:col-span-4 rounded-3xl p-8 flex flex-col justify-between text-white"
              style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-12" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined icon-filled text-white">query_stats</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>Smart Match Scores</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(178,195,218,1)' }}>
                  Get a real-time percentage score on how well your resume matches the job requirements.
                </p>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: '#c0c1ff' }} />
                </div>
              </div>
            </div>

            {/* Purple card */}
            <div className="md:col-span-4 rounded-3xl p-8 flex flex-col text-white"
              style={{ backgroundColor: '#0e0099' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-auto" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <span className="material-symbols-outlined text-white">visibility</span>
              </div>
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope' }}>Live Preview</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  See your changes in real-time on a professional, print-ready document as you edit.
                </p>
              </div>
            </div>

            {/* Wide card 2 */}
            <div className="md:col-span-8 bg-white rounded-3xl p-8 card-shadow border hover:shadow-md transition-all"
              style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 h-48 w-full rounded-2xl overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                  <div className="w-full h-full flex flex-col p-5 gap-2">
                    {[
                      { q: '"Tell me about a time you led a team..."', tag: 'BEHAVIORAL' },
                      { q: '"How do you approach system design?"', tag: 'TECHNICAL' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3 flex-1">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded tracking-wider mt-0.5" style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>{item.tag}</span>
                        <p className="text-xs font-medium" style={{ color: '#031631' }}>{item.q}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: '#e1e0ff' }}>
                    <span className="material-symbols-outlined" style={{ color: '#2f2ebe' }}>psychology</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Manrope', color: '#031631' }}>Interview STAR Prep</h3>
                  <p className="leading-relaxed" style={{ color: '#44474d' }}>
                    Generate tailored behavioral interview questions and STAR-method responses based on your unique experience and the target role.
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
              <h2 className="font-bold text-4xl mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                Three steps to your next role
              </h2>
              <p style={{ color: '#44474d' }}>The Digital Atelier workflow: clean, fast, and focused.</p>
            </div>
            <div className="hidden md:block text-8xl font-black" style={{ color: '#eceef0' }}>PROCESS</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                num: '01', title: 'Build Master Profile',
                desc: 'Upload your current resume or LinkedIn profile. Our AI extracts every achievement, metric, and skill into your Digital Atelier vault.',
                action: () => navigate('/app/import'), cta: 'Import Resume →'
              },
              {
                num: '02', title: 'Paste Job Description',
                desc: 'Drop in the URL or text of any job posting. The AI immediately identifies the "silent keywords" and critical requirements recruiters are looking for.',
                action: () => navigate('/app/tailor'), cta: 'Start Tailoring →'
              },
              {
                num: '03', title: 'Get Tailored Content',
                desc: 'Download your custom-fit resume, a matching cover letter, and a personalized interview cheat sheet — all perfectly synced to that specific job.',
                action: () => navigate('/app/dashboard'), cta: 'See Dashboard →'
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

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto rounded-[3rem] overflow-hidden relative"
          style={{ backgroundColor: '#031631' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(14,0,153,0.4) 0%, transparent 60%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#0e0099', transform: 'translate(30%, 30%)' }} />
          <div className="relative z-10 px-8 py-20 md:py-32 text-center max-w-3xl mx-auto">
            <h2 className="font-bold text-4xl md:text-5xl text-white mb-6 leading-tight"
              style={{ fontFamily: 'Manrope' }}>
              Ready to land your dream job?<br />Start tailoring now.
            </h2>
            <p className="text-lg mb-12" style={{ color: '#8293b4' }}>
              Join 10,000+ professionals who have accelerated their job search with the JobBlitz Digital Atelier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/app/import')}
                className="px-10 py-5 font-bold rounded-2xl shadow-xl transition-all active:scale-95 hover:brightness-110"
                style={{ backgroundColor: '#e1e0ff', color: '#07006c' }}>
                Create Your Profile
              </button>
              <button onClick={() => navigate('/app/dashboard')}
                className="px-10 py-5 font-bold rounded-2xl transition-all active:scale-95 hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: '#f7f9fb', borderTop: '1px solid #eceef0' }}>
        <div className="w-full px-4 md:px-8 py-10 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="text-xl font-black tracking-tighter" style={{ fontFamily: 'Manrope', color: '#1A2B47' }}>JobBlitz</div>
            <p className="text-xs tracking-wide" style={{ color: '#5c6d8c' }}>© 2025 JobBlitz AI. Built for the Digital Atelier.</p>
          </div>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(link => (
              <a key={link} href="#"
                className="text-xs tracking-wide transition-all hover:opacity-100"
                style={{ color: '#5c6d8c' }}>{link}</a>
            ))}
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
