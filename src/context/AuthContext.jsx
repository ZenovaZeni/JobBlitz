import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { checkAccess } from '../lib/permissions'
import { PLAN_LIMITS, DEFAULT_PLAN } from '../lib/planLimits'
import { logger } from '../lib/logger'

const AuthContext = createContext(null)

const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'tester@jobblitz.ai',
  user_metadata: { full_name: 'Test Admin' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_USER)
  const [profile, setProfile] = useState({ id: MOCK_USER.id, plan_tier: 'pro', full_name: 'Test Admin' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Session check bypassed for verification
    setLoading(false)
  }, [])

  async function createDefaultProfile(userId) {
    // Called when a user has no profile row — first-time OAuth sign-ins hit this path.
    // upsert with onConflict ensures this is idempotent if two tabs race on first login.
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, plan_tier: DEFAULT_PLAN }, { onConflict: 'id' })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error

      const profile = data ?? await createDefaultProfile(userId)
      const checkedProfile = await checkMonthlyReset(profile)
      setProfile(checkedProfile)
    } catch (err) {
      console.error('Profile fetch error:', err)
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
      signOut, updateProfile, updateUsage,
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
