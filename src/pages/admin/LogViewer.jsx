import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const EVENT_TYPES = ['auth', 'generation', 'billing', 'session', 'system', 'admin']
const SEVERITIES = ['info', 'warning', 'error', 'critical']

/**
 * LogViewer
 * 
 * Provides a searchable, filterable table for audit logs with detailed JSON inspection.
 */
export default function LogViewer() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)
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
                <th className="px-6 py-4 text-right pr-6">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-6 py-6 h-12 bg-slate-800/5 rounded animate-pulse"></td>
                  </tr>
                ))
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-500/5 transition-colors group cursor-pointer" onClick={() => setSelectedLog(log)}>
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
                  <td className="px-6 py-4 text-right pr-6">
                    <button className="p-2 rounded-lg text-slate-500 group-hover:text-white group-hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-8 py-6 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Event Context</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Telemetry Payload Breakdown</p>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                {/* ID and Action */}
                <div className="flex flex-wrap gap-3">
                   <div className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-slate-400">
                     ID: {selectedLog.id}
                   </div>
                   <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase text-blue-400 tracking-wider">
                     {selectedLog.action}
                   </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 text-sm text-slate-300 leading-relaxed italic">
                  "{selectedLog.message}"
                </div>

                {/* JSON Blocks */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Primary Payload</h4>
                    <pre className="p-5 rounded-2xl bg-black/60 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.payload || {}, null, 2)}
                    </pre>
                  </div>

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Diagnostic Metadata</h4>
                      <pre className="p-5 rounded-2xl bg-black/60 border border-slate-800 text-[11px] text-blue-400 font-mono overflow-x-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-8 py-5 bg-slate-950/50 border-t border-slate-800 text-right">
                <button onClick={() => setSelectedLog(null)} className="px-6 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-700 transition-all">
                  Close Inspector
                </button>
              </div>
           </div>
        </div>
      )}
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
