/**
 * Smoke-test Supabase auth against your project.
 * Usage: node scripts/test-auth.mjs
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from .env
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const text = readFileSync(join(process.cwd(), '.env'), 'utf8')
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = loadEnv()
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or key in .env')
  process.exit(1)
}

const email = `pa-smoke-${Date.now()}@example.com`
const password = 'SmokeTest123!'

const supabase = createClient(url, key)

console.log('Project:', url)
console.log('Test email:', email)

const signUp = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: 'http://localhost:5173' },
})
console.log('\n--- SIGN UP ---')
console.log('error:', signUp.error?.message ?? null)
console.log('code:', signUp.error?.code ?? null)
console.log('session:', signUp.data.session ? 'yes' : 'no')
console.log('identities:', signUp.data.user?.identities?.length ?? 0)

const signIn = await supabase.auth.signInWithPassword({ email, password })
console.log('\n--- SIGN IN ---')
console.log('error:', signIn.error?.message ?? null)
console.log('code:', signIn.error?.code ?? null)
console.log('session:', signIn.data.session ? 'yes' : 'no')

if (signIn.data.session) {
  const { data, error } = await supabase
    .from('user_app_snapshots')
    .select('updated_at')
    .eq('user_id', signIn.data.session.user.id)
    .maybeSingle()
  console.log('\n--- SNAPSHOT ---')
  console.log('error:', error?.message ?? null)
  console.log('row:', data ? 'yes' : 'no')
  console.log('\nAuth smoke test PASSED')
} else {
  console.log('\nAuth smoke test FAILED — see errors above.')
  if (signUp.error?.code === 'over_email_send_rate_limit') {
    console.log('\nFix: Supabase Dashboard → Authentication → Rate Limits (wait ~1h)')
    console.log('     Or disable "Confirm email" under Authentication → Providers → Email')
  }
  if (!signUp.error && !signUp.data.session) {
    console.log('\nLikely: email confirmation required — check inbox or disable confirm email in Supabase.')
  }
  process.exit(1)
}
