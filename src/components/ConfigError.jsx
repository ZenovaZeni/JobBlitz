import React from 'react'

export default function ConfigError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f7f9fb' }}>
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border" style={{ borderColor: 'rgba(197,198,206,0.2)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #FFDAD6, #FF897D)' }}>
          <span className="material-symbols-outlined text-[32px]" style={{ color: '#93000a' }}>settings_alert</span>
        </div>
        
        <h1 className="text-2xl font-black mb-4" style={{ fontFamily: 'Manrope', color: '#031631' }}>
          Missing Configuration
        </h1>
        
        <p className="text-sm leading-relaxed mb-6" style={{ color: '#44474d' }}>
          JobBlitz is unable to connect to its backend because the Supabase configuration is missing. 
          This usually happens if environment variables are not set in your host.
        </p>
        
        <div className="bg-red-50 rounded-xl p-4 mb-8 border border-red-100">
          <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-2">Required Variables</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 font-mono text-[11px] text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              VITE_SUPABASE_URL
            </li>
            <li className="flex items-center gap-2 font-mono text-[11px] text-red-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              VITE_SUPABASE_ANON_KEY
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="block text-center w-full py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ai-glow-btn">
            Open Vercel Dashboard
          </a>
          <button onClick={() => window.location.reload()}
            className="w-full py-3 text-sm font-bold rounded-xl transition-all hover:bg-gray-100"
            style={{ color: '#5c6d8c' }}>
            Check again
          </button>
        </div>
      </div>
    </div>
  )
}
