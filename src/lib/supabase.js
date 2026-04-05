import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigMissing = !supabaseUrl || !supabaseAnonKey

if (isConfigMissing) {
  console.warn('Supabase environment variables are missing. App will show ConfigError screen.')
}

// Create client only if config exists to avoid crash
export const supabase = !isConfigMissing 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
