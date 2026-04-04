import React from 'react'

export const templates = [
  { id: 'atelier', label: 'The Atelier' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'impact', label: 'Impact' },
]

export function AtelierTemplate({ resume }) {
  if (!resume) return null
  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1122px', padding: '56px 64px', textAlign: 'left' }}>
      <div className="pb-8 mb-8" style={{ borderBottom: '3px solid #031631' }}>
        <h1 style={{ fontFamily: 'Manrope', fontSize: '32px', fontWeight: 800, color: '#031631', letterSpacing: '-0.02em' }}>{resume.name || 'Your Name'}</h1>
        <p style={{ fontSize: '14px', color: '#0e0099', fontWeight: 600, marginBottom: '8px' }}>{resume.title || 'Job Title'}</p>
        <p style={{ fontSize: '11px', color: '#44474d' }}>{resume.contact || 'Email · Phone · Location'}</p>
      </div>
      {(resume.summary || !resume.id) && (
        <div className="mb-8">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Professional Summary</h2>
          <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.8' }}>{resume.summary || 'A brief professional summary about yourself...'}</p>
        </div>
      )}
      {resume.experience?.length > 0 && (
        <div className="mb-8 resume-section">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '12px' }}>Experience</h2>
          {resume.experience.map((exp, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: '20px' }}>
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
        <div className="mb-8 resume-section">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Skills</h2>
          <div className="resume-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resume.skills.map(s => (
              <span key={s} style={{ fontSize: '11px', backgroundColor: '#f2f4f6', color: '#031631', padding: '4px 10px', borderRadius: '4px', fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
      {resume.education?.length > 0 && (
        <div className="resume-section">
          <h2 style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid #eceef0', paddingBottom: '6px', marginBottom: '10px' }}>Education</h2>
          {resume.education.map((edu, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: '8px' }}>
              <strong style={{ fontFamily: 'Manrope', fontSize: '13px', fontWeight: 700, color: '#031631' }}>{edu.degree}</strong>
              <p style={{ fontSize: '12px', color: '#44474d' }}>{edu.school}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function MinimalTemplate({ resume }) {
  if (!resume) return null
  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1122px', padding: '64px 72px', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#000', letterSpacing: '-0.01em', marginBottom: '4px' }}>{resume.name || 'Your Name'}</h1>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '6px' }}>{resume.title || 'Job Title'}</p>
        <p style={{ fontSize: '11px', color: '#888' }}>{resume.contact || 'Email · Phone · Location'}</p>
      </div>
      {(resume.summary || !resume.id) && (
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.9', borderLeft: '2px solid #000', paddingLeft: '16px' }}>{resume.summary || 'A brief professional summary about yourself...'}</p>
        </div>
      )}
      {resume.experience?.length > 0 && (
        <div className="resume-section" style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '16px' }}>Experience</p>
          {resume.experience.map((exp, i) => (
            <div key={i} className="resume-item" style={{ marginBottom: '24px' }}>
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
        <div className="resume-section" style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Skills</p>
          <p className="resume-item" style={{ fontSize: '12px', color: '#444', lineHeight: '1.8' }}>{resume.skills.join(' · ')}</p>
        </div>
      )}
      {resume.education?.length > 0 && (
        <div className="resume-section">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '12px' }}>Education</p>
          {resume.education.map((edu, i) => (
            <div key={i} className="resume-item"><strong style={{ fontSize: '12px', color: '#000' }}>{edu.degree}</strong><p style={{ fontSize: '11px', color: '#666' }}>{edu.school}</p></div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ImpactTemplate({ resume }) {
  if (!resume) return null
  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1122px', fontFamily: 'Manrope, sans-serif', textAlign: 'left' }}>
      <div style={{ backgroundColor: '#031631', padding: '48px 56px', color: 'white' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>{resume.name || 'Your Name'}</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '12px' }}>{resume.title || 'Job Title'}</p>
        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{resume.contact || 'Email · Phone · Location'}</p>
      </div>
      <div style={{ padding: '40px 56px' }}>
        {(resume.summary || !resume.id) && (
          <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: '#f7f9fb', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#44474d', lineHeight: '1.9' }}>{resume.summary || 'A brief professional summary about yourself...'}</p>
          </div>
        )}
        {resume.experience?.length > 0 && (
          <div className="mb-8 resume-section">
            <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0099', marginBottom: '16px' }}>Experience</h2>
            {resume.experience.map((exp, i) => (
              <div key={i} className="resume-item" style={{ marginBottom: '24px', paddingLeft: '16px', borderLeft: '3px solid #0e0099' }}>
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
            <div className="resume-section">
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0099', marginBottom: '12px' }}>Skills</h2>
              <div className="resume-item" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resume.skills.map(s => (
                  <span key={s} style={{ fontSize: '10px', backgroundColor: '#e1e0ff', color: '#2f2ebe', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {resume.education?.length > 0 && (
            <div className="resume-section">
              <h2 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0e0099', marginBottom: '12px' }}>Education</h2>
              {resume.education.map((edu, i) => (
                <div key={i} className="resume-item">
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
