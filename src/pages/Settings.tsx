import { useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  checkSupabaseConnection,
  isSupabaseConfigured,
  supabaseProjectUrl,
} from '@/lib/supabase'
import { useUIStore, type Theme } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { BASE_SESSION_MINUTES } from '@/types/practice-method'

const THEME_OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

export function Settings() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await checkSupabaseConnection()
    setTestResult(result.message)
    setTesting(false)
    if (result.ok) toast.success('Supabase API reachable')
    else toast.error(result.message)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configuration, integrations, and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose light, dark, or match your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={theme === id ? 'default' : 'outline'}
                className={cn('gap-2', theme === id && 'ring-2 ring-ring')}
                onClick={() => setTheme(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase</CardTitle>
          <CardDescription>
            Use the <strong>publishable</strong> key in Vercel — never the secret key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">Env configured:</span>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'}>
              {isSupabaseConfigured ? 'Yes' : 'Missing publishable key'}
            </Badge>
          </div>
          {supabaseProjectUrl && (
            <p className="text-xs text-muted-foreground break-all">
              Project: <span className="font-mono">{supabaseProjectUrl}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Copy the <strong>Publishable key</strong> (<span className="font-mono">sb_publishable_…</span>)
            from Supabase → Settings → API. Set{' '}
            <span className="font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</span> in{' '}
            <span className="font-mono">.env</span> locally, or in Vercel → Environment Variables, then
            redeploy. Do <strong>not</strong> use <span className="font-mono">sb_secret_…</span> in the
            browser.
          </p>
          <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={testing}>
            {testing ? 'Testing…' : 'Test Supabase connection'}
          </Button>
          {testResult && (
            <p className={cn('text-xs', testResult.includes('reachable') ? 'text-success' : 'text-warning')}>
              {testResult}
            </p>
          )}
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            Practice data still saves in this browser until cloud sync is implemented. Supabase stores
            the schema; run <span className="font-mono">supabase/migrations/001_initial_schema.sql</span>{' '}
            in the SQL Editor once.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI</CardTitle>
          <CardDescription>AI Practice Engine and recording feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="VITE_OPENAI_API_KEY" type="password" disabled />
          <p className="mt-2 text-xs text-muted-foreground">
            Set in <span className="font-mono">.env</span>. Without it, local fallback coaching is used.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Daily session duration</span>
            <span>{BASE_SESSION_MINUTES} minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Monthly tunes</span>
            <span>3 tunes × 4 weeks</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Review day</span>
            <span>Sunday</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
