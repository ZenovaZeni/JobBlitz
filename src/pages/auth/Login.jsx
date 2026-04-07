import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoWordmark from '../../assets/brand/jobblitz-wordmark-transparent.png'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth()

  useEffect(() => {
    document.title = 'Login | JobBlitz'
    if (!authLoading && user) navigate('/app/dashboard', { replace: true })
  }, [user, authLoading, navigate])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn({ email, password })
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f7f9fb' }}>
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white"
        style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
        <img src={logoWordmark} alt="JobBlitz" className="h-10 w-fit object-contain brightness-0 invert" 
          style={{ filter: 'brightness(0) invert(1)' }} />
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-6" style={{ fontFamily: 'Manrope' }}>
            Your career data,<br />curated and ready<br />for every opportunity.
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '94%', label: 'Avg match score' },
              { num: '3min', label: 'Per tailored resume' },
              { num: '10k+', label: 'Professionals' },
              { num: '$0.00', label: 'To get started' },
            ].map(s => (
              <div key={s.label} className="p-5 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-3xl font-black mb-1" style={{ fontFamily: 'Manrope' }}>{s.num}</div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2026 JobBlitz AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:p-8">
        <div className="w-full max-w-md animate-slide-in">
          <div className="lg:hidden flex justify-center mb-12">
            <img src={logoWordmark} alt="JobBlitz" className="h-8 w-fit object-contain" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>
            Welcome back
          </h1>
          <p className="mb-8" style={{ color: '#44474d' }}>
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-bold transition-colors hover:opacity-70" style={{ color: '#0e0099' }}>
              Sign up free
            </Link>
          </p>

          {/* Google Sign In */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold border mb-6 transition-all hover:bg-[#f8f9fa] hover:shadow-sm active:scale-[0.98] bg-white select-none group"
            style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}>
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="text-sm">Continue with Google</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c5c6ce' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
              <span className="material-symbols-outlined icon-filled text-[18px]">error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'rgba(197,198,206,0.3)',
                  backgroundColor: 'white',
                  color: '#031631',
                }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold" style={{ color: '#031631' }}>Password</label>
                <Link to="/auth/reset" className="text-xs font-semibold transition-colors hover:opacity-70"
                  style={{ color: '#0e0099' }}>Forgot password?</Link>
              </div>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'rgba(197,198,206,0.3)',
                  backgroundColor: 'white',
                  color: '#031631',
                }}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base mt-2 flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-xs text-center mt-8" style={{ color: '#75777e' }}>
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline">Terms</a> and{' '}
            <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
