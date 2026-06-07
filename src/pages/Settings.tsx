import { Moon, Sun, Monitor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { isSupabaseConfigured } from '@/lib/supabase'
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
          <CardDescription>Authentication and data persistence</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'}>
              {isSupabaseConfigured ? 'Connected' : 'Local mode (configure .env)'}
            </Badge>
          </div>
          <Input placeholder="VITE_SUPABASE_URL" disabled={isSupabaseConfigured} />
          <Input placeholder="VITE_SUPABASE_ANON_KEY" type="password" disabled={isSupabaseConfigured} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OpenAI</CardTitle>
          <CardDescription>AI Practice Engine and recording feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="VITE_OPENAI_API_KEY" type="password" />
          <p className="mt-2 text-xs text-muted-foreground">
            Without API key, local fallback coaching logic is used.
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
