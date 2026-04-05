import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [id])

  async function fetchUser() {
    setLoading(true)
    try {
      // Fetch user profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (profileErr) throw profileErr
      setUser(profile)

      // Fetch user logs
      const { data: logData } = await supabase
        .from('system_logs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(50)
      
      setLogs(logData || [])
    } catch (err) {
      console.error('Error fetching user:', err)
      // If user not found, maybe show error or redirect
    } finally {
      setLoading(false)
    }
  }

  async function updateTier(newTier) {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ plan_tier: newTier })
        .eq('id', id)
      
      if (error) throw error
      
      // Log the admin action
      await supabase.from('system_logs').insert({
        event_type: 'admin',
        action: 'subscription_updated',
        severity: 'info',
        message: `Admin manually updated user tier to ${newTier}`,
        user_id: id,
        metadata: { admin_action: true, new_tier: newTier }
      })

      setUser(prev => ({ ...prev, plan_tier: newTier }))
    } catch (err) {
      alert('Failed to update tier: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  async function adjustLimit(field, amount) {
    setUpdating(true)
    try {
      const newValue = (user[field] || 0) + amount
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: newValue })
        .eq('id', id)
      
      if (error) throw error

      setUser(prev => ({ ...prev, [field]: newValue }))
    } catch (err) {
      alert('Failed to adjust limit: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-500 font-bold">
      <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
      Loading User Intelligence...
    </div>
  )

  if (!user) return (
    <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
      <h2 className="text-2xl font-black text-white mb-2">User Not Found</h2>
      <p className="text-slate-500 mb-6 font-medium">The requested identifier does not exist in the platform registry.</p>
      <button onClick={() => navigate('/admin/users')} className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">
        Back to Directory
      </button>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Breadcrumbs */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/users')} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{user.full_name || 'Anonymous User'}</h2>
            <p className="text-slate-500 font-mono text-xs">{user.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            user.plan_tier === 'pro' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-500/10' : 'bg-slate-700/30 text-slate-500 border-slate-800'
          }`}>
            {user.plan_tier === 'pro' ? 'PRO TIER' : 'FREE TIER'}
          </span>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            user.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {user.subscription_status}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <section className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
             <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800/50">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl font-black text-slate-500">
                 {user.full_name?.[0] || '?'}
               </div>
               <div>
                 <p className="text-white font-bold">{user.email}</p>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Primary Correspondence</p>
               </div>
             </div>

             <div className="space-y-4">
                <InfoRow label="Access Level" value={user.app_role} mono />
                <InfoRow label="Joined On" value={new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })} />
                <InfoRow label="Stripe ID" value={user.stripe_customer_id || 'unlinked'} mono highlight={!!user.stripe_customer_id} />
             </div>
          </section>

          {/* Quick Actions */}
          <section className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-blue-400">tune</span>
              Operator Controls
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subscription State</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => updateTier('free')}
                    disabled={updating || user.plan_tier === 'free'}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      user.plan_tier === 'free' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    Set Free
                  </button>
                  <button 
                    onClick={() => updateTier('pro')}
                    disabled={updating || user.plan_tier === 'pro'}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      user.plan_tier === 'pro' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30'
                    }`}
                  >
                    Set Pro
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Session Quota</p>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                  <div>
                    <p className="text-xl font-black text-white">{user.sessions_limit}</p>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-0.5">Total Allocation</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => adjustLimit('sessions_limit', -1)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all">
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <button onClick={() => adjustLimit('sessions_limit', 1)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all">
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Usage & activity */}
        <div className="lg:col-span-2 space-y-8">
           {/* Metric Dashboard */}
           <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <UsageBlock label="Sessions Used" current={user.sessions_used} total={user.sessions_limit} color="#60a5fa" />
              <UsageBlock label="Job Tailors" current={user.tailors_used} total="--" color="#818cf8" />
              <UsageBlock label="Cover Letters" current={user.cover_letters_used} total="--" color="#c084fc" />
           </div>

           {/* Activity Stream */}
           <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-800/20">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Activity Intelligence</h3>
                <span className="text-[10px] font-bold text-slate-500">LAST 50 EVENTS</span>
              </div>
              <div className="divide-y divide-slate-800/40">
                {logs.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-slate-600 italic">No activity recorded for this persona.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className="p-4 flex gap-4 hover:bg-slate-800/20 transition-all">
                      <div className={`mt-1 p-1.5 rounded-lg border ${
                         log.severity === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                         log.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                         'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {log.severity === 'error' ? 'error' : log.severity === 'warning' ? 'warning' : 'info'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                           <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{log.action || log.event_type}</p>
                           <span className="text-[9px] font-mono text-slate-600">{new Date(log.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">{log.message}</p>
                        {log.payload && Object.keys(log.payload).length > 0 && (
                          <pre className="mt-3 p-3 rounded-xl bg-black/40 border border-slate-800 text-[10px] text-emerald-500/80 font-mono overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, mono = false, highlight = false }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-bold ${mono ? 'font-mono' : ''} ${highlight ? 'text-blue-400' : 'text-slate-300'}`}>
        {value}
      </span>
    </div>
  )
}

function UsageBlock({ label, current, total, color }) {
  const pct = typeof total === 'number' ? Math.min(100, (current / total) * 100) : 0
  
  return (
    <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-end justify-between mb-3">
        <h4 className="text-2xl font-black text-white tracking-tight">{current}</h4>
        <span className="text-xs font-bold text-slate-600">/ {total}</span>
      </div>
      {typeof total === 'number' && (
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  )
}
