import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../context/SessionContext'
import { useSessions } from '../../hooks/useSessions'
import MobileDrawer from '../MobileDrawer'

const STAR_COLORS = {
  situation: { bg: 'rgba(213,224,247,0.3)', border: '#d8e3fa', label: '#3c475a' },
  task:      { bg: 'rgba(225,224,255,0.2)', border: '#e1e0ff', label: '#2f2ebe' },
  action:    { bg: 'rgba(214,227,255,0.15)', border: '#d6e3ff', label: '#374765' },
  result:    { bg: 'rgba(3,22,49,0.04)', border: '#c5c6ce', label: '#031631' },
}

function STARSection({ label, content, onChange }) {
  const [editing, setEditing] = useState(false)
  const c = STAR_COLORS[label.toLowerCase()] || STAR_COLORS.result

  return (
    <div className="rounded-xl p-5 group relative" style={{ backgroundColor: c.bg, borderLeft: `4px solid ${c.border}` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: c.label }}>{label}</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5 active:opacity-100"
            title="Edit">
            <span className="material-symbols-outlined text-[14px]" style={{ color: c.label }}>edit</span>
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            autoFocus
            className="w-full bg-white/70 border rounded-lg px-3 py-2 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 custom-scroll"
            style={{ borderColor: c.border, minHeight: '80px', color: '#191c1e' }}
            value={content}
            onChange={e => onChange(e.target.value)}
            rows={Math.max(3, Math.ceil(content.length / 80))}
          />
          <button
            onClick={() => setEditing(false)}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: c.border, color: c.label }}>
            Done
          </button>
        </div>
      ) : (
        <p className="text-sm leading-relaxed" style={{ color: '#191c1e' }}>{content}</p>
      )}
    </div>
  )
}

const TAG_COLORS = {
  BEHAVIORAL: '#0e0099',
  TECHNICAL: '#2f2ebe',
  'CASE STUDY': '#545f72',
  'CULTURE FIT': '#44474d',
}

export default function InterviewPrepCore() {
  const navigate = useNavigate()
  const { activeSession, setActiveSession } = useSession()
  const { saveInterviewPrep } = useSessions()

  const [questions, setQuestions] = useState(() => activeSession?.interviewData?.questions || [])
  const [activeQ, setActiveQ] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const currentQ = questions[activeQ] || null
  const hasSession = questions.length > 0

  function prevQ() { setActiveQ(i => Math.max(0, i - 1)) }
  function nextQ() { setActiveQ(i => Math.min(questions.length - 1, i + 1)) }

  const updateSTAR = useCallback((field, value) => {
    setQuestions(prev => prev.map((q, i) =>
      i === activeQ ? { ...q, star: { ...q.star, [field]: value } } : q
    ))
  }, [activeQ])

  async function handleSave() {
    if (!activeSession) return
    setSaving(true)
    try {
      await saveInterviewPrep({ sessionId: activeSession.sessionId, questions })
      setActiveSession(prev => ({ ...prev, interviewData: { ...prev.interviewData, questions } }))
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2500)
    } catch {
      setSaveMsg('Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleExportPrep() {
    if (!questions.length) return
    const header = activeSession?.role
      ? `Interview Prep — ${activeSession.role} at ${activeSession.company}\n${'='.repeat(60)}\n\n`
      : 'Interview Prep\n==============\n\n'
    const body = questions.map((q, i) => {
      const lines = [
        `Question ${i + 1}: ${q.question}`,
        q.tag ? `Type: ${q.tag}` : '',
        '',
      ]
      if (q.key_points?.length) {
        lines.push('Key Points to Lead With:')
        q.key_points.forEach(pt => lines.push(`  • ${pt}`))
        lines.push('')
      }
      if (q.star) {
        lines.push('SITUATION:', `  ${q.star.situation}`, '')
        lines.push('TASK:', `  ${q.star.task}`, '')
        lines.push('ACTION:', `  ${q.star.action}`, '')
        lines.push('RESULT:', `  ${q.star.result}`, '')
      }
      return lines.filter(l => l !== undefined).join('\n')
    }).join('\n---\n\n')
    const content = header + body
    const filename = activeSession?.role
      ? `Interview Prep — ${activeSession.role} at ${activeSession.company}.txt`
      : 'Interview Prep.txt'
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full relative flex-col md:flex-row bg-[#f7f9fb]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scroll h-full dot-grid flex flex-col items-center justify-start" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="w-full h-full pb-44 lg:pb-12 border-x" style={{ borderColor: 'rgba(197,198,206,0.1)', maxWidth: '1056px', backgroundColor: 'white' }}>
          {currentQ ? (
            <div className="w-full animate-slide-in">
              {/* Sticky context bar — shows active question on scroll */}
              <div className="sticky top-0 z-10 px-4 md:px-12 py-2.5 border-b flex items-center justify-between bg-white/95 backdrop-blur-md gap-2"
                style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
                {/* Prev / Next navigation */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={prevQ} disabled={activeQ === 0}
                    className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all hover:bg-[#f2f4f6] disabled:opacity-30"
                    style={{ borderColor: 'rgba(197,198,206,0.3)' }}>
                    <span className="material-symbols-outlined text-[14px] text-[#031631]">chevron_left</span>
                  </button>
                  <span className="text-[10px] font-bold text-[#c5c6ce] px-1 tabular-nums">
                    {activeQ + 1}/{questions.length}
                  </span>
                  <button onClick={nextQ} disabled={activeQ === questions.length - 1}
                    className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all hover:bg-[#f2f4f6] disabled:opacity-30"
                    style={{ borderColor: 'rgba(197,198,206,0.3)' }}>
                    <span className="material-symbols-outlined text-[14px] text-[#031631]">chevron_right</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-[#031631] truncate flex-1 min-w-0 hidden sm:block">{currentQ.title}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {saveMsg && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: saveMsg === 'Saved!' ? '#e8f5e9' : '#ffebee', color: saveMsg === 'Saved!' ? '#2e7d32' : '#c62828' }}>
                      {saveMsg}
                    </span>
                  )}
                  <button
                    onClick={handleExportPrep}
                    disabled={!hasSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:bg-[#f2f4f6] disabled:opacity-40"
                    style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.3)' }}>
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all hover:bg-[#f2f4f6] disabled:opacity-50"
                    style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.3)' }}>
                    <span className="material-symbols-outlined text-[14px]">{saving ? 'progress_activity' : 'save'}</span>
                    <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>

              <div className="px-6 md:px-12 py-8 md:py-10 max-w-2xl">

              {/* Role context label */}
              {activeSession?.role && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>psychology</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: '#031631' }}>Interview Preparation</span>
                    <span className="text-[10px] font-bold" style={{ color: '#8293b4' }}>{activeSession.role} at {activeSession.company}</span>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-10 rounded-3xl mb-12 shadow-sm border relative overflow-hidden" 
                   style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.1)', borderLeft: '8px solid #031631' }}>
                <div className="flex items-center gap-2 mb-4">
                   <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: '#031631', color: 'white' }}>{currentQ.tag}</span>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#8293b4]">Likely Interview Question</p>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold italic leading-relaxed tracking-tight" 
                    style={{ color: '#031631', fontFamily: '"Manrope", sans-serif' }}>
                  "{currentQ.question}"
                </h2>
                
                {/* Micro-annotation */}
                <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-widest text-[#c5c6ce] opacity-40">Q-{activeQ+1}</div>
              </div>

              {currentQ.star ? (
                <div className="space-y-12">

                  {/* ACTIONABLE CONTENT: Key Points & Metrics */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Key Points to Lead With */}
                    {currentQ.key_points?.length > 0 && (
                      <div className="p-6 md:p-8 rounded-3xl border shadow-sm"
                        style={{ background: 'linear-gradient(135deg, rgba(225,224,255,0.3) 0%, rgba(214,227,255,0.1) 100%)', borderColor: 'rgba(14,0,153,0.1)' }}>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0e0099] flex items-center gap-2">
                            <span className="material-symbols-outlined icon-filled text-[18px]">tips_and_updates</span>
                            Key Points to Lead With
                          </h3>
                        </div>
                        <ul className="space-y-4">
                          {currentQ.key_points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-3.5 text-sm md:text-base font-medium prose" style={{ color: '#031631' }}>
                              <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black bg-[#0e0099] text-white mt-0.5">
                                {i+1}
                              </span>
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Metrics to Highlight */}
                    {currentQ.key_metrics?.length > 0 && (
                      <div className="p-6 md:p-8 rounded-3xl border shadow-sm bg-white" style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-[#8293b4] flex items-center gap-2">
                          <span className="material-symbols-outlined icon-filled text-[18px]">analytics</span>
                          Proof Points & Metrics
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {currentQ.key_metrics.map(m => (
                            <div key={m.metric} className="p-5 rounded-2xl bg-[#f7f9fb] border border-[rgba(197,198,206,0.1)] transition-transform hover:scale-[1.02]">
                              <div className="text-3xl font-black text-[#0e0099] tracking-tighter">{m.metric}</div>
                              <div className="text-[10px] font-black text-[#031631] uppercase tracking-widest mt-1 opacity-70">{m.context}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[#031631] flex items-center gap-3">
                         <span className="w-8 h-[3px] bg-[#031631] rounded-full" />
                         STAR Strategy
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#8293b4] bg-[#f2f4f6] px-2 py-1 rounded-lg">Draft Your Response Below</span>
                    </div>
                    <div className="grid gap-6">
                      <STARSection label="Situation" content={currentQ.star.situation} onChange={v => updateSTAR('situation', v)} />
                      <STARSection label="Task" content={currentQ.star.task} onChange={v => updateSTAR('task', v)} />
                      <STARSection label="Action" content={currentQ.star.action} onChange={v => updateSTAR('action', v)} />
                      <STARSection label="Result" content={currentQ.star.result} onChange={v => updateSTAR('result', v)} />
                    </div>
                  </div>

                  {/* Mobile save button */}
                  <div className="lg:hidden flex items-center justify-between">
                    {saveMsg && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: saveMsg === 'Saved!' ? '#e8f5e9' : '#ffebee', color: saveMsg === 'Saved!' ? '#2e7d32' : '#c62828' }}>
                        {saveMsg}
                      </span>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-[#f2f4f6] disabled:opacity-50"
                      style={{ color: '#031631', borderColor: 'rgba(197,198,206,0.3)' }}>
                      <span className="material-symbols-outlined text-[16px]">{saving ? 'progress_activity' : 'save'}</span>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-20 text-center border-2 border-dashed rounded-3xl" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                  <div className="w-16 h-16 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-[#c5c6ce]">psychology_alt</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#031631] mb-1">STAR response not written yet</h3>
                    <p className="text-xs max-w-xs mx-auto" style={{ color: '#8293b4' }}>Build a packet to generate interview prep for this role.</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 h-full text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-[#f2f4f6] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[40px] text-[#c5c6ce]">psychology</span>
              </div>
              {hasSession ? (
                <>
                  <h2 className="text-xl font-extrabold text-[#031631]" style={{ fontFamily: 'Manrope' }}>Choose a question</h2>
                  <p className="text-sm text-[#8293b4] font-medium max-w-xs">Select from the list on the right to review your STAR strategy.</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold text-[#031631]" style={{ fontFamily: 'Manrope' }}>
                    {activeSession ? `Prep for ${activeSession.company}` : 'No interview prep yet'}
                  </h2>
                  <p className="text-sm text-[#8293b4] font-medium max-w-xs">
                    {activeSession
                      ? `Generate your packet to get ${activeSession.role}-specific STAR answers, behavioral prep, and talking points.`
                      : 'Open an application packet to see role-specific interview prep.'}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question List Sidebar — Desktop Only */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex flex-col overflow-y-auto custom-scroll border-l bg-white"
        style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
        <header className="px-6 py-5 border-b sticky top-0 bg-white/80 backdrop-blur-md z-10" style={{ borderColor: 'rgba(197,198,206,0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base" style={{ fontFamily: '"Manrope", sans-serif', color: '#031631' }}>Prep Strategy</h2>
              {hasSession && (
                <p className="text-[11px] mt-0.5" style={{ color: '#8293b4' }}>
                  {questions.length} question{questions.length !== 1 ? 's' : ''} · {questions.filter(q => q.star).length} with STAR
                </p>
              )}
            </div>
            {hasSession && (
              <button
                onClick={handleExportPrep}
                className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:bg-[#f2f4f6]"
                style={{ borderColor: 'rgba(197,198,206,0.2)' }}
                title="Export prep sheet">
                <span className="material-symbols-outlined text-[15px]" style={{ color: '#44474d' }}>download</span>
              </button>
            )}
          </div>
        </header>

        <div className="p-3 space-y-2">
          {hasSession ? questions.map((q, i) => {
            const tagColor = TAG_COLORS[q.tag] || '#44474d'
            return (
              <button key={q.id || i} onClick={() => setActiveQ(i)}
                className="w-full text-left p-4 rounded-xl transition-all hover:bg-[#f2f4f6]"
                style={{
                  backgroundColor: activeQ === i ? '#f2f4f6' : 'transparent',
                  border: activeQ === i ? '1px solid rgba(197,198,206,0.2)' : '1px solid transparent'
                }}>
                <div className="flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${tagColor}14`, color: tagColor }}>{q.tag}</span>
                  <div>
                    <p className="font-bold text-xs leading-snug" style={{ color: '#031631' }}>{q.title}</p>
                    {q.star && (
                      <div className="flex items-center gap-1 mt-1.5 text-[#0e0099]">
                        <span className="material-symbols-outlined icon-filled text-[12px]">check_circle</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">STAR Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          }) : (
            <div className="text-center py-12 px-4">
              <span className="material-symbols-outlined text-[32px] block mb-2 text-[#c5c6ce]">psychology</span>
              <p className="text-xs font-bold text-[#8293b4] uppercase tracking-widest">No prep data</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Footer Action Bar — Pull-up Drawer */}
      {hasSession && (
        <div className="lg:hidden fixed above-bottom-nav left-0 right-0 z-40 border-t"
          style={{
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(197,198,206,0.3)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
          <div className="px-4 py-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#8293b4] mb-0.5">Active Question</p>
               <h4 className="text-xs font-bold text-[#031631] truncate">{currentQ?.title || 'Select Question'}</h4>
            </div>
            <button
              onClick={handleExportPrep}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#44474d', backgroundColor: 'white' }}
              title="Export prep sheet">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-90 ai-glow-btn text-white text-[10px] font-black uppercase tracking-widest flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">list</span>
              View All
            </button>
          </div>
        </div>
      )}

      {/* Mobile Selection Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Prep Strategy"
      >
        <div className="space-y-2 pb-8">
          {questions.map((q, i) => {
            const tagColor = TAG_COLORS[q.tag] || '#44474d'
            return (
              <button key={q.id || i}
                onClick={() => { setActiveQ(i); setIsDrawerOpen(false); }}
                className="w-full text-left p-4 rounded-2xl transition-all border"
                style={{
                  backgroundColor: activeQ === i ? '#f2f4f6' : 'white',
                  borderColor: activeQ === i ? 'rgba(197,198,206,0.3)' : 'rgba(197,198,206,0.1)'
                }}>
                <div className="flex items-start gap-4">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-0.5"
                    style={{ backgroundColor: `${tagColor}14`, color: tagColor }}>{q.tag}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-snug" style={{ color: '#031631' }}>{q.title}</p>
                    {q.star && (
                      <div className="flex items-center gap-1 mt-1 text-[#0e0099]">
                        <span className="material-symbols-outlined icon-filled text-[12px]">check_circle</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">STAR Ready</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </MobileDrawer>
    </div>
  )
}
