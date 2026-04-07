import { useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSession } from '../context/SessionContext'
import { useMasterProfile } from './useMasterProfile'
import { useSessions } from './useSessions'
import {
  analyzeJobMatch,
  generateTailoredResume,
  generateCoverLetter,
  generateInterviewQuestions,
} from '../lib/openai'

export const TAILOR_STEPS = [
  { id: 1, label: 'Analyzing JD',              icon: 'search'      },
  { id: 2, label: 'Building match score',      icon: 'analytics'   },
  { id: 3, label: 'Tailoring resume',          icon: 'description' },
  { id: 4, label: 'Writing cover letter',      icon: 'mail'        },
  { id: 5, label: 'Generating interview prep', icon: 'psychology'  },
]

// ── Map API error codes to calm user-facing messages ─────────────────────────
function toUserMessage(err) {
  const code = err?.code || err?.message
  switch (code) {
    case 'SESSION_LIMIT_REACHED': return null // handled separately
    case 'AUTHENTICATION_FAILED':
    case 'UNAUTHORIZED':
    case 'Not authenticated':
      return 'Authentication issue — please refresh the page and try again.'
    case 'AI_NOT_CONFIGURED':
      return 'The AI service isn\'t configured. Please contact support.'
    default:
      return err?.message || 'Something went wrong. Use the Retry button to continue.'
  }
}

export function useTailorEngine() {
  const { profile, isPro, updateUsage, checkAccess, sessionsLeft } = useAuth()
  const { setActiveSession } = useSession()
  const { profile: masterProfile, loading: profileLoading } = useMasterProfile()
  const { createSession, updateSession, saveResumeVersion, saveCoverLetter, saveInterviewPrep } = useSessions()

  const [company, setCompany]               = useState('')
  const [role, setRole]                     = useState('')
  const [jdText, setJdText]                 = useState('')
  const [phase, setPhase]                   = useState('input')
  const [currentStep, setCurrentStep]       = useState(0)
  const [error, setError]                   = useState('')
  const [stepErrors, setStepErrors]         = useState({})
  const [results, setResults]               = useState(null)
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [stepData, setStepData]             = useState({})
  const [showUpgradeGate, setShowUpgradeGate] = useState(false)

  // Ref for accumulating pipeline data across recursive runStep calls.
  // Using a ref avoids stale-closure issues: setStepData schedules a render,
  // but the next recursive call needs the data immediately in the same tick.
  const stepAccRef = useRef({})

  const hasProfile = masterProfile && (masterProfile.experience?.length > 0 || masterProfile.summary)

  // ── runStep ──────────────────────────────────────────────────────────────────
  // sessionId param rules:
  //   - Pass `null` explicitly for a fresh run (step 1) so stale closure value is ignored
  //   - Pass explicit ID for all recursive calls (steps 2→5)
  //   - Pass `undefined` (omit) for user-initiated retries — falls back to activeSessionId state
  const runStep = useCallback(async (stepId, sessionId) => {
    // Distinguish "explicitly passed null/id" from "not passed at all"
    const currentSessionId = sessionId !== undefined ? sessionId : activeSessionId

    setCurrentStep(stepId)
    setStepErrors(prev => ({ ...prev, [stepId]: null }))
    setError('')

    try {

      // ── Step 1: Create (or resume) session ──────────────────────────────────
      if (stepId === 1) {
        const s = currentSessionId
          ? { id: currentSessionId }
          : await createSession({ company, role, jd_text: jdText, packet_status: 'generating' })

        if (!currentSessionId) {
          setActiveSessionId(s.id)
        } else {
          await updateSession(s.id, { packet_status: 'generating' })
        }
        return runStep(2, s.id)
      }

      // ── Step 2: Match analysis ──────────────────────────────────────────────
      if (stepId === 2) {
        const rawMatchData = await analyzeJobMatch({ masterProfile, jdText })
        const matchData = {
          match_score:    rawMatchData?.match_score    || 0,
          matched_skills: rawMatchData?.matched_skills || [],
          gaps:           rawMatchData?.gaps           || [],
          ats_keywords:   rawMatchData?.ats_keywords   || [],
          summary:        rawMatchData?.summary        || 'Analysis complete.',
        }
        await updateSession(currentSessionId, {
          match_score:    matchData.match_score,
          matched_skills: matchData.matched_skills,
          gaps:           matchData.gaps,
          ats_keywords:   matchData.ats_keywords,
        })
        // Write to ref first — the recursive call below reads from the ref,
        // not from React state (which won't have flushed yet).
        stepAccRef.current = { ...stepAccRef.current, matchData }
        setStepData({ ...stepAccRef.current })
        return runStep(3, currentSessionId)
      }

      // ── Step 3: Tailor resume ───────────────────────────────────────────────
      if (stepId === 3) {
        const tailoredResume = await generateTailoredResume({
          masterProfile,
          jdText,
          matchData: stepAccRef.current.matchData,
          company,
          role,
        })
        await saveResumeVersion({
          sessionId: currentSessionId,
          title: `${role} — ${company}`,
          content: tailoredResume,
        })
        stepAccRef.current = { ...stepAccRef.current, tailoredResume }
        setStepData({ ...stepAccRef.current })
        return runStep(4, currentSessionId)
      }

      // ── Step 4: Cover letter ────────────────────────────────────────────────
      if (stepId === 4) {
        const coverLetterText = await generateCoverLetter({
          masterProfile,
          jdText,
          company,
          role,
          tone: 'Professional',
        })
        await saveCoverLetter({
          sessionId: currentSessionId,
          tone: 'Professional',
          content: coverLetterText,
        })
        stepAccRef.current = { ...stepAccRef.current, coverLetter: coverLetterText }
        setStepData({ ...stepAccRef.current })
        return runStep(5, currentSessionId)
      }

      // ── Step 5: Interview prep + finish ────────────────────────────────────
      if (stepId === 5) {
        const interviewData = await generateInterviewQuestions({
          masterProfile,
          jdText,
          company,
          role,
        })
        await saveInterviewPrep({ sessionId: currentSessionId, questions: interviewData.questions })

        const acc = stepAccRef.current
        const payload = {
          sessionId:      currentSessionId,
          company,
          role,
          matchData:      acc.matchData,
          tailoredResume: acc.tailoredResume,
          coverLetter:    acc.coverLetter,
          interviewData,
        }
        setActiveSession(payload)
        await updateSession(currentSessionId, { packet_status: 'ready' })
        await updateUsage('tailor').catch(err => console.error('[engine] Usage sync failed:', err))
        setResults(payload)
        setPhase('results')
      }

    } catch (err) {
      console.error(`[engine] Step ${stepId} failed:`, err)

      if (err.message === 'SESSION_LIMIT_REACHED') {
        setShowUpgradeGate(true)
        setCurrentStep(0)
        setPhase('input')
        return
      }

      const userMsg = toUserMessage(err)
      setStepErrors(prev => ({ ...prev, [stepId]: userMsg || err.message }))
      setError(userMsg || err.message)

      // Mark the session as failed/partial — fire and forget
      if (currentSessionId) {
        const newStatus = stepId <= 2 ? 'failed' : 'partial'
        updateSession(currentSessionId, { packet_status: newStatus }).catch(() => {})
      }
    }

  // stepData intentionally omitted — reads go through stepAccRef to avoid stale closure.
  }, [company, role, jdText, masterProfile, activeSessionId,
      createSession, updateSession, saveResumeVersion, saveCoverLetter,
      saveInterviewPrep, setActiveSession, updateUsage])

  // ── handleAnalyze ─────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(() => {
    if (!company.trim() || !role.trim() || !jdText.trim()) {
      setError('Please fill in the company, role, and job description.')
      return
    }
    if (!hasProfile) {
      setError('Please build your Master Profile first — I need your experience to tailor your resume.')
      return
    }
    const access = checkAccess('tailor')
    if (!access.allowed) {
      setShowUpgradeGate(true)
      return
    }
    setError('')
    setStepErrors({})
    setStepData({})
    stepAccRef.current = {}      // reset accumulated pipeline data
    setActiveSessionId(null)
    setPhase('analyzing')
    runStep(1, null)             // explicit null = always create a new session
  }, [company, role, jdText, hasProfile, checkAccess, runStep])

  // ── startFromSession (retry existing) ────────────────────────────────────
  const startFromSession = useCallback((sessionObj) => {
    if (!sessionObj) return

    setCompany(sessionObj.company || '')
    setRole(sessionObj.role || '')
    setJdText(sessionObj.jd_text || '')

    if (!hasProfile) {
      setError('Please build your Master Profile first.')
      return
    }
    const access = checkAccess('tailor')
    if (!access.allowed) {
      setShowUpgradeGate(true)
      return
    }

    setError('')
    setStepErrors({})
    setStepData({})
    stepAccRef.current = {}      // reset accumulated pipeline data
    setActiveSessionId(sessionObj.id)
    setPhase('analyzing')
    runStep(2, sessionObj.id)
  }, [hasProfile, checkAccess, runStep])

  return {
    company, setCompany,
    role, setRole,
    jdText, setJdText,
    phase, setPhase,
    currentStep,
    error,
    stepErrors,
    results, setResults,
    stepData,
    showUpgradeGate, setShowUpgradeGate,
    masterProfile,
    profileLoading,
    hasProfile,
    profile,
    isPro,
    sessionsLeft,
    handleAnalyze,
    runStep,
    startFromSession,
  }
}
