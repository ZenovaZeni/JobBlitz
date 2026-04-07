import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing AI Pipeline Auth...')
  
  // 1. Sign up a fresh random user to avoid 401/403 issues from existing users
  const email = `test_${Math.floor(Math.random() * 100000)}@jobblitz.test`
  const password = 'TestPassword123!'
  
  console.log(`Signing up ${email}...`)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    console.error('Sign up failed:', authError.message)
    return
  }

  const session = authData.session
  if (!session) {
    console.log('Sign up successful, but no session (confirm email?). Trying to login directly...')
    // Note: If email confirmation is off, this should work.
    return
  }

  console.log('Authentication successful. Calling openai-proxy...')
  
  const { data, error: invokeError } = await supabase.functions.invoke('openai-proxy', {
    body: { 
      messages: [{ role: 'user', content: 'Ping' }],
      options: { model: 'gpt-4o-mini' }
    }
  })

  if (invokeError) {
    console.error('Edge Function failed with error:', invokeError)
  } else {
    console.log('Success! AI Response:', data)
  }
}

test()
