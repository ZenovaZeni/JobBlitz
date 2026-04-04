import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSession } from '../../context/SessionContext'
import { generateCoverLetter } from '../../lib/openai'
import { useSessions } from '../../hooks/useSessions'
import { useMasterProfile } from '../../hooks/useMasterProfile'

const tones = ['Professional', 'Passionate', 'Confident', 'Creative']

export default function CoverLetterCore() {
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
    setGenerating(true)
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
    <div className="flex flex-1 overflow-hidden h-full relative">
      {/* Left Controls — Desktop Only */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex flex-col border-r overflow-y-auto custom-scroll"
        style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>
        <header className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h2 className="font-bold text-base" style={{ fontFamily: 'Manrope', color: '#031631' }}>Letter Settings</h2>
        </header>

        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>Tone</h3>
          <div className="grid grid-cols-1 gap-2">
            {tones.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: tone === t ? '#031631' : 'white',
                  color: tone === t ? 'white' : '#44474d',
                  border: tone === t ? 'none' : '1px solid rgba(197,198,206,0.1)'
                }}>
                {t}
                {tone === t && <span className="material-symbols-outlined icon-filled text-[16px]">check_circle</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 space-y-3 mt-auto bg-white border-t" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          {error && (
            <div className="p-3 rounded-xl text-[10px] font-semibold mb-2" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>{error}</div>
          )}
          <button onClick={handleRegenerate}
            disabled={!activeSession || generating}
            className="w-full py-4 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center justify-center gap-2 disabled:opacity-50">
            <span className={`material-symbols-outlined icon-filled text-[18px] ${generating ? 'animate-spin' : ''}`}>
              {generating ? 'progress_activity' : 'auto_awesome'}
            </span>
            {generating ? 'Working...' : `Rewrite Letter`}
          </button>
          <button onClick={handleCopy}
            disabled={!hasSession}
            className="w-full py-3.5 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all hover:bg-[#f2f4f6]"
            style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.2)' }}>
            <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scroll dot-grid flex justify-center items-start"
          style={{ paddingBottom: '10rem' }}>
          {hasSession ? (
            <div className="w-full max-w-3xl animate-slide-in">
              <div className="bg-white rounded-2xl p-6 md:p-12 paper-shadow border" style={{ minHeight: '600px', borderColor: 'rgba(197,198,206,0.15)' }}>
                <textarea
                  value={letterText}
                  onChange={e => setLetterText(e.target.value)}
                  className="w-full bg-transparent border-none resize-none focus:outline-none leading-relaxed text-sm md:text-base custom-scroll"
                  style={{ color: '#191c1e', minHeight: '540px', fontFamily: '"Inter", sans-serif' }}
                  placeholder="Your cover letter text will appear here..."
                />
              </div>
              <div className="flex items-center justify-between mt-4 px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b1bd]">
                  {letterText.split(/\s+/).filter(Boolean).length} words · {tone} Tone
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#b0b1bd]">
                  Editable Area
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-4 w-full">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#f2f4f6' }}>
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#0e0099' }}>mail</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No cover letter yet</h2>
                <p className="max-w-sm text-sm font-semibold text-[#8293b4]">Finish tailoring your session to generate a high-impact cover letter.</p>
              </div>
              <button onClick={() => navigate('/app/tailor')}
                className="px-8 py-4 text-white font-black rounded-xl ai-glow-btn flex items-center gap-3 active:scale-95 transition-all">
                <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                Start Tailoring
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(197,198,206,0.3)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
        <div className="px-4 py-3">
          {/* Tone Selector — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {tones.map(t => (
              <button key={t} onClick={() => setTone(t)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: tone === t ? '#031631' : '#f2f4f6',
                  color: tone === t ? 'white' : '#44474d',
                }}>
                {t}
              </button>
            ))}
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleRegenerate} disabled={!activeSession || generating}
              className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 ai-glow-btn disabled:opacity-40 transition-all">
              <span className={`material-symbols-outlined text-[18px] ${generating ? 'animate-spin' : ''}`}>
                {generating ? 'progress_activity' : 'auto_awesome'}
              </span>
              Rewrite
            </button>
            <button onClick={handleCopy} disabled={!hasSession}
              className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631', backgroundColor: 'white' }}>
              <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
              Copy
            </button>
          </div>
          {error && <p className="text-[10px] font-bold text-center mt-2 text-[#93000a]">{error}</p>}
        </div>
      </div>
    </div>
  )
}
