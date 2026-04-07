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
  const { checkAccess, updateUsage, isPro } = useAuth()

  const [tone, setTone] = useState('Professional')
  const [letterText, setLetterText] = useState(activeSession?.coverLetter || '')
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const wordCount = letterText.trim() ? letterText.trim().split(/\s+/).length : 0

  function handleCopy() {
    navigator.clipboard.writeText(letterText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    if (!letterText) return
    const filename = activeSession
      ? `Cover Letter — ${activeSession.role} at ${activeSession.company}.txt`
      : 'Cover Letter.txt'
    const blob = new Blob([letterText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
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
    <div className="flex flex-1 overflow-hidden h-full relative flex-col lg:flex-row bg-[#f7f9fb]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scroll dot-grid flex justify-center items-start pb-40 lg:pb-12">
          {hasSession ? (
            <div className="w-full flex flex-col items-center gap-3 animate-slide-in">
              {/* Application context + meta row */}
              <div className="w-full max-w-[816px] px-1 flex flex-col gap-1">
                {activeSession?.role && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#8293b4' }}>Cover Letter ·</span>
                    <span className="text-[10px] font-bold" style={{ color: '#031631' }}>{activeSession.role}</span>
                    <span className="text-[10px]" style={{ color: '#8293b4' }}>at {activeSession.company}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: '#8293b4' }}>
                    {wordCount} words
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                    {tone}
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 md:p-[64px_72px] paper-shadow w-full max-w-[816px]" style={{ minHeight: '1056px' }}>
                <textarea
                  value={letterText}
                  onChange={e => setLetterText(e.target.value)}
                  className="w-full h-full bg-transparent border-none resize-none focus:outline-none leading-relaxed text-[13px] md:text-sm custom-scroll"
                  style={{ color: '#333', minHeight: '850px', fontFamily: '"Inter", sans-serif' }}
                  placeholder="Your cover letter text will appear here..."
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-4 w-full">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#f2f4f6' }}>
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#0e0099' }}>mail</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  {activeSession ? `Cover letter for ${activeSession.company}` : 'No active application'}
                </h2>
                <p className="max-w-sm text-sm font-semibold text-[#8293b4]">
                  {activeSession
                    ? `Generate a personalized letter for the ${activeSession.role} role. Uses your master profile and the job description.`
                    : 'Open an application packet first, then generate a cover letter tailored to that role.'}
                </p>
              </div>
              {activeSession ? (
                <button onClick={handleRegenerate} disabled={generating}
                  className="px-8 py-4 text-white font-black rounded-xl ai-glow-btn flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                  <span className={`material-symbols-outlined icon-filled text-[20px] ${generating ? 'animate-spin' : ''}`}>
                    {generating ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  {generating ? 'Generating...' : 'Generate Cover Letter'}
                </button>
              ) : (
                <button onClick={() => navigate('/app/tailor')}
                  className="px-8 py-4 text-white font-black rounded-xl ai-glow-btn flex items-center gap-3 active:scale-95 transition-all">
                  <span className="material-symbols-outlined icon-filled text-[20px]">bolt</span>
                  Build Application Packet
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls — Desktop Only */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex flex-col border-l overflow-y-auto custom-scroll"
        style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>
        <header className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h2 className="font-bold text-base" style={{ fontFamily: 'Manrope', color: '#031631' }}>Cover Letter</h2>
          {activeSession?.role && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: '#8293b4' }}>
              {activeSession.role} · {activeSession.company}
            </p>
          )}
        </header>

        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>Tone</h3>
          <div className="grid grid-cols-1 gap-2">
            {tones.map((t, i) => {
              const isLocked = i > 0 && !isPro
              return (
                <button key={t}
                  onClick={() => isLocked ? navigate('/pricing') : setTone(t)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: tone === t ? '#031631' : 'white',
                    color: tone === t ? 'white' : isLocked ? '#75777e' : '#44474d',
                    border: tone === t ? 'none' : '1px solid rgba(197,198,206,0.1)',
                    opacity: isLocked ? 0.7 : 1,
                  }}>
                  <span className="flex items-center gap-2">
                    {t}
                    {isLocked && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>Pro</span>
                    )}
                  </span>
                  {tone === t
                    ? <span className="material-symbols-outlined icon-filled text-[16px]">check_circle</span>
                    : isLocked
                      ? <span className="material-symbols-outlined text-[14px]">lock</span>
                      : null
                  }
                </button>
              )
            })}
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
            {generating ? 'Working...' : hasSession ? 'Rewrite Letter' : 'Generate Letter'}
          </button>
          <div className="flex gap-2">
            <button onClick={handleCopy}
              disabled={!hasSession}
              className="flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all hover:bg-[#f2f4f6] disabled:opacity-40"
              style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.2)' }}>
              <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownload}
              disabled={!hasSession}
              className="flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all hover:bg-[#f2f4f6] disabled:opacity-40"
              style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.2)' }}>
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Action Bar */}
      <div className="lg:hidden fixed above-bottom-nav left-0 right-0 z-40 border-t"
        style={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(197,198,206,0.3)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
        <div className="px-4 py-3">
          {/* Tone Selector — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {tones.map((t, i) => {
              const isLocked = i > 0 && !isPro
              return (
                <button key={t}
                  onClick={() => isLocked ? navigate('/pricing') : setTone(t)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  style={{
                    backgroundColor: tone === t ? '#031631' : '#f2f4f6',
                    color: tone === t ? 'white' : '#44474d',
                  }}>
                  {isLocked && <span className="material-symbols-outlined text-[12px]">lock</span>}
                  {t}
                </button>
              )
            })}
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleRegenerate} disabled={!activeSession || generating}
              className="flex-1 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 ai-glow-btn disabled:opacity-40 transition-all">
              <span className={`material-symbols-outlined text-[18px] ${generating ? 'animate-spin' : ''}`}>
                {generating ? 'progress_activity' : 'auto_awesome'}
              </span>
              {generating ? 'Working…' : letterText ? 'Rewrite' : 'Generate'}
            </button>
            <button onClick={handleCopy} disabled={!hasSession}
              className="px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631', backgroundColor: 'white' }}>
              <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
              Copy
            </button>
            <button onClick={handleDownload} disabled={!hasSession}
              className="px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631', backgroundColor: 'white' }}>
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Save</span>
            </button>
          </div>
          {error && <p className="text-[10px] font-bold text-center mt-2 text-[#93000a]">{error}</p>}
        </div>
      </div>
    </div>
  )
}
