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
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) console.error('Failed to load sessions:', error.message)
    setSessions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const createSession = useCallback(async ({ company, role, jd_text }) => {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ company, role, jd_text, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setSessions(prev => [data, ...prev])
    return data
  }, [user])

  const updateSession = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
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
    return data
  }, [user])

  const saveCoverLetter = useCallback(async ({ sessionId, tone, content }) => {
    const wordCount = content.split(/\s+/).length
    const { data, error } = await supabase
      .from('cover_letters')
      .upsert({ session_id: sessionId, user_id: user.id, tone, content, word_count: wordCount },
        { onConflict: 'session_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }, [user])

  const saveInterviewPrep = useCallback(async ({ sessionId, questions }) => {
    const { data, error } = await supabase
      .from('interview_prep')
      .upsert({ session_id: sessionId, user_id: user.id, questions },
        { onConflict: 'session_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }, [user])

  return {
    sessions, loading, reload: load,
    createSession, updateSession,
    saveResumeVersion, saveCoverLetter, saveInterviewPrep,
  }
}
