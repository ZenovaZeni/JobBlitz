/**
 * OpenAI GPT-4o mini API wrapper
 * All calls are proxied through a Supabase Edge Function to keep the API key server-side.
 */

import { supabase } from './supabase'
import { logger } from './logger'

/**
 * Calls our Supabase Edge Function to proxy OpenAI requests.
 * Includes a retry mechanism (up to 2 retries) for better stability.
 */
export async function callAI(messages, options = {}, retryCount = 0) {
  const MAX_RETRIES = 2
  const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff (1s, 2s)

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy`

    const res = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ messages, options }),
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      
      // If limit reached (403), stop retrying
      if (res.status === 403) {
        throw Object.assign(new Error('SESSION_LIMIT_REACHED'), { code: 'SESSION_LIMIT_REACHED' })
      }
      
      // If server error or rate limit and we have retries left, wait and retry
      if ((res.status >= 500 || res.status === 429) && retryCount < MAX_RETRIES) {
        console.warn(`AI request failed (${res.status}). Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
        await new Promise(r => setTimeout(r, delay))
        return callAI(messages, options, retryCount + 1)
      }

      await logger.error('generation', 'callAI', `AI request failed: ${res.status}`, {
        status: res.status,
        error: err,
        retry_count: retryCount
      }, user?.id)

      throw new Error(err?.error || `AI request failed (${res.status})`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? data.content ?? ''

    // Log successful generation
    await logger.info('generation', 'callAI', 'AI content generated successfully', {
      tokens: data.usage?.total_tokens,
      model: data.model,
      retry_count: retryCount
    }, user?.id)

    if (options.json) {
      try {
        return typeof content === 'string' ? JSON.parse(content) : content
      } catch { 
        await logger.error('generation', 'parse_error', 'AI returned invalid JSON', { content }, user?.id)
        throw new Error('AI returned invalid JSON') 
      }
    }
    return content
  } catch (error) {
    // If it's a non-retryable error (limit, auth), throw it
    if (error.code === 'SESSION_LIMIT_REACHED' || error.message === 'Not authenticated') {
      throw error
    }

    // Generic retry for other errors (network, timeout)
    if (retryCount < MAX_RETRIES) {
      console.warn(`AI request error: ${error.message}. Retrying... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
      await new Promise(r => setTimeout(r, delay))
      return callAI(messages, options, retryCount + 1)
    }

    throw error
  }
}

// =============================================
// PROMPT 1: Analyze job description vs profile
// =============================================
export async function analyzeJobMatch({ masterProfile, jdText }) {
  const profileSummary = JSON.stringify({
    summary: masterProfile.summary,
    experience: masterProfile.experience,
    skills: masterProfile.skills,
  })

  return callAI([
    {
      role: 'system',
      content: `You are a senior career coach and ATS expert. Analyze how well a candidate's profile matches a job description. Be brutally honest but constructive. Return a JSON object.`,
    },
    {
      role: 'user',
      content: `
Candidate Profile:
${profileSummary}

Job Description:
${jdText}

Return a JSON object with these exact keys:
{
  "match_score": number (0-100),
  "matched_skills": string[] (skills/experiences that match),
  "gaps": [{ "label": string, "severity": "high"|"medium"|"low", "suggestion": string }],
  "ats_keywords": string[] (important keywords from JD not yet in profile),
  "summary": string (2-3 sentence honest assessment)
}`,
    },
  ], { json: true, maxTokens: 1200 })
}

// =============================================
// PROMPT 2: Generate tailored resume content
// =============================================
export async function generateTailoredResume({ masterProfile, jdText, matchData, company, role }) {
  const positioningContext = [
    masterProfile.positioning ? `Candidate positioning statement: ${masterProfile.positioning}` : '',
    masterProfile.career_goals?.target_roles ? `Target roles: ${masterProfile.career_goals.target_roles}` : '',
    masterProfile.career_goals?.short_term ? `Short-term career goal: ${masterProfile.career_goals.short_term}` : '',
  ].filter(Boolean).join('\n')

  return callAI([
    {
      role: 'system',
      content: `You are an expert resume writer specializing in ATS optimization and impact-driven bullet points. You rewrite resume content to strongly target a specific job description without fabricating experience. Return a JSON object.`,
    },
    {
      role: 'user',
      content: `
Master Profile:
${JSON.stringify(masterProfile)}

Target Job: ${role} at ${company}
Job Description:
${jdText}

ATS Keywords to weave in naturally: ${matchData?.ats_keywords?.join(', ')}
${positioningContext ? `\nCandidate context (use to shape the summary and framing):\n${positioningContext}` : ''}

Rewrite the resume to maximize match for this specific role.
Return JSON with these exact keys:
{
  "name": string,
  "title": string (tailored to role),
  "contact": string,
  "summary": string (3-4 sentence tailored summary),
  "experience": [
    {
      "title": string,
      "company": string,
      "dates": string,
      "bullets": string[] (3-5 strong, metric-driven bullets per role, tailored to JD)
    }
  ],
  "skills": string[] (prioritized and sorted by JD relevance),
  "education": [{ "degree": string, "school": string }]
}`,
    },
  ], { json: true, maxTokens: 2500, temperature: 0.6 })
}

// =============================================
// PROMPT 3: Generate cover letter
// =============================================
export async function generateCoverLetter({ masterProfile, jdText, company, role, tone = 'Professional' }) {
  const toneInstructions = {
    Professional: 'formal, precise, and confident without being stiff',
    Passionate: 'enthusiastic and emotionally resonant, showing genuine excitement',
    Confident: 'bold and assertive, leading with accomplishments',
    Creative: 'memorable and distinctive, showing personality and originality',
  }

  return callAI([
    {
      role: 'system',
      content: `You are an expert cover letter writer. Write a compelling, tailored cover letter that feels personal and authentic — never generic. Tone: ${toneInstructions[tone] || toneInstructions.Professional}. Do not use bullet points. Write in flowing paragraphs.`,
    },
    {
      role: 'user',
      content: `
Candidate: ${masterProfile.name}
Role: ${role} at ${company}

Profile Summary:
${masterProfile.summary}

Key Experience:
${JSON.stringify(masterProfile.experience?.slice(0, 2))}

Job Description:
${jdText}

Write a 3-paragraph cover letter (opening hook, body connecting experience to role, compelling close with CTA). Do not include the date, address headers, or sign-off — just the 3 paragraphs.`,
    },
  ], { maxTokens: 800, temperature: 0.75 })
}

// =============================================
// PROMPT 4: Generate interview STAR answers
// =============================================
export async function generateInterviewQuestions({ masterProfile, jdText, company, role }) {
  return callAI([
    {
      role: 'system',
      content: `You are a senior hiring manager and interview coach. Generate tailored behavioral and technical interview questions and STAR-method answers based on the candidate's actual experience. Return a JSON object.`,
    },
    {
      role: 'user',
      content: `
Candidate Profile:
${JSON.stringify({
  summary: masterProfile.summary,
  experience: masterProfile.experience,
  skills: masterProfile.skills,
})}

Target Role: ${role} at ${company}
Job Description: ${jdText}

Generate 4 interview questions with STAR answers. Return JSON:
{
  "questions": [
    {
      "id": number,
      "tag": "BEHAVIORAL"|"TECHNICAL"|"CASE STUDY"|"CULTURE FIT",
      "title": string (short title for the question theme),
      "question": string (the full interview question),
      "star": {
        "situation": string,
        "task": string,
        "action": string,
        "result": string (include specific metrics where possible)
      },
      "key_metrics": [{ "metric": string, "context": string }],
      "delivery_tips": string[]
    }
  ]
}`,
    },
  ], { json: true, maxTokens: 3000, temperature: 0.65 })
}

// =============================================
// PROMPT 5: Parse raw resume text into profile
// =============================================
export async function parseResumeText({ rawText }) {
  return callAI([
    {
      role: 'system',
      content: `You are a resume parsing expert. Extract structured data from raw resume text. Be thorough but accurate — only extract what's actually there. Return a JSON object.`,
    },
    {
      role: 'user',
      content: `
Parse this resume text into structured data:

${rawText}

Return JSON:
{
  "name": string,
  "title": string (most recent job title),
  "email": string,
  "phone": string,
  "location": string,
  "linkedin_url": string,
  "portfolio_url": string,
  "summary": string,
  "experience": [{ "company": string, "role": string, "dates": string, "bullets": string[] }],
  "skills": string[],
  "education": [{ "degree": string, "school": string, "year": string }],
  "certifications": string[],
  "projects": [{ "title": string, "description": string, "tags": string[] }],
  "languages": string[]
}`,
    },
  ], { json: true, maxTokens: 2000 })
}

// =============================================
// PROMPT 6: AI improve a single bullet point
// =============================================
export async function improveBullet({ bullet, role, jdContext = '' }) {
  return callAI([
    {
      role: 'system',
      content: `You are a resume bullet point optimizer. Rewrite single resume bullets to be more impactful, metric-driven, and ATS-optimized. Keep the same experience — just make it stronger. Return only the improved bullet text, nothing else.`,
    },
    {
      role: 'user',
      content: `
Original bullet: "${bullet}"
Role context: ${role}
${jdContext ? `Job description context: ${jdContext}` : ''}

Rewrite this bullet to be stronger. Lead with an action verb, include metrics if possible, and highlight business impact.`,
    },
  ], { maxTokens: 200, temperature: 0.6 })
}
// =============================================
// PROMPT 7: ATS Coach / Profile Readiness Analysis
// =============================================
export async function analyzeMasterProfile(masterProfile) {
  return callAI([
    {
      role: 'system',
      content: `You are a senior hiring manager and ATS optimization coach. Analyze a candidate's Master Profile for hiring outcomes. Focus on metric density, summary strength, and section completeness. Be brutally honest, outcome-oriented, and constructive. Return a JSON object.`
    },
    {
      role: 'user',
      content: `
Analyze this Master Profile for readiness:
${JSON.stringify({
  name: masterProfile.name,
  title: masterProfile.title,
  summary: masterProfile.summary,
  experience: masterProfile.experience,
  skills: masterProfile.skills,
  education: masterProfile.education,
  projects: masterProfile.projects
})}

Return JSON with these exact keys:
{
  "readiness_score": number (0-100),
  "critical_missing": string[] (sections or key info missing),
  "quality_feedback": {
    "summary": { "rating": "strong"|"weak", "advice": string },
    "experience": { "metric_density": number (0-100), "advice": string },
    "skills": { "advice": string }
  },
  "next_steps": string[] (3 actionable bullet points to improve the profile)
}`
    }
  ], { json: true, maxTokens: 1500, temperature: 0.5 })
}

// Explicit export for Vite/HMR stability
export { analyzeMasterProfile as analyzeMasterProfile_explicit };
