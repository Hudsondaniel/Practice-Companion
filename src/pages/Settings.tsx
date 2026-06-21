import { AuthPanel } from '@/components/auth/AuthPanel'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
        <p className="text-muted-foreground">Account and appearance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Your practice data syncs securely to your account across devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthPanel variant="settings" />
        </CardContent>
      </Card>

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
          <CardTitle>Your practice plan</CardTitle>
          <CardDescription>How your guided sessions are structured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Daily session</span>
            <span>{BASE_SESSION_MINUTES} minutes</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Monthly repertoire</span>
            <span>3 tunes per month</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Weekly review</span>
            <span>Sundays</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
