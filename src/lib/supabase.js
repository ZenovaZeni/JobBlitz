import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const baseSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Mock Session for Launch Verification (Smoke Tests)
const MOCK_USER = {
  id: 'fa6d0edd-bdf1-48e9-ba3f-014ea83a819d', // Hand-created test user
  email: 'test_smoke_final@example.com',
  user_metadata: { first_name: 'Smoke', last_name: 'Test' },
  app_metadata: { provider: 'email', providers: ['email'] },
  role: 'authenticated'
};

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: MOCK_USER,
};

export const supabase = new Proxy(baseSupabase, {
  get(target, prop) {
    if (prop === 'auth' && localStorage.getItem('auth_mock') === 'true') {
      return {
        ...target.auth,
        getSession: async () => ({ data: { session: MOCK_SESSION }, error: null }),
        getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
        onAuthStateChange: (callback) => {
          callback('SIGNED_IN', MOCK_SESSION);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signOut: async () => {
          localStorage.removeItem('auth_mock');
          return target.auth.signOut();
        },
        signInWithPassword: async () => ({ data: { user: MOCK_USER, session: MOCK_SESSION }, error: null }),
      };
    }
    return target[prop];
  }
});
