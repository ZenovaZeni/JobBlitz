import { useState, useCallback } from 'react'
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
  { id: 1, label: 'Analyzing JD',            icon: 'search'      },
  { id: 2, label: 'Building match score',    icon: 'analytics'   },
  { id: 3, label: 'Tailoring resume',        icon: 'description' },
  { id: 4, label: 'Writing cover letter',    icon: 'mail'        },
  { id: 5, label: 'Generating interview prep', icon: 'psychology' },
]

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

  const hasProfile = masterProfile && (masterProfile.experience?.length > 0 || masterProfile.summary)

  // runStep signature: (stepId, sessionId?)
  // For retries the caller passes only stepId — sessionId is read from state.
  // For sequential recursive calls we pass sessionId explicitly to avoid needing
  // to re-read it from state across async boundaries.
  const runStep = useCallback(async (stepId, sessionId) => {
    setCurrentStep(stepId)
    setStepErrors(prev => ({ ...prev, [stepId]: null }))
    setError('')

    try {
      const currentSessionId = sessionId || activeSessionId

      if (stepId === 1) {
        const s = currentSessionId
          ? { id: currentSessionId }
          : await createSession({ company, role, jd_text: jdText })
        if (!currentSessionId) setActiveSessionId(s.id)
        return runStep(2, s.id)
      }

      if (stepId === 2) {
        const rawMatchData = await analyzeJobMatch({ masterProfile, jdText })
        const matchData = {
          match_score:    rawMatchData?.match_score    || 0,
          matched_skills: rawMatchData?.matched_skills || [],
          gaps:           rawMatchData?.gaps           || [],
          ats_keywords:   rawMatchData?.ats_keywords   || [],
          summary:        rawMatchData?.summary        || 'Analysis complete. Please review the key findings.',
        }
        await updateSession(currentSessionId, {
          match_score:    matchData.match_score,
          matched_skills: matchData.matched_skills,
          gaps:           matchData.gaps,
          ats_keywords:   matchData.ats_keywords,
        })
        setStepData(prev => ({ ...prev, matchData }))
        return runStep(3, currentSessionId)
      }

      if (stepId === 3) {
        const tailoredResume = await generateTailoredResume({
          masterProfile,
          jdText,
          matchData: stepData.matchData,
          company,
          role,
        })
        await saveResumeVersion({ sessionId: currentSessionId, title: `${role} — ${company}`, content: tailoredResume })
        setStepData(prev => ({ ...prev, tailoredResume }))
        return runStep(4, currentSessionId)
      }

      if (stepId === 4) {
        const coverLetterText = await generateCoverLetter({ masterProfile, jdText, company, role, tone: 'Professional' })
        await saveCoverLetter({ sessionId: currentSessionId, tone: 'Professional', content: coverLetterText })
        setStepData(prev => ({ ...prev, coverLetter: coverLetterText }))
        return runStep(5, currentSessionId)
      }

      if (stepId === 5) {
        const interviewData = await generateInterviewQuestions({ masterProfile, jdText, company, role })
        await saveInterviewPrep({ sessionId: currentSessionId, questions: interviewData.questions })

        const payload = {
          sessionId: currentSessionId,
          company,
          role,
          matchData:      stepData.matchData,
          tailoredResume: stepData.tailoredResume,
          coverLetter:    stepData.coverLetter,
          interviewData,
        }
        setActiveSession(payload)
        await updateUsage('tailor').catch(err => console.error('Usage sync failed:', err))
        setResults(payload)
        setPhase('results')
      }
    } catch (err) {
      console.error(`Step ${stepId} failed:`, err)
      if (err.message === 'SESSION_LIMIT_REACHED') {
        setShowUpgradeGate(true)
        setPhase('input')
        return
      }
      setStepErrors(prev => ({ ...prev, [stepId]: err.message || 'AI step failed' }))
      setError(err.message || 'Something went wrong. You can retry the failed step below.')
    }
  }, [company, role, jdText, masterProfile, activeSessionId, stepData,
      createSession, updateSession, saveResumeVersion, saveCoverLetter,
      saveInterviewPrep, setActiveSession, updateUsage])

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
    setActiveSessionId(null)
    setPhase('analyzing')
    runStep(1)
  }, [company, role, jdText, hasProfile, checkAccess, runStep])

  const startFromSession = useCallback((sessionObj) => {
    if (!sessionObj) return

    setCompany(sessionObj.company || '')
    setRole(sessionObj.role || '')
    setJdText(sessionObj.jd_text || '')
    
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
