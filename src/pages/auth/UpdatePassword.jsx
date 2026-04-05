import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoWordmark from '../../assets/brand/jobblitz-wordmark-transparent.png'

export default function UpdatePassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  useEffect(() => {
    document.title = 'Update Password | JobBlitz'
  }, [])

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    
    setLoading(true)
    try {
      await updatePassword(password)
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
            Set new password
          </h1>
          <p className="mb-8 text-center" style={{ color: '#44474d' }}>
            Enter your new password below.
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
              <label className="block text-sm font-semibold mb-2" style={{ color: '#031631' }}>New Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white"
                style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631' }}
                placeholder="Min. 8 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 text-white font-bold rounded-xl shadow-xl transition-all active:scale-95 ai-glow-btn text-base flex items-center justify-center gap-2">
              {loading
                ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Updating...</>
                : 'Update Password'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
