import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    // Authenticate the user via their JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Check rate limits / session count via profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, sessions_used, sessions_limit')
      .eq('id', user.id)
      .single()

    const isPro = profile?.subscription_tier === 'pro'
    const sessionsUsed = profile?.sessions_used ?? 0
    const sessionsLimit = profile?.sessions_limit ?? 3

    // Parse request body
    const body = await req.json()
    const { messages, options = {} } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages array required' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Only enforce session limits for full tailoring calls, not cover letter regeneration
    const isTailoringCall = options.isTailoringCall === true
    if (isTailoringCall && !isPro && sessionsUsed >= sessionsLimit) {
      return new Response(JSON.stringify({ error: 'SESSION_LIMIT_REACHED', sessionsUsed, sessionsLimit }), {
        status: 402, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Forward to OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        response_format: options.json ? { type: 'json_object' } : undefined,
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}))
      return new Response(JSON.stringify({ error: err?.error?.message || `OpenAI error ${openaiRes.status}` }), {
        status: openaiRes.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const data = await openaiRes.json()
    const content = data.choices[0]?.message?.content ?? ''

    return new Response(JSON.stringify({ content }), {
      status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
