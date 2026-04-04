import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Dev-only component to bypass Auth rate limits during smoke tests.
 * usage: /dev-login?email=test_smoke_final@example.com
 */
export default function DevLogin() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Initializing bypass...');
  const navigate = useNavigate();
  const email = searchParams.get('email') || 'test_smoke_final@example.com';

  useEffect(() => {
    function forceBypass() {
      setStatus(`🛠️ Bypassing Auth for ${email}...`);
      localStorage.setItem('jam_smoke_bypass', 'true');
      
      // We don't even need to call sign-in, just refresh/redirect
      setStatus('Instrumentation active. Entering session...');
      setTimeout(() => {
        window.location.reload(); // Reload to pick up the localStorage change in AuthContext
        // After reload, AuthContext will call fetchProfile and redirect to dashboard
      }, 800);
    }

    if (email) forceBypass();
  }, [email, navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#0f172a',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem', background: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <h2 style={{ marginBottom: '1rem', color: '#6366f1' }}>🛠️ Test Bypass Active</h2>
        <p style={{ opacity: 0.8 }}>{status}</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #475569', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
