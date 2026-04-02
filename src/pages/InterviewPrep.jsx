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

  const currentQ = questions[activeQ] || null
  const hasSession = questions.length > 0

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <main className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* Left: Question List */}
        <aside className="w-full md:w-80 flex-shrink-0 flex flex-col overflow-y-auto custom-scroll border-b md:border-b-0 md:border-r"
          style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)', maxHeight: '40vh' }}
          id="interview-aside">
          <style>{`@media(min-width:768px){#interview-aside{max-height:none;}}`}</style>

          <header className="px-6 py-6 border-b sticky top-0 glass-panel z-10" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Interview Prep
            </h1>
            <p className="text-xs mt-1" style={{ color: '#44474d' }}>
              {activeSession ? `${activeSession.company} · ${activeSession.role}` : 'No session loaded'}
            </p>
            {hasSession && (
              <div className="flex gap-2 mt-4">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(3,22,49,0.05)', color: '#44474d' }}>
                  <span className="material-symbols-outlined icon-filled text-[12px]">help</span>
                  {questions.length} Questions
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(3,22,49,0.05)', color: '#0e0099' }}>
                  <span className="material-symbols-outlined icon-filled text-[12px]">check_circle</span>
                  {questions.filter(q => q.star).length} Ready
                </div>
              </div>
            )}
          </header>

          <div className="p-4 space-y-3">
            {hasSession ? questions.map((q, i) => {
              const tagColor = TAG_COLORS[q.tag] || '#44474d'
              return (
                <button key={q.id || i} onClick={() => setActiveQ(i)}
                  className="w-full text-left p-4 rounded-xl transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: activeQ === i ? 'white' : 'transparent',
                    boxShadow: activeQ === i ? '0 4px 12px rgba(3,22,49,0.06)' : 'none',
                  }}>
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${tagColor}14`, color: tagColor }}>{q.tag}</span>
                    <div>
                      <p className="font-semibold text-sm leading-snug" style={{ color: '#031631' }}>{q.title}</p>
                      {q.star && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <span className="material-symbols-outlined icon-filled text-[12px]" style={{ color: '#0e0099' }}>check_circle</span>
                          <span className="text-[10px] font-bold" style={{ color: '#0e0099' }}>STAR ready</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            }) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[40px] block mb-3" style={{ color: '#c5c6ce' }}>psychology</span>
                <p className="text-sm mb-4" style={{ color: '#44474d' }}>No questions yet. Run a tailoring session to generate personalized interview prep.</p>
                <button onClick={() => navigate('/app/tailor')}
                  className="w-full py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn">
                  Start Session
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right: STAR Response */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          {currentQ ? (
            <>
              <header className="px-8 py-6 border-b sticky top-0 glass-panel z-10"
                style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: `${TAG_COLORS[currentQ.tag] || '#44474d'}14`, color: TAG_COLORS[currentQ.tag] || '#44474d' }}>
                      {currentQ.tag}
                    </span>
                    <h2 className="text-xl font-extrabold tracking-tight mt-2 max-w-2xl"
                      style={{ fontFamily: 'Manrope', color: '#031631' }}>
                      {currentQ.title}
                    </h2>
                  </div>
                </div>
              </header>

              <div className="px-4 md:px-8 py-6 md:py-10 max-w-3xl space-y-8">
                <div className="p-6 rounded-2xl" style={{ backgroundColor: '#eceef0', borderLeft: '4px solid #031631' }}>
                  <p className="font-bold text-sm mb-1 uppercase tracking-widest" style={{ color: '#8293b4' }}>Interview Question</p>
                  <p className="text-lg font-medium italic leading-relaxed" style={{ color: '#031631' }}>
                    {currentQ.question}
                  </p>
                </div>

                {currentQ.star ? (
                  <>
                    <div>
                      <h3 className="font-extrabold text-xl mb-5" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                        Your STAR Answer
                      </h3>
                      <div className="space-y-4">
                        <STARSection label="Situation" content={currentQ.star.situation} />
                        <STARSection label="Task" content={currentQ.star.task} />
                        <STARSection label="Action" content={currentQ.star.action} />
                        <STARSection label="Result" content={currentQ.star.result} />
                      </div>
                    </div>

                    {currentQ.key_metrics?.length > 0 && (
                      <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'white', borderColor: 'rgba(197,198,206,0.1)' }}>
                        <h4 className="font-bold mb-4" style={{ fontFamily: 'Manrope', color: '#031631' }}>Key Metrics to Cite</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {currentQ.key_metrics.map(m => (
                            <div key={m.metric} className="p-4 rounded-xl text-center" style={{ backgroundColor: '#f2f4f6' }}>
                              <div className="text-2xl font-extrabold" style={{ color: '#0e0099', fontFamily: 'Manrope' }}>{m.metric}</div>
                              <div className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: '#44474d' }}>{m.context}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentQ.delivery_tips?.length > 0 && (
                      <div className="p-6 rounded-2xl" style={{ backgroundColor: 'rgba(225,224,255,0.2)' }}>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined icon-filled text-[18px]" style={{ color: '#0e0099' }}>lightbulb</span>
                          <h4 className="font-bold" style={{ color: '#031631' }}>Delivery Tips</h4>
                        </div>
                        <ul className="space-y-3">
                          {currentQ.delivery_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold"
                                style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>{i + 1}</span>
                              <p className="text-sm leading-relaxed" style={{ color: '#44474d' }}>{tip}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-6 py-16 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
                      <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>psychology</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                        STAR answer included
                      </h3>
                      <p className="max-w-sm" style={{ color: '#44474d' }}>
                        This question's STAR answer will appear here once generated by the AI.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center px-8">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>psychology</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No interview prep yet</h2>
                <p className="max-w-sm text-sm" style={{ color: '#44474d' }}>
                  Run a tailoring session to generate personalized STAR-method interview questions and answers.
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
    </div>
  )
}
