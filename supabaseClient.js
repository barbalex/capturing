import { createClient } from '@supabase/supabase-js'

// https://supabase.com/docs/reference/javascript/initializing#with-additional-parameters
const options = {
  schema: 'public',
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options,
)
