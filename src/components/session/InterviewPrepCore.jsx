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
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5"
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

  return (
    <div className="flex flex-1 overflow-hidden h-full relative flex-col md:flex-row bg-[#f7f9fb]">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scroll h-full dot-grid flex flex-col items-center justify-start" style={{ backgroundColor: '#f7f9fb' }}>
        <div className="w-full h-full pb-32 lg:pb-12 border-x" style={{ borderColor: 'rgba(197,198,206,0.1)', maxWidth: '1056px', backgroundColor: 'white' }}>
          {currentQ ? (
            <div className="w-full animate-slide-in">
              {/* Sticky context bar — shows active question on scroll */}
              <div className="sticky top-0 z-10 px-6 md:px-12 py-3 border-b flex items-center justify-between bg-white/95 backdrop-blur-md"
                style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex-shrink-0"
                    style={{ backgroundColor: '#031631', color: 'white' }}>{currentQ.tag}</span>
                  <p className="text-xs font-bold text-[#031631] truncate">{currentQ.title}</p>
                  <span className="hidden sm:block text-[10px] font-bold text-[#c5c6ce]">
                    {activeQ + 1} / {questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {saveMsg && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: saveMsg === 'Saved!' ? '#e8f5e9' : '#ffebee', color: saveMsg === 'Saved!' ? '#2e7d32' : '#c62828' }}>
                      {saveMsg}
                    </span>
                  )}
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

              <div className="p-6 md:p-8 rounded-2xl mb-10 shadow-sm border" style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.1)', borderLeft: '6px solid #031631' }}>
                <div className="flex items-center gap-2 mb-3">
                   <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: '#031631', color: 'white' }}>{currentQ.tag}</span>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#8293b4]">Target Question</p>
                </div>
                <h2 className="text-xl md:text-2xl font-bold italic leading-relaxed tracking-tight" style={{ color: '#031631', fontFamily: '"Manrope", sans-serif' }}>
                  "{currentQ.question}"
                </h2>
              </div>

              {currentQ.star ? (
                <div className="space-y-10">
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-[#031631] flex items-center gap-2">
                       <span className="w-8 h-[2px] bg-[#031631] rounded-full" />
                       STAR Strategy
                       <span className="text-[9px] font-semibold normal-case tracking-normal text-[#8293b4] ml-1">— hover a section to edit</span>
                    </h3>
                    <div className="grid gap-5">
                      <STARSection label="Situation" content={currentQ.star.situation} onChange={v => updateSTAR('situation', v)} />
                      <STARSection label="Task" content={currentQ.star.task} onChange={v => updateSTAR('task', v)} />
                      <STARSection label="Action" content={currentQ.star.action} onChange={v => updateSTAR('action', v)} />
                      <STARSection label="Result" content={currentQ.star.result} onChange={v => updateSTAR('result', v)} />
                    </div>
                  </div>

                  {currentQ.key_metrics?.length > 0 && (
                    <div className="p-8 rounded-3xl border bg-[#fcfdfe]" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-[#8293b4]">Metrics to Highlight</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.key_metrics.map(m => (
                          <div key={m.metric} className="p-5 rounded-2xl bg-white border border-[rgba(197,198,206,0.1)] shadow-sm">
                            <div className="text-2xl font-black text-[#0e0099] tracking-tighter">{m.metric}</div>
                            <div className="text-[10px] font-black text-[#44474d] uppercase tracking-widest mt-1 opacity-60">{m.context}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                <div className="flex flex-col items-center gap-6 py-20 text-center border-2 border-dashed rounded-3xl" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                  <div className="w-16 h-16 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-[#c5c6ce]">psychology_alt</span>
                  </div>
                  <h3 className="font-bold text-[#031631]">No strategy generated yet</h3>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 h-full text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-[#f2f4f6] flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[40px] text-[#c5c6ce]">psychology</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#031631]" style={{ fontFamily: 'Manrope' }}>Select a question to prepare</h2>
              <p className="text-sm text-[#8293b4] font-medium max-w-xs uppercase tracking-widest">Choose from the list to see your STAR response strategy</p>
            </div>
          )}
        </div>
      </div>

      {/* Question List Sidebar — Desktop Only */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex flex-col overflow-y-auto custom-scroll border-l bg-white"
        style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
        <header className="px-6 py-5 border-b sticky top-0 bg-white/80 backdrop-blur-md z-10" style={{ borderColor: 'rgba(197,198,206,0.08)' }}>
          <h2 className="font-bold text-base" style={{ fontFamily: '"Manrope", sans-serif', color: '#031631' }}>Prep Strategy</h2>
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
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
          style={{
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(197,198,206,0.3)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
          <div className="px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-black uppercase tracking-widest text-[#8293b4] mb-0.5">Active Question</p>
               <h4 className="text-xs font-bold text-[#031631] truncate">{currentQ?.title || 'Select Question'}</h4>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-90 ai-glow-btn text-white text-[10px] font-black uppercase tracking-widest"
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
