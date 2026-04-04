import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * UserManager
 * 
 * Provides a management interface for user accounts, tiers, and usage monitoring.
 */
export default function UserManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error) setUsers(data || [])
    } catch (err) {
      console.error('[UserManager] Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">User Manager</h2>
          <p className="text-slate-500 font-medium">Manage accounts, tiers, and roles.</p>
        </div>
        <button 
           onClick={fetchUsers}
           disabled={loading}
           className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 transition-all shadow-lg"
        >
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="max-w-md p-2 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
        <div className="relative">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
           <input 
             type="text" 
             placeholder="Search users by name, email, or ID..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-800/50 border border-transparent focus:border-blue-500/50 focus:bg-slate-800 outline-none transition-all text-sm font-medium"
           />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
             <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-800/60">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status & Tier</th>
                <th className="px-6 py-4">Usage (MTD)</th>
                <th className="px-6 py-4">App Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-8 h-12 bg-slate-800/5 rounded animate-pulse"></td>
                  </tr>
                ))
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                          {u.full_name?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                       </div>
                       <div className="text-xs">
                          <p className="text-slate-200 font-bold text-sm tracking-tight">{u.full_name || 'Anonymous User'}</p>
                          <p className="text-slate-500 font-medium">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              u.plan_tier === 'pro' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                           }`}>
                              {u.plan_tier}
                           </span>
                           {u.subscription_status === 'active' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                           )}
                        </div>
                        <span className={`text-[10px] font-bold ${
                           u.subscription_status === 'active' ? 'text-emerald-500/70' : 'text-slate-500'
                        }`}>
                           {u.subscription_status}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="text-[11px] font-medium text-slate-400 space-y-0.5">
                        <p><span className="text-slate-200 font-bold">{u.tailors_used || 0}</span> Resumes</p>
                        <p><span className="text-slate-200 font-bold">{u.cover_letters_used || 0}</span> Letters</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${
                        u.app_role === 'admin' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-slate-800/50 text-slate-500 border-slate-700/50'
                     }`}>
                        {u.app_role || 'user'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 tabular-nums">
                     {new Date(u.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right pr-6">
                     <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100" title="View details">
                           <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all" title="More options">
                           <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-slate-700 text-4xl">search_off</span>
                      <p className="text-slate-500 font-medium italic">No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
