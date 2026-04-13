import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UsageGate({ children, onUpgrade }) {
  const { canUseAI, isPro } = useAuth()
  const navigate = useNavigate()

  if (canUseAI) return children

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(3,22,49,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl text-center animate-slide-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
          <span className="material-symbols-outlined icon-filled text-[14px]">auto_awesome</span>
          FREE APPLICATIONS USED
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3"
          style={{ fontFamily: 'Manrope', color: '#031631' }}>
          Unlock Pro Access
        </h2>
        <p className="mb-8 leading-relaxed" style={{ color: '#44474d' }}>
          You've used all <strong>5 free application packets</strong> this month. Upgrade to Pro for
          50 sessions per month, all templates, PDF export, and more.
        </p>

        <div className="p-6 rounded-2xl mb-8 text-left" style={{ backgroundColor: '#f2f4f6' }}>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-4xl font-black" style={{ fontFamily: 'Manrope', color: '#031631' }}>$9.99</span>
            <span className="text-sm font-semibold mb-2" style={{ color: '#44474d' }}>/month</span>
          </div>
          <ul className="space-y-2">
            {[
              '50 application packets / mo',
              'Cover letter — 4 tone options',
              'Interview STAR prep',
              'PDF export + all 3 templates',
              'Priority AI processing',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#031631' }}>
                <span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>check_circle</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate('/pricing')}
          className="w-full py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base mb-3">
          Upgrade to Pro — $9.99/mo
        </button>
        <button
          onClick={onUpgrade}
          className="w-full py-3 font-semibold text-sm transition-colors hover:opacity-70"
          style={{ color: '#75777e' }}>
          Maybe later
        </button>
      </div>
    </div>
  )
}
