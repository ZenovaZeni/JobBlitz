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
  const { sessions, loading } = useSessions()
  
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

  // 1. Sync session from URL to context if needed
  useEffect(() => {
    if (!loading && sessions.length > 0) {
      const found = sessions.find(s => s.id === id)
      if (found) {
        // Map DB record to Context schema
        const contextSession = {
          sessionId: found.id,
          company: found.company,
          role: found.role,
          jdText: found.jd_text,
          matchData: found.match_data,
          tailoredResume: found.tailored_resume,
          coverLetter: found.cover_letter,
          interviewData: found.interview_data,
          lastUpdated: found.created_at
        }
        
        // Only update if it's actually different to avoid rerender loops
        if (activeSession?.sessionId !== id) {
          setActiveSession(contextSession)
        }
      }
    }
  }, [id, loading, sessions, activeSession, setActiveSession])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f4f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#031631] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#031631] animate-pulse">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  if (!activeSession && !loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f2f4f6] p-4 text-center">
        <div>
          <h2 className="text-xl font-bold text-[#031631] mb-2">Session Not Found</h2>
          <p className="text-sm text-[#44474d] mb-6">We couldn't find the workspace you're looking for.</p>
          <button onClick={() => navigate('/app/dashboard')} className="px-6 py-2 bg-[#031631] text-white rounded-xl font-bold">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 🔥 UNIFIED STICKY HEADER */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            <Link to="/app/dashboard" className="w-9 h-9 md:w-10 md:h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all hover:bg-[#f2f4f6]"
              style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
              <span className="material-symbols-outlined text-[18px] md:text-[20px] text-[#031631]">arrow_back</span>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                 <h1 className="text-base md:text-xl font-black text-[#031631] truncate tracking-tight font-manrope">
                  {activeSession?.role}
                </h1>
                {activeSession?.matchData?.match_score && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider h-fit mt-0.5 flex items-center gap-1"
                    style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0e0099] animate-pulse" />
                    {activeSession.matchData.match_score}% Match
                  </span>
                )}
              </div>
              <p className="text-[10px] md:text-xs font-semibold text-[#8293b4] truncate uppercase tracking-widest leading-none">
                {activeSession?.company} · {activeSession?.lastUpdated ? new Date(activeSession.lastUpdated).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          </div>

          {/* TAB BAR (SEGMENTED CONTROL) */}
          <nav className="flex bg-[#f2f4f6] p-1 rounded-2xl border w-full md:w-auto overflow-x-auto no-scrollbar" style={{ borderColor: 'rgba(3,22,49,0.05)' }}>
            {[
              { id: 'resume', label: 'Resume', icon: 'description' },
              { id: 'cover', label: 'Cover Letter', icon: 'mail' },
              { id: 'interview', label: 'Interview Prep', icon: 'psychology' }
            ].map(tab => (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`relative flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[11px] md:text-xs font-bold transition-all duration-300 ${
                  activeTab === tab.id ? 'text-[#031631] shadow-sm bg-white' : 'text-[#8293b4] hover:text-[#031631]'
                }`}>
                <span className={`material-symbols-outlined text-[16px] md:text-[18px] ${activeTab === tab.id ? 'icon-filled' : ''}`}>
                  {tab.icon}
                </span>
                <span className="whitespace-nowrap">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0e0099]" />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block text-right">
             <div className="text-[9px] font-black uppercase tracking-widest text-[#c5c6ce] mb-0.5">Workspace</div>
             <div className="flex items-center gap-2 justify-end">
                <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
                <span className="text-[11px] font-bold text-[#031631]">Tailored & Active</span>
             </div>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'resume' && <ResumeEditorCore />}
          {activeTab === 'cover' && <CoverLetterCore />}
          {activeTab === 'interview' && <InterviewPrepCore />}
        </main>
      </div>
    </div>
  )
}
