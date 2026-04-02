import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useSession } from '../context/SessionContext'
import { useSessions } from '../hooks/useSessions'

const templates = [
  { id: 'atelier', label: 'The Atelier' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'impact', label: 'Impact' },
]

function AtelierTemplate({ resume }) {
  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1122px', padding: '56px 64px' }}>
      <div className="pb-8 mb-8" style={{ borderBottom: '3px solid #031631' }}>
        <h1 style={{ fontFamily: 'Manrope', fontSize: '32px', fontWeight: 800, color: '#031631', letterSpacing: '-0.02em' }}>{resume.name}</h1>
        <p style={{ fontSize: '14px', color: '#0e0099', fontWeight: 600, marginBottom: '8px' }}>{resume.title}</p>
        <p style={{ fontSize: '11px', color: '#44474d' }}>{resume.contact}</p>
      </div>
      {resume.summary && (
        <div className="mb-8">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Professional Summary</h2>
          <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.8' }}>{resume.summary}</p>
        </div>
      )}
      {resume.experience?.length > 0 && (
        <div className="mb-8">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '12px' }}>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <strong style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631' }}>{exp.title}</strong>
              <p style={{ fontSize: '11px', color: '#0e0099', fontWeight: 600, marginBottom: '8px', marginTop: '2px' }}>{exp.company}{exp.dates ? ` · ${exp.dates}` : ''}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {exp.bullets?.map((b, j) => (
                  <li key={j} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: '#031631', marginTop: '2px', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.7' }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {resume.skills?.length > 0 && (
        <div className="mb-8">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resume.skills.map(s => (
              <span key={s} style={{ fontSize: '11px', backgroundColor: '#f2f4f6', color: '#031631', padding: '4px 10px', borderRadius: '4px', fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {resume.education?.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Education</h2>
          {resume.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <strong style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631' }}>{edu.degree}</strong>
              <p style={{ fontSize: '12px', color: '#44474d' }}>{edu.school}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MinimalTemplate({ resume }) {
  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1122px', padding: '64px 72px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#000', letterSpacing: '-0.01em', marginBottom: '4px' }}>{resume.name}</h1>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>{resume.title}</p>
        <p style={{ fontSize: '11px', color: '#888' }}>{resume.contact}</p>
      </div>
      {resume.summary && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.9', borderLeft: '2px solid #000', paddingLeft: '16px' }}>{resume.summary}</p>
        </div>
      )}
      {resume.experience?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '16px' }}>Experience</p>
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <strong style={{ fontSize: '13px', fontWeight: 600, color: '#000' }}>{exp.title}</strong>
                <span style={{ fontSize: '11px', color: '#888' }}>{exp.dates}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>{exp.company}</p>
              {exp.bullets?.map((b, j) => (
                <p key={j} style={{ fontSize: '11px', color: '#444', lineHeight: '1.7', marginBottom: '4px', paddingLeft: '12px' }}>– {b}</p>
              ))}
            </div>
          ))}
        </div>
      )}
      {resume.skills?.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Skills</p>
          <p style={{ fontSize: '12px', color: '#444', lineHeight: '1.8' }}>{resume.skills.join(' · ')}</p>
        </div>
      )}
      {resume.education?.length > 0 && (
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Education</p>
          {resume.education.map((edu, i) => (
            <div key={i}><strong style={{ fontSize: '12px', color: '#000' }}>{edu.degree}</strong><p style={{ fontSize: '11px', color: '#666' }}>{edu.school}</p></div>
          ))}
        </div>
      )}
    </div>
  )
}

function ImpactTemplate({ resume }) {
  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1122px', fontFamily: 'Manrope, sans-serif' }}>
      <div style={{ backgroundColor: '#031631', padding: '48px 56px', color: 'white' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>{resume.name}</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '12px' }}>{resume.title}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{resume.contact}</p>
      </div>
      <div style={{ padding: '40px 56px' }}>
        {resume.summary && (
          <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f7f9fb', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.9' }}>{resume.summary}</p>
          </div>
        )}
        {resume.experience?.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0099', marginBottom: '16px' }}>Experience</h2>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '24px', paddingLeft: '16px', borderLeft: '3px solid #0e0099' }}>
                <strong style={{ fontSize: '13px', fontWeight: 700, color: '#031631', display: 'block' }}>{exp.title}</strong>
                <p style={{ fontSize: '11px', color: '#0e0099', fontWeight: 600, marginBottom: '8px', marginTop: '2px' }}>{exp.company}{exp.dates ? ` · ${exp.dates}` : ''}</p>
                {exp.bullets?.map((b, j) => (
                  <p key={j} style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.7', marginBottom: '4px' }}>• {b}</p>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {resume.skills?.length > 0 && (
            <div>
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0099', marginBottom: '12px' }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resume.skills.map(s => (
                  <span key={s} style={{ fontSize: '10px', backgroundColor: '#e1e0ff', color: '#2f2ebe', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {resume.education?.length > 0 && (
            <div>
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0099', marginBottom: '12px' }}>Education</h2>
              {resume.education.map((edu, i) => (
                <div key={i}>
                  <strong style={{ fontSize: '12px', color: '#031631' }}>{edu.degree}</strong>
                  <p style={{ fontSize: '11px', color: '#44474d' }}>{edu.school}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResumeEditor() {
  const navigate = useNavigate()
  const { activeSession } = useSession()
  const { saveResumeVersion } = useSessions()
  const [activeTemplate, setActiveTemplate] = useState('atelier')
  const [zoom, setZoom] = useState(90)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

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

  const ResumeTemplate = activeTemplate === 'atelier'
    ? AtelierTemplate
    : activeTemplate === 'minimal'
      ? MinimalTemplate
      : ImpactTemplate

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f2f4f6' }}>
      <SideNav />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="glass-panel border-b px-6 py-3 flex items-center justify-between z-10 flex-shrink-0"
          style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="text-sm font-bold flex items-center gap-2 truncate" style={{ color: '#031631' }}>
              <span className="material-symbols-outlined text-[18px] flex-shrink-0">description</span>
              <span className="truncate">
                {activeSession ? `${activeSession.role} — ${activeSession.company}` : 'No session loaded'}
              </span>
            </div>
            {activeSession && (
              <div className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: '#eceef0', color: '#44474d' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#2e7d32' }} />
                {activeSession.matchData?.match_score}% Match
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs border rounded-lg px-2 overflow-hidden"
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
            <button onClick={() => window.print()}
              className="px-5 py-2 text-sm font-bold rounded-lg text-white shadow-lg transition-all active:scale-95 ai-glow-btn flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export PDF
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scroll dot-grid flex items-start justify-center p-6 md:p-10">
          {resume ? (
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
              <div className="paper-shadow">
                <ResumeTemplate resume={resume} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#eceef0' }}>
                <span className="material-symbols-outlined text-[40px]" style={{ color: '#c5c6ce' }}>description</span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>No resume loaded</h2>
                <p className="max-w-sm text-sm" style={{ color: '#44474d' }}>Run a tailoring session first to generate your AI-optimized resume.</p>
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
                {activeTemplate === t.id && <span className="material-symbols-outlined icon-filled text-[16px]">check_circle</span>}
              </button>
            ))}
          </div>
        </div>

        {activeSession && (
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#8293b4' }}>Session</h3>
            <p className="text-sm font-semibold" style={{ color: '#031631' }}>{activeSession.role}</p>
            <p className="text-xs mb-3" style={{ color: '#44474d' }}>{activeSession.company}</p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                <div className="h-full rounded-full" style={{ width: `${activeSession.matchData?.match_score}%`, backgroundColor: '#0e0099' }} />
              </div>
              <span className="text-xs font-bold" style={{ color: '#0e0099' }}>{activeSession.matchData?.match_score}%</span>
            </div>
          </div>
        )}

        <div className="mt-auto px-6 py-5 border-t space-y-3" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          {saveMsg && (
            <p className="text-xs font-bold text-center" style={{ color: saveMsg === 'Saved!' ? '#2e7d32' : '#93000a' }}>{saveMsg}</p>
          )}
          <button onClick={handleSave} disabled={!resume || saving}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold border flex items-center justify-center gap-2 transition-all hover:bg-[#eceef0] disabled:opacity-50"
            style={{ color: '#031631' }}>
            <span className="material-symbols-outlined text-[18px]">{saving ? 'progress_activity' : 'save'}</span>
            {saving ? 'Saving...' : 'Save Version'}
          </button>
          <button onClick={() => navigate('/app/tailor')}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all text-white ai-glow-btn">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            New Session
          </button>
        </div>
      </aside>
    </div>
  )
}
