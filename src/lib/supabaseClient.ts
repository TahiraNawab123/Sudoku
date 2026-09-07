import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True once real Supabase credentials are configured (vs. missing/placeholder .env values). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Doesn't throw - the app should still work fine without a leaderboard configured.
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable accounts and the leaderboard.',
  )
}

// Fall back to harmless placeholder strings so createClient doesn't throw when
// unconfigured - isSupabaseConfigured is what actually gates whether we use it.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)