import { useNavigate } from 'react-router-dom'
import { PRO_PRICE, PRO_PRICE_LABEL, PRO_FEATURES } from '../../config/constants'

export function UpgradeGateModal({ onDismiss }) {
  const navigate = useNavigate()

  return (
    <div
      className="absolute inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(3,22,49,0.6)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl text-center animate-slide-in">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
          style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}
        >
          <span className="material-symbols-outlined icon-filled text-[14px]">auto_awesome</span>
          FREE APPLICATIONS USED
        </div>

        <h2
          className="text-3xl font-extrabold tracking-tight mb-3"
          style={{ fontFamily: 'Manrope', color: '#031631' }}
        >
          Upgrade to Pro
        </h2>
        <p className="mb-8 leading-relaxed" style={{ color: '#44474d' }}>
          You've reached your monthly limit for free application packets. Upgrade to Pro for 50 per month,
          unlimited cover letters, and priority processing.
        </p>

        <div className="p-6 rounded-2xl mb-8 text-left" style={{ backgroundColor: '#f2f4f6' }}>
          <div className="flex items-end gap-2 mb-3">
            <span
              className="text-4xl font-black"
              style={{ fontFamily: 'Manrope', color: '#031631' }}
            >
              {PRO_PRICE}
            </span>
            <span className="text-sm font-semibold mb-2" style={{ color: '#44474d' }}>/month</span>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#031631' }}>
                <span
                  className="material-symbols-outlined icon-filled text-[16px]"
                  style={{ color: '#0e0099' }}
                >
                  check_circle
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate('/pricing')}
          className="w-full py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base mb-3"
        >
          Upgrade to Pro — {PRO_PRICE_LABEL}
        </button>
        <button
          onClick={onDismiss}
          className="w-full py-3 font-semibold text-sm transition-colors hover:opacity-70"
          style={{ color: '#75777e' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
