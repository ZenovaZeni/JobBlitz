import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PLAN_LIMITS } from '../lib/planLimits'

function Section({ id, title, subtitle, children }) {
  return (
    <div id={id} className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(3,22,49,0.04)', border: '1px solid rgba(197,198,206,0.12)' }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
        <h2 className="font-extrabold text-base" style={{ fontFamily: 'Manrope', color: '#031631' }}>{title}</h2>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#75777e' }}>{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-3 py-4 border-b last:border-0"
      style={{ borderColor: 'rgba(197,198,206,0.08)' }}>
      <div className="md:w-48 flex-shrink-0">
        <p className="text-sm font-semibold" style={{ color: '#031631' }}>{label}</p>
        {hint && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#75777e' }}>{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Input({ value, onChange, disabled, type = 'text', placeholder }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none"
      style={{
        borderColor: disabled ? 'rgba(197,198,206,0.15)' : 'rgba(197,198,206,0.4)',
        backgroundColor: disabled ? '#f7f9fb' : 'white',
        color: disabled ? '#75777e' : '#031631',
      }}
    />
  )
}

function SaveBtn({ onClick, saving, saved, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || saving}
      className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-40"
      style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
      {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, isPro, updateProfile, signOut, isSigningOut } = useAuth()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (profile) setFullName(profile.full_name || '')
  }, [profile])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [emailNotifs, setEmailNotifs] = useState(profile?.email_notifications ?? true)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [activeSection, setActiveSection] = useState('account')

  const isGoogleUser = user?.app_metadata?.provider === 'google'

  const planTier = profile?.plan_tier || 'free'
  const sessionsUsed = profile?.tailors_used || 0
  const sessionsLimit = PLAN_LIMITS[planTier]?.monthly_tailors ?? 5

  const NAV_ITEMS = [
    { id: 'account',      label: 'Account',      icon: 'person'            },
    { id: 'subscription', label: 'Subscription', icon: 'workspace_premium' },
    ...(!isGoogleUser ? [{ id: 'security', label: 'Security', icon: 'lock' }] : []),
    { id: 'preferences',  label: 'Preferences',  icon: 'tune'              },
    { id: 'data',         label: 'Privacy',       icon: 'shield'            },
    { id: 'session',      label: 'Session',       icon: 'logout'            },
    { id: 'danger',       label: 'Danger Zone',   icon: 'warning'           },
  ]

  function scrollTo(id) {
    setActiveSection(id)
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleSaveAccount() {
    setAccountSaving(true)
    setAccountError('')
    setAccountSaved(false)
    try {
      await updateProfile({ full_name: fullName })
      await supabase.auth.updateUser({ data: { full_name: fullName } })
      setAccountSaved(true)
      setTimeout(() => setAccountSaved(false), 3000)
    } catch (err) {
      setAccountError(err.message || 'Failed to update account.')
    } finally {
      setAccountSaving(false)
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-portal')
      if (error) throw error
      if (data?.redirect) navigate(data.redirect)
      else if (data?.url) window.location.href = data.url
    } catch (err) {
      console.error('Portal error:', err)
      alert(`Portal failed: ${err.message || 'Unknown error'}`)
    } finally {
      setPortalLoading(false)
    }
  }

  async function handleChangePassword() {
    setPasswordError('')
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return }
    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSaved(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSaved(false), 3000)
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleNotifToggle() {
    setNotifSaving(true)
    const newVal = !emailNotifs
    setEmailNotifs(newVal)
    try {
      await updateProfile({ email_notifications: newVal })
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2000)
    } catch {
      setEmailNotifs(!newVal)
    } finally {
      setNotifSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  async function handleExportData() {
    const { data: masterProfile } = await supabase
      .from('master_profiles').select('*').eq('user_id', user.id).single()
    const { data: sessions } = await supabase
      .from('sessions').select('*').eq('user_id', user.id)
    const exportData = {
      account: { email: user.email, name: profile?.full_name, created_at: user.created_at },
      profile: masterProfile,
      sessions,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobblitz-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Page-level sticky header */}
        <header
          className="glass-panel border-b flex-shrink-0 z-20 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(197,198,206,0.15)', boxShadow: '0 4px 12px rgba(3,22,49,0.03)' }}>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#0e0099' }}>
              Settings
            </p>
            <h1 className="text-base md:text-lg font-black tracking-tight truncate"
              style={{ fontFamily: 'Manrope', color: '#031631' }}>
              {profile?.full_name || user?.email || 'Account Settings'}
            </h1>
          </div>
          <div className="flex-shrink-0">
            <span
              className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
              style={{ background: isPro ? 'linear-gradient(135deg, #031631, #0e0099)' : '#44474d' }}>
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
        </header>

        {/* Body: secondary nav + main content */}
        <div className="flex-1 flex overflow-hidden">

          {/* Secondary nav — desktop only, scrolls independently */}
          <nav
            className="hidden md:flex w-52 flex-shrink-0 flex-col border-r overflow-y-auto custom-scroll bg-white"
            style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
            <div className="px-3 pt-6 pb-4">
              <p className="text-[10px] font-black uppercase tracking-widest px-3 mb-2"
                style={{ color: '#8293b4' }}>
                Sections
              </p>
              <div className="space-y-0.5">
                {NAV_ITEMS.map(item => {
                  const isDanger = item.id === 'danger'
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                      style={{
                        backgroundColor: isActive && !isDanger ? 'rgba(3,22,49,0.05)' : 'transparent',
                        color: isDanger ? '#93000a' : isActive ? '#031631' : '#44474d',
                      }}>
                      <span
                        className="material-symbols-outlined text-[17px] flex-shrink-0"
                        style={{ color: isDanger ? '#93000a' : isActive ? '#0e0099' : '#8293b4' }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto custom-scroll">

            {/* Mobile section tabs — horizontal scrollable strip */}
            <div
              className="md:hidden overflow-x-auto no-scrollbar border-b px-4 py-3 flex-shrink-0"
              style={{ backgroundColor: '#f2f4f6', borderColor: 'rgba(197,198,206,0.15)' }}>
              <div className="flex gap-2">
                {NAV_ITEMS.map(item => {
                  const isDanger = item.id === 'danger'
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollTo(item.id)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        backgroundColor: isActive ? (isDanger ? '#93000a' : '#031631') : 'white',
                        color: isActive ? 'white' : isDanger ? '#93000a' : '#44474d',
                        boxShadow: isActive ? '0 2px 8px rgba(3,22,49,0.12)' : '0 1px 3px rgba(3,22,49,0.06)',
                      }}>
                      <span className="material-symbols-outlined text-[13px]">{item.icon}</span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section content */}
            <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 pb-24 md:pb-16 space-y-5">

              {/* Account */}
              <Section id="settings-account" title="Account" subtitle="Your name and login details.">
                <Field label="Full Name">
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                </Field>
                <Field label="Email" hint="Contact support to change your email.">
                  <Input value={user?.email || ''} disabled />
                </Field>
                <Field label="Sign-in method">
                  <div className="flex items-center gap-2">
                    {isGoogleUser
                      ? <>
                          <span className="material-symbols-outlined icon-filled text-[15px]" style={{ color: '#4285F4' }}>google</span>
                          <span className="text-sm font-semibold" style={{ color: '#031631' }}>Google</span>
                        </>
                      : <>
                          <span className="material-symbols-outlined icon-filled text-[15px]" style={{ color: '#0e0099' }}>mail</span>
                          <span className="text-sm font-semibold" style={{ color: '#031631' }}>Email / Password</span>
                        </>
                    }
                  </div>
                </Field>
                {accountError && (
                  <p className="text-xs font-semibold pt-1 pb-2" style={{ color: '#93000a' }}>{accountError}</p>
                )}
                <div className="pt-3">
                  <SaveBtn onClick={handleSaveAccount} saving={accountSaving} saved={accountSaved} />
                </div>
              </Section>

              {/* Subscription */}
              <Section id="settings-subscription" title="Subscription" subtitle="Your plan and monthly usage.">
                {/* Plan row */}
                <Field label="Current plan">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white"
                      style={{ background: isPro ? 'linear-gradient(135deg, #031631, #0e0099)' : '#44474d' }}>
                      {isPro ? 'Pro' : 'Free'}
                    </span>
                    {isPro && profile?.current_period_end && (
                      <span className="text-xs" style={{ color: '#75777e' }}>
                        {profile?.cancel_at_period_end
                          ? `Ends ${new Date(profile.current_period_end).toLocaleDateString()}`
                          : `Renews ${new Date(profile.current_period_end).toLocaleDateString()}`
                        }
                      </span>
                    )}
                  </div>
                </Field>

                {/* Usage */}
                <Field label="Monthly usage" hint="Resets at the start of each billing cycle.">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: '#031631' }}>Tailoring sessions</span>
                      <span style={{ color: '#75777e' }}>{sessionsUsed} / {sessionsLimit}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, (sessionsUsed / sessionsLimit) * 100)}%`,
                          background: 'linear-gradient(90deg, #0e0099, #2f2ebe)',
                        }}
                      />
                    </div>
                  </div>
                </Field>

                {/* Upgrade card — full width, not buried in a Field row */}
                {!isPro && (
                  <div className="mt-2 p-5 rounded-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(3,22,49,0.03) 0%, rgba(14,0,153,0.05) 100%)', border: '1px solid rgba(14,0,153,0.1)' }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-extrabold text-base mb-1" style={{ fontFamily: 'Manrope', color: '#031631' }}>
                          Unlock Pro
                        </p>
                        <p className="text-sm" style={{ color: '#44474d' }}>
                          $9.99/month — 50 sessions, all templates, PDF export, priority AI.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="flex-shrink-0 px-5 py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn active:scale-95 transition-all">
                        Upgrade to Pro →
                      </button>
                    </div>
                  </div>
                )}

                {/* Billing portal */}
                {isPro && (
                  <div className="pt-3">
                    <button
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all hover:bg-[#f2f4f6] disabled:opacity-50"
                      style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631' }}>
                      {portalLoading && (
                        <span className="material-symbols-outlined animate-spin text-[15px]">progress_activity</span>
                      )}
                      Manage Billing →
                    </button>
                  </div>
                )}
              </Section>

              {/* Security — email/password users only */}
              {!isGoogleUser && (
                <Section id="settings-security" title="Security" subtitle="Change your password.">
                  <Field label="New password" hint="Minimum 8 characters.">
                    <div className="space-y-3">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password"
                      />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      {passwordError && (
                        <p className="text-xs font-semibold" style={{ color: '#93000a' }}>{passwordError}</p>
                      )}
                      <SaveBtn
                        onClick={handleChangePassword}
                        saving={passwordSaving}
                        saved={passwordSaved}
                        disabled={!newPassword || !confirmPassword}
                      />
                    </div>
                  </Field>
                </Section>
              )}

              {/* Preferences */}
              <Section id="settings-preferences" title="Preferences" subtitle="Notifications and communication settings.">
                <Field label="Email notifications" hint="Tips, session summaries, and product updates.">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleNotifToggle}
                      disabled={notifSaving}
                      className="relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0"
                      style={{ backgroundColor: emailNotifs ? '#0e0099' : '#c5c6ce' }}>
                      <span
                        className="inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                        style={{ transform: emailNotifs ? 'translateX(24px)' : 'translateX(4px)' }}
                      />
                    </button>
                    <span className="text-sm font-semibold" style={{ color: '#031631' }}>
                      {emailNotifs ? 'On' : 'Off'}
                    </span>
                    {notifSaved && (
                      <span className="text-xs font-bold" style={{ color: '#0e0099' }}>Saved ✓</span>
                    )}
                  </div>
                </Field>
              </Section>

              {/* Data & Privacy */}
              <Section id="settings-data" title="Data & Privacy" subtitle="Export or review how your data is handled.">
                <Field label="Export your data" hint="Download everything stored in your account.">
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all hover:bg-[#f2f4f6]"
                    style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631' }}>
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download JSON Export
                  </button>
                </Field>
                <Field label="Privacy policy">
                  <p className="text-sm" style={{ color: '#44474d' }}>
                    Your data is encrypted at rest and never sold.{' '}
                    <button
                      onClick={() => navigate('/privacy')}
                      className="font-bold underline"
                      style={{ color: '#0e0099' }}>
                      Read Privacy Policy
                    </button>
                  </p>
                </Field>
              </Section>

              {/* Session */}
              <Section id="settings-session" title="Session">
                <Field label="Sign out" hint="You'll need to sign in again to access your account.">
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all hover:bg-[#ffdad6] disabled:opacity-50"
                    style={{ borderColor: 'rgba(147,0,10,0.2)', color: '#93000a' }}>
                    {isSigningOut ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                    )}
                    {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </Field>
              </Section>

              {/* Danger Zone — visually separated, red-tinted card */}
              <div id="settings-danger" className="rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid rgba(147,0,10,0.18)' }}>
                <div className="px-6 py-5 border-b"
                  style={{ borderColor: 'rgba(147,0,10,0.1)', backgroundColor: 'rgba(255,218,214,0.2)' }}>
                  <h2 className="font-extrabold text-base" style={{ fontFamily: 'Manrope', color: '#93000a' }}>
                    Danger Zone
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: '#44474d' }}>
                    Irreversible actions. Proceed with caution.
                  </p>
                </div>
                <div className="px-6 py-5 bg-white">
                  <Field label="Delete account" hint="Permanently deletes your account and all data. Cannot be undone.">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all hover:shadow-sm"
                      style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>
                      <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                      Delete My Account
                    </button>
                  </Field>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(3,22,49,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full"
            style={{ boxShadow: '0 24px 80px rgba(3,22,49,0.2)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: '#ffdad6' }}>
              <span className="material-symbols-outlined icon-filled text-[24px]" style={{ color: '#93000a' }}>
                warning
              </span>
            </div>
            <h3 className="text-lg font-extrabold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Delete your account?
            </h3>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: '#44474d' }}>
              This will permanently delete your account, master profile, all sessions, and every tailored resume.{' '}
              <strong style={{ color: '#031631' }}>This cannot be undone.</strong>
            </p>
            <p className="text-xs font-bold mb-2" style={{ color: '#031631' }}>
              Type <span style={{ color: '#93000a' }}>DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full px-4 py-3 rounded-xl text-sm border mb-5 focus:outline-none"
              style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }}
                className="flex-1 py-3 text-sm font-bold rounded-xl border transition-all hover:bg-[#f2f4f6]"
                style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631' }}>
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== 'DELETE'}
                onClick={() => alert('To delete your account, please contact support@jobblitz.ai')}
                className="flex-1 py-3 text-sm font-bold rounded-xl transition-all disabled:opacity-35"
                style={{ backgroundColor: '#93000a', color: 'white' }}>
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
