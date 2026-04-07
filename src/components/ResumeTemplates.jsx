import React from 'react'

export const templates = [
  { id: 'atelier', label: 'The Atelier' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'impact', label: 'Impact' },
]

export function AtelierTemplate({ resume, settings = {} }) {
  if (!resume) return null
  const { font_family = 'Inter, sans-serif', accent_color = '#031631', density = 1 } = settings
  
  const baseSpacing = (val) => `${val * density}px`

  return (
    <div className="bg-white text-left" style={{ width: '816px', minHeight: '1056px', padding: '56px 64px', fontFamily: font_family }}>
      <div className="pb-8 mb-8" style={{ borderBottom: `3px solid ${accent_color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, color: accent_color, letterSpacing: '-0.02em', marginBottom: '4px' }}>{resume.name || 'Your Name'}</h1>
            <p style={{ fontSize: '14px', color: '#0e0099', fontWeight: 600, marginBottom: '10px' }}>{resume.title || 'Job Title'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: '11px', color: '#44474d' }}>
              <span>{resume.contact || 'Email · Phone · Location'}</span>
              {resume.linkedin && (
                <a href={resume.linkedin.startsWith('http') ? resume.linkedin : `https://${resume.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0e0099', fontWeight: 600, textDecoration: 'none' }}>· LinkedIn</a>
              )}
              {resume.portfolio && (
                <a href={resume.portfolio.startsWith('http') ? resume.portfolio : `https://${resume.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0e0099', fontWeight: 600, textDecoration: 'none' }}>· Portfolio</a>
              )}
            </div>
          </div>
          {resume.resume_photo_enabled && resume.avatar_url && (
            <div style={{ width: '80px', hieght: '80px', borderRadius: '12px', overflow: 'hidden', border: `1px solid #eceef0`, flexShrink: 0 }}>
              <img src={resume.avatar_url} alt="" style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      {(resume.summary || !resume.id) && (
        <div className="resume-section resume-item" style={{ marginBottom: baseSpacing(32) }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Professional Summary</h2>
          <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.8' }}>{resume.summary || 'A brief professional summary about yourself...'}</p>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '12px' }}>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(20) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '13px', fontWeight: 700, color: '#031631' }}>{exp.title}</strong>
                <span style={{ fontSize: '11px', color: '#44474d', fontWeight: 500 }}>{exp.dates}</span>
              </div>
              <p style={{ fontSize: '11px', color: '#0e0099', fontWeight: 600, marginBottom: '8px', marginTop: '2px' }}>{exp.company}</p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {exp.bullets?.map((b, j) => (
                  <li key={j} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '11px', color: accent_color, marginTop: '2px', flexShrink: 0 }}>•</span>
                    <span style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.7' }}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {resume.projects?.length > 0 && (
        <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '12px' }}>Projects</h2>
          {resume.projects.map((proj, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(16) }}>
              <strong style={{ fontSize: '13px', fontWeight: 700, color: '#031631' }}>{proj.title}</strong>
              <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.7', marginTop: '4px' }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      {resume.skills?.length > 0 && (
        <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Skills</h2>
          <div className="resume-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resume.skills.map(s => (
              <span key={s} style={{ fontSize: '11px', backgroundColor: '#f2f4f6', color: '#031631', padding: '4px 10px', borderRadius: '4px', fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px' }}>
        {resume.education?.length > 0 && (
          <div className="resume-section">
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Education</h2>
            {resume.education.map((edu, i) => (
              <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(8) }}>
                <strong style={{ fontSize: '13px', fontWeight: 700, color: '#031631' }}>{edu.degree}</strong>
                <p style={{ fontSize: '12px', color: '#44474d' }}>{edu.school}</p>
              </div>
            ))}
          </div>
        )}
        {(resume.certifications?.length > 0 || resume.languages?.length > 0) && (
          <div className="resume-section">
            {resume.certifications?.length > 0 && (
              <div style={{ marginBottom: baseSpacing(20) }}>
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Certifications</h2>
                <ul className="resume-item" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {resume.certifications.map((cert, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#44474d', marginBottom: '4px' }}>• {cert}</li>
                  ))}
                </ul>
              </div>
            )}
            {resume.languages?.length > 0 && (
              <div>
                <h2 style={{ fontSize: '13px', fontWeight: 700, color: accent_color, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Languages</h2>
                <div className="resume-item" style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.6' }}>
                  {resume.languages.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function MinimalTemplate({ resume, settings = {} }) {
  if (!resume) return null
  const { font_family = 'Inter, sans-serif', accent_color = '#000', density = 1 } = settings
  
  const baseSpacing = (val) => `${val * density}px`

  return (
    <div className="bg-white text-left" style={{ width: '816px', minHeight: '1056px', padding: '64px 72px', fontFamily: font_family }}>
      <div style={{ marginBottom: baseSpacing(40) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: accent_color, letterSpacing: '-0.01em', marginBottom: '8px' }}>{resume.name || 'Your Name'}</h1>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px' }}>{resume.title || 'Job Title'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: '11px', color: '#888' }}>
              <span>{resume.contact || 'Email · Phone · Location'}</span>
              {resume.linkedin && (
                <a href={resume.linkedin.startsWith('http') ? resume.linkedin : `https://${resume.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: accent_color, fontWeight: 600, textDecoration: 'none' }}>· LinkedIn</a>
              )}
              {resume.portfolio && (
                <a href={resume.portfolio.startsWith('http') ? resume.portfolio : `https://${resume.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: accent_color, fontWeight: 600, textDecoration: 'none' }}>· Portfolio</a>
              )}
            </div>
          </div>
          {resume.resume_photo_enabled && resume.avatar_url && (
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: `1px solid #ccc`, flexShrink: 0 }}>
              <img src={resume.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>

      {(resume.summary || !resume.id) && (
        <div className="resume-section resume-item" style={{ marginBottom: baseSpacing(32) }}>
          <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.9', borderLeft: `2px solid ${accent_color}`, paddingLeft: '16px' }}>{resume.summary || 'A brief professional summary about yourself...'}</p>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '16px' }}>Experience</p>
          {resume.experience.map((exp, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(24) }}>
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
        <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Skills</p>
          <p className="resume-item" style={{ fontSize: '12px', color: '#444', lineHeight: '1.8' }}>{resume.skills.join(' · ')}</p>
        </div>
      )}

      {resume.projects?.length > 0 && (
        <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '16px' }}>Projects</p>
          {resume.projects.map((proj, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(16) }}>
              <strong style={{ fontSize: '13px', fontWeight: 600, color: '#000', display: 'block', marginBottom: '2px' }}>{proj.title}</strong>
              <p style={{ fontSize: '11px', color: '#444', lineHeight: '1.7' }}>{proj.description}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {resume.education?.length > 0 && (
          <div className="resume-section">
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Education</p>
            {resume.education.map((edu, i) => (
              <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(8) }}>
                <strong style={{ fontSize: '12px', color: '#000' }}>{edu.degree}</strong>
                <p style={{ fontSize: '11px', color: '#666' }}>{edu.school}</p>
              </div>
            ))}
          </div>
        )}
        {(resume.certifications?.length > 0 || resume.languages?.length > 0) && (
          <div className="resume-section">
            {resume.certifications?.length > 0 && (
              <div style={{ marginBottom: baseSpacing(20) }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Certifications</p>
                <p className="resume-item" style={{ fontSize: '11px', color: '#444', lineHeight: '1.6' }}>{resume.certifications.join(', ')}</p>
              </div>
            )}
            {resume.languages?.length > 0 && (
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Languages</p>
                <p className="resume-item" style={{ fontSize: '11px', color: '#444', lineHeight: '1.6' }}>{resume.languages.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ImpactTemplate({ resume, settings = {} }) {
  if (!resume) return null
  const { font_family = 'Inter, sans-serif', accent_color = '#031631', density = 1 } = settings
  
  const baseSpacing = (val) => `${val * density}px`

  return (
    <div className="bg-white text-left" style={{ width: '816px', minHeight: '1056px', fontFamily: font_family }}>
      <div style={{ backgroundColor: accent_color, padding: '48px 56px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>{resume.name || 'Your Name'}</h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '16px' }}>{resume.title || 'Job Title'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
              <span>{resume.contact || 'Email · Phone · Location'}</span>
              {resume.linkedin && (
                <a href={resume.linkedin.startsWith('http') ? resume.linkedin : `https://${resume.linkedin}`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>· LinkedIn</a>
              )}
              {resume.portfolio && (
                <a href={resume.portfolio.startsWith('http') ? resume.portfolio : `https://${resume.portfolio}`} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontWeight: 600, textDecoration: 'none' }}>· Portfolio</a>
              )}
            </div>
          </div>
          {resume.resume_photo_enabled && resume.avatar_url && (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `3px solid rgba(255,255,255,0.2)`, flexShrink: 0 }}>
              <img src={resume.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        {(resume.summary || !resume.id) && (
          <div className="resume-section resume-item" style={{ marginBottom: baseSpacing(32), padding: '20px', backgroundColor: '#f7f9fb', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.9' }}>{resume.summary || 'A brief professional summary about yourself...'}</p>
          </div>
        )}
        {resume.experience?.length > 0 && (
          <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
            <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent_color, marginBottom: '16px' }}>Experience</h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(24), paddingLeft: '16px', borderLeft: `3px solid ${accent_color}` }}>
                <strong style={{ fontSize: '13px', fontWeight: 700, color: '#031631', display: 'block' }}>{exp.title}</strong>
                <p style={{ fontSize: '11px', color: accent_color, fontWeight: 600, marginBottom: '8px', marginTop: '2px' }}>{exp.company}{exp.dates ? ` · ${exp.dates}` : ''}</p>
                {exp.bullets?.map((b, j) => (
                  <p key={j} style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.7', marginBottom: '4px' }}>• {b}</p>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '32px', marginBottom: baseSpacing(32) }}>
          {resume.skills?.length > 0 && (
            <div className="resume-section">
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent_color, marginBottom: '12px' }}>Skills</h2>
              <div className="resume-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resume.skills.map(s => (
                  <span key={s} style={{ fontSize: '10px', backgroundColor: '#e1e0ff', color: '#2f2ebe', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {resume.education?.length > 0 && (
            <div className="resume-section">
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent_color, marginBottom: '12px' }}>Education</h2>
              {resume.education.map((edu, i) => (
                <div key={i} className="resume-item">
                  <strong style={{ fontSize: '12px', color: '#031631' }}>{edu.degree}</strong>
                  <p style={{ fontSize: '11px', color: '#44474d' }}>{edu.school}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {resume.projects?.length > 0 && (
          <div className="resume-section" style={{ marginBottom: baseSpacing(32) }}>
            <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent_color, marginBottom: '16px' }}>Projects</h2>
            {resume.projects.map((proj, i) => (
              <div key={i} className="resume-item" style={{ marginBottom: baseSpacing(16) }}>
                <strong style={{ fontSize: '13px', fontWeight: 700, color: '#031631', display: 'block' }}>{proj.title}</strong>
                <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.7', marginTop: '4px' }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {(resume.certifications?.length > 0 || resume.languages?.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {resume.certifications?.length > 0 && (
              <div className="resume-section">
                <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent_color, marginBottom: '12px' }}>Certifications</h2>
                <div className="resume-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {resume.certifications.map((cert, i) => (
                    <span key={i} style={{ fontSize: '11px', color: '#44474d' }}>• {cert}</span>
                  ))}
                </div>
              </div>
            )}
            {resume.languages?.length > 0 && (
              <div className="resume-section">
                <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent_color, marginBottom: '12px' }}>Languages</h2>
                <p className="resume-item" style={{ fontSize: '11px', color: '#44474d', lineHeight: '1.6' }}>{resume.languages.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ResumeTemplate({ resume, settings = {}, templateId = 'atelier' }) {
  if (!resume) return null
  
  const selectedTemplate = templateId || resume.templateId || 'atelier'
  
  switch (selectedTemplate) {
    case 'minimal':
      return <MinimalTemplate resume={resume} settings={settings} />
    case 'impact':
      return <ImpactTemplate resume={resume} settings={settings} />
    case 'atelier':
    default:
      return <AtelierTemplate resume={resume} settings={settings} />
  }
}
