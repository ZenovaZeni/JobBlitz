import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#f7f9fb] py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold mb-8 transition-colors hover:opacity-70" style={{ color: '#0e0099' }}>
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        
        <h1 className="text-3xl font-extrabold mb-6" style={{ fontFamily: 'Manrope', color: '#031631' }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: '#75777e' }}>Last updated: April 2, 2026</p>

        <div className="prose prose-sm max-w-none text-slate-600 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, import a resume, or use our AI tailoring tools. This includes your name, email address, and professional experience.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve our services, specifically to power the AI tailoring logic and save your career materials. Your data is processed securely through OpenAI's API.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">3. Data Security and Retention</h2>
            <p>Your resume data is encrypted at rest. We do not sell your personal data to third parties. We retain your information for as long as your account is active.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">4. Your Rights</h2>
            <p>You have the right to access, export, or delete your personal information at any time through your account settings or by contacting us.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
