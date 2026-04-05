const DEMO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/demo-preview`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function runDemoPreview({ jdText, userRole = '' }) {
  const res = await fetch(DEMO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': ANON_KEY,
    },
    body: JSON.stringify({ jdText, userRole }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Demo failed (${res.status})`)
  return data
}
