/**
 * useSessions — CRUD for tailoring sessions from Supabase
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          resume_versions(id),
          cover_letters(id),
          interview_prep(id)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      if (error) {
        console.error('Error loading sessions:', error)
      } else {
        setSessions(data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { 
    load() 
  }, [load])

  const createSession = useCallback(async ({ company, role, jd_text, packet_status = 'draft' }) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ company, role, jd_text, packet_status, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    
    // Optimistic update: ensure nested arrays exist so readiness counts work immediately
    const sessionWithArrays = {
      ...data,
      resume_versions: [],
      cover_letters: [],
      interview_prep: []
    }
    setSessions(prev => [sessionWithArrays, ...prev])
    return sessionWithArrays
  }, [user])

  const updateSession = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        resume_versions(id),
        cover_letters(id),
        interview_prep(id)
      `)
      .single()
    if (error) throw error
    setSessions(prev => prev.map(s => s.id === id ? data : s))
    return data
  }, [])

  const saveResumeVersion = useCallback(async ({ sessionId, title, template = 'atelier', content }) => {
    const { data, error } = await supabase
      .from('resume_versions')
      .insert({ session_id: sessionId, user_id: user.id, title, template, content })
      .select()
      .single()
    if (error) throw error
    // Refresh local sessions to reflect the new version
    load()
    return data
  }, [user, load])

  const saveCoverLetter = useCallback(async ({ sessionId, tone, content }) => {
    const wordCount = content.split(/\s+/).length
    const { data, error } = await supabase
      .from('cover_letters')
      .upsert({ session_id: sessionId, user_id: user.id, tone, content, word_count: wordCount },
        { onConflict: 'session_id' })
      .select()
      .single()
    if (error) throw error
    // Refresh local sessions
    load()
    return data
  }, [user, load])

  const saveInterviewPrep = useCallback(async ({ sessionId, questions }) => {
    const { data, error } = await supabase
      .from('interview_prep')
      .upsert({ session_id: sessionId, user_id: user.id, questions },
        { onConflict: 'session_id' })
      .select()
      .single()
    if (error) throw error
    // Refresh local sessions
    load()
    return data
  }, [user, load])

  const fetchFullPacket = useCallback(async (sessionId) => {
    if (!user || !sessionId) return null
    
    try {
      const { data, error } = await supabase.rpc('get_application_packet', { 
        p_application_id: sessionId 
      })
      
      if (error) throw error
      if (!data) return null
      
      // Map RDS response to Context schema for consistency in workspace
      return {
        sessionId: data.application.id,
        company: data.application.company,
        role: data.application.role,
        jdText: data.application.jd_text,
        matchData: {
          match_score:    data.application.match_score,
          matched_skills: data.application.matched_skills,
          gaps:           data.application.gaps,
          ats_keywords:   data.application.ats_keywords,
        },
        tailoredResume: data.resume?.content || null,
        coverLetter:    data.cover_letter?.content || null,
        interviewData:  data.interview_prep || { questions: [] },
        lastUpdated:    data.application.updated_at,
        packetStatus:   data.application.packet_status,
      }
    } catch (err) {
      console.error('[useSessions] fetchFullPacket Error:', err.message)
      return null
    }
  }, [user])

  // Centralized helper to get packet completeness and status
  const getPacketStats = useCallback((session) => {
    if (!session) return { readyCount: 0, isComplete: false, hasResume: false, hasCover: false, hasInterview: false, statusLabel: 'draft' }
    
    // Check for nested arrays (joined data) or direct fields if available
    const hasResume    = (session.resume_versions?.length > 0) || !!session.tailoredResume
    const hasCover     = (session.cover_letters?.length > 0) || !!session.coverLetter
    const hasInterview = (session.interview_prep?.length > 0) || (session.interviewData?.questions?.length > 0)
    
    const readyCount = [hasResume, hasCover, hasInterview].filter(Boolean).length
    
    return {
      readyCount,
      isComplete: readyCount === 3,
      hasResume,
      hasCover,
      hasInterview,
      statusLabel: session.packet_status || 'draft'
    }
  }, [])

  // Refined latest packet: most recent non-draft/non-failed session
  const latestPacket = sessions.find(s => 
    s.packet_status !== 'draft' && s.packet_status !== 'failed'
  ) || sessions[0] || null

  return {
    sessions, loading, reload: load,
    createSession, updateSession,
    saveResumeVersion, saveCoverLetter, saveInterviewPrep,
    fetchFullPacket,
    latestPacket,
    getPacketStats,
  }
}
