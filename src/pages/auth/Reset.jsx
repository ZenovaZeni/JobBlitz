import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoWordmark from '../../assets/brand/jobblitz-wordmark-transparent.png'

export default function Reset() {
  const navigate = useNavigate()
  const { resetPassword, user, loading: authLoading } = useAuth()

  useEffect(() => {
    document.title = 'Reset Password | JobBlitz'
    if (!authLoading && user) navigate('/app/dashboard', { replace: true })
  }, [user, authLoading, navigate])

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="max-w-md text-center animate-slide-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
            <span className="material-symbols-outlined icon-filled text-[36px] text-white">mark_email_read</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>Check your inbox</h1>
          <p className="mb-8 leading-relaxed" style={{ color: '#44474d' }}>
            We've sent a password reset link to <strong>{email}</strong>.
            Click the link in the email to set a new password.
          </p>
          <button onClick={() => navigate('/auth/login')}
            className="px-8 py-4 text-white font-bold rounded-xl shadow-xl active:scale-95 transition-all ai-glow-btn">
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f7f9fb' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:p-8">
        <div className="w-full max-w-md animate-slide-in">
          <div className="flex justify-center mb-12">
            <img src={logoWordmark} alt="JobBlitz" className="h-8 w-fit object-contain" style={{ filter: 'brightness(0) sepia(1) hue-rotate(200deg) saturate(3) opacity(0.8)' }} />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>
            Reset Password
          </h1>
          <p className="mb-8 text-center" style={{ color: '#44474d' }}>
            Enter your email to receive a reset link.
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
              <span className="material-symbols-outlined icon-filled text-[18px]">error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white"
                style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Sending...</>
                : 'Send Reset Link'
              }
            </button>
          </form>

          <p className="text-center mt-8 cursor-pointer">
            <Link to="/auth/login" className="font-bold transition-colors hover:opacity-70 text-sm" style={{ color: '#0e0099' }}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
