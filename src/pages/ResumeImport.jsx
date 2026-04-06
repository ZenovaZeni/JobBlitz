import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { parseResumeText } from '../lib/openai'

const IMPORT_DRAFT_KEY = 'jb_import_draft'

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <path d="M24 32V20M24 20L18 26M24 20L30 26" stroke="#0e0099" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 34C39.3137 34 42 31.3137 42 28C42 25.2386 40.1948 22.9041 37.6938 22.174C37.8934 21.4679 38 20.7254 38 19.9593C38 14.9467 33.9706 10.9079 29 11C26.0699 11.0457 23.4714 12.4558 21.8174 14.6538C21.2175 14.5199 20.5966 14.4483 20 14.4483C15.5817 14.4483 12 17.9877 12 22.3448C12 24.5359 12.8714 26.5249 14.2857 27.9928" stroke="#0e0099" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ReviewCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: 'rgba(197,198,206,0.12)', boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
      <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#8293b4' }}>{title}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default function ResumeImport() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('select') // select | parsing | review | error
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [pasteMode, setPasteMode] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const STEPS = [
    { label: 'Select', key: 'select' },
    { label: 'Parsing', key: 'parsing' },
    { label: 'Review', key: 'review' },
  ]
  const activeStepIdx = stage === 'error' ? 0 : STEPS.findIndex(s => s.key === stage)

  function animateProgress(from, to, onDone) {
    let current = from
    const step = Math.ceil((to - from) / 8)
    const timer = setInterval(() => {
      current = Math.min(current + step, to)
      setProgress(current)
      if (current >= to) { clearInterval(timer); onDone?.() }
    }, 150)
  }

  async function processText(rawText) {
    setStage('parsing')
    setProgress(10)
    setErrorMsg('')
    animateProgress(10, 60, null)
    try {
      const result = await parseResumeText({ rawText })
      animateProgress(60, 100, () => {
        setParsedData(result)
        setTimeout(() => setStage('review'), 400)
      })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to parse resume. Please try again.')
      setStage('error')
    }
  }

  function handleFile(file) {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'txt') {
      const reader = new FileReader()
      reader.onload = (e) => processText(e.target.result)
      reader.readAsText(file)
    } else if (ext === 'pdf' || ext === 'docx') {
      setPasteMode(true)
      setErrorMsg('PDF and DOCX files are not supported yet. Please paste your resume text below instead.')
    } else {
      setErrorMsg('Unsupported file type. Please upload a .txt file or paste your resume text.')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  function handleFileInput(e) {
    handleFile(e.target.files[0])
  }

  function handlePasteSubmit() {
    if (!pasteText.trim() || pasteText.trim().length < 50) {
      setErrorMsg('Please paste your full resume text (at least a few lines).')
      return
    }
    setErrorMsg('')
    processText(pasteText)
  }

  function handleConfirm() {
    localStorage.setItem(IMPORT_DRAFT_KEY, JSON.stringify(parsedData))
    navigate('/app/profile')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky header */}
        <header
          className="glass-panel border-b flex-shrink-0 z-10"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
                Import Resume
              </p>
              <h1 className="text-base md:text-lg font-black tracking-tight"
                style={{ fontFamily: 'Manrope', color: '#031631' }}>
                Build Your Master Profile
              </h1>
            </div>

            {/* Step indicator — full labels on sm+, hidden on mobile (replaced by progress bar) */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              {STEPS.map((step, i) => {
                const done = i < activeStepIdx
                const active = i === activeStepIdx
                return (
                  <div key={step.key} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all"
                        style={{
                          backgroundColor: done ? '#031631' : active ? '#0e0099' : '#eceef0',
                          color: done || active ? 'white' : '#c5c6ce',
                        }}>
                        {done
                          ? <span className="material-symbols-outlined text-[12px]">check</span>
                          : i + 1
                        }
                      </div>
                      <span className="text-xs font-bold transition-colors"
                        style={{ color: active ? '#031631' : done ? '#0e0099' : '#9da3ae' }}>
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-5 h-px mx-1" style={{ backgroundColor: '#e0e3e5' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </header>

        {/* Mobile step progress bar — 3 equal segments */}
        <div className="sm:hidden flex-shrink-0 flex gap-1 px-4 pt-3 pb-2"
          style={{ backgroundColor: '#f2f4f6', borderBottom: '1px solid rgba(197,198,206,0.15)' }}>
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex-1 flex flex-col gap-1">
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{ backgroundColor: i <= activeStepIdx ? '#0e0099' : '#e0e3e5' }}
              />
              <span className="text-[9px] font-bold transition-colors"
                style={{ color: i === activeStepIdx ? '#031631' : i < activeStepIdx ? '#0e0099' : '#c5c6ce' }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto custom-scroll">
          <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-16">

            {/* ── SELECT / ERROR STAGE ── */}
            {(stage === 'select' || stage === 'error') && (
              <div className="space-y-6">

                {/* Stage intro */}
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight mb-1"
                    style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Import your resume
                  </h2>
                  <p className="text-sm" style={{ color: '#75777e' }}>
                    Upload or paste your resume — we'll extract your career data automatically so you can review and confirm before saving.
                  </p>
                </div>

                {/* Error / info message */}
                {errorMsg && (
                  <div
                    className="p-4 rounded-xl flex items-start gap-3"
                    style={{
                      backgroundColor: errorMsg.includes('PDF') ? 'rgba(225,224,255,0.3)' : '#ffdad6',
                      color: errorMsg.includes('PDF') ? '#0e0099' : '#93000a',
                    }}>
                    <span className="material-symbols-outlined icon-filled text-[18px] flex-shrink-0 mt-0.5">
                      {errorMsg.includes('PDF') ? 'info' : 'error'}
                    </span>
                    <p className="text-sm font-semibold">{errorMsg}</p>
                  </div>
                )}

                {!pasteMode ? (
                  <>
                    {/* Drop zone */}
                    <label
                      className="block border-2 border-dashed rounded-2xl cursor-pointer transition-all"
                      style={{
                        backgroundColor: isDragging ? 'rgba(225,224,255,0.15)' : 'white',
                        borderColor: isDragging ? '#0e0099' : 'rgba(197,198,206,0.4)',
                      }}
                      onDragEnter={() => setIsDragging(true)}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}>
                      <input
                        type="file"
                        accept=".txt,.pdf,.docx"
                        className="sr-only"
                        onChange={handleFileInput}
                      />
                      <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(14,0,153,0.06)' }}>
                          <UploadIcon />
                        </div>
                        <div>
                          <p className="font-bold text-base mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                            Drop your resume here
                          </p>
                          <p className="text-sm" style={{ color: '#75777e' }}>
                            .txt supported &nbsp;·&nbsp; PDF/DOCX: paste text below
                          </p>
                        </div>
                        <span className="py-2 px-5 text-sm font-bold text-white rounded-xl ai-glow-btn pointer-events-none">
                          Browse Files
                        </span>
                      </div>
                    </label>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
                      <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#c5c6ce' }}>
                        or
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
                    </div>

                    {/* Alt options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setPasteMode(true)}
                        className="flex items-center gap-4 p-5 rounded-2xl text-left border bg-white transition-all hover:border-[rgba(14,0,153,0.2)] hover:shadow-sm"
                        style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'rgba(14,0,153,0.06)' }}>
                          <span className="material-symbols-outlined text-[20px]" style={{ color: '#0e0099' }}>content_paste</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-0.5" style={{ color: '#031631' }}>Paste Resume Text</p>
                          <p className="text-xs" style={{ color: '#75777e' }}>Works with any format</p>
                        </div>
                      </button>
                      <button
                        onClick={() => navigate('/app/profile')}
                        className="flex items-center gap-4 p-5 rounded-2xl text-left border bg-white transition-all hover:border-[rgba(14,0,153,0.2)] hover:shadow-sm"
                        style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'rgba(14,0,153,0.06)' }}>
                          <span className="material-symbols-outlined text-[20px]" style={{ color: '#0e0099' }}>edit_note</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm mb-0.5" style={{ color: '#031631' }}>Build from Scratch</p>
                          <p className="text-xs" style={{ color: '#75777e' }}>Fill in manually</p>
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── PASTE MODE ── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm" style={{ color: '#031631' }}>Paste your resume text</p>
                      <button
                        onClick={() => { setPasteMode(false); setErrorMsg('') }}
                        className="flex items-center gap-1 text-xs font-bold transition-all hover:opacity-70"
                        style={{ color: '#44474d' }}>
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Back to upload
                      </button>
                    </div>
                    <textarea
                      value={pasteText}
                      onChange={e => setPasteText(e.target.value)}
                      placeholder="Paste your full resume here — name, contact info, work experience, skills, education..."
                      rows={16}
                      className="w-full px-5 py-4 rounded-2xl text-sm border resize-none focus:outline-none leading-relaxed"
                      style={{
                        borderColor: 'rgba(197,198,206,0.3)',
                        backgroundColor: 'white',
                        color: '#031631',
                        fontFamily: 'Inter, sans-serif',
                        boxShadow: '0 2px 12px rgba(3,22,49,0.04)',
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: '#c5c6ce' }}>
                        {pasteText.split(/\s+/).filter(Boolean).length} words
                      </p>
                      <button
                        onClick={handlePasteSubmit}
                        disabled={pasteText.trim().length < 50}
                        className="px-6 py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
                        <span className="material-symbols-outlined icon-filled text-[18px]">auto_awesome</span>
                        Extract with AI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PARSING STAGE ── */}
            {stage === 'parsing' && (
              <div className="flex flex-col items-center gap-10 py-8">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-center mb-1"
                    style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Extracting your career data
                  </h2>
                  <p className="text-sm text-center" style={{ color: '#75777e' }}>
                    This usually takes 10–20 seconds.
                  </p>
                </div>

                {/* Progress ring */}
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" strokeWidth="8" stroke="#f2f4f6" fill="none" />
                    <circle cx="60" cy="60" r="50" strokeWidth="8" stroke="#0e0099" fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-black"
                    style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    {progress}%
                  </span>
                </div>

                {/* Step checklist */}
                <div className="w-full max-w-sm space-y-4">
                  {[
                    { label: 'Reading document', done: progress >= 33 },
                    { label: 'Extracting information', done: progress >= 66 },
                    { label: 'Building profile structure', done: progress >= 100 },
                  ].map(step => (
                    <div key={step.label} className="flex items-center gap-4">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                        style={{ backgroundColor: step.done ? '#031631' : '#eceef0' }}>
                        {step.done
                          ? <span className="material-symbols-outlined icon-filled text-[13px] text-white">check</span>
                          : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c5c6ce' }} />
                        }
                      </div>
                      <p className="text-sm font-semibold"
                        style={{ color: step.done ? '#031631' : '#9da3ae' }}>
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REVIEW STAGE ── */}
            {stage === 'review' && parsedData && (
              <div className="space-y-6">

                {/* Review header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2"
                      style={{ backgroundColor: 'rgba(225,224,255,0.5)', color: '#2f2ebe' }}>
                      <span className="material-symbols-outlined icon-filled text-[12px]">check_circle</span>
                      Extraction complete
                    </div>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-1"
                      style={{ fontFamily: 'Manrope', color: '#031631' }}>
                      Review extracted data
                    </h2>
                    <p className="text-sm" style={{ color: '#75777e' }}>
                      Confirm below — you can edit everything in the Profile Builder.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setStage('select'); setPasteMode(true); setProgress(0) }}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-[#f2f4f6]"
                      style={{ color: '#44474d', borderColor: 'rgba(197,198,206,0.3)' }}>
                      Re-import
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="px-5 py-2 text-white rounded-xl text-sm font-bold ai-glow-btn active:scale-95 transition-all">
                      Confirm →
                    </button>
                  </div>
                </div>

                {/* Identity + Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReviewCard title="Identity">
                    <p className="text-xl font-extrabold mb-0.5"
                      style={{ fontFamily: 'Manrope', color: '#031631' }}>
                      {parsedData.name || 'Name not found'}
                    </p>
                    {parsedData.title && (
                      <p className="text-sm font-semibold mb-3" style={{ color: '#0e0099' }}>
                        {parsedData.title}
                      </p>
                    )}
                    <div className="space-y-1.5 mt-2">
                      {[
                        { label: 'Email', value: parsedData.email },
                        { label: 'Phone', value: parsedData.phone },
                        { label: 'Location', value: parsedData.location },
                        { label: 'LinkedIn', value: parsedData.linkedin_url },
                      ].filter(f => f.value).map(f => (
                        <p key={f.label} className="text-xs truncate" style={{ color: '#44474d' }}>
                          <span className="font-semibold">{f.label}:</span> {f.value}
                        </p>
                      ))}
                    </div>
                  </ReviewCard>

                  <ReviewCard title="Summary">
                    <p className="text-sm leading-relaxed" style={{ color: parsedData.summary ? '#031631' : '#9da3ae' }}>
                      {parsedData.summary || 'No summary found — you can add one in the Profile Builder.'}
                    </p>
                  </ReviewCard>
                </div>

                {/* Experience */}
                {parsedData.experience?.length > 0 && (
                  <ReviewCard title={`Experience · ${parsedData.experience.length} roles`}>
                    <div className="space-y-0">
                      {parsedData.experience.map((exp, i) => (
                        <div key={i}
                          className="flex items-center justify-between py-3 border-b last:border-b-0"
                          style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm truncate" style={{ color: '#031631' }}>
                              {exp.role || exp.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: '#75777e' }}>
                              {exp.company}{exp.dates ? ` · ${exp.dates}` : ''}
                            </p>
                          </div>
                          {exp.bullets?.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-3"
                              style={{ backgroundColor: '#f2f4f6', color: '#44474d' }}>
                              {exp.bullets.length} bullets
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ReviewCard>
                )}

                {/* Skills */}
                {parsedData.skills?.length > 0 && (
                  <ReviewCard title={`Skills · ${parsedData.skills.length} found`}>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.skills.slice(0, 14).map(s => (
                        <span key={s}
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: '#e8edff', color: '#031631' }}>
                          {s}
                        </span>
                      ))}
                      {parsedData.skills.length > 14 && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: '#f2f4f6', color: '#75777e' }}>
                          +{parsedData.skills.length - 14} more
                        </span>
                      )}
                    </div>
                  </ReviewCard>
                )}

                {/* Education */}
                {parsedData.education?.length > 0 && (
                  <ReviewCard title="Education">
                    <div className="space-y-3">
                      {parsedData.education.map((edu, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'rgba(14,0,153,0.06)' }}>
                            <span className="material-symbols-outlined text-[16px]" style={{ color: '#0e0099' }}>
                              school
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={{ color: '#031631' }}>{edu.degree}</p>
                            <p className="text-xs" style={{ color: '#75777e' }}>
                              {edu.school}{edu.year ? ` · ${edu.year}` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ReviewCard>
                )}

                {/* Also found banner */}
                {(parsedData.certifications?.length > 0 || parsedData.projects?.length > 0 || parsedData.languages?.length > 0) && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ backgroundColor: 'rgba(225,224,255,0.2)', border: '1px solid rgba(14,0,153,0.08)' }}>
                    <span className="material-symbols-outlined icon-filled text-[18px] flex-shrink-0"
                      style={{ color: '#0e0099' }}>
                      check_circle
                    </span>
                    <p className="text-sm" style={{ color: '#44474d' }}>
                      <span className="font-semibold" style={{ color: '#031631' }}>Also found: </span>
                      {[
                        parsedData.certifications?.length > 0 && `${parsedData.certifications.length} certifications`,
                        parsedData.projects?.length > 0 && `${parsedData.projects.length} projects`,
                        parsedData.languages?.length > 0 && `${parsedData.languages.length} languages`,
                      ].filter(Boolean).join(', ')}
                      {' '}— all pre-filled in the Profile Builder.
                    </p>
                  </div>
                )}

                {/* Bottom CTA */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleConfirm}
                    className="px-8 py-3.5 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2 active:scale-95 transition-all">
                    <span className="material-symbols-outlined icon-filled text-[18px]">arrow_forward</span>
                    Confirm & Build Profile
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
