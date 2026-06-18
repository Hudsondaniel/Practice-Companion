import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/** Public project URL (safe to display in Settings) */
export const supabaseProjectUrl = supabaseUrl || null

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)

/** Ping Supabase API — does not require login or migrated tables */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart dev server.',
    }
  }
  try {
    const { error } = await supabase.auth.getSession()
    if (error) {
      return { ok: false, message: error.message }
    }
    return { ok: true, message: 'API reachable. Run the SQL migration if you have not yet.' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not reach Supabase'
    return { ok: false, message }
  }
}
