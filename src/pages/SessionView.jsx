import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useSession } from '../context/SessionContext'
import { useSessions } from '../hooks/useSessions'

// Core Components
import ResumeEditorCore from '../components/session/ResumeEditorCore'
import CoverLetterCore from '../components/session/CoverLetterCore'
import InterviewPrepCore from '../components/session/InterviewPrepCore'

export default function SessionView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeSession, setActiveSession } = useSession()
  const { sessions, loading, fetchFullPacket, updateSession } = useSessions()
  const [fetching, setFetching] = useState(false)

  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabParam || 'resume')

  // Sync tab state with URL param
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  async function handleMarkApplied() {
    if (!activeSession?.sessionId) return
    const next = packetStatus === 'applied' ? derivedStatus : 'applied'
    try {
      await updateSession(activeSession.sessionId, { packet_status: next })
      setActiveSession(prev => ({ ...prev, packetStatus: next }))
    } catch (err) {
      console.error('Failed to update applied status:', err)
    }
  }

  // Update page title when session loads
  useEffect(() => {
    if (activeSession?.role && activeSession?.company) {
      document.title = `${activeSession.role} · ${activeSession.company} — JobBlitz`
    } else {
      document.title = 'JobBlitz — Workspace'
    }
    return () => { document.title = 'JobBlitz' }
  }, [activeSession?.role, activeSession?.company])

  // 1. Sync session from URL to context using the full packet fetcher
  useEffect(() => {
    let mounted = true

    async function loadFullPacket() {
      if (!id || activeSession?.sessionId === id) return
      setFetching(true)
      try {
        const fullPacket = await fetchFullPacket(id)
        if (fullPacket && mounted) setActiveSession(fullPacket)
      } finally {
        if (mounted) setFetching(false)
      }
    }

    if (!loading) {
      loadFullPacket()
    }

    return () => { mounted = false }
  }, [id, loading, fetchFullPacket, activeSession?.sessionId, setActiveSession])

  if (loading || fetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f4f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#031631] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#031631] animate-pulse">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  if (!activeSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f4f6] p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-[#031631] mb-2">Application Not Found</h2>
          <p className="text-sm text-[#44474d] mb-6">We couldn't find this application workspace.</p>
          <button onClick={() => navigate('/app/dashboard')} className="px-6 py-2 bg-[#031631] text-white rounded-xl font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Derive per-component completion from session data
  const hasResume = !!activeSession?.tailoredResume
  const hasCoverLetter = !!activeSession?.coverLetter
  const hasInterview = (activeSession?.interviewData?.questions?.length || 0) > 0
  const completedCount = [hasResume, hasCoverLetter, hasInterview].filter(Boolean).length

  // Effective packet status — prefer explicit backend field, fall back to derived
  const derivedStatus = completedCount === 3 ? 'ready' : completedCount > 0 ? 'partial' : 'empty'
  const packetStatus = activeSession?.packetStatus ?? derivedStatus

  const STATUS_LABEL = {
    ready:      { text: 'Complete',   dot: '#2e7d32', bg: '#e8f5e9', color: '#2e7d32' },
    partial:    { text: `${completedCount} of 3 ready`, dot: '#f59e0b', bg: '#fffbeb', color: '#92400e' },
    empty:      { text: 'Not generated', dot: '#c5c6ce', bg: '#f2f4f6', color: '#75777e' },
    draft:      { text: 'Draft',      dot: '#8293b4', bg: '#f2f4f6', color: '#44474d' },
    generating: { text: 'Generating…', dot: '#0e0099', bg: '#e1e0ff', color: '#2f2ebe' },
    failed:     { text: 'Failed',     dot: '#93000a', bg: '#ffdad6', color: '#93000a' },
    applied:    { text: 'Applied',    dot: '#0e0099', bg: '#e1e0ff', color: '#0e0099' },
  }
  const statusInfo = STATUS_LABEL[packetStatus] || STATUS_LABEL.empty

  const TAB_DEFS = [
    { id: 'resume',    label: 'Resume Studio',  icon: 'description', ready: hasResume },
    { id: 'cover',     label: 'Cover Letter',   icon: 'mail',        ready: hasCoverLetter },
    { id: 'interview', label: 'Interview Prep', icon: 'psychology',  ready: hasInterview },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <SideNav />

      {/* Main Workspace Area — Command Center */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="glass-panel border-b px-4 md:px-8 py-3 md:py-4 flex items-center justify-between z-20"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:bg-[#eceef0]"
              style={{ color: '#44474d', borderColor: 'rgba(197,198,206,0.3)' }}>
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="truncate">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#0e0099' }}>
                   Command Center
                </span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#c5c6ce' }} />
                <span className="text-[10px] font-bold" style={{ color: '#8293b4' }}>
                  {activeSession?.company}
                </span>
              </div>
              <h1 className="text-base md:text-lg font-black tracking-tight truncate"
                style={{ fontFamily: 'Manrope', color: '#031631' }}>
                {activeSession?.role}
              </h1>
            </div>
          </div>

          {/* TAB BAR with per-tab completion dots */}
          <nav className="flex bg-[#f2f4f6] p-1 rounded-2xl border w-full md:w-auto overflow-x-auto no-scrollbar"
            style={{ borderColor: 'rgba(3,22,49,0.05)' }}>
            {TAB_DEFS.map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id ? 'text-[#031631] shadow-sm bg-white' : 'text-[#8293b4] hover:text-[#031631]'
                }`}>
                <span className={`material-symbols-outlined text-[15px] md:text-[17px] ${activeTab === tab.id ? 'icon-filled' : ''}`}>
                  {tab.icon}
                </span>
                <span className="whitespace-nowrap">{tab.label}</span>
                {/* Completion dot */}
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tab.ready ? '#2e7d32' : 'rgba(197,198,206,0.6)' }} />
              </button>
            ))}
          </nav>

          {/* Desktop: packet status + quick export actions */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <span className="px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5"
              style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusInfo.dot }} />
              {statusInfo.text}
            </span>
            {/* Jump-to-export shortcut */}
            {hasResume && (
              <button
                onClick={() => handleTabChange('resume')}
                title="Export Resume PDF"
                className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:bg-[#e1e0ff]"
                style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: '#0e0099' }}>download</span>
              </button>
            )}
            {hasCoverLetter && (
              <button
                onClick={() => handleTabChange('cover')}
                title="Open Cover Letter"
                className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all hover:bg-[#f2f4f6]"
                style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
                <span className="material-symbols-outlined text-[16px]" style={{ color: '#031631' }}>mail</span>
              </button>
            )}
            {/* Applied toggle — clickable in both directions */}
            <button
              onClick={handleMarkApplied}
              title={packetStatus === 'applied' ? 'Undo applied status' : 'Mark as Applied'}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all"
              style={packetStatus === 'applied'
                ? { backgroundColor: '#e8f5e9', borderColor: 'rgba(46,125,50,0.2)', color: '#2e7d32' }
                : { borderColor: 'rgba(197,198,206,0.2)', color: '#44474d', backgroundColor: 'transparent' }
              }>
              <span className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: packetStatus === 'applied' ? "'FILL' 1" : "'FILL' 0" }}>
                {packetStatus === 'applied' ? 'check_circle' : 'mark_email_read'}
              </span>
              {packetStatus === 'applied' ? 'Applied ✓' : 'Applied?'}
            </button>
          </div>
        </header>

        {/* Packet completeness nudge — tab-aware, excludes the current tab from missing list */}
        {(() => {
          const missingItems = [
            !hasResume      && activeTab !== 'resume'    ? { label: 'Resume',       tab: 'resume' }    : null,
            !hasCoverLetter && activeTab !== 'cover'     ? { label: 'Cover Letter', tab: 'cover' }     : null,
            !hasInterview   && activeTab !== 'interview' ? { label: 'Interview Prep', tab: 'interview' } : null,
          ].filter(Boolean)
          if (!activeSession || missingItems.length === 0) return null
          return (
            <div className="flex-shrink-0 px-4 md:px-8 py-2 flex items-center gap-3 border-b"
              style={{ backgroundColor: '#fffbeb', borderColor: 'rgba(245,158,11,0.15)' }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#f59e0b]" />
              <p className="text-[11px] font-bold flex-1" style={{ color: '#92400e' }}>
                {missingItems.map(i => i.label).join(', ')} not yet generated
              </p>
              {missingItems.length === 1 && (
                <button onClick={() => handleTabChange(missingItems[0].tab)}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all"
                  style={{ color: '#92400e' }}>
                  View →
                </button>
              )}
            </div>
          )
        })()}

        {/* WORKSPACE AREA */}
        <main className="flex-1 flex flex-col overflow-y-auto custom-scroll page-pb-mobile">
          {activeTab === 'resume' && <ResumeEditorCore />}
          {activeTab === 'cover' && <CoverLetterCore />}
          {activeTab === 'interview' && <InterviewPrepCore />}
        </main>
      </div>
    </div>
  )
}
