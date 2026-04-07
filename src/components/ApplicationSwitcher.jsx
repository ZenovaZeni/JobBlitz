import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'

/**
 * ApplicationSwitcher — searchable command-palette overlay for quickly opening
 * any saved application. Trigger externally via the `open` prop.
 *
 * Backend contract: reads from useSessions() which returns:
 *   session.id, session.company, session.role, session.created_at, session.match_data
 */
export default function ApplicationSwitcher({ open, onClose }) {
  const navigate = useNavigate()
  const { sessions, loading } = useSessions()
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const filtered = sessions.filter(s => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      s.company?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    )
  })

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset cursor when filtered results change
  useEffect(() => {
    setCursor(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const openSession = useCallback((id) => {
    navigate(`/app/session/${id}`)
    onClose()
  }, [navigate, onClose])

  const handleKeyDown = useCallback((e) => {
    if (!open) return
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor(c => Math.min(c + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor(c => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && filtered[cursor]) {
      openSession(filtered[cursor].id)
    }
  }, [open, filtered, cursor, onClose, openSession])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
      style={{ backgroundColor: 'rgba(3,22,49,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-slide-in"
        style={{ border: '1px solid rgba(197,198,206,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
          <span className="material-symbols-outlined text-[20px] flex-shrink-0" style={{ color: '#8293b4' }}>search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search applications by role or company..."
            className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
            style={{ color: '#031631' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-[#f2f4f6] transition-colors flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]" style={{ color: '#8293b4' }}>close</span>
            </button>
          )}
          <kbd className="hidden sm:flex items-center px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: '#f2f4f6', color: '#8293b4' }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto custom-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-[#eceef0] border-t-[#0e0099] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="material-symbols-outlined text-[32px]" style={{ color: '#c5c6ce' }}>
                {sessions.length === 0 ? 'inbox' : 'search_off'}
              </span>
              <p className="text-sm font-semibold" style={{ color: '#8293b4' }}>
                {sessions.length === 0
                  ? 'No applications yet'
                  : `No results for "${query}"`}
              </p>
              {sessions.length === 0 && (
                <button
                  onClick={() => { navigate('/app/tailor'); onClose() }}
                  className="mt-1 px-5 py-2 rounded-xl text-white text-xs font-bold ai-glow-btn">
                  Build Your First Application
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="px-5 pt-3 pb-1">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#c5c6ce' }}>
                  {query ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : 'Recent Applications'}
                </span>
              </div>
              <ul className="pb-2">
                {filtered.map((s, i) => {
                  const score = s.match_data?.match_score
                  const date = new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  const isActive = i === cursor
                  return (
                    <li key={s.id} data-idx={i}>
                      <button
                        onClick={() => openSession(s.id)}
                        onMouseEnter={() => setCursor(i)}
                        className="w-full flex items-center gap-4 px-5 py-3 transition-colors text-left"
                        style={{ backgroundColor: isActive ? '#f7f9fb' : 'transparent' }}
                      >
                        {/* Icon */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: isActive ? '#031631' : '#f2f4f6' }}>
                          <span className="material-symbols-outlined text-[16px]"
                            style={{ color: isActive ? 'white' : '#8293b4' }}>work</span>
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: '#031631' }}>{s.role || 'Untitled Role'}</p>
                          <p className="text-[11px] font-semibold truncate" style={{ color: '#8293b4' }}>
                            {s.company || 'Unknown Company'} · {date}
                          </p>
                        </div>

                        {/* Match badge */}
                        {score && (
                          <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                            style={{ backgroundColor: '#e1e0ff', color: '#0e0099' }}>
                            {score}%
                          </span>
                        )}

                        {/* Arrow */}
                        <span className="material-symbols-outlined text-[16px] flex-shrink-0"
                          style={{ color: isActive ? '#0e0099' : '#c5c6ce' }}>
                          arrow_forward
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(197,198,206,0.15)', backgroundColor: '#fafbfc' }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#c5c6ce' }}>
              <kbd className="px-1.5 py-0.5 rounded bg-[#eceef0] font-mono">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#c5c6ce' }}>
              <kbd className="px-1.5 py-0.5 rounded bg-[#eceef0] font-mono">↵</kbd> open
            </span>
          </div>
          <button
            onClick={() => { navigate('/app/tailor'); onClose() }}
            className="flex items-center gap-1.5 text-[11px] font-bold hover:opacity-70 transition-opacity"
            style={{ color: '#0e0099' }}>
            <span className="material-symbols-outlined text-[14px]">add</span>
            New Application
          </button>
        </div>
      </div>
    </div>
  )
}
