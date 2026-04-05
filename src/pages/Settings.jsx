import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SideNav from '../components/SideNav'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PLAN_LIMITS } from '../lib/planLimits'

function Section({ id, title, subtitle, children }) {
  return (
    <div id={id} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(3,22,49,0.04)' }}>
      <div className="px-8 py-6 border-b" style={{ borderColor: 'rgba(197,198,206,0.12)' }}>
        <h2 className="font-extrabold text-lg" style={{ fontFamily: 'Manrope', color: '#031631' }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: '#75777e' }}>{subtitle}</p>}
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-3 py-5 border-b last:border-0" style={{ borderColor: 'rgba(197,198,206,0.1)' }}>
      <div className="md:w-52 flex-shrink-0">
        <p className="text-sm font-semibold" style={{ color: '#031631' }}>{label}</p>
        {hint && <p className="text-xs mt-0.5" style={{ color: '#75777e' }}>{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
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
        borderColor: disabled ? 'rgba(197,198,206,0.2)' : 'rgba(197,198,206,0.4)',
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
      className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
      style={{ background: 'linear-gradient(135deg, #031631, #0e0099)' }}>
      {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, profile, isPro, updateProfile, signOut } = useAuth()

  // Account state — stored as full_name to match SideNav / Dashboard reads
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  // Sync state if profile loads later
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
    }
  }, [profile])

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(profile?.email_notifications ?? true)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifSaved, setNotifSaved] = useState(false)

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isGoogleUser = user?.app_metadata?.provider === 'google'

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
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    setPasswordSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSaved(true)
      setNewPassword('')
      setCurrentPassword('')
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
      setEmailNotifs(!newVal) // revert on error
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
      account: { email: user.email, name: `${profile?.first_name} ${profile?.last_name}`, created_at: user.created_at },
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

  const planLabel = isPro ? 'Pro' : 'Free'

  const planTier = profile?.plan_tier || 'free'
  const sessionsUsed = profile?.tailors_used || 0
  const sessionsLimit = PLAN_LIMITS[planTier]?.monthly_tailors ?? 5

  const NAV_ITEMS = [
    { id: 'account',      label: 'Account',       icon: 'person'          },
    { id: 'subscription', label: 'Subscription',  icon: 'workspace_premium' },
    ...(!isGoogleUser ? [{ id: 'security', label: 'Security', icon: 'lock' }] : []),
    { id: 'preferences',  label: 'Preferences',   icon: 'tune'            },
    { id: 'data',         label: 'Data & Privacy', icon: 'shield'          },
    { id: 'session',      label: 'Session',        icon: 'logout'          },
    { id: 'danger',       label: 'Danger Zone',    icon: 'warning'         },
  ]

  function scrollTo(id) {
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f9fb' }}>
      <SideNav />

      <div className="flex-1 flex overflow-hidden">

        {/* Settings secondary nav */}
        <nav className="hidden md:flex w-56 flex-shrink-0 flex-col border-r overflow-y-auto custom-scroll bg-white"
          style={{ borderColor: 'rgba(197,198,206,0.15)' }}>
          <div className="px-4 pt-8 pb-4">
            <p className="text-[10px] font-black uppercase tracking-widest px-3 mb-3" style={{ color: '#8293b4' }}>Settings</p>
            <div className="space-y-0.5">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left hover:bg-[#f2f4f6]"
                  style={{ color: item.id === 'danger' ? '#93000a' : '#44474d' }}>
                  <span className="material-symbols-outlined text-[18px]"
                    style={{ color: item.id === 'danger' ? '#93000a' : '#8293b4' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-12">
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">

          <div className="space-y-6">

            {/* Account */}
            <Section id="settings-account" title="Account" subtitle="Your personal information and login details.">
              <Field label="Full Name">
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
              </Field>
              <Field label="Email Address" hint="Contact support to change your email.">
                <Input value={user?.email || ''} disabled />
              </Field>
              <Field label="Provider" hint="How you signed in.">
                <div className="flex items-center gap-2 mt-0.5">
                  {isGoogleUser
                    ? <><span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#4285F4' }}>google</span>
                       <span className="text-sm font-semibold" style={{ color: '#031631' }}>Google</span></>
                    : <><span className="material-symbols-outlined icon-filled text-[16px]" style={{ color: '#0e0099' }}>mail</span>
                       <span className="text-sm font-semibold" style={{ color: '#031631' }}>Email / Password</span></>
                  }
                </div>
              </Field>
              {accountError && (
                <p className="text-xs font-semibold mb-4" style={{ color: '#93000a' }}>{accountError}</p>
              )}
              <div className="pt-2">
                <SaveBtn onClick={handleSaveAccount} saving={accountSaving} saved={accountSaved} />
              </div>
            </Section>

            {/* Subscription */}
            <Section id="settings-subscription" title="Subscription" subtitle="Your current plan and usage.">
              <Field label="Current Plan">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white"
                    style={{ background: isPro ? 'linear-gradient(135deg, #031631, #0e0099)' : '#44474d' }}>
                    {planLabel}
                  </span>
                  {isPro && (
                    <span className="text-xs" style={{ color: '#75777e' }}>
                      {profile?.cancel_at_period_end 
                        ? `Pro ends ${new Date(profile?.current_period_end).toLocaleDateString()}`
                        : `Renews ${new Date(profile?.current_period_end).toLocaleDateString()}`
                      }
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Monthly Usage" hint="Resets at start of each billing cycle.">
                {/* Sessions */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold" style={{ color: '#031631' }}>Tailoring Sessions</span>
                    <span style={{ color: '#75777e' }}>{sessionsUsed} / {sessionsLimit}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#eceef0' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${Math.min(100, (sessionsUsed / sessionsLimit) * 100)}%`, 
                        background: 'linear-gradient(90deg, #0e0099, #2f2ebe)' 
                      }} />
                  </div>
                </div>
              </Field>
              {!isPro && (
                <Field label="Upgrade">
                  <div className="p-5 rounded-2xl border" style={{ borderColor: 'rgba(14,0,153,0.15)', backgroundColor: 'rgba(225,224,255,0.15)' }}>
                    <p className="font-bold mb-1" style={{ color: '#031631' }}>Unlock Unlimited Access</p>
                    <p className="text-sm mb-4" style={{ color: '#44474d' }}>
                      $9.99/month — 50 sessions, all templates, PDF export, priority AI.
                    </p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="px-5 py-2.5 text-white text-sm font-bold rounded-xl ai-glow-btn">
                      Upgrade to Pro →
                    </button>
                  </div>
                </Field>
              )}
              {isPro && (
                <Field label="Billing">
                  <button
                    onClick={handleManageBilling} disabled={portalLoading}
                    className="px-4 py-2 text-sm font-bold rounded-xl border transition-all hover:bg-[#f2f4f6] flex items-center justify-center gap-2"
                    style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631' }}>
                    {portalLoading ? <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> : null}
                    Manage Billing →
                  </button>
                </Field>
              )}
            </Section>

            {/* Security */}
            {!isGoogleUser && (
              <Section id="settings-security" title="Security" subtitle="Update your password.">
                <Field label="New Password" hint="Minimum 8 characters.">
                  <div className="space-y-3">
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
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
            <Section id="settings-preferences" title="Preferences" subtitle="Control how JobBlitz communicates with you.">
              <Field label="Email Notifications" hint="Receive tips, session summaries, and product updates.">
                <button
                  onClick={handleNotifToggle}
                  disabled={notifSaving}
                  className="relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ backgroundColor: emailNotifs ? '#0e0099' : '#c5c6ce' }}>
                  <span
                    className="inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 shadow-sm"
                    style={{ transform: emailNotifs ? 'translateX(24px)' : 'translateX(4px)' }}
                  />
                </button>
                {notifSaved && <span className="ml-3 text-xs font-bold" style={{ color: '#0e0099' }}>Saved ✓</span>}
              </Field>
            </Section>

            {/* Data & Privacy */}
            <Section id="settings-data" title="Data & Privacy" subtitle="Your data, your control.">
              <Field label="Export Your Data" hint="Download everything we have stored for your account.">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all hover:bg-[#f2f4f6]"
                  style={{ borderColor: 'rgba(197,198,206,0.4)', color: '#031631' }}>
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download JSON Export
                </button>
              </Field>
              <Field label="Privacy Policy">
                <p className="text-sm" style={{ color: '#44474d' }}>
                  Your data is encrypted at rest and never sold or shared with third parties.{' '}
                  <button className="font-bold underline" style={{ color: '#0e0099' }}
                    onClick={() => navigate('/privacy')}>
                    Read Privacy Policy
                  </button>
                </p>
              </Field>
            </Section>

            {/* Sign Out */}
            <Section id="settings-session" title="Session">
              <Field label="Sign Out" hint="You'll need to log in again to access your account.">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all hover:bg-[#ffdad6]"
                  style={{ borderColor: 'rgba(147,0,10,0.2)', color: '#93000a' }}>
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </Field>
            </Section>

            {/* Danger Zone */}
            <div id="settings-danger" className="rounded-2xl overflow-hidden border-2" style={{ borderColor: 'rgba(147,0,10,0.2)' }}>
              <div className="px-8 py-6 border-b" style={{ borderColor: 'rgba(147,0,10,0.1)', backgroundColor: 'rgba(255,218,214,0.15)' }}>
                <h2 className="font-extrabold text-lg" style={{ fontFamily: 'Manrope', color: '#93000a' }}>Danger Zone</h2>
                <p className="text-sm mt-0.5" style={{ color: '#44474d' }}>Irreversible actions. Proceed with caution.</p>
              </div>
              <div className="px-8 py-6 bg-white">
                <Field label="Delete Account" hint="Permanently delete your account and all associated data.">
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
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(3,22,49,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full" style={{ boxShadow: '0 24px 80px rgba(3,22,49,0.2)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
              style={{ backgroundColor: '#ffdad6' }}>
              <span className="material-symbols-outlined icon-filled text-[28px]" style={{ color: '#93000a' }}>warning</span>
            </div>
            <h3 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Delete Account?
            </h3>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#44474d' }}>
              This will permanently delete your account, master profile, all sessions, and every tailored resume. <strong>This cannot be undone.</strong>
            </p>
            <p className="text-xs font-bold mb-3" style={{ color: '#031631' }}>
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
                className="flex-1 py-3 text-sm font-bold rounded-xl transition-all disabled:opacity-40"
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
