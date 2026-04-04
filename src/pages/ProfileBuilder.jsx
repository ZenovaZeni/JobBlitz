import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { useMasterProfile } from '../hooks/useMasterProfile'
import { templates, AtelierTemplate, MinimalTemplate, ImpactTemplate } from '../components/ResumeTemplates'

function calcCompletion(f) {
  let score = 0
  if (f.name?.trim()) score += 10
  if (f.title?.trim()) score += 5
  if (f.summary?.trim()) score += 15
  if (f.experience?.length > 0) score += 25
  if (f.skills?.length >= 3) score += 15
  if (f.education?.length > 0) score += 10
  if (f.email?.trim() || f.phone?.trim()) score += 5
  if (f.location?.trim()) score += 5
  if (f.linkedin_url?.trim() || f.portfolio_url?.trim()) score += 5
  if (f.projects?.length > 0) score += 5
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
}

function SectionLabel({ children }) {
  return <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#8293b4' }}>{children}</h3>
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
  { id: 'header', label: 'Profile Header', icon: 'account_circle' },
  { id: 'summary', label: 'Summary', icon: 'description' },
  { id: 'experience', label: 'Experience', icon: 'work_history' },
  { id: 'skills', label: 'Skills', icon: 'bolt' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'projects', label: 'Projects', icon: 'rocket_launch' },
  { id: 'positioning', label: 'Positioning', icon: 'record_voice_over' },
  { id: 'goals', label: 'Goals', icon: 'north_star' },
]

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
  const [showPreview, setShowPreview] = useState(false)
  const [zoom, setZoom] = useState(60)

  const activeTemplate = form.preferred_template || 'atelier'
  const ResumeTemplate = activeTemplate === 'atelier'
    ? AtelierTemplate
    : activeTemplate === 'minimal'
      ? MinimalTemplate
      : ImpactTemplate

  // Mapper layer to fix the preview state bug
  // Translates Master Profile schema to the Resume UI schema in real-time
  const mappedProfile = {
    ...form,
    contact: [form.email, form.phone, form.location].filter(Boolean).join(' · '),
    experience: (form.experience || []).map(exp => ({
      ...exp,
      title: exp.role || 'Job Title', // Templates expect 'title' within experience objects
    })),
    education: (form.education || []).map(edu => ({
      ...edu,
      // Other fields remain consistent
    }))
  }

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
      setTimeout(() => setSaveMsg(''), 3000)
    } catch {
      setSaveMsg('Save failed — try again.')
    }
  }

  function scrollTo(id) {
    setActiveSection(id)
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    <div className="flex min-h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <main className="flex-1 overflow-y-auto custom-scroll flex flex-col items-center">
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
        <header className="w-full sticky top-0 z-50 glass-panel border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
          <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #031631, #0e0099)' }} />
              <div>
                <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>Master Profile</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1.5 w-24 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${completion}%`, background: 'linear-gradient(90deg, #031631, #0e0099)' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#0e0099' }}>{completion}% complete</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(saveMsg || hookError) && (
                <span className="text-xs font-bold hidden xl:block"
                  style={{ color: saveMsg?.includes('failed') || hookError ? '#93000a' : '#2e7d32' }}>
                  {saveMsg || hookError}
                </span>
              )}
              <button onClick={() => setShowPreview(!showPreview)}
                className="xl:hidden p-2.5 rounded-xl border flex items-center justify-center transition-all bg-white"
                style={{ borderColor: 'rgba(197,198,206,0.2)', color: '#031631' }}>
                <span className="material-symbols-outlined text-[20px]">{showPreview ? 'edit_note' : 'visibility'}</span>
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-xl active:scale-95 transition-all ai-glow-btn flex items-center gap-2 disabled:opacity-60">
                <span className={`material-symbols-outlined icon-filled text-[16px] ${saving ? 'animate-spin' : ''}`}>
                  {saving ? 'progress_activity' : 'save'}
                </span>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </header>

        <div className="w-full max-w-[1800px] grid grid-cols-1 xl:grid-cols-12 gap-10 px-6 md:px-12 py-10 pb-32">
          {/* Left Column (Navigation + Form) */}
          <div className={`${showPreview ? 'hidden xl:flex' : 'flex'} xl:col-span-8 gap-10`}>
            {/* Left nav */}
            <aside className="hidden lg:flex flex-col w-48 flex-shrink-0 sticky top-24 self-start">
            <nav className="space-y-1">
              {NAV_SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                  style={{ backgroundColor: activeSection === s.id ? '#031631' : 'transparent', color: activeSection === s.id ? 'white' : '#44474d' }}>
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Form */}
          <div className="flex-1 space-y-8">

            <section id="section-header" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
              <SectionLabel>Profile Header</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name"><TextInput value={form.name} onChange={v => update('name', v)} placeholder="Your full name" /></Field>
                <Field label="Current Title"><TextInput value={form.title} onChange={v => update('title', v)} placeholder="e.g. Senior Product Designer" /></Field>
                <Field label="Email"><TextInput value={form.email} onChange={v => update('email', v)} placeholder="you@example.com" type="email" /></Field>
                <Field label="Phone"><TextInput value={form.phone} onChange={v => update('phone', v)} placeholder="+1 (555) 000-0000" type="tel" /></Field>
                <Field label="Location"><TextInput value={form.location} onChange={v => update('location', v)} placeholder="City, State" /></Field>
                <Field label="LinkedIn URL"><TextInput value={form.linkedin_url} onChange={v => update('linkedin_url', v)} placeholder="linkedin.com/in/yourname" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Portfolio / Website"><TextInput value={form.portfolio_url} onChange={v => update('portfolio_url', v)} placeholder="yourportfolio.com" /></Field>
                </div>
              </div>
            </section>

            <section id="section-summary" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
              <SectionLabel>Professional Summary</SectionLabel>
              <p className="text-xs mb-3" style={{ color: '#75777e' }}>3–5 sentences. Gives the AI full context about who you are.</p>
              <TextArea value={form.summary} onChange={v => update('summary', v)}
                placeholder="Describe your career narrative, core expertise, and what makes you stand out..." rows={5} />
              <p className="text-xs mt-2 text-right" style={{ color: '#c5c6ce' }}>{form.summary.length} characters</p>
            </section>

            <section id="section-experience" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
              <SectionLabel>Work Experience</SectionLabel>
              <ExperienceEditor experience={form.experience} onChange={v => update('experience', v)} />
            </section>

            <section id="section-skills" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
              <SectionLabel>Skills</SectionLabel>
              <p className="text-xs mb-3" style={{ color: '#75777e' }}>The AI uses these for match scoring and ATS optimization.</p>
              <SkillsInput skills={form.skills} onChange={v => update('skills', v)} />
            </section>

            <section id="section-education" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
              <SectionLabel>Education & Certifications</SectionLabel>
              <EducationEditor education={form.education} onChange={v => update('education', v)} />
              <div className="mt-6">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#44474d' }}>Certifications</label>
                <SimpleListEditor items={form.certifications} onChange={v => update('certifications', v)}
                  placeholder="e.g. AWS Solutions Architect, PMP" />
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#44474d' }}>Languages</label>
                <SimpleListEditor items={form.languages} onChange={v => update('languages', v)}
                  placeholder="e.g. English (native), Spanish (conversational)" />
              </div>
            </section>

            <section id="section-projects" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
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

            <section id="section-positioning" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
              <SectionLabel>Personal Positioning</SectionLabel>
              <p className="text-xs mb-3" style={{ color: '#75777e' }}>What's your unique professional angle? What type of work energizes you?</p>
              <TextArea value={form.positioning} onChange={v => update('positioning', v)}
                placeholder="e.g. I thrive in early-stage B2B SaaS companies where I can own product direction from 0 to 1..." rows={4} />
            </section>

            <section id="section-goals" className="p-6 rounded-2xl" style={{ backgroundColor: 'white', boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
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

          {/* Right Column (Live Preview) */}
          <div className={`${!showPreview ? 'hidden xl:flex' : 'flex'} xl:col-span-4 flex-col sticky top-24 self-start h-[calc(100vh-120px)]`}>
          <div className="glass-panel rounded-2xl border h-full flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm"
            style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
            
            {/* Preview Toolbar */}
            <div className="px-5 py-4 border-b flex items-center justify-between bg-white" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#031631]">visibility</span>
                <span className="text-sm font-bold" style={{ color: '#031631' }}>Live Preview</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[#f2f4f6] rounded-lg">
                {templates.map(t => (
                  <button key={t.id} onClick={() => update('preferred_template', t.id)}
                    className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all"
                    style={{ 
                      backgroundColor: activeTemplate === t.id ? '#031631' : 'transparent',
                      color: activeTemplate === t.id ? 'white' : '#8293b4'
                    }}>
                    {t.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Stage */}
            <div className="flex-1 overflow-auto custom-scroll dot-grid p-6 flex justify-center items-start origin-top bg-[#f2f4f6]">
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }}>
                <div className="paper-shadow">
                  <ResumeTemplate resume={mappedProfile} />
                </div>
              </div>
            </div>

            {/* Footer zoom controls */}
            <div className="px-5 py-3 border-t bg-white flex items-center justify-center gap-4" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
              <button onClick={() => setZoom(z => Math.max(z - 10, 30))} className="text-[#8293b4] hover:text-[#031631]">
                <span className="material-symbols-outlined text-[20px]">remove</span>
              </button>
              <span className="text-xs font-bold w-12 text-center" style={{ color: '#031631' }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 100))} className="text-[#8293b4] hover:text-[#031631]">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
