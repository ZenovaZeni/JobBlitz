import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const EVENT_TYPES = ['auth', 'generation', 'billing', 'session', 'system', 'admin']
const SEVERITIES = ['info', 'warning', 'error', 'critical']

/**
 * LogViewer
 * 
 * Provides a searchable, filterable table for audit logs.
 */
export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    event_type: 'all',
    severity: 'all',
    search: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [filters.event_type, filters.severity])

  async function fetchLogs() {
    setLoading(true)
    try {
      let query = supabase
        .from('system_logs')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filters.event_type !== 'all') query = query.eq('event_type', filters.event_type)
      if (filters.severity !== 'all') query = query.eq('severity', filters.severity)

      const { data, error } = await query
      if (!error) setLogs(data || [])
    } catch (err) {
      console.error('[LogViewer] Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => 
    log.message?.toLowerCase().includes(filters.search.toLowerCase()) ||
    log.action?.toLowerCase().includes(filters.search.toLowerCase()) ||
    log.profiles?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(filters.search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">System Logs</h2>
          <p className="text-slate-500 font-medium">Audit trail and diagnostic events.</p>
        </div>
        <button 
           onClick={fetchLogs}
           disabled={loading}
           className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 transition-all shadow-lg"
        >
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </header>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
        <div className="md:col-span-2">
          <div className="relative">
             <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">search</span>
             <input 
               type="text" 
               placeholder="Search logs, actions, or users..."
               value={filters.search}
               onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
               className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-800/50 border border-transparent focus:border-blue-500/50 focus:bg-slate-800 outline-none transition-all text-sm font-medium"
             />
          </div>
        </div>
        
        <select 
          value={filters.event_type}
          onChange={(e) => setFilters(f => ({ ...f, event_type: e.target.value }))}
          className="px-4 py-3 rounded-2xl bg-slate-800/50 border border-transparent focus:border-blue-500/50 outline-none text-sm font-medium transition-all text-slate-300"
        >
          <option value="all">All Events</option>
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        <select 
          value={filters.severity}
          onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))}
          className="px-4 py-3 rounded-2xl bg-slate-800/50 border border-transparent focus:border-blue-500/50 outline-none text-sm font-medium transition-all text-slate-300"
        >
          <option value="all">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-800/60">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Event & Action</th>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Message Context</th>
                <th className="px-6 py-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5" className="px-6 py-6 h-12 bg-slate-800/5 rounded animate-pulse"></td>
                  </tr>
                ))
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-6 py-4 text-[11px] tabular-nums text-slate-500 font-medium">
                    {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">{log.event_type}</span>
                      <span className="text-sm font-bold text-slate-200">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      {log.profiles ? (
                        <>
                          <p className="text-slate-300 font-bold">{log.profiles.full_name || 'Anonymous'}</p>
                          <p className="text-slate-500 font-medium">{log.profiles.email}</p>
                        </>
                      ) : (
                        <p className="text-slate-500 italic font-medium">System / Internal</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">
                      {log.message}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={log.severity} />
                  </td>
                </tr>
              ))}
              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-slate-700 text-4xl">inventory_2</span>
                      <p className="text-slate-500 font-medium italic">No logs found matching your filters.</p>
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

function SeverityBadge({ severity }) {
  const styles = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    critical: 'bg-red-600/90 text-white border-red-500 font-black shadow-lg shadow-red-900/20'
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold border tracking-[0.1em] ${styles[severity] || styles.info}`}>
      {severity}
    </span>
  )
}
