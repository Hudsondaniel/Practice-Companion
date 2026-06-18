import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth-store'
import { isSupabaseConfigured } from '@/lib/supabase'

export function AuthPanel() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const syncStatus = useAuthStore((s) => s.syncStatus)
  const lastSyncedAt = useAuthStore((s) => s.lastSyncedAt)
  const syncError = useAuthStore((s) => s.syncError)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signOut = useAuthStore((s) => s.signOut)
  const syncNow = useAuthStore((s) => s.syncNow)

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isSupabaseConfigured) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || password.length < 6) {
      toast.error('Use a valid email and password (6+ characters)')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password)
        toast.success('Signed in — syncing your practice data')
      } else {
        await signUp(email.trim(), password)
        toast.success('Account created — check email if confirmation is required')
      }
    } catch {
      toast.error(syncError ?? 'Authentication failed')
    } finally {
      setSubmitting(false)
    }
  }

  const syncBadge = () => {
    if (!user) return null
    const variants = {
      idle: 'secondary',
      syncing: 'warning',
      synced: 'success',
      error: 'warning',
      offline: 'outline',
    } as const
    return (
      <Badge variant={variants[syncStatus]}>
        {syncStatus === 'syncing' ? 'Syncing…' : syncStatus === 'synced' ? 'Synced' : syncStatus}
      </Badge>
    )
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Checking sign-in status…</p>
  }

  if (user) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Signed in as</span>
          <span className="text-sm font-medium">{user.email}</span>
          {syncBadge()}
        </div>
        {lastSyncedAt && (
          <p className="text-xs text-muted-foreground">
            Last saved to cloud: {new Date(lastSyncedAt).toLocaleString()}
          </p>
        )}
        {syncError && <p className="text-xs text-warning">{syncError}</p>}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void syncNow()}>
            Sync now
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void signOut()
              toast('Signed out — local data remains on this device')
            }}
          >
            Sign out
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Changes auto-save to Supabase every few seconds while signed in. Audio recordings stay
          on this device for now.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sign in to sync concepts, monthly plans, transcriptions, and session history across devices.
      </p>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder="Password (6+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
        >
          {mode === 'sign-in' ? 'Need an account?' : 'Already have an account?'}
        </Button>
      </div>
    </form>
  )
}
