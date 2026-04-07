import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://nvgfxnfcczdidnhdmzpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdX...' // (snip)
)

async function checkStorage() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error.message)
    return
  }
  console.log('Buckets:', data.map(b => b.id))
}

checkStorage()
