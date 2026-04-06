/**
 * useMasterProfile — loads and saves the user's master profile from Supabase
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMasterProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(() => {
      console.warn('[useMasterProfile] Sync timed out after 10s')
      setLoading(false)
    }, 10000)

    try {
      const { data, error } = await supabase
        .from('master_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setError(err.message)
      console.error('[useMasterProfile] Load Error:', err.message)
    } finally {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [user])

  useEffect(() => { 
    load() 
  }, [load])

  const save = useCallback(async (updates) => {
    if (!user) return
    setSaving(true)
    setError(null)
    try {
      const payload = { ...updates, user_id: user.id }
      const { data, error } = await supabase
        .from('master_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single()
      if (error) throw error
      setProfile(data)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }, [user])

  return { profile, loading, saving, error, save, reload: load }
}
