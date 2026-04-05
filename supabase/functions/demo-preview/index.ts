import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Versatile sample profile — works across SWE, PM, ops, growth, and adjacent roles.
// Concrete metrics make the tailored output impressive regardless of target JD.
const SAMPLE_PROFILE = `
Alex Rivera — 5 years building and shipping software products at a Series B B2B SaaS startup.

Experience:
- Led a team of 4 engineers to ship a customer-facing analytics dashboard used by 400+ enterprise clients across 12 countries
- Redesigned the payment reconciliation pipeline for a platform processing $3M/month; cut failure rate by 41% and manual review time by 70%
- Optimized core API layer: reduced p99 latency from 1.8s to 380ms via query indexing and Redis caching, handling 2M+ requests/day
- Ran an A/B testing program that improved new-user activation by 34% over two product quarters

Skills: React, Node.js, Python, PostgreSQL, Redis, AWS, system design, product strategy, user research, cross-functional leadership, data analysis, Agile
`.trim()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jdText, userRole } = await req.json()

    if (!jdText || typeof jdText !== 'string' || jdText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: 'Please paste a full job description (at least 100 characters).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) throw new Error('AI service not configured')

    const profileContext = userRole?.trim()
      ? `${SAMPLE_PROFILE}\n\nCandidate's self-described role: "${userRole.trim()}"`
      : SAMPLE_PROFILE

    const prompt = `Candidate Profile:\n${profileContext}\n\nJob Description:\n${jdText.trim().slice(0, 3500)}\n\nGenerate a JSON object with exactly these keys — be specific, concrete, and impressive:\n{\n  "company": string (company name from the JD, or "this company" if unclear),\n  "role": string (job title from the JD),\n  "match_score": number (0–100, honest),\n  "original_bullet": string (the single most relevant bullet from the candidate's experience, quoted exactly),\n  "tailored_bullet": string (that bullet rewritten to target this specific role — keep metrics, sharpen framing),\n  "cover_opener": string (one punchy opening sentence for a cover letter, specific to this company/role),\n  "matched_skills": string[] (exactly 3–4 skills that match),\n  "top_gap": string (the single most important missing skill, one short phrase)\n}`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career coach generating a quick application preview. Be specific, honest, and impressive. Return valid JSON only, no markdown.',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 700,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `AI error (${res.status})`)
    }

    const aiData = await res.json()
    const content = aiData.choices?.[0]?.message?.content
    if (!content) throw new Error('No content returned from AI')

    const result = JSON.parse(content)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('demo-preview error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Demo generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
