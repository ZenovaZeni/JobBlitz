import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { generateCoverLetter } from '../lib/openai'
import { useSessions } from '../hooks/useSessions'
import { useMasterProfile } from '../hooks/useMasterProfile'

const tones = ['Professional', 'Passionate', 'Confident', 'Creative']

export default function CoverLetter() {
  const navigate = useNavigate()
  const { activeSession } = useSession()
  const { saveCoverLetter } = useSessions()
  const { profile: masterProfile } = useMasterProfile()
  const { checkAccess, updateUsage } = useAuth()

  const [tone, setTone] = useState('Professional')
  const [letterText, setLetterText] = useState(activeSession?.coverLetter || '')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  function handleCopy() {
    navigator.clipboard.writeText(letterText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRegenerate() {
    if (!activeSession || !masterProfile) return
    const access = checkAccess('cover_letter')
    if (!access.allowed) {
      alert(access.reason)
      return
    }
    setError('')
    try {
      const newLetter = await generateCoverLetter({
        masterProfile,
        jdText: activeSession.jdText || '',
        company: activeSession.company,
        role: activeSession.role,
        tone,
      })
      setLetterText(newLetter)
      await saveCoverLetter({ sessionId: activeSession.sessionId, tone, content: newLetter })
      await updateUsage('cover_letter').catch(err => console.error('Usage sync failed:', err))
    } catch (err) {
      setError(err.message || 'Failed to regenerate. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const hasSession = !!activeSession && !!letterText

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f2f4f6' }}>
      <SideNav />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Controls */}
        <aside className="w-72 flex-shrink-0 flex flex-col border-r overflow-y-auto custom-scroll"
          style={{ backgroundColor: '#f7f9fb', borderColor: 'rgba(197,198,206,0.15)' }}>
          <header className="px-6 py-6 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Cover Letter
            </h1>
            <p className="text-xs mt-1" style={{ color: '#44474d' }}>
              {activeSession ? `AI-crafted for ${activeSession.company}` : 'No session loaded'}
            </p>
          </header>

          {activeSession && (
            <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>Session</h3>
              <div className="space-y-2">
                {[
                  { icon: 'work', label: activeSession.role },
                  { icon: 'business', label: activeSession.company },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#e1e0ff' }}>
                      <span className="material-symbols-outlined icon-filled text-[14px]" style={{ color: '#0e0099' }}>{item.icon}</span>
                    </div>
                    <span className="text-sm font-medium truncate" style={{ color: '#031631' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>Tone</h3>
            <div className="space-y-2">
              {tones.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: tone === t ? '#031631' : 'rgba(3,22,49,0.04)',
                    color: tone === t ? 'white' : '#44474d',
                  }}>
                  {t}
                  {tone === t && <span className="material-symbols-outlined icon-filled text-[16px]">check</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">
            {error && (
              <div className="p-3 rounded-xl text-xs font-semibold" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>{error}</div>
            )}
            <button onClick={handleRegenerate}
              disabled={!activeSession || generating}
              className="w-full py-3 text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span className={`material-symbols-outlined icon-filled text-[16px] ${generating ? 'animate-spin' : ''}`}>
                {generating ? 'progress_activity' : 'auto_awesome'}
              </span>
              {generating ? 'Regenerating...' : `Regenerate (${tone})`}
            </button>
            <button onClick={handleCopy}
              disabled={!hasSession}
              className="w-full py-3 text-sm font-bold rounded-xl border flex items-center justify-center gap-2 transition-all hover:bg-[#eceef0] disabled:opacity-50"
              style={{ color: '#031631' }}>
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>

          {!activeSession && (
            <div className="px-6 py-5">
              <div className="p-4 rounded-2xl text-center" style={{ backgroundColor: '#f2f4f6' }}>
                <p className="text-sm mb-3" style={{ color: '#44474d' }}>Run a tailoring session to generate your cover letter.</p>
                <button onClick={() => navigate('/app/tailor')}
                  className="w-full py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn">
                  Start Session
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Right: Letter */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="px-8 py-6 border-b glass-panel flex-shrink-0" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#0e0099' }}>Cover Letter</p>
                <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  {activeSession ? `${activeSession.role} at ${activeSession.company}` : 'No session loaded'}
                </h2>
              </div>
              {hasSession && (
                <span className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
                  {tone} Tone
                </span>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            {hasSession ? (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-10" style={{ boxShadow: '0 4px 24px rgba(3,22,49,0.06)', minHeight: '500px' }}>
                  <textarea
                    value={letterText}
                    onChange={e => setLetterText(e.target.value)}
                    className="w-full bg-transparent border-none resize-none focus:outline-none leading-relaxed text-sm"
                    style={{ color: '#191c1e', minHeight: '480px', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-xs" style={{ color: '#c5c6ce' }}>
                    {letterText.split(/\s+/).filter(Boolean).length} words
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => navigate(`/app/session/${activeSession.sessionId}?tab=resume`)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:bg-[#eceef0]"
                      style={{ color: '#031631' }}>View Resume →</button>
                    <button onClick={() => navigate(`/app/session/${activeSession.sessionId}?tab=interview`)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:bg-[#eceef0]"
                      style={{ color: '#0e0099' }}>Interview Prep →</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
                  <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>mail</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No cover letter yet</h2>
                  <p className="max-w-sm text-sm" style={{ color: '#44474d' }}>
                    Run a tailoring session to automatically generate a personalized cover letter.
                  </p>
                </div>
                <button onClick={() => navigate('/app/tailor')}
                  className="px-6 py-3 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2">
                  <span className="material-symbols-outlined icon-filled text-[18px]">bolt</span>
                  Start Tailoring
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
