import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { checkAccess } from '../lib/permissions'
import { PLAN_LIMITS, DEFAULT_PLAN } from '../lib/planLimits'
import { logger } from '../lib/logger'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    let mounted = true
    console.log('[AuthContext] INITIALIZING')
    
    // Safety timeout: the "Nuclear Option" to ensure the app ALWAYS boots
    const globalAuthTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.error('[AuthContext] CRITICAL: Auth initialization timed out after 8s. Force-clearing loading state.')
        setLoading(false)
      }
    }, 8000)

    const initAuth = async () => {
      try {
        console.log('[AuthContext] SESSION_SYNCING')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthContext] Session Hydration Error:', error)
          throw error
        }
        
        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          console.log('[AuthContext] PROFILE_SYNCING for', currentUser.email)
          await fetchProfile(currentUser.id)
        } else {
          console.log('[AuthContext] READY - No active session')
          setLoading(false)
        }
      } catch (err) {
        console.error('[AuthContext] Bootstrap Failed:', err)
        if (mounted) setLoading(false)
      } finally {
        if (mounted) clearTimeout(globalAuthTimeout)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] onAuthStateChange: ${event}`)
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
      clearTimeout(globalAuthTimeout)
    }
  }, [])

  async function createDefaultProfile(userId) {
    try {
      console.log('[AuthContext] Creating default profile for', userId)
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId, 
          plan_tier: DEFAULT_PLAN,
          app_role: 'user',
          subscription_status: 'active'
        }, { onConflict: 'id' })
        .select()
        .single()

      if (error) {
        console.error('[AuthContext] Profile Creation Error:', error)
        throw error
      }
      return data
    } catch (err) {
      console.error('[AuthContext] Fatal Failure in createDefaultProfile:', err)
      return null // Return null so fetchProfile knows to stop
    }
  }

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('[AuthContext] Fetch Profile Error:', error)
        throw error
      }

      let userProfile = data
      if (!userProfile) {
        console.log('[AuthContext] No profile found, triggering creation...')
        userProfile = await createDefaultProfile(userId)
      }
      
      if (userProfile) {
        const checkedProfile = await checkMonthlyReset(userProfile)
        setProfile(checkedProfile)
        console.log('[AuthContext] READY - Profile Loaded')
      } else {
        console.warn('[AuthContext] READY - Proceeding with NULL profile (fallback mode)')
      }
    } catch (err) {
      console.error('[AuthContext] Final Profile Fetch Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function checkMonthlyReset(p) {
    if (!p) return p
    const lastReset = p.last_reset_date ? new Date(p.last_reset_date) : new Date(p.created_at)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (lastReset < thirtyDaysAgo) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          tailors_used: 0,
          cover_letters_used: 0,
          sessions_used: 0, // legacy field — kept until column is dropped
          last_reset_date: new Date().toISOString(),
        })
        .eq('id', p.id)
        .select()
        .single()

      if (!error) return data
    }
    return p
  }

  async function signUp({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
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

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    if (error) throw error
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  async function signOut() {
    setIsSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Log signout
      await logger.info('auth', 'signout', 'User signed out', {}, user?.id)
    } finally {
      setIsSigningOut(false)
    }
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

  async function updateUsage(action) {
    if (!profile) return
    const field = action === 'cover_letter' ? 'cover_letters_used' : 'tailors_used'
    const { data, error } = await supabase
      .from('profiles')
      .update({ [field]: (profile[field] || 0) + 1 })
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

  const limitObj = PLAN_LIMITS[profile?.plan_tier || DEFAULT_PLAN]
  const tailorLimit = limitObj?.monthly_tailors ?? 5
  const tailorsLeft = isPro ? Infinity : Math.max(0, tailorLimit - (profile?.tailors_used || 0))
  // sessionsLeft kept as alias — consumed by Dashboard and JobTailoring
  const sessionsLeft = tailorsLeft

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, resetPassword, updatePassword, signInWithGoogle,
      signOut, isSigningOut, updateProfile, updateUsage,
      isPro, isAdmin, canUseTailor, canUseCoverLetter, checkAccess: (action) => checkAccess(profile, action),
      sessionsLeft,
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
