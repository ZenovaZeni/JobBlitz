import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import SideNav from '../../components/SideNav'

const SEVERITY_COLORS = {
  info: { bg: '#e8f0fe', text: '#1967d2' },
  warn: { bg: '#fff4e5', text: '#663c00' },
  error: { bg: '#fce8e6', text: '#c5221f' }
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
      .channel('admin_logs')
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
        .limit(50)
      
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
    <div className="flex min-h-screen bg-[#f7f9fb]">
      <SideNav />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Manrope', color: '#031631' }}>
              Command Center
            </h1>
            <p className="text-sm text-[#5c6d8c] mt-1">Operational observability and system health.</p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Users" value={stats.users} icon="groups" color="#0e0099" />
            <StatCard title="AI Generations" value={stats.generations} icon="auto_awesome" color="#1967d2" />
            <StatCard title="System Errors" value={stats.errors} icon="error" color="#c5221f" />
            <StatCard title="Success Rate" value={`${stats.successRate}%`} icon="analytics" color={stats.successRate > 90 ? '#0d652d' : '#c5221f'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hot Spots */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#eceef0] p-6">
              <h2 className="font-bold text-[#031631] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#c5221f]">local_fire_department</span>
                Error Hot Spots
              </h2>
              <div className="space-y-3">
                {hotSpots.length === 0 ? (
                  <p className="text-sm text-[#5c6d8c] italic py-4">No active error patterns detected.</p>
                ) : (
                  hotSpots.map((spot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#fce8e610] border border-[#fce8e6]">
                      <span className="text-xs font-bold text-[#c5221f] truncate max-w-[80%]" title={spot.msg}>
                        {spot.msg}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-[#c5221f] text-white px-2 py-0.5 rounded-full">
                        {spot.count} Hits
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Health Chart (Visual Placeholder/Simulation) */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#eceef0] p-6">
               <h2 className="font-bold text-[#031631] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0e0099]">insights</span>
                System Health (Last 50 Events)
              </h2>
              <div className="flex items-end gap-2 h-32 px-4">
                {/* Visualizing success vs error density in the last 50 logs */}
                {Array.from({ length: 15 }).map((_, i) => {
                  const slice = logs.slice(i * 3, (i + 1) * 3)
                  const hasErr = slice.some(l => l.severity === 'error')
                  const height = Math.max(20, Math.random() * 80 + 20) // Simulated trend for visual polish
                  return (
                    <div key={i} className="flex-1 rounded-t-md transition-all hover:scale-110" 
                      style={{ 
                        backgroundColor: hasErr ? '#c5221f' : '#e8f0fe',
                        height: `${height}%`,
                        opacity: 0.8
                      }} 
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-3 px-2 text-[9px] font-black uppercase tracking-widest text-[#8293b4]">
                 <span>Chronological History</span>
                 <span>Latest</span>
              </div>
            </div>
          </div>

          {/* Log Stream */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#eceef0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eceef0] flex justify-between items-center bg-[#fcfdfe]">
              <h2 className="font-bold text-[#031631]">Real-time Event Stream</h2>
              <button 
                onClick={fetchData}
                className="text-xs font-bold text-[#0e0099] flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f7f9fb] text-[11px] uppercase tracking-wider font-bold text-[#5c6d8c]">
                  <tr>
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Event</th>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {loading && logs.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-[#5c6d8c]">Initializing secure connection...</td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-[#5c6d8c]">No system logs found.</td></tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-[#fcfdfe] transition-colors">
                        <td className="px-6 py-4 text-[11px] text-[#75777e] font-mono">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                            {log.event_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <SeverityBadge severity={log.severity} />
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-[#031631]">
                          {log.profiles?.email || 'System'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-[#1967d2]">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#44474d] max-w-xs truncate" title={log.message}>
                          {log.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#eceef0] shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold text-[#5c6d8c] uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-[#031631]">{value.toLocaleString()}</p>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }) {
  const styles = SEVERITY_COLORS[severity] || SEVERITY_COLORS.info
  return (
    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" 
      style={{ backgroundColor: styles.bg, color: styles.text }}>
      {severity}
    </span>
  )
}
