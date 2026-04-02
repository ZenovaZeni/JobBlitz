import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { parseResumeText } from '../lib/openai'

const IMPORT_DRAFT_KEY = 'jb_import_draft'

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M24 32V20M24 20L18 26M24 20L30 26" stroke="#031631" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 34C39.3137 34 42 31.3137 42 28C42 25.2386 40.1948 22.9041 37.6938 22.174C37.8934 21.4679 38 20.7254 38 19.9593C38 14.9467 33.9706 10.9079 29 11C26.0699 11.0457 23.4714 12.4558 21.8174 14.6538C21.2175 14.5199 20.5966 14.4483 20 14.4483C15.5817 14.4483 12 17.9877 12 22.3448C12 24.5359 12.8714 26.5249 14.2857 27.9928" stroke="#031631" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ProgressParsing({ progress, stage }) {
  const steps = [
    { label: 'Reading document', done: progress >= 33 },
    { label: 'Extracting information', done: progress >= 66 },
    { label: 'Building profile structure', done: progress >= 100 },
  ]
  return (
    <div className="flex flex-col items-center gap-10 py-12">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" strokeWidth="10" stroke="#f2f4f6" fill="none" />
          <circle cx="60" cy="60" r="50" strokeWidth="10" stroke="#0e0099" fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black"
          style={{ fontFamily: 'Manrope', color: '#031631' }}>{progress}%</span>
      </div>
      <div className="w-full max-w-md space-y-4">
        {steps.map(step => (
          <div key={step.label} className="flex items-center gap-4">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{ backgroundColor: step.done ? '#031631' : '#eceef0' }}>
              {step.done
                ? <span className="material-symbols-outlined icon-filled text-[14px] text-white">check</span>
                : <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#c5c6ce' }} />
              }
            </div>
            <p className="font-semibold text-sm" style={{ color: step.done ? '#031631' : '#75777e' }}>{step.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewSection({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
      <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>{title}</h4>
      {children}
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
      // PDF/DOCX need a parsing library — prompt paste fallback
      setPasteMode(true)
      setErrorMsg(`PDF/DOCX extraction requires a library not yet installed. Please paste your resume text below instead.`)
    } else {
      setErrorMsg('Unsupported file type. Please upload a .txt file or paste your resume text.')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
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
    <div className="flex min-h-screen" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <main className="flex-1 flex flex-col">
        <header className="px-4 md:px-16 py-6 md:py-8 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2"
              style={{ fontFamily: 'Manrope', color: '#031631', letterSpacing: '-0.02em' }}>
              Import Your Resume
            </h1>
            <p style={{ color: '#44474d' }}>
              Upload a .txt file or paste your resume text — we'll extract and pre-fill your Master Profile.
            </p>
          </div>
        </header>

        <div className="flex-1 px-4 md:px-16 py-8 md:py-12 flex flex-col pb-24 md:pb-0">

          {/* Step indicator */}
          {stage !== 'review' && (
            <div className="flex items-center gap-4 mb-10 max-w-md">
              {[
                { num: '01', label: 'Select / Paste', active: stage === 'select' || stage === 'error' },
                { num: '02', label: 'Parsing', active: stage === 'parsing' },
                { num: '03', label: 'Review', active: false },
              ].map((step, i, arr) => (
                <div key={step.num} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={{
                        backgroundColor: step.active ? '#031631' : '#eceef0',
                        color: step.active ? 'white' : '#c5c6ce',
                      }}>
                      {step.num}
                    </div>
                    <span className="font-medium text-sm" style={{ color: step.active ? '#031631' : '#9da3ae' }}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && <div className="w-8 h-px" style={{ backgroundColor: '#eceef0' }} />}
                </div>
              ))}
            </div>
          )}

          {/* SELECT STAGE */}
          {(stage === 'select' || stage === 'error') && (
            <div className="max-w-2xl">

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
                  style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                  <span className="material-symbols-outlined icon-filled text-[18px] flex-shrink-0 mt-0.5">error</span>
                  <p className="text-sm font-semibold">{errorMsg}</p>
                </div>
              )}

              {!pasteMode ? (
                <>
                  {/* Drop zone */}
                  <label
                    className="border-2 border-dashed rounded-2xl p-8 md:p-16 flex flex-col items-center gap-6 transition-all cursor-pointer block"
                    style={{
                      backgroundColor: isDragging ? 'rgba(225,224,255,0.2)' : '#f2f4f6',
                      borderColor: isDragging ? '#0e0099' : '#c5c6ce',
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
                    <UploadIcon />
                    <div className="text-center">
                      <p className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                        Drop your resume here
                      </p>
                      <p className="text-sm" style={{ color: '#44474d' }}>
                        .txt supported · PDF/DOCX: paste text below
                      </p>
                    </div>
                    <span className="py-2.5 px-6 font-bold text-sm text-white rounded-xl ai-glow-btn pointer-events-none">
                      Browse Files
                    </span>
                  </label>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
                    <span className="text-xs uppercase tracking-widest font-bold" style={{ color: '#c5c6ce' }}>Or paste text</span>
                    <div className="flex-1 h-px" style={{ backgroundColor: '#eceef0' }} />
                  </div>

                  {/* Alt options */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPasteMode(true)}
                      className="flex items-start gap-4 p-5 rounded-2xl text-left border transition-all hover:shadow-md bg-white"
                      style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d6e3ff' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#031631' }}>content_paste</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-0.5" style={{ color: '#031631' }}>Paste Resume Text</p>
                        <p className="text-xs" style={{ color: '#44474d' }}>Works with any format</p>
                      </div>
                    </button>
                    <button
                      onClick={() => navigate('/app/profile')}
                      className="flex items-start gap-4 p-5 rounded-2xl text-left border transition-all hover:shadow-md bg-white"
                      style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#d6e3ff' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#031631' }}>edit_note</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-0.5" style={{ color: '#031631' }}>Build from Scratch</p>
                        <p className="text-xs" style={{ color: '#44474d' }}>Manual entry wizard</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                /* PASTE MODE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold" style={{ color: '#031631' }}>Paste your resume text</p>
                    <button onClick={() => { setPasteMode(false); setErrorMsg('') }}
                      className="text-xs font-bold flex items-center gap-1" style={{ color: '#44474d' }}>
                      <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                      Back to upload
                    </button>
                  </div>
                  <textarea
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    placeholder="Paste your full resume here — name, contact info, work experience, skills, education..."
                    rows={18}
                    className="w-full px-5 py-4 rounded-2xl text-sm border resize-none focus:outline-none leading-relaxed"
                    style={{
                      borderColor: 'rgba(197,198,206,0.3)',
                      backgroundColor: 'white',
                      color: '#031631',
                      boxShadow: '0 2px 12px rgba(3,22,49,0.05)',
                      fontFamily: 'Inter, monospace',
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: '#c5c6ce' }}>
                      {pasteText.split(/\s+/).filter(Boolean).length} words
                    </p>
                    <button
                      onClick={handlePasteSubmit}
                      disabled={pasteText.trim().length < 50}
                      className="px-8 py-3 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                      <span className="material-symbols-outlined icon-filled text-[18px]">auto_awesome</span>
                      Extract with AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PARSING STAGE */}
          {stage === 'parsing' && (
            <div className="max-w-2xl">
              <div className="bg-white p-10 rounded-2xl shadow-sm border" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                <h3 className="text-xl font-bold mb-8 text-center" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                  Extracting your career data...
                </h3>
                <ProgressParsing progress={progress} />
              </div>
            </div>
          )}

          {/* REVIEW STAGE */}
          {stage === 'review' && parsedData && (
            <div className="w-full max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                    style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
                    <span className="material-symbols-outlined icon-filled text-[14px]">check_circle</span>
                    EXTRACTION COMPLETE
                  </div>
                  <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                    Review extracted data
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#44474d' }}>
                    Confirm below — you can edit everything in the Profile Builder.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setStage('select'); setPasteMode(true); setProgress(0) }}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:bg-[#eceef0]"
                    style={{ color: '#031631' }}>
                    Re-import
                  </button>
                  <button onClick={handleConfirm}
                    className="px-8 py-2.5 text-white rounded-xl font-bold active:scale-95 transition-all shadow-lg ai-glow-btn">
                    Confirm & Build Profile →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Identity */}
                <div className="md:col-span-4">
                  <ReviewSection title="Identity">
                    <p className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                      {parsedData.name || 'Name not found'}
                    </p>
                    {parsedData.title && (
                      <p className="text-sm font-semibold mb-3" style={{ color: '#0e0099' }}>{parsedData.title}</p>
                    )}
                    <div className="space-y-1.5 mt-3">
                      {parsedData.email && <p className="text-xs" style={{ color: '#44474d' }}><span className="font-bold">Email: </span>{parsedData.email}</p>}
                      {parsedData.phone && <p className="text-xs" style={{ color: '#44474d' }}><span className="font-bold">Phone: </span>{parsedData.phone}</p>}
                      {parsedData.location && <p className="text-xs" style={{ color: '#44474d' }}><span className="font-bold">Location: </span>{parsedData.location}</p>}
                      {parsedData.linkedin_url && <p className="text-xs truncate" style={{ color: '#44474d' }}><span className="font-bold">LinkedIn: </span>{parsedData.linkedin_url}</p>}
                    </div>
                  </ReviewSection>
                </div>

                {/* Summary */}
                <div className="md:col-span-8">
                  <div className="p-6 rounded-2xl border h-full" style={{ backgroundColor: 'rgba(225,224,255,0.15)', borderColor: 'rgba(14,0,153,0.08)' }}>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>Professional Summary</h4>
                    <p className="text-sm leading-relaxed" style={{ color: '#031631' }}>
                      {parsedData.summary || 'No summary found — you can add one in the Profile Builder.'}
                    </p>
                  </div>
                </div>

                {/* Experience */}
                {parsedData.experience?.length > 0 && (
                  <div className="md:col-span-8">
                    <ReviewSection title={`Experience (${parsedData.experience.length} roles)`}>
                      <div className="space-y-3">
                        {parsedData.experience.map((exp, i) => (
                          <div key={i} className="flex items-start justify-between py-2 border-b last:border-b-0" style={{ borderColor: '#f2f4f6' }}>
                            <div className="min-w-0">
                              <p className="font-semibold truncate" style={{ color: '#031631' }}>{exp.role || exp.title}</p>
                              <p className="text-xs" style={{ color: '#44474d' }}>{exp.company} {exp.dates ? `· ${exp.dates}` : ''}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ml-3" style={{ backgroundColor: '#f2f4f6', color: '#44474d' }}>
                              {exp.bullets?.length ?? 0} bullets
                            </span>
                          </div>
                        ))}
                      </div>
                    </ReviewSection>
                  </div>
                )}

                {/* Skills */}
                {parsedData.skills?.length > 0 && (
                  <div className="md:col-span-4">
                    <ReviewSection title={`Skills (${parsedData.skills.length})`}>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.skills.slice(0, 12).map(s => (
                          <span key={s} className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#d6e3ff', color: '#031631' }}>{s}</span>
                        ))}
                        {parsedData.skills.length > 12 && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: '#f2f4f6', color: '#75777e' }}>
                            +{parsedData.skills.length - 12} more
                          </span>
                        )}
                      </div>
                    </ReviewSection>
                  </div>
                )}

                {/* Education */}
                {parsedData.education?.length > 0 && (
                  <div className="md:col-span-12">
                    <ReviewSection title="Education">
                      <div className="flex flex-wrap gap-4">
                        {parsedData.education.map((edu, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#d6e3ff' }}>
                              <span className="material-symbols-outlined text-[16px]" style={{ color: '#031631' }}>school</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm" style={{ color: '#031631' }}>{edu.degree}</p>
                              <p className="text-xs" style={{ color: '#44474d' }}>{edu.school}{edu.year ? ` · ${edu.year}` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ReviewSection>
                  </div>
                )}

                {/* Certifications / Projects hint */}
                {(parsedData.certifications?.length > 0 || parsedData.projects?.length > 0) && (
                  <div className="md:col-span-12">
                    <div className="p-4 rounded-2xl flex items-center gap-3"
                      style={{ backgroundColor: '#eceef0' }}>
                      <span className="material-symbols-outlined icon-filled text-[20px]" style={{ color: '#0e0099' }}>check_circle</span>
                      <p className="text-sm" style={{ color: '#44474d' }}>
                        Also found:{' '}
                        {[
                          parsedData.certifications?.length > 0 && `${parsedData.certifications.length} certifications`,
                          parsedData.projects?.length > 0 && `${parsedData.projects.length} projects`,
                          parsedData.languages?.length > 0 && `${parsedData.languages.length} languages`,
                        ].filter(Boolean).join(', ')}
                        {' '}— all pre-filled in the Profile Builder.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA footer */}
              <div className="mt-8 flex justify-end">
                <button onClick={handleConfirm}
                  className="px-10 py-4 text-white font-bold rounded-xl ai-glow-btn flex items-center gap-2 active:scale-95 transition-all shadow-xl">
                  <span className="material-symbols-outlined icon-filled text-[18px]">arrow_forward</span>
                  Confirm & Build Profile
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
