import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  // Debug Ping
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', message: 'JobBlitz AI Proxy is live' }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('[openai-proxy] Request received');
    
    // Log ALL headers to see what is actually arriving (be careful not to log full sensitive tokens in prod, 
    // but here we need to see the format of the Authorization header)
    const headersObj: any = {};
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'authorization') {
        headersObj[key] = value.substring(0, 15) + '...'; // Log prefix for safety
      } else {
        headersObj[key] = value;
      }
    });
    console.log('[openai-proxy] Headers:', JSON.stringify(headersObj));

    // 1. Check if OpenAI key is even configured
    if (!OPENAI_API_KEY) {
      console.error('[openai-proxy] CRITICAL: OPENAI_API_KEY is not set in secrets.')
      return new Response(JSON.stringify({ error: 'AI_NOT_CONFIGURED', details: 'OpenAI API key missing in Supabase secrets.' }), {
        status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // 2. Authenticate the user via their JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[openai-proxy] Auth failure: No Authorization header present')
      return new Response(JSON.stringify({ error: 'UNAUTHORIZED', details: 'No authorization header provided.' }), {
        status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Clean the token (handle Bearer prefix case-insensitively and extra spaces)
    const token = authHeader.replace(/^[Bb]earer\s+/, '').trim()
    console.log(`[openai-proxy] Extracted token prefix: ${token.substring(0, 10)}...`);
    const cleanedAuthHeader = `Bearer ${token}`

    // Standard pattern for Supabase Edge Functions:
    // Create a client using the incoming Authorization header to represent the user
    // This allows us to respect RLS automatically.
    const userClient = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: cleanedAuthHeader } } }
    )

    console.log('[openai-proxy] Validating user via auth.getUser()...')
    const { data: { user }, error: authError } = await userClient.auth.getUser()

    if (authError || !user) {
      console.error('[openai-proxy] Auth failure:', authError?.message || 'Falsy user object', authError)
      return new Response(JSON.stringify({ 
        error: 'UNAUTHORIZED', 
        details: authError?.message || 'Invalid or missing user session.',
        code: authError?.status || 401
      }), {
        status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[openai-proxy] User authenticated: ${user.id}`)

    // 3. Check profile and limits
    // Attempt to fetch via userClient first (respecting RLS)
    console.log('[openai-proxy] Fetching profile via user context...')
    let { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('plan_tier, sessions_used, sessions_limit')
      .eq('id', user.id)
      .single()

    // Fallback to Admin Client only if RLS failed but we KNOW the user exists
    if (profileError || !profile) {
      console.warn('[openai-proxy] Profile fetch via user context failed, falling back to admin client:', profileError?.message)
      const adminClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
      const { data: adminProfile, error: adminProfileError } = await adminClient
        .from('profiles')
        .select('plan_tier, sessions_used, sessions_limit')
        .eq('id', user.id)
        .single()
      
      if (adminProfileError) {
        console.error('[openai-proxy] CRITICAL: Profile fetch failed even with admin client:', adminProfileError.message)
      } else {
        profile = adminProfile
      }
    }

    // Default to free if profile is weird
    const planTier = profile?.plan_tier || 'free'
    const isPro = planTier === 'pro' || planTier === 'unlimited'
    const sessionsUsed = (profile?.sessions_used ?? 0)
    const sessionsLimit = (profile?.sessions_limit ?? 3)

    console.log(`[openai-proxy] Profile verified: ${user.id} is ${planTier}. Usage: ${sessionsUsed}/${sessionsLimit}`)

    // 4. Parse request body
    const body = await req.json()
    const { messages, options = {} } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'BAD_REQUEST', details: 'messages array required' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Enforce session limits for tailoring calls
    const isTailoringCall = options.isTailoringCall === true
    if (isTailoringCall && !isPro && sessionsUsed >= sessionsLimit) {
      console.warn(`[openai-proxy] Limit reached for user ${user.id}`)
      return new Response(JSON.stringify({ 
        error: 'SESSION_LIMIT_REACHED', 
        details: 'You have reached the limit of free applications.',
        sessionsUsed, 
        sessionsLimit 
      }), {
        status: 402, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // 5. Forward to OpenAI
    console.log(`[openai-proxy] Forwarding to OpenAI (Model: ${options.model || 'gpt-4o-mini'})...`)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        response_format: options.json ? { type: 'json_object' } : undefined,
      }),
    })

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text().catch(() => '{}')
      let errJson = {}
      try { errJson = JSON.parse(errBody) } catch(e) {}
      
      console.error('[openai-proxy] OpenAI API Error:', errJson)
      return new Response(JSON.stringify({ 
        error: 'AI_SERVICE_ERROR', 
        details: errJson?.error?.message || `OpenAI returned status ${openaiRes.status}` 
      }), {
        status: openaiRes.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const data = await openaiRes.json()
    console.log('[openai-proxy] Successfully completed AI request.')

    return new Response(JSON.stringify({ 
      content: data.choices[0]?.message?.content ?? '',
      usage: data.usage
    }), {
      status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[openai-proxy] Unhandled internal error:', err)
    return new Response(JSON.stringify({ error: 'INTERNAL_ERROR', details: err.message }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})


