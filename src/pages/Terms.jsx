import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#f7f9fb] py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-12 shadow-sm border" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold mb-8 transition-colors hover:opacity-70" style={{ color: '#0e0099' }}>
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>
        
        <h1 className="text-3xl font-extrabold mb-6" style={{ fontFamily: 'Manrope', color: '#031631' }}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{ color: '#75777e' }}>Last updated: April 2, 2026</p>

        <div className="prose prose-sm max-w-none text-slate-600 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account on JobBlitz, you agree to follow these Terms of Service and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">2. Description of Service</h2>
            <p>JobBlitz provides AI-powered tools for tailoring career materials. We reserve the right to modify or discontinue any part of the service at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">3. Subscription and Billing</h2>
            <p>Subscription fees are billed monthly through Stripe. You may cancel your subscription at any time through the Billing Portal. No refunds are provided for partial months.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#031631] mb-2">4. User Content</h2>
            <p>You retain ownership of the data you upload. By using the service, you grant us the right to process your data specifically for providing the requested AI generating services.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
