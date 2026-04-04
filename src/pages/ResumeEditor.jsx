import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useSession } from '../context/SessionContext'
import { useSessions } from '../hooks/useSessions'

import { templates, AtelierTemplate, MinimalTemplate, ImpactTemplate } from '../components/ResumeTemplates'

const PAPER_WIDTH = 794

export default function ResumeEditor() {
  const navigate = useNavigate()
  const { activeSession } = useSession()
  const { saveResumeVersion } = useSessions()
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

  const ResumeTemplate = activeTemplate === 'atelier'
    ? AtelierTemplate
    : activeTemplate === 'minimal'
      ? MinimalTemplate
      : ImpactTemplate

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

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f2f4f6' }}>
      <SideNav />

      {/* Hidden print target — rendered at 100% scale, invisible in app, shown on print */}
      <div id="resume-print-target-standalone" aria-hidden="true">
        <ResumeTemplate resume={resume} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="glass-panel border-b px-4 md:px-6 py-3 flex items-center justify-between z-10 flex-shrink-0"
          style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-sm font-bold flex items-center gap-2 truncate" style={{ color: '#031631' }}>
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">description</span>
              <span className="truncate">
                {activeSession ? `${activeSession.role} — ${activeSession.company}` : 'No session loaded'}
              </span>
            </div>
            {activeSession?.matchData?.match_score && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: '#eceef0', color: '#44474d' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#2e7d32' }} />
                {activeSession.matchData.match_score}% Match
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Zoom controls — desktop only */}
            <div className="hidden md:flex items-center gap-1 text-xs border rounded-lg px-2 overflow-hidden"
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

            <button onClick={handleExportPDF} disabled={!resume}
              className="px-4 md:px-5 py-2 text-sm font-bold rounded-lg text-white shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center gap-1.5 disabled:opacity-40">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll dot-grid flex items-start justify-center p-4 md:p-10"
          style={{ paddingBottom: '6rem' }}>
          {resume ? (
            <div style={{
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top center',
              transition: isMobileCanvas ? 'none' : 'transform 0.2s ease',
              // Negative margin collapses layout gap from transform not affecting flow
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
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No resume loaded</h2>
                <p className="max-w-sm text-sm" style={{ color: '#44474d' }}>
                  Run a tailoring session first to generate your AI-optimized resume.
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
      </main>

      {/* Desktop right sidebar */}
      <aside className="hidden md:flex w-72 flex-shrink-0 flex-col overflow-y-auto custom-scroll border-l"
        style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>
        <header className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h2 className="font-bold text-base" style={{ fontFamily: 'Manrope', color: '#031631' }}>Editor</h2>
        </header>

        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>Template</h3>
          <div className="space-y-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: activeTemplate === t.id ? '#031631' : '#eceef0',
                  color: activeTemplate === t.id ? 'white' : '#031631',
                }}>
                {t.label}
                {activeTemplate === t.id && (
                  <span className="material-symbols-outlined icon-filled text-[16px]">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeSession && (
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>Session</h3>
            <p className="text-sm font-semibold" style={{ color: '#031631' }}>{activeSession.role}</p>
            <p className="text-xs mb-3" style={{ color: '#44474d' }}>{activeSession.company}</p>
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

        <div className="mt-auto px-6 py-5 border-t space-y-3" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          {saveMsg && (
            <p className="text-xs font-bold text-center"
              style={{ color: saveMsg === 'Saved!' ? '#2e7d32' : '#93000a' }}>
              {saveMsg}
            </p>
          )}
          <button onClick={handleSave} disabled={!resume || saving}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all hover:bg-[#eceef0] disabled:opacity-50"
            style={{ color: '#031631' }}>
            <span className="material-symbols-outlined text-[18px]">
              {saving ? 'progress_activity' : 'save'}
            </span>
            {saving ? 'Saving...' : 'Save Version'}
          </button>
          <button onClick={() => navigate('/app/tailor')}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-white ai-glow-btn">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            New Session
          </button>
        </div>
      </aside>

      {/* Mobile bottom action bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(197,198,206,0.2)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
        <div className="px-4 py-3">
          {/* Template selector — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {templates.map(t => (
              <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: activeTemplate === t.id ? '#031631' : '#f2f4f6',
                  color: activeTemplate === t.id ? 'white' : '#44474d',
                }}>
                {t.label}
              </button>
            ))}
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
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export PDF
            </button>
          </div>
          {saveMsg && (
            <p className="text-xs font-bold text-center mt-2"
              style={{ color: saveMsg === 'Saved!' ? '#2e7d32' : '#93000a' }}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
