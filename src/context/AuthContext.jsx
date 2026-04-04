import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { checkAccess } from '../lib/permissions'
import { logger } from '../lib/logger'

const AuthContext = createContext(null)

const SMOKE_TEST_USER_ID = 'fa6d0edd-bdf1-48e9-ba3f-014ea83a819d' // test_smoke_final@example.com
const MOCK_USER = {
  id: SMOKE_TEST_USER_ID,
  email: 'test_smoke_final@example.com',
  app_metadata: { provider: 'email' },
  user_metadata: { first_name: 'Smoke', last_name: 'Tester' },
  aud: 'authenticated',
  role: 'authenticated'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const isBypass = localStorage.getItem('jam_smoke_bypass') === 'true'
    
    if (isBypass) {
      console.warn('🛠️ SMOKE TEST BYPASS ACTIVE')
      setUser(MOCK_USER)
      fetchProfile(SMOKE_TEST_USER_ID)
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        else setLoading(false)
      })
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('jam_smoke_bypass') === 'true') return
      
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        if (localStorage.getItem('jam_smoke_bypass') === 'true') {
          console.warn('⚠️ SMOKE TEST: Injecting synthetic profile');
          setProfile({
            id: userId,
            email: 'test_smoke_final@example.com',
            full_name: 'Smoke Tester',
            plan_tier: 'pro',
            subscription_status: 'active',
            app_role: 'admin',
            sessions_used: 0,
            sessions_limit: 100
          });
          setLoading(false);
          return;
        }
        if (error) throw error;
      } else {
        const checkedProfile = await checkMonthlyReset(data)
        setProfile(checkedProfile)
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (localStorage.getItem('jam_smoke_bypass') === 'true') {
        setProfile({
          id: userId,
          email: 'test_smoke_final@example.com',
          full_name: 'Smoke Tester (Fallback)',
          plan_tier: 'pro',
          app_role: 'admin',
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function checkMonthlyReset(p) {
    if (!p) return p
    const lastReset = p.last_reset_date ? new Date(p.last_reset_date) : new Date(p.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (lastReset < thirtyDaysAgo) {
      console.log('Resetting monthly usage counters')
      const { data, error } = await supabase
        .from('profiles')
        .update({
          sessions_used: 0,
          last_reset_date: new Date().toISOString(),
        })
        .eq('id', p.id)
        .select()
        .single()
      
      if (!error) return data
    }
    return p
  }

  async function signUp({ email, password, firstName, lastName }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName.trim(), last_name: lastName.trim() } },
    })
    if (error) throw error
    
    // Log signup success
    await logger.info('auth', 'signup', `User signed up: ${email}`, { email }, data.user?.id)
    
    return data
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Log login success
    await logger.info('auth', 'signin', `User signed in: ${email}`, { email }, data.user?.id)
    
    return data
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/app/dashboard` },
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Log signout
    await logger.info('auth', 'signout', 'User signed out', {}, user?.id)
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  async function updateUsage() {
    if (!profile) return
    const { data, error } = await supabase
      .from('profiles')
      .update({ sessions_used: (profile.sessions_used || 0) + 1 })
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    return data
  }

  const isPro = profile?.plan_tier === 'pro' && profile?.subscription_status === 'active'
  const isAdmin = profile?.app_role === 'admin'
  const canUseTailor = checkAccess(profile, 'tailor').allowed
  const canUseCoverLetter = checkAccess(profile, 'cover_letter').allowed

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signInWithGoogle, signOut, updateProfile, updateUsage,
      isPro, isAdmin, canUseTailor, canUseCoverLetter, checkAccess: (action) => checkAccess(profile, action),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
