import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useSession } from '../context/SessionContext'

function STARSection({ label, content }) {
  const colors = {
    situation: { bg: 'rgba(213,224,247,0.3)', border: '#d8e3fa', label: '#3c475a' },
    task:      { bg: 'rgba(225,224,255,0.2)', border: '#e1e0ff', label: '#2f2ebe' },
    action:    { bg: 'rgba(214,227,255,0.15)', border: '#d6e3ff', label: '#374765' },
    result:    { bg: 'rgba(3,22,49,0.04)', border: '#c5c6ce', label: '#031631' },
  }
  const c = colors[label.toLowerCase()] || colors.result
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: c.bg, borderLeft: `4px solid ${c.border}` }}>
      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: c.label }}>{label}</p>
      <p className="text-sm leading-relaxed" style={{ color: '#191c1e' }}>{content}</p>
    </div>
  )
}

const TAG_COLORS = {
  BEHAVIORAL: '#0e0099',
  TECHNICAL: '#2f2ebe',
  'CASE STUDY': '#545f72',
  'CULTURE FIT': '#44474d',
}

export default function InterviewPrep() {
  const navigate = useNavigate()
  const { activeSession } = useSession()

  const questions = activeSession?.interviewData?.questions || []
  const [activeQ, setActiveQ] = useState(0)
  // Track which question indices the user has marked as prepared
  const [prepared, setPrepared] = useState(new Set())

  const currentQ = questions[activeQ] || null
  const hasSession = questions.length > 0
  const starReadyCount = questions.filter(q => q.star).length
  const isLastQuestion = activeQ === questions.length - 1
  const isPrepared = prepared.has(activeQ)

  function togglePrepared(idx) {
    setPrepared(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function goNext() {
    if (!isLastQuestion) setActiveQ(prev => prev + 1)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Page-level sticky header */}
        <header
          className="glass-panel border-b flex-shrink-0 z-20 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
              Interview Prep
            </p>
            <h1 className="text-base md:text-lg font-black truncate tracking-tight"
              style={{ fontFamily: 'Manrope', color: '#031631' }}>
              {activeSession ? `${activeSession.role} · ${activeSession.company}` : 'No session loaded'}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-4">
            {hasSession && (
              <div className="hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: 'rgba(14,0,153,0.06)', color: '#0e0099' }}>
                  <span className="material-symbols-outlined icon-filled text-[13px]">check_circle</span>
                  {prepared.size} / {questions.length} Prepared
                </span>
              </div>
            )}
            {activeSession && (
              <button
                onClick={() => navigate(`/app/session/${activeSession.sessionId}`)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:bg-[#eceef0]"
                style={{ color: '#44474d' }}>
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                <span className="hidden sm:inline">Back to Session</span>
              </button>
            )}
          </div>
        </header>

        {/* Mobile question pill strip */}
        {hasSession && (
          <div
            className="md:hidden flex-shrink-0 overflow-x-auto no-scrollbar border-b px-4 py-3"
            style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>
            <div className="flex gap-2">
              {questions.map((q, i) => {
                const isActive = activeQ === i
                const isDone = prepared.has(i)
                return (
                  <button
                    key={q.id || i}
                    onClick={() => setActiveQ(i)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      backgroundColor: isActive ? '#031631' : isDone ? '#e1e0ff' : 'white',
                      color: isActive ? 'white' : isDone ? '#2f2ebe' : '#44474d',
                      boxShadow: isActive
                        ? '0 2px 8px rgba(3,22,49,0.15)'
                        : '0 1px 3px rgba(3,22,49,0.06)',
                    }}>
                    <span>{i + 1}</span>
                    {isDone && (
                      <span
                        className="material-symbols-outlined icon-filled text-[11px]"
                        style={{ color: isActive ? 'rgba(255,255,255,0.65)' : '#2f2ebe' }}>
                        check_circle
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: Question list — tablet and desktop only */}
          <aside
            className="hidden md:flex w-72 lg:w-80 flex-shrink-0 flex-col border-r overflow-hidden"
            style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>

            <div
              className="px-5 py-4 border-b flex-shrink-0 flex items-center justify-between"
              style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#8293b4' }}>
                Questions
              </p>
              {hasSession && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(14,0,153,0.08)', color: '#0e0099' }}>
                  {prepared.size} of {questions.length} prepared
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll p-3">
              {hasSession ? questions.map((q, i) => {
                const tagColor = TAG_COLORS[q.tag] || '#44474d'
                const isActive = activeQ === i
                const isDone = prepared.has(i)
                return (
                  <button
                    key={q.id || i}
                    onClick={() => setActiveQ(i)}
                    className="w-full text-left p-4 rounded-xl transition-all mb-1.5"
                    style={{
                      backgroundColor: isActive ? 'white' : 'transparent',
                      boxShadow: isActive ? '0 2px 10px rgba(3,22,49,0.07)' : 'none',
                    }}>
                    <div className="flex items-start gap-2.5">
                      {/* Number / prepared checkmark */}
                      <div className="flex-shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded-full"
                        style={{
                          backgroundColor: isDone ? '#031631' : 'transparent',
                        }}>
                        {isDone
                          ? <span className="material-symbols-outlined icon-filled text-[12px] text-white">check</span>
                          : <span className="text-[10px] font-black" style={{ color: isActive ? '#0e0099' : '#c5c6ce' }}>{i + 1}</span>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-1.5"
                          style={{ backgroundColor: `${tagColor}14`, color: tagColor }}>
                          {q.tag}
                        </span>
                        <p className="text-sm font-semibold leading-snug"
                          style={{ color: isDone ? '#75777e' : '#031631', textDecoration: isDone ? 'line-through' : 'none' }}>
                          {q.title}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              }) : (
                <div className="text-center py-10 px-4">
                  <span className="material-symbols-outlined text-[36px] block mb-3" style={{ color: '#c5c6ce' }}>
                    psychology
                  </span>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#75777e' }}>
                    No questions yet. Start a tailoring session to generate your prep.
                  </p>
                  <button
                    onClick={() => navigate('/app/tailor')}
                    className="w-full py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn">
                    Start Session
                  </button>
                </div>
              )}
            </div>

            {/* Progress footer */}
            {hasSession && (
              <div className="px-5 py-4 border-t flex-shrink-0"
                style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#8293b4' }}>
                    Progress
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: '#031631' }}>
                    {Math.round((prepared.size / questions.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(prepared.size / questions.length) * 100}%`,
                      background: 'linear-gradient(90deg, #031631, #0e0099)',
                    }}
                  />
                </div>
              </div>
            )}
          </aside>

          {/* Right: STAR content panel */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {currentQ ? (
              <>
                {/* Panel sticky header */}
                <header
                  className="flex-shrink-0 glass-panel border-b z-10 px-5 md:px-8 py-4"
                  style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0"
                          style={{
                            backgroundColor: `${TAG_COLORS[currentQ.tag] || '#44474d'}14`,
                            color: TAG_COLORS[currentQ.tag] || '#44474d',
                          }}>
                          {currentQ.tag}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: '#8293b4' }}>
                          Question {activeQ + 1} of {questions.length}
                        </span>
                        {isPrepared && (
                          <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#0e0099' }}>
                            <span className="material-symbols-outlined icon-filled text-[11px]">check_circle</span>
                            Prepared
                          </span>
                        )}
                      </div>
                      <h2
                        className="text-base md:text-lg font-extrabold tracking-tight leading-snug"
                        style={{ fontFamily: 'Manrope', color: '#031631' }}>
                        {currentQ.title}
                      </h2>
                    </div>

                    {/* Prev / Next */}
                    {questions.length > 1 && (
                      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                        <button
                          onClick={() => setActiveQ(prev => Math.max(0, prev - 1))}
                          disabled={activeQ === 0}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#eceef0] disabled:opacity-25"
                          style={{ color: '#44474d' }}>
                          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                        </button>
                        <button
                          onClick={goNext}
                          disabled={isLastQuestion}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[#eceef0] disabled:opacity-25"
                          style={{ color: '#44474d' }}>
                          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </div>
                </header>

                {/* Scrollable STAR content */}
                <div className="flex-1 overflow-y-auto custom-scroll page-pb-mobile">
                  <div className="max-w-2xl mx-auto px-5 md:px-8 py-8 space-y-6">

                    {/* Question prompt */}
                    <div className="p-5 rounded-2xl" style={{ backgroundColor: '#eceef0', borderLeft: '4px solid #031631' }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#8293b4' }}>
                        Interview Question
                      </p>
                      <p className="text-base font-medium italic leading-relaxed" style={{ color: '#031631' }}>
                        {currentQ.question}
                      </p>
                    </div>

                    {currentQ.star ? (
                      <>
                        {/* STAR answer */}
                        <div>
                          <h3 className="font-extrabold text-base mb-4"
                            style={{ fontFamily: 'Manrope', color: '#031631' }}>
                            Your STAR Answer
                          </h3>
                          <div className="space-y-3">
                            <STARSection label="Situation" content={currentQ.star.situation} />
                            <STARSection label="Task" content={currentQ.star.task} />
                            <STARSection label="Action" content={currentQ.star.action} />
                            <STARSection label="Result" content={currentQ.star.result} />
                          </div>
                        </div>

                        {/* Key metrics */}
                        {currentQ.key_metrics?.length > 0 && (
                          <div className="p-5 rounded-2xl border"
                            style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.12)' }}>
                            <h4 className="font-bold text-sm mb-4"
                              style={{ fontFamily: 'Manrope', color: '#031631' }}>
                              Key Metrics to Cite
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {currentQ.key_metrics.map(m => (
                                <div key={m.metric} className="p-3 rounded-xl text-center"
                                  style={{ backgroundColor: '#f2f4f6' }}>
                                  <div className="text-xl font-extrabold"
                                    style={{ color: '#0e0099', fontFamily: 'Manrope' }}>
                                    {m.metric}
                                  </div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest mt-1"
                                    style={{ color: '#44474d' }}>
                                    {m.context}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Delivery tips */}
                        {currentQ.delivery_tips?.length > 0 && (
                          <div className="p-5 rounded-2xl"
                            style={{ backgroundColor: 'rgba(225,224,255,0.2)' }}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="material-symbols-outlined icon-filled text-[16px]"
                                style={{ color: '#0e0099' }}>
                                lightbulb
                              </span>
                              <h4 className="font-bold text-sm" style={{ color: '#031631' }}>Delivery Tips</h4>
                            </div>
                            <ul className="space-y-2.5">
                              {currentQ.delivery_tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <span
                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                                    style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
                                    {i + 1}
                                  </span>
                                  <p className="text-sm leading-relaxed" style={{ color: '#44474d' }}>{tip}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bottom action bar — primary CTA for moving through prep */}
                        <div className="flex items-center justify-between pt-2 border-t"
                          style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
                          <button
                            onClick={() => togglePrepared(activeQ)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                            style={{
                              backgroundColor: isPrepared ? '#031631' : 'white',
                              color: isPrepared ? 'white' : '#44474d',
                              border: isPrepared ? 'none' : '1px solid rgba(197,198,206,0.35)',
                            }}>
                            <span className="material-symbols-outlined icon-filled text-[16px]">
                              {isPrepared ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            {isPrepared ? 'Prepared' : 'Mark as Prepared'}
                          </button>

                          {isLastQuestion ? (
                            <div className="flex items-center gap-2 text-sm font-bold"
                              style={{ color: prepared.size === questions.length ? '#0e0099' : '#8293b4' }}>
                              {prepared.size === questions.length
                                ? <>
                                    <span className="material-symbols-outlined icon-filled text-[16px]">celebration</span>
                                    All done!
                                  </>
                                : `${questions.length - prepared.size} remaining`
                              }
                            </div>
                          ) : (
                            <button
                              onClick={() => { togglePrepared(activeQ); goNext() }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 ai-glow-btn">
                              Next Question
                              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Question has no STAR answer */
                      <div className="p-8 rounded-2xl border text-center"
                        style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.12)' }}>
                        <span className="material-symbols-outlined text-[32px] block mb-3"
                          style={{ color: '#c5c6ce' }}>
                          hourglass_empty
                        </span>
                        <p className="font-semibold text-sm mb-1" style={{ color: '#031631' }}>
                          No STAR answer available
                        </p>
                        <p className="text-sm mb-6" style={{ color: '#75777e' }}>
                          This question was not included in your AI-generated prep bundle.
                        </p>
                        {!isLastQuestion && (
                          <button
                            onClick={goNext}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white ai-glow-btn active:scale-95 transition-all">
                            Next Question
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* No session — structured empty state */
              <div className="flex-1 flex items-center justify-center px-6 page-pb-mobile">
                <div className="max-w-sm w-full text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                    style={{ backgroundColor: '#f2f4f6' }}>
                    <span className="material-symbols-outlined text-[30px]" style={{ color: '#8293b4' }}>
                      psychology
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold mb-2"
                    style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    No interview prep yet
                  </h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#75777e' }}>
                    Run a tailoring session for a specific role to get personalized STAR-method questions and answers.
                  </p>
                  <button
                    onClick={() => navigate('/app/tailor')}
                    className="px-8 py-3.5 text-white font-bold rounded-xl ai-glow-btn inline-flex items-center gap-2 active:scale-95 transition-all">
                    <span className="material-symbols-outlined icon-filled text-[18px]">bolt</span>
                    Start Tailoring
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
