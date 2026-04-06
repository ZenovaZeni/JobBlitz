import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useSessions } from '../../hooks/useSessions'
import { useAuth } from '../../context/AuthContext'
import { templates, AtelierTemplate, MinimalTemplate, ImpactTemplate } from '../ResumeTemplates'

const PAPER_WIDTH = 794

export default function ResumeEditorCore() {
  const navigate = useNavigate()
  const { activeSession } = useSession()
  const { saveResumeVersion } = useSessions()
  const { isPro } = useAuth()
  const [activeTemplate, setActiveTemplate] = useState('atelier')
  const [zoom, setZoom] = useState(90)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // Auto-scale for mobile
  const canvasRef = useRef(null)
  const [canvasWidth, setCanvasWidth] = useState(0)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      setCanvasWidth(entries[0].contentRect.width)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // On small screens auto-fit; on desktop use user zoom
  const isMobileCanvas = canvasWidth > 0 && canvasWidth < PAPER_WIDTH
  const effectiveScale = isMobileCanvas ? (canvasWidth - 32) / PAPER_WIDTH : zoom / 100

  const resume = activeSession?.tailoredResume || null

  async function handleSave() {
    if (!activeSession || !resume) return
    setSaving(true)
    try {
      await saveResumeVersion({
        sessionId: activeSession.sessionId,
        title: `${activeSession.role} — ${activeSession.company} (${activeTemplate})`,
        template: activeTemplate,
        content: resume,
      })
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2500)
    } catch {
      setSaveMsg('Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleExportPDF() {
    if (!resume) return
    if (!isPro) {
      navigate('/pricing')
      return
    }
    const prev = document.title
    document.title = resume.name
      ? `${resume.name} — Resume`
      : activeSession
        ? `${activeSession.role} at ${activeSession.company}`
        : 'Resume'
    window.print()
    // Restore after a tick so the print dialog can capture the title first
    setTimeout(() => { document.title = prev }, 500)
  }

  function handleTemplateSelect(templateId) {
    const proTemplates = ['minimal', 'impact']
    if (proTemplates.includes(templateId) && !isPro) {
      navigate('/pricing')
      return
    }
    setActiveTemplate(templateId)
  }

  const ResumeTemplate = activeTemplate === 'atelier'
    ? AtelierTemplate
    : activeTemplate === 'minimal'
      ? MinimalTemplate
      : ImpactTemplate

  return (
    <div className="flex flex-1 overflow-hidden h-full relative">
      {/* Hidden print target — rendered at 100% scale, invisible in app, shown on print */}
      <div id="resume-print-target" aria-hidden="true">
        <ResumeTemplate resume={resume} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Tool Header */}
        <header className="glass-panel border-b px-4 md:px-6 py-3 flex items-center justify-between z-10 flex-shrink-0"
          style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
          <div className="flex items-center gap-3">
            {/* Zoom controls — desktop only */}
            <div className="hidden md:flex items-center gap-1 text-xs border rounded-lg px-2 overflow-hidden bg-white"
              style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
              <button onClick={() => setZoom(z => Math.max(z - 10, 50))}
                className="py-1 px-1 transition-colors hover:text-[#0e0099]" style={{ color: '#44474d' }}>
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="w-10 text-center font-bold" style={{ color: '#031631' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 150))}
                className="py-1 px-1 transition-colors hover:text-[#0e0099]" style={{ color: '#44474d' }}>
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
            {saveMsg && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full animate-slide-in" 
                style={{ backgroundColor: saveMsg === 'Saved!' ? '#e8f5e9' : '#ffebee', color: saveMsg === 'Saved!' ? '#2e7d32' : '#c62828' }}>
                {saveMsg}
              </span>
            )}
          </div>
          <button onClick={handleExportPDF} disabled={!resume}
            className="px-4 md:px-5 py-2 text-sm font-bold rounded-lg text-white shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center gap-1.5 disabled:opacity-40">
            <span className="material-symbols-outlined text-[16px]">{isPro ? 'download' : 'lock'}</span>
            <span className="hidden sm:inline">Export PDF</span>
            {!isPro && <span className="text-[9px] font-black uppercase tracking-wider opacity-80">Pro</span>}
          </button>
        </header>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll dot-grid flex items-start justify-center p-4 md:p-10 pb-36 lg:pb-12">
          {resume ? (
            <div style={{
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top center',
              transition: isMobileCanvas ? 'none' : 'transform 0.2s ease',
              marginBottom: isMobileCanvas
                ? `${Math.round(PAPER_WIDTH * 1.415 * (effectiveScale - 1))}px`
                : 0,
            }}>
              <div className="paper-shadow">
                <ResumeTemplate resume={resume} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>description</span>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No resume loaded</h2>
              <button onClick={() => navigate('/app/tailor')}
                className="px-6 py-3 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2">
                <span className="material-symbols-outlined icon-filled text-[18px]">bolt</span>
                Start Tailoring
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Editor Aside — Desktop */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 flex-col overflow-y-auto custom-scroll border-l"
        style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>
        <header className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h2 className="font-bold text-base" style={{ fontFamily: 'Manrope', color: '#031631' }}>Editor</h2>
        </header>

        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>Template</h3>
          <div className="space-y-2">
            {templates.map(t => {
              const isLocked = ['minimal', 'impact'].includes(t.id) && !isPro
              return (
                <button key={t.id} onClick={() => handleTemplateSelect(t.id)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: activeTemplate === t.id ? '#031631' : 'white',
                    color: activeTemplate === t.id ? 'white' : isLocked ? '#75777e' : '#031631',
                    border: activeTemplate === t.id ? 'none' : '1px solid rgba(197,198,206,0.1)',
                    opacity: isLocked ? 0.7 : 1,
                  }}>
                  <span className="flex items-center gap-2">
                    {t.label}
                    {isLocked && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>Pro</span>
                    )}
                  </span>
                  {activeTemplate === t.id
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

        {activeSession && (
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>Matching</h3>
            {activeSession.matchData?.match_score && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${activeSession.matchData.match_score}%`, backgroundColor: '#0e0099' }} />
                </div>
                <span className="text-xs font-bold" style={{ color: '#0e0099' }}>
                  {activeSession.matchData.match_score}%
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto px-6 py-6 border-t space-y-3 bg-white" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <button onClick={handleSave} disabled={!resume || saving}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all hover:bg-[#f2f4f6] disabled:opacity-50"
            style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.2)' }}>
            <span className="material-symbols-outlined text-[18px]">
              {saving ? 'progress_activity' : 'save'}
            </span>
            {saving ? 'Saving...' : 'Save Version'}
          </button>
        </div>
      </aside>

      {/* Mobile bottom action bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(197,198,206,0.3)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
        <div className="px-4 py-3">
          {/* Template selector — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {templates.map(t => {
              const isLocked = ['minimal', 'impact'].includes(t.id) && !isPro
              return (
                <button key={t.id} onClick={() => handleTemplateSelect(t.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  style={{
                    backgroundColor: activeTemplate === t.id ? '#031631' : '#f2f4f6',
                    color: activeTemplate === t.id ? 'white' : '#44474d',
                  }}>
                  {isLocked && <span className="material-symbols-outlined text-[12px]">lock</span>}
                  {t.label}
                </button>
              )
            })}
          </div>
          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!resume || saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631', backgroundColor: 'white' }}>
              <span className="material-symbols-outlined text-[16px]">
                {saving ? 'progress_activity' : 'save'}
              </span>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleExportPDF} disabled={!resume}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 ai-glow-btn disabled:opacity-40 transition-all">
              <span className="material-symbols-outlined text-[16px]">{isPro ? 'download' : 'lock'}</span>
              {isPro ? 'Export PDF' : 'PDF (Pro)'}
            </button>
          </div>
          {saveMsg && (
            <p className="text-[10px] font-bold text-center mt-2"
              style={{ color: saveMsg === 'Saved!' ? '#2e7d32' : '#93000a' }}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
