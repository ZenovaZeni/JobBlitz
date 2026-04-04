import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoWordmark from '../../assets/brand/jobblitz-wordmark-transparent.png'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth()

  useEffect(() => {
    document.title = 'Sign Up | JobBlitz'
    if (!authLoading && user) navigate('/app/dashboard', { replace: true })
  }, [user, authLoading, navigate])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!firstName.trim() || !lastName.trim()) { setError('Please enter your first and last name'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await signUp({ email, password, firstName, lastName })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    try { await signInWithGoogle() }
    catch (err) { setError(err.message) }
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
            We've sent a confirmation email to <strong>{email}</strong>.
            Click the link in the email to activate your account, then come back and sign in.
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
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 text-white"
        style={{ background: 'linear-gradient(135deg, #031631 0%, #0e0099 100%)' }}>
        <img src={logoWordmark} alt="JobBlitz" className="h-10 w-fit object-contain brightness-0 invert" 
          style={{ filter: 'brightness(0) invert(1)' }} />
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-8" style={{ fontFamily: 'Manrope' }}>
            One profile.<br />Every opportunity<br />perfectly matched.
          </h2>
          <div className="space-y-4">
            {[
              { icon: 'upload_file', text: 'Import your resume in 30 seconds' },
              { icon: 'bolt', text: 'AI tailors it to any job instantly' },
              { icon: 'auto_awesome', text: 'Cover letter + interview prep included' },
              { icon: 'lock', text: 'Your data is private and secure' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <span className="material-symbols-outlined icon-filled text-[20px]">{f.icon}</span>
                </div>
                <span className="font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>© 2025 JobBlitz AI · The Digital Atelier</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:p-8">
        <div className="w-full max-w-md animate-slide-in">
          <div className="lg:hidden flex justify-center mb-12">
            <img src={logoWordmark} alt="JobBlitz" className="h-8 w-fit object-contain" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
            <span className="material-symbols-outlined icon-filled text-[12px]">star</span>
            FREE · 3 tailoring sessions included
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-2"
            style={{ fontFamily: 'Manrope', color: '#031631' }}>
            Create your account
          </h1>
          <p className="mb-8" style={{ color: '#44474d' }}>
            Already have one?{' '}
            <Link to="/auth/login" className="font-bold transition-colors hover:opacity-70" style={{ color: '#0e0099' }}>
              Sign in
            </Link>
          </p>

          {/* Google */}
          <button onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold border mb-6 transition-all hover:shadow-md bg-white"
            style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c5c6ce' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
              <span className="material-symbols-outlined icon-filled text-[18px]">error</span>
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>First Name</label>
                <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white"
                  style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                  placeholder="Alex" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>Last Name</label>
                <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white"
                  style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                  placeholder="Sterling" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white"
                style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white"
                style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                placeholder="Min. 8 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base mt-2 flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Creating account...</>
                : 'Create Free Account'
              }
            </button>
          </form>

          <p className="text-xs text-center mt-8" style={{ color: '#75777e' }}>
            By signing up, you agree to our{' '}
            <a href="#" className="underline">Terms of Service</a> and{' '}
            <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
