import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../../hooks/useSessions'

export default function QuickStartWizard() {
  const navigate = useNavigate()
  const { createSession } = useSessions()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    jdText: ''
  })

  async function handleSubmit() {
    if (!formData.role || !formData.company || !formData.jdText) return
    setLoading(true)
    try {
      const newSession = await createSession({
        role: formData.role,
        company: formData.company,
        jd_text: formData.jdText
      })
      if (newSession) {
        // Optimization: Go straight to tailoring for the prompt "2-Minute Start"
        navigate(`/app/tailor?session=${newSession.id}`)
      }
    } catch (err) {
      console.error('Wizard failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.role && formData.company && (step < 2 || formData.jdText.length > 50)

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-panel p-8 md:p-10 relative overflow-hidden border-0 shadow-2xl"
        style={{ backgroundColor: 'white', borderRadius: '24px' }}>
        
        {/* Progress header */}
        <div className="flex items-center gap-4 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex flex-col gap-2">
              <div className="h-1.5 rounded-full overflow-hidden" 
                style={{ backgroundColor: step >= s ? '#0e0099' : '#eceef0' }}>
                {step === s && <div className="h-full bg-[#0e0099] animate-shimmer" style={{ width: '100%' }} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-[#0e0099]' : 'text-[#c5c6ce]'}`}>
                {s === 1 ? 'Job Info' : 'Job Details'}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="animate-slide-in">
            <h2 className="text-3xl font-black mb-2 tracking-tight text-[#031631] font-manrope">
              Let's get you hired.
            </h2>
            <p className="text-sm font-semibold text-[#8293b4] mb-8">
              Tell us what role you're targeting. We'll handle the rest.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#0e0099] pl-1">Target Role</label>
                <input 
                  type="text"
                  placeholder="e.g. Senior Product Designer"
                  className="w-full px-5 py-4 rounded-2xl border text-base font-semibold focus:outline-none focus:ring-4 focus:ring-[#0e0099]/5 transition-all placeholder:text-[#c5c6ce]"
                  style={{ borderColor: 'rgba(197,198,206,0.2)' }}
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#0e0099] pl-1">Company Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Google, Tesla, or Local Startup"
                  className="w-full px-5 py-4 rounded-2xl border text-base font-semibold focus:outline-none focus:ring-4 focus:ring-[#0e0099]/5 transition-all placeholder:text-[#c5c6ce]"
                  style={{ borderColor: 'rgba(197,198,206,0.2)' }}
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.role || !formData.company}
                className="group px-8 py-4 bg-[#031631] text-white font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-blue-900/10 hover:shadow-2xl">
                Next Step
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-in">
            <h2 className="text-3xl font-black mb-2 tracking-tight text-[#031631] font-manrope">
              Paste Job Description
            </h2>
            <p className="text-sm font-semibold text-[#8293b4] mb-8">
              Paste the text from the job posting. This is how we tailor your profile.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-[#0e0099] pl-1">Job Description Text</label>
              <textarea 
                placeholder="Paste the full job description here..."
                className="w-full h-48 px-5 py-4 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#0e0099]/5 transition-all placeholder:text-[#c5c6ce] custom-scroll"
                style={{ borderColor: 'rgba(197,198,206,0.2)', resize: 'none' }}
                value={formData.jdText}
                onChange={e => setFormData({...formData, jdText: e.target.value})}
              />
              <p className="text-[10px] font-bold text-[#8293b4] text-right mt-1">
                {formData.jdText.length} characters (min 50 recommended)
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-4 text-sm font-black text-[#8293b4] hover:text-[#031631] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!formData.jdText || formData.jdText.length < 50 || loading}
                className="px-8 py-4 bg-[#031631] text-white font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-blue-900/20 ai-glow-btn">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Launch Session
                    <span className="material-symbols-outlined icon-filled">rocket_launch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0e0099]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0e0099]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
      </div>

      <p className="text-center mt-8 text-[11px] font-bold text-[#b0b1bd] flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[14px]">bolt</span>
        Takes about 2 minutes to complete.
      </p>
    </div>
  )
}
