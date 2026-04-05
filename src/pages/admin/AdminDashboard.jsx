import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const SEVERITY_COLORS = {
  info: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.2)' },
  warn: { bg: 'rgba(245,158,11,0.1)', text: '#fbbf24', border: 'rgba(245,158,11,0.2)' },
  error: { bg: 'rgba(239,68,68,0.1)', text: '#f87171', border: 'rgba(239,68,68,0.2)' }
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, generations: 0, errors: 0, successRate: 100 })
  const [hotSpots, setHotSpots] = useState([])

  useEffect(() => {
    fetchData()
    
    // Subscribe to new logs
    const channel = supabase
      .channel('admin_logs_dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev].slice(0, 50))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch latest logs
      const { data: logData } = await supabase
        .from('system_logs')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .limit(20)
      
      setLogs(logData || [])

      // Basic Stats
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: genCount } = await supabase.from('system_logs').select('*', { count: 'exact', head: true }).eq('event_type', 'generation')
      const { count: errCount } = await supabase.from('system_logs').select('*', { count: 'exact', head: true }).eq('severity', 'error')

      setStats({
        users: userCount || 0,
        generations: genCount || 0,
        errors: errCount || 0,
        successRate: genCount > 0 ? Math.round(((genCount - errCount) / genCount) * 100) : 100
      })

      // Hot Spots (Group by message)
      const errorCounts = (logData || [])
        .filter(l => l.severity === 'error')
        .reduce((acc, l) => {
          acc[l.message] = (acc[l.message] || 0) + 1
          return acc
        }, {})
      
      const sortedHotSpots = Object.entries(errorCounts)
        .map(([msg, count]) => ({ msg, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setHotSpots(sortedHotSpots)
    } catch (err) {
      console.error('Admin data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Command Center</h2>
          <p className="text-slate-500 font-medium">Real-time health and system telemetry.</p>
        </div>
        <button 
           onClick={fetchData}
           disabled={loading}
           className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 transition-all shadow-lg"
        >
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users} icon="groups" color="#60a5fa" />
        <StatCard title="AI Generations" value={stats.generations} icon="auto_awesome" color="#818cf8" />
        <StatCard title="System Errors" value={stats.errors} icon="error" color="#f87171" />
        <StatCard title="Success Rate" value={`${stats.successRate}%`} icon="analytics" color={stats.successRate > 90 ? '#34d399' : '#f87171'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Hot Spots */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-400">local_fire_department</span>
            Anomalous Hot Spots
          </h3>
          <div className="space-y-3">
            {hotSpots.length === 0 ? (
              <p className="text-sm text-slate-600 italic py-4">No critical error patterns.</p>
            ) : (
              hotSpots.map((spot, i) => (
                <div key={i} className="group p-3 rounded-2xl bg-red-500/5 border border-red-500/10 transition-all hover:bg-red-500/10">
                  <p className="text-[11px] font-bold text-red-400/80 mb-1 truncate" title={spot.msg}>{spot.msg}</p>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black uppercase text-red-400 tracking-wider">Occurrence Density</span>
                     <span className="text-xs font-black text-white">{spot.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health View */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-400">insights</span>
            Event Throughput (Last 50 Logs)
          </h3>
          <div className="flex items-end gap-1.5 h-32 px-2">
            {Array.from({ length: 25 }).map((_, i) => {
              const slice = logs.slice(i * 2, (i + 1) * 2)
              const hasErr = slice.some(l => l.severity === 'error' || l.severity === 'critical')
              const height = slice.length > 0 ? Math.max(15, (slice.length / 2) * 100) : 8
              return (
                <div key={i} className="flex-1 rounded-t-lg transition-all hover:brightness-125 cursor-help"
                  style={{
                    backgroundColor: hasErr ? '#f87171' : '#3b82f6',
                    height: `${height}%`,
                    opacity: slice.length > 0 ? 0.6 : 0.2
                  }}
                  title={hasErr ? 'Contains Errors' : 'Healthy Segment'}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-4 px-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
             <span>Older History</span>
             <span>Current Pulse</span>
          </div>
        </div>
      </div>

      {/* Mini Event Stream */}
      <section className="rounded-3xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-800/20">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Real-time Event Stream</h3>
          <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-800/30 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800/60">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Context</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {logs.slice(0, 10).map(log => (
                <tr key={log.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-6 py-4 text-[10px] font-mono text-slate-500">
                    {new Date(log.created_at).toLocaleTimeString([], { hour12: false })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{log.event_type}</span>
                      <span className="text-[11px] font-bold text-slate-300">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-medium text-slate-400">
                    {log.profiles?.email || 'SYSTEM'}
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 truncate max-w-xs transition-colors group-hover:text-slate-300">
                    {log.message}
                  </td>
                  <td className="px-6 py-4">
                    <SeverityBadge severity={log.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="group p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl transition-all hover:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
          <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">Active</span>
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-3xl font-black text-white tracking-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}

function SeverityBadge({ severity }) {
  const styles = SEVERITY_COLORS[severity] || SEVERITY_COLORS.info
  return (
    <span className="text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded border" 
      style={{ backgroundColor: styles.bg, color: styles.text, borderColor: styles.border }}>
      {severity}
    </span>
  )
}
