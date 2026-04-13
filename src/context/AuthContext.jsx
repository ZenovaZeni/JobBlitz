import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { checkAccess } from '../lib/permissions'
import { PLAN_LIMITS, DEFAULT_PLAN } from '../lib/planLimits'
import { logger } from '../lib/logger'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [isProfileReady, setIsProfileReady] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Backward compatibility alias
  const loading = !isAuthReady

  useEffect(() => {
    let mounted = true
    // Safety timeout to ensure the app ALWAYS boots
    const globalAuthTimeout = setTimeout(() => {
      if (mounted && !isAuthReady) {
        setIsAuthReady(true)
      }
    }, 8000)

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        if (currentUser) {
          setIsAuthReady(true)
          fetchProfile(currentUser.id)
        } else {
          setIsAuthReady(true)
          setIsProfileReady(true) // Nothing to load
        }
      } catch {
        if (mounted) setIsAuthReady(true)
      } finally {
        if (mounted) clearTimeout(globalAuthTimeout)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        setIsAuthReady(true)
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setIsAuthReady(true)
        setIsProfileReady(true)
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

      if (error) throw error
      return data
    } catch {
      return null
    }
  }

  async function fetchProfile(userId) {
    try {
      setIsProfileReady(false)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      let userProfile = data
      if (!userProfile) {
        userProfile = await createDefaultProfile(userId)
      }

      if (userProfile) {
        const checkedProfile = await checkMonthlyReset(userProfile)
        setProfile(checkedProfile)
      }
    } catch {
    } finally {
      setIsProfileReady(true)
      // Safety: always ensure auth is ready if profile somehow finished first or errored
      setIsAuthReady(true)
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
      user, profile, loading, isAuthReady, isProfileReady,
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
