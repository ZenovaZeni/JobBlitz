import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'

import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { templates, AtelierTemplate, MinimalTemplate, ImpactTemplate, ResumeTemplate } from '../components/ResumeTemplates'
import { ATSCoach } from '../components/profile/ATSCoach'
import { analyzeMasterProfile } from '../lib/openai'
import { logger } from '../lib/logger'



function calcCompletion(f) {
  let score = 0
  // Core Sections (Required for 100%)
  if (f.name?.trim()) score += 15
  if (f.summary?.trim()) score += 15
  if (f.experience?.length > 0) score += 25
  if (f.skills?.length >= 3) score += 15
  if (f.education?.length > 0) score += 15
  if (f.projects?.length > 0) score += 15
  
  // Total of above is 100. 
  // Remaining fields (LinkedIn, Portfolio, Certs, Languages) are "Bonus/Polish" 
  // but don't increase the score beyond 100.
  
  return Math.min(score, 100)
}

function uid() { return Math.random().toString(36).slice(2) }

const EMPTY_FORM = {
  name: '', title: '', email: '', phone: '', location: '',
  linkedin_url: '', portfolio_url: '', summary: '',
  experience: [], skills: [], education: [], projects: [],
  certifications: [], languages: [], positioning: '',
  career_goals: { target_roles: '', short_term: '', long_term: '' },
  preferred_template: 'atelier',
  theme_settings: { font_family: 'Inter, sans-serif', accent_color: '#031631', density: 1 }
}

function SectionLabel({ children }) {
  return <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>{children}</h3>
}

function ThemeSettingsEditor({ settings, onChange }) {
  const fonts = [
    { name: 'Inter (Clean)', value: 'Inter, sans-serif' },
    { name: 'Roboto (Modern)', value: 'Roboto, sans-serif' },
    { name: 'Lora (Classic Serif)', value: 'Lora, serif' },
    { name: 'Merriweather (Elegant)', value: 'Merriweather, serif' },
  ]
  const colors = [
    { name: 'Exec Blue', value: '#031631' },
    { name: 'Slate', value: '#475569' },
    { name: 'Emerald', value: '#065f46' },
    { name: 'Deep Plum', value: '#581c87' },
    { name: 'Onyx', value: '#18181b' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <SectionLabel>Typography</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fonts.map(f => (
            <button key={f.value} onClick={() => onChange({ ...settings, font_family: f.value })}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${settings.font_family === f.value ? 'border-[#0e0099] bg-[#f7f7ff]' : 'border-transparent bg-white shadow-sm hover:border-[#c5c6ce]'}`}>
              <div className="text-sm font-bold mb-1" style={{ fontFamily: f.value }}>{f.name}</div>
              <div className="text-[10px] opacity-60 uppercase tracking-widest leading-none">The quick brown fox jumps over the lazy dog</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Accent Color</SectionLabel>
        <div className="flex flex-wrap gap-4">
          {colors.map(c => (
            <button key={c.value} onClick={() => onChange({ ...settings, accent_color: c.value })}
              className={`group relative w-12 h-12 rounded-full transition-all flex items-center justify-center ${settings.accent_color === c.value ? 'ring-4 ring-[#0e0099] ring-offset-2' : 'hover:scale-110'}`}
              style={{ backgroundColor: c.value }}>
              {settings.accent_color === c.value && <span className="material-symbols-outlined text-white text-[20px]">check</span>}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Content Density & Spacing</SectionLabel>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#eceef0]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-[#8293b4]">Compact</span>
            <span className="text-xs font-bold text-[#8293b4]">Standard</span>
            <span className="text-xs font-bold text-[#8293b4]">Airy</span>
          </div>
          <input type="range" min="0.7" max="1.3" step="0.05" value={settings.density} onChange={e => onChange({ ...settings, density: parseFloat(e.target.value) })}
            className="w-full h-2 bg-[#f2f4f6] rounded-lg appearance-none cursor-pointer accent-[#0e0099]" />
          <p className="mt-4 text-[11px] text-[#75777e] leading-relaxed">
            Adjusting density helps fit more content on a single page or adds breathing room for a cleaner look. 
            Currently: <span className="font-bold text-[#031631]">{Math.round(settings.density * 100)}% scale</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#44474d' }}>{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2 transition-all"
      style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }} />
  )
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full px-4 py-3 rounded-xl border-0 text-sm font-medium resize-none focus:outline-none focus:ring-2 transition-all leading-relaxed"
      style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }} />
  )
}

function SkillsInput({ skills, onChange }) {
  const [input, setInput] = useState('')
  function add(raw) {
    const vals = raw.split(',').map(s => s.trim()).filter(Boolean)
    onChange([...new Set([...skills, ...vals])])
    setInput('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map(s => (
          <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: '#e1e0ff', color: '#2f2ebe' }}>
            {s}
            <button onClick={() => onChange(skills.filter(x => x !== s))} className="hover:opacity-60">
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (input.trim()) add(input) } }}
          placeholder="Type a skill and press Enter (or comma-separate multiple)"
          className="flex-1 px-4 py-3 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2 transition-all"
          style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }} />
        <button onClick={() => { if (input.trim()) add(input) }}
          className="px-4 py-3 rounded-xl text-white text-sm font-bold ai-glow-btn flex-shrink-0">Add</button>
      </div>
    </div>
  )
}

function ExperienceEditor({ experience, onChange }) {
  function addExp() { onChange([...experience, { _id: uid(), company: '', role: '', dates: '', bullets: [''] }]) }
  function removeExp(id) { onChange(experience.filter(e => e._id !== id)) }
  function updateExp(id, field, value) { onChange(experience.map(e => e._id === id ? { ...e, [field]: value } : e)) }
  function updateBullet(id, idx, value) {
    onChange(experience.map(e => {
      if (e._id !== id) return e
      const bullets = [...e.bullets]; bullets[idx] = value; return { ...e, bullets }
    }))
  }
  function addBullet(id) { onChange(experience.map(e => e._id === id ? { ...e, bullets: [...e.bullets, ''] } : e)) }
  function removeBullet(id, idx) {
    onChange(experience.map(e => e._id !== id ? e : { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }))
  }

  return (
    <div className="space-y-4">
      {experience.map((exp, expIdx) => (
        <div key={exp._id} className="p-5 rounded-2xl border-l-4"
          style={{ backgroundColor: 'white', borderLeftColor: '#031631', boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8293b4' }}>Position {expIdx + 1}</span>
            <button onClick={() => removeExp(exp._id)} className="p-1.5 rounded-lg hover:bg-[#ffdad6] transition-colors" style={{ color: '#93000a' }}>
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Field label="Job Title"><TextInput value={exp.role} onChange={v => updateExp(exp._id, 'role', v)} placeholder="e.g. Senior Product Designer" /></Field>
            <Field label="Company"><TextInput value={exp.company} onChange={v => updateExp(exp._id, 'company', v)} placeholder="e.g. Stripe" /></Field>
          </div>
          <Field label="Dates"><TextInput value={exp.dates} onChange={v => updateExp(exp._id, 'dates', v)} placeholder="e.g. 2021 – Present" /></Field>
          <div className="mt-3">
            <label className="block text-xs font-semibold mb-2" style={{ color: '#44474d' }}>Bullet Points</label>
            <div className="space-y-2">
              {exp.bullets.map((b, bIdx) => (
                <div key={bIdx} className="flex gap-2 items-start">
                  <span className="mt-3 text-sm flex-shrink-0" style={{ color: '#031631' }}>•</span>
                  <input value={b} onChange={e => updateBullet(exp._id, bIdx, e.target.value)}
                    placeholder="Describe an achievement with measurable impact..."
                    className="flex-1 px-3 py-2.5 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: '#f7f9fb', color: '#031631' }} />
                  <button onClick={() => removeBullet(exp._id, bIdx)}
                    className="mt-2 p-1 rounded-lg hover:bg-[#eceef0] transition-colors flex-shrink-0" style={{ color: '#75777e' }}>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => addBullet(exp._id)} className="mt-2 text-xs font-bold flex items-center gap-1 hover:opacity-70" style={{ color: '#0e0099' }}>
              <span className="material-symbols-outlined text-[14px]">add</span>Add bullet
            </button>
          </div>
        </div>
      ))}
      <button onClick={addExp}
        className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-[#0e0099] hover:text-[#0e0099]"
        style={{ borderColor: '#c5c6ce', color: '#44474d' }}>
        <span className="material-symbols-outlined text-[18px]">add</span>Add Position
      </button>
    </div>
  )
}

function EducationEditor({ education, onChange }) {
  function addEdu() { onChange([...education, { _id: uid(), degree: '', school: '', year: '' }]) }
  function removeEdu(id) { onChange(education.filter(e => e._id !== id)) }
  function updateEdu(id, field, value) { onChange(education.map(e => e._id === id ? { ...e, [field]: value } : e)) }

  return (
    <div className="space-y-3">
      {education.map((edu, i) => (
        <div key={edu._id} className="p-4 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 2px 12px rgba(3,22,49,0.04)' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8293b4' }}>Degree {i + 1}</span>
            <button onClick={() => removeEdu(edu._id)} className="p-1 rounded-lg hover:bg-[#ffdad6] transition-colors" style={{ color: '#93000a' }}>
              <span className="material-symbols-outlined text-[14px]">delete</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2"><TextInput value={edu.degree} onChange={v => updateEdu(edu._id, 'degree', v)} placeholder="e.g. B.S. Computer Science" /></div>
            <TextInput value={edu.year} onChange={v => updateEdu(edu._id, 'year', v)} placeholder="2019" />
            <div className="sm:col-span-3"><TextInput value={edu.school} onChange={v => updateEdu(edu._id, 'school', v)} placeholder="University name" /></div>
          </div>
        </div>
      ))}
      <button onClick={addEdu}
        className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-[#0e0099] hover:text-[#0e0099]"
        style={{ borderColor: '#c5c6ce', color: '#44474d' }}>
        <span className="material-symbols-outlined text-[18px]">add</span>Add Education
      </button>
    </div>
  )
}

function SimpleListEditor({ items, onChange, placeholder }) {
  const [input, setInput] = useState('')
  function add() { if (!input.trim()) return; onChange([...items, input.trim()]); setInput('') }
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: '#f2f4f6', color: '#44474d' }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="hover:opacity-60">
              <span className="material-symbols-outlined text-[12px]">close</span>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-xl border-0 text-sm font-medium focus:outline-none focus:ring-2 transition-all"
          style={{ backgroundColor: 'white', color: '#031631', boxShadow: '0 2px 8px rgba(3,22,49,0.05)' }} />
        <button onClick={add} className="px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:bg-[#eceef0]" style={{ color: '#031631' }}>Add</button>
      </div>
    </div>
  )
}

const NAV_SECTIONS = [
  { id: 'theme', label: 'Theme & Style', icon: 'palette' },
  { id: 'header', label: 'Header', icon: 'person' },
  { id: 'summary', label: 'Summary', icon: 'description' },
  { id: 'experience', label: 'Experience', icon: 'work' },
  { id: 'skills', label: 'Skills', icon: 'psychology' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'additional', label: 'Additional Details', icon: 'extension' },
  { id: 'projects', label: 'Projects', icon: 'rocket_launch' },
  { id: 'positioning', label: 'Positioning', icon: 'adjust' },
  { id: 'goals', label: 'Career Goals', icon: 'flag' },
]

function PrintPortal({ children }) {
  return createPortal(
    <div id="resume-print-target" aria-hidden="true" className="hidden print:block">
      {children}
    </div>,
    document.body
  )
}

const IMPORT_DRAFT_KEY = 'jb_import_draft'

function formFromData(data, userFallback = {}) {
  return {
    name: data.name || userFallback.name || '',
    title: data.title || '',
    email: data.email || userFallback.email || '',
    phone: data.phone || '',
    location: data.location || '',
    linkedin_url: data.linkedin_url || '',
    portfolio_url: data.portfolio_url || '',
    summary: data.summary || '',
    experience: (data.experience || []).map(e => ({ ...e, _id: uid() })),
    skills: data.skills || [],
    education: (data.education || []).map(e => ({ ...e, _id: uid() })),
    projects: (data.projects || []).map(p => ({ ...p, _id: uid() })),
    certifications: data.certifications || [],
    languages: data.languages || [],
    positioning: data.positioning || '',
    career_goals: data.career_goals || { target_roles: '', short_term: '', long_term: '' },
    preferred_template: data.preferred_template || 'atelier',
    theme_settings: data.theme_settings || EMPTY_FORM.theme_settings,
  }
}

export default function ProfileBuilder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile, loading, saving, error: hookError, save } = useMasterProfile()
  const [form, setForm] = useState(EMPTY_FORM)
  const [initialized, setInitialized] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [activeSection, setActiveSection] = useState('header')
  const [importBanner, setImportBanner] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [showCoach, setShowCoach] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiFindings, setAiFindings] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const scrollRef = useRef(null)
  const [zoom, setZoom] = useState(() => {
    const saved = localStorage.getItem('jb_resume_zoom')
    return saved ? parseInt(saved, 10) : 100
  })
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    localStorage.setItem('jb_resume_zoom', zoom.toString())
  }, [zoom])

  const location = useLocation()
  const isDedicatedPreview = useMemo(() => {
    return new URLSearchParams(location.search).get('preview') === 'true'
  }, [location.search])

  const scrollToSection = (id) => {
    setActiveSection(id)
    const el = document.getElementById(`section-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleExportPDF() {
    if (!mappedProfile) return
    const prev = document.title
    document.title = mappedProfile.name
      ? `${mappedProfile.name} — Resume`
      : 'Resume — JobBlitz'
    window.print()
    setTimeout(() => { document.title = prev }, 500)
  }

  // Handle intersection observer to update active section on scroll
  useEffect(() => {
    const options = { 
      root: scrollRef.current,
      threshold: 0.1, 
      rootMargin: '-10% 0px -80% 0px' 
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('section-', '')
          setActiveSection(id)
        }
      })
    }, options)

    NAV_SECTIONS.forEach(s => {
      const el = document.getElementById(`section-${s.id}`)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [initialized])

  // Mapper layer to fix the preview state bug
  // Translates Master Profile schema to the Resume UI schema in real-time
  const mappedProfile = useMemo(() => {
    if (!form) return EMPTY_FORM;
    return {
      ...form,
      contact: [form.email, form.phone, form.location].filter(Boolean).join(' · '),
      linkedin: form.linkedin_url,
      portfolio: form.portfolio_url,
      experience: (form.experience || []).map(exp => ({
        ...exp,
        title: exp.role || 'Job Title', 
      })),
      education: (form.education || []).map(edu => ({
        ...edu,
      })),
      projects: (form.projects || []).map(proj => ({
        ...proj,
      })),
      certifications: form.certifications || [],
      languages: form.languages || []
    };
  }, [form])

  useEffect(() => {
    if (profile && !initialized) {
      setForm(formFromData(profile))
      setInitialized(true)
    }
  }, [profile, initialized])

  useEffect(() => {
    if (!loading && !profile && !initialized) {
      // Check for import draft first
      try {
        const raw = localStorage.getItem(IMPORT_DRAFT_KEY)
        if (raw) {
          const draft = JSON.parse(raw)
          setForm(formFromData(draft, {
            name: user?.user_metadata?.full_name || '',
            email: user?.email || '',
          }))
          localStorage.removeItem(IMPORT_DRAFT_KEY)
          setImportBanner(true)
          setTimeout(() => setImportBanner(false), 6000)
          setInitialized(true)
          return
        }
      } catch { /* ignore parse errors */ }

      setForm(f => ({
        ...f,
        name: f.name || user?.user_metadata?.full_name || '',
        email: f.email || user?.email || '',
      }))
      setInitialized(true)
    }
  }, [loading, profile, initialized, user])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }
  function updateGoals(field, value) { setForm(f => ({ ...f, career_goals: { ...f.career_goals, [field]: value } })) }

  async function handleSave() {
    const payload = {
      ...form,
      experience: form.experience.map(({ _id, ...rest }) => rest),
      education: form.education.map(({ _id, ...rest }) => rest),
      projects: form.projects.map(({ _id, ...rest }) => rest),
      completion_pct: calcCompletion(form),
    }
    try {
      await save(payload)
      setSaveMsg('Profile saved!')
      setLastSaved(new Date())
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Save failed — try again.')
    }
  }

  async function handleDeepDive() {
    setIsAnalyzing(true)
    try {
      // Use mappedProfile for the AI deep dive to ensure contact strings and structured data are clean
      const results = await analyzeMasterProfile(mappedProfile)
      setAiFindings(results)
      setShowCoach(true)
    } catch (err) {
      console.error('Deep dive failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function scrollTo(id) {
    scrollToSection(id)
  }


  const completion = calcCompletion(form)

  if (loading) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: '#f7f9fb' }}>
        <SideNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl" style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }} />
            <p className="text-sm font-semibold" style={{ color: '#44474d' }}>Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      {!isDedicatedPreview && <SideNav />}

      <PrintPortal>
        <ResumeTemplate 
          resume={mappedProfile} 
          settings={form.theme_settings} 
          templateId={form.preferred_template} 
        />
      </PrintPortal>

      <main ref={scrollRef} className={`flex-1 overflow-y-auto custom-scroll flex flex-col items-center ${isDedicatedPreview ? 'bg-white' : ''}`}>
        {/* Import success banner */}
        {importBanner && (
          <div className="w-full px-6 py-3 flex items-center gap-3 text-white"
            style={{ background: 'linear-gradient(90deg, #031631, #0e0099)' }}>
            <span className="material-symbols-outlined icon-filled text-[18px]">check_circle</span>
            <p className="text-sm font-semibold flex-1">
              Resume imported successfully — your profile has been pre-filled. Review and save when ready.
            </p>
            <button onClick={() => setImportBanner(false)} className="opacity-70 hover:opacity-100">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
        {/* Sticky header */}
        {!isDedicatedPreview && (
          <header className="glass-panel border-b border-[#eceef0] sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to bottom, #031631, #0e0099)' }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#0e0099' }}>Master Profile</p>
                    <h2 className="text-sm md:text-base font-black tracking-tight truncate" style={{ fontFamily: 'Manrope', color: '#031631' }}>Career Source of Truth</h2>
                  </div>
                </div>

                {/* Center: Status — hidden on mobile */}
                <div className="hidden md:flex items-center gap-6 px-6 py-2 rounded-2xl bg-[#f8f9fa] border border-[#eceef0]">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#eceef0" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#0e0099" strokeWidth="3"
                          strokeDasharray={87.96} strokeDashoffset={87.96 - (87.96 * completion) / 100}
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                      </svg>
                      <span className="absolute text-[9px] font-black" style={{ color: '#031631' }}>{completion}%</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#031631' }}>
                      {completion < 70 ? 'Building' : completion < 90 ? 'Professional' : 'Elite'}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-[#eceef0]" />
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${completion > 80 ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold" style={{ color: '#031631' }}>{completion > 80 ? 'ATS Ready' : 'Improving'}</span>
                  </div>
                  <div className="w-px h-6 bg-[#eceef0]" />
                  <span className="text-[11px] font-bold" style={{ color: saveMsg?.includes('failed') ? '#93000a' : '#8293b4' }}>
                    {saving ? 'Saving...' : saveMsg || (lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Draft Mode')}
                  </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setShowCoach(!showCoach)}
                    className={`hidden lg:flex p-2.5 rounded-xl transition-all duration-300 items-center gap-2 border ${showCoach ? 'bg-[#f7f7ff] border-[#0e0099]/20 text-[#0e0099]' : 'border-transparent hover:bg-[#f8f9fa] text-[#031631]'}`}>
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    <span className="text-sm font-bold">ATS Coach</span>
                  </button>
                  <button onClick={() => setShowFullPreview(true)}
                    className="hidden sm:flex p-2.5 rounded-xl text-[#031631] hover:bg-[#f8f9fa] transition-all items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                    <span className="text-sm font-bold hidden lg:block">Preview</span>
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-white text-xs md:text-sm font-bold ai-glow-btn flex items-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50">
                    <span className={`material-symbols-outlined text-[16px] md:text-[18px] ${saving ? 'animate-spin' : ''}`}>save</span>
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`w-full max-w-none ${isDedicatedPreview ? 'flex flex-col items-center py-12' : 'grid grid-cols-1 xl:grid-cols-12 gap-10 px-6 md:px-12 py-10 pb-32'}`}>
          {/* Left Column (Navigation + Form) */}
          {!isDedicatedPreview && (
            <div className={`${showPreview ? 'hidden xl:flex' : 'flex'} xl:col-span-7 gap-10`}>
              {/* Left nav */}
              <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 sticky top-[88px] self-start">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eceef0]">
                  <SectionLabel>Builder Sections</SectionLabel>
                  <nav className="space-y-1">
                    {NAV_SECTIONS.map(s => (
                      <button key={s.id} onClick={() => scrollToSection(s.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${activeSection === s.id ? 'bg-[#031631] text-white shadow-lg' : 'text-[#44474d] hover:bg-[#f7f9fb]'}`}>
                        <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                        {s.label}
                      </button>
                    ))}
                  </nav>
                  
                  <div className="mt-8 pt-6 border-t border-[#f2f4f6]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8293b4]">Completion</span>
                      <span className="text-xs font-bold text-[#031631]">{calcCompletion(form)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f2f4f6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0e0099] transition-all duration-500" style={{ width: `${calcCompletion(form)}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#f2f4f6] flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[14px] flex-shrink-0 ${saving ? 'animate-spin' : ''}`}
                      style={{ color: saveMsg?.includes('failed') ? '#93000a' : '#8293b4' }}>
                      {saving ? 'progress_activity' : lastSaved ? 'check_circle' : 'edit'}
                    </span>
                    <span className="text-[11px] font-semibold leading-tight" style={{ color: saveMsg?.includes('failed') ? '#93000a' : '#8293b4' }}>
                      {saving ? 'Saving...' : saveMsg || (lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved changes')}
                    </span>
                  </div>
                </div>
              </aside>

              {/* Form */}
              <div className="flex-1 space-y-8">
                {/* Theme & Style (Always visible at top or separate) */}
                <section id="section-theme" className="p-8 rounded-2xl border-2 border-dashed border-[#e1e0ff] bg-[#fcfcff] scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#0e0099] flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">palette</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#031631]">Theme & Aesthetics</h2>
                      <p className="text-xs text-[#75777e]">Customize your professional look across all templates</p>
                    </div>
                  </div>
                  <ThemeSettingsEditor settings={form.theme_settings} onChange={v => setForm({ ...form, theme_settings: v })} />
                </section>

                {/* Form Sections (Header, Summary, etc.) */}
                <section id="section-header" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Profile Header</SectionLabel>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Full Name"><TextInput value={form.name} onChange={v => update('name', v)} placeholder="John Doe" /></Field>
                      <Field label="Professional Title"><TextInput value={form.title} onChange={v => update('title', v)} placeholder="Software Engineer" /></Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Email Address"><TextInput value={form.email} onChange={v => update('email', v)} placeholder="john@example.com" /></Field>
                      <Field label="Phone Number"><TextInput value={form.phone} onChange={v => update('phone', v)} placeholder="(555) 000-0000" /></Field>
                    </div>
                    <Field label="Location"><TextInput value={form.location} onChange={v => update('location', v)} placeholder="City, State" /></Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="LinkedIn URL"><TextInput value={form.linkedin_url} onChange={v => update('linkedin_url', v)} placeholder="linkedin.com/in/username" /></Field>
                      <Field label="Portfolio / Website"><TextInput value={form.portfolio_url} onChange={v => update('portfolio_url', v)} placeholder="yourportfolio.com" /></Field>
                    </div>
                  </div>
                </section>

                <section id="section-summary" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Professional Summary</SectionLabel>
                  <p className="text-xs mb-3" style={{ color: '#75777e' }}>3–5 sentences. Gives the AI full context about who you are.</p>
                  <TextArea value={form.summary} onChange={v => update('summary', v)}
                    placeholder="Describe your career narrative, core expertise, and what makes you stand out..." rows={5} />
                  <p className="text-xs mt-2 text-right" style={{ color: '#c5c6ce' }}>{form.summary.length} characters</p>
                </section>

                <section id="section-experience" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Work Experience</SectionLabel>
                  <ExperienceEditor experience={form.experience} onChange={v => update('experience', v)} />
                </section>

                <section id="section-skills" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Skills</SectionLabel>
                  <p className="text-xs mb-3" style={{ color: '#75777e' }}>The AI uses these for match scoring and ATS optimization.</p>
                  <SkillsInput skills={form.skills} onChange={v => update('skills', v)} />
                </section>

                <section id="section-education" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Education</SectionLabel>
                  <EducationEditor education={form.education} onChange={v => update('education', v)} />
                </section>

                <section id="section-additional" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Additional Details</SectionLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Certifications"><SimpleListEditor items={form.certifications} onChange={v => update('certifications', v)} placeholder="e.g. AWS Solutions Architect" /></Field>
                    <Field label="Languages"><SimpleListEditor items={form.languages} onChange={v => update('languages', v)} placeholder="e.g. Spanish (Fluent)" /></Field>
                  </div>
                </section>

                <section id="section-projects" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Projects</SectionLabel>
                  <div className="space-y-4">
                    {form.projects.map((proj, i) => (
                      <div key={proj._id} className="p-4 rounded-2xl" style={{ backgroundColor: '#f7f9fb' }}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8293b4' }}>Project {i + 1}</span>
                          <button onClick={() => update('projects', form.projects.filter((_, j) => j !== i))}
                            className="p-1 rounded-lg hover:bg-[#ffdad6]" style={{ color: '#93000a' }}>
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                        <div className="space-y-2">
                          <TextInput value={proj.title}
                            onChange={v => update('projects', form.projects.map((p, j) => j === i ? { ...p, title: v } : p))}
                            placeholder="Project name" />
                          <TextArea value={proj.description}
                            onChange={v => update('projects', form.projects.map((p, j) => j === i ? { ...p, description: v } : p))}
                            placeholder="What you built and its impact..." rows={3} />
                        </div>
                      </div>
                    ))}
                    <button onClick={() => update('projects', [...form.projects, { _id: uid(), title: '', description: '', tags: [] }])}
                      className="w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold flex items-center justify-center gap-2 transition-all hover:border-[#0e0099] hover:text-[#0e0099]"
                      style={{ borderColor: '#c5c6ce', color: '#44474d' }}>
                      <span className="material-symbols-outlined text-[18px]">add</span>Add Project
                    </button>
                  </div>
                </section>

                <section id="section-positioning" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Personal Positioning</SectionLabel>
                  <p className="text-xs mb-3" style={{ color: '#75777e' }}>What's your unique professional angle? What type of work energizes you?</p>
                  <TextArea value={form.positioning} onChange={v => update('positioning', v)}
                    placeholder="e.g. I thrive in early-stage B2B SaaS companies where I can own product direction from 0 to 1..." rows={4} />
                </section>

                <section id="section-goals" className="p-6 rounded-2xl scroll-mt-24" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
                  <SectionLabel>Career Goals</SectionLabel>
                  <div className="space-y-4">
                    <Field label="Target Roles (comma-separated)">
                      <TextInput
                        value={typeof form.career_goals.target_roles === 'string'
                          ? form.career_goals.target_roles
                          : (form.career_goals.target_roles || []).join(', ')}
                        onChange={v => updateGoals('target_roles', v)}
                        placeholder="e.g. Head of Product, Principal Designer, VP Engineering" />
                    </Field>
                    <Field label="Short-term Goal (1–2 years)">
                      <TextArea value={form.career_goals.short_term} onChange={v => updateGoals('short_term', v)}
                        placeholder="What do you want to achieve in the next 1–2 years?" rows={3} />
                    </Field>
                    <Field label="Long-term Vision (3–5 years)">
                      <TextArea value={form.career_goals.long_term} onChange={v => updateGoals('long_term', v)}
                        placeholder="Where do you see yourself in 3–5 years?" rows={3} />
                    </Field>
                  </div>
                </section>

                <div className="flex items-center justify-between pt-4">
                  <button onClick={() => navigate('/app/dashboard')}
                    className="px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all hover:bg-[#eceef0]" style={{ color: '#031631' }}>
                    ← Dashboard
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowCoach(!showCoach)}
                      className={`px-4 py-2.5 rounded-xl border font-semibold transition-all flex items-center gap-2 ${showCoach ? 'bg-[#031631] text-white border-[#031631]' : 'bg-white text-[#031631] border-[#c5c6ce] hover:border-[#031631]'}`}>
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                      {showCoach ? 'Close Coach' : 'ATS Coach'}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="px-8 py-3 text-white font-bold rounded-xl shadow-xl active:scale-95 transition-all ai-glow-btn flex items-center gap-2 disabled:opacity-60">
                      <span className={`material-symbols-outlined icon-filled text-[16px] ${saving ? 'animate-spin' : ''}`}>
                        {saving ? 'progress_activity' : 'save'}
                      </span>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right Column (Live Preview) */}
          <div className={`${(!showPreview && !isDedicatedPreview) ? 'hidden xl:flex' : 'flex'} ${isDedicatedPreview ? 'w-full max-w-4xl' : 'xl:col-span-5 flex-col sticky top-[88px] self-start h-[calc(100vh-120px)]'}`}>
          <div className={`glass-panel rounded-2xl border flex flex-col overflow-hidden ${isDedicatedPreview ? 'shadow-2xl' : 'h-full bg-white/50 backdrop-blur-sm'}`}
            style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
            
            {/* Preview Toolbar */}
            {!isDedicatedPreview && (
              <div className="px-4 py-3 border-b bg-white flex flex-col gap-3" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
                {/* Row 1: Title and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#031631]">visibility</span>
                    <span className="text-sm font-bold" style={{ color: '#031631' }}>Live Preview</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={handleSave} disabled={saving} className="p-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#2e7d32] transition-colors" title="Save Profile">
                      <span className={`material-symbols-outlined text-[18px] ${saving ? 'animate-spin' : 'icon-filled'}`}>
                        {saving ? 'progress_activity' : 'save'}
                      </span>
                    </button>
                    <button onClick={() => setShowFullPreview(true)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#44474d] transition-colors" title="View full page preview">

                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                      <span className="text-xs font-semibold hidden 2xl:block">Full Page</span>
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#44474d] transition-colors" title="Print resume">
                      <span className="material-symbols-outlined text-[16px]">print</span>
                      <span className="text-xs font-semibold hidden 2xl:block">Print</span>
                    </button>
                    <button onClick={handleExportPDF} 
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#44474d] transition-colors" title="Download as PDF">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span className="text-xs font-semibold hidden 2xl:block">Download PDF</span>
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1 hidden 2xl:block" />
                    <button onClick={() => setShowCoach(!showCoach)} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${showCoach ? 'bg-[#e1e0ff] text-[#2f2ebe]' : 'hover:bg-[#f2f4f6] text-[#44474d]'}`}
                      title="Toggle ATS Coach">
                      <span className="material-symbols-outlined text-[18px]">psychology</span>
                      <span className="text-xs font-bold hidden 2xl:block">ATS Coach</span>
                    </button>
                  </div>

                </div>
                
                {/* Row 2: Controls */}
                <div className="flex items-center justify-between">
                  {/* Template Switcher */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#f2f4f6] rounded-lg">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => update('preferred_template', t.id)}
                        className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
                        style={{ 
                          backgroundColor: form.preferred_template === t.id ? '#031631' : 'transparent',
                          color: form.preferred_template === t.id ? 'white' : '#8293b4'
                        }}>
                        {t.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  
                  {/* Inline Formatting & Zoom Controls */}
                  <div className="flex items-center gap-2">
                    {/* Font Scale (Stub) */}
                    <div className="flex items-center bg-[#f2f4f6] rounded-lg p-1 opacity-50 cursor-not-allowed" title="Font Scale (Coming Soon)">
                      <button className="p-1 rounded text-[#8293b4] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[14px]">text_decrease</span>
                      </button>
                      <button className="p-1 rounded text-[#8293b4] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">text_increase</span>
                      </button>
                    </div>
                    
                    {/* Spacing (Stub) */}
                    <div className="flex items-center bg-[#f2f4f6] rounded-lg p-1 opacity-50 cursor-not-allowed" title="Spacing (Coming Soon)">
                      <button className="p-1 rounded text-[#8293b4] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px]">format_line_spacing</span>
                      </button>
                    </div>

                    {/* Zoom */}
                    <div className="flex items-center gap-1 bg-[#f2f4f6] rounded-lg p-1">
                      <button onClick={() => setZoom(z => Math.max(z - 10, 30))} className="p-1 rounded text-[#8293b4] hover:text-[#031631] hover:bg-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="text-[10px] font-bold w-8 text-center" style={{ color: '#031631' }}>{zoom}%</span>
                      <button onClick={() => setZoom(z => Math.min(z + 10, 100))} className="p-1 rounded text-[#8293b4] hover:text-[#031631] hover:bg-white transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex overflow-hidden">
              <div className={`flex-1 overflow-auto custom-scroll flex justify-center items-start ${isDedicatedPreview ? 'dot-grid-preview p-0 pt-12 pb-32' : 'dot-grid p-6'}`}>
                <div 
                  className={isDedicatedPreview ? 'scale-100' : ''}
                  style={!isDedicatedPreview ? { transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' } : { flexShrink: 0, width: '816px' }}>
                  <div className="paper-shadow">
                    <ResumeTemplate 
                      resume={mappedProfile} 
                      settings={form.theme_settings} 
                      templateId={form.preferred_template} 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dedicated Preview Floating Bar */}
            {isDedicatedPreview && (
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/90 backdrop-blur shadow-2xl rounded-2xl border" style={{ borderColor: 'rgba(3,22,49,0.1)' }}>
                <button onClick={() => window.close()} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#f2f4f6] text-sm font-bold transition-all" style={{ color: '#031631' }}>
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  Close Preview
                </button>
                <div className="w-px h-6 bg-[#eceef0]" />
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl ai-glow-btn text-white text-sm font-bold shadow-lg transition-all active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download PDF
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Edit/Preview Toggle Bar — hidden on xl where both panes are visible */}
      {!isDedicatedPreview && (
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
          style={{
            backgroundColor: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(197,198,206,0.3)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}>
          <div className="px-4 py-2 flex gap-2">
            <button onClick={() => setShowPreview(false)}
              className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: !showPreview ? '#031631' : '#f2f4f6',
                color: !showPreview ? 'white' : '#44474d',
              }}>
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
            <button onClick={() => setShowPreview(true)}
              className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: showPreview ? '#031631' : '#f2f4f6',
                color: showPreview ? 'white' : '#44474d',
              }}>
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              Preview
            </button>
            <button onClick={() => setShowFullPreview(true)}
              className="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border"
              style={{ borderColor: 'rgba(197,198,206,0.3)', color: '#031631', backgroundColor: 'white' }}>
              <span className="material-symbols-outlined text-[16px]">fullscreen</span>
            </button>
          </div>
        </div>
      )}

      {/* ATS Coach Sliding Panel */}
      {showCoach && !isDedicatedPreview && (
        <div className="coach-panel animate-slide-in rounded-l-3xl shadow-2xl" 
          style={{ top: '80px', height: 'calc(100vh - 80px)', border: '1px solid rgba(197,198,206,0.2)' }}>
          <ATSCoach 
            profile={mappedProfile} 
            aiFindings={aiFindings}
            isAnalyzing={isAnalyzing}
            onDeepDive={handleDeepDive}
            onClose={() => setShowCoach(false)}
          />
        </div>
      )}

      {/* Full-Page Modal Preview */}
      {showFullPreview && (
        <div className="modal-overlay" onClick={() => setShowFullPreview(false)}>
          <div className="relative w-full max-w-5xl h-[95vh] flex flex-col bg-[#f2f4f6] rounded-3xl overflow-hidden shadow-2xl animate-slide-up" 
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#031631]">Full Screen Preview</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#031631] text-white">ATS SAFE</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1 bg-[#f2f4f6] rounded-lg border">
                  <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1 hover:text-[#0e0099] transition-colors"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                  <span className="text-xs font-bold w-10 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1 hover:text-[#0e0099] transition-colors"><span className="material-symbols-outlined text-[18px]">add</span></button>
                </div>
                <button onClick={handleExportPDF} className="px-4 py-2 bg-[#031631] text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#0e0099] transition-colors">
                  <span className="material-symbols-outlined text-[16px]">print</span> Print/Export
                </button>
                <div className="w-[1px] h-6 bg-[#c5c6ce]" />
                <button onClick={() => setShowFullPreview(false)} className="p-2 hover:bg-[#f2f4f6] rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[#8293b4]">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-12 dot-grid-preview flex justify-center custom-scrollbar">
              <div className="paper-shadow origin-top transition-all duration-300" style={{ transform: `scale(${zoom / 100})` }}>
                <ResumeTemplate 
                  resume={mappedProfile} 
                  settings={form.theme_settings} 
                  templateId={form.preferred_template} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
