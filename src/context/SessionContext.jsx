import { createContext, useContext, useState } from 'react'

/**
 * SessionContext — holds the active tailoring session results in memory
 * and localStorage so data flows between JobTailoring → Editor / CoverLetter / InterviewPrep
 */
const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [activeSession, setActiveSessionState] = useState(() => {
    try {
      const saved = localStorage.getItem('jb_active_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  function setActiveSession(data) {
    setActiveSessionState(data)
    if (data) {
      localStorage.setItem('jb_active_session', JSON.stringify(data))
    } else {
      localStorage.removeItem('jb_active_session')
    }
  }

  function clearSession() {
    setActiveSession(null)
  }

  return (
    <SessionContext.Provider value={{ activeSession, setActiveSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
