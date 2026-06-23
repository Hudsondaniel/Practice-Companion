import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AUTH_ACCOUNT_EXISTS,
  AUTH_CONFIRM_EMAIL,
} from '@/lib/auth-errors'
import { useAuthStore } from '@/stores/auth-store'

interface AuthPanelProps {
  /** gate = full-screen login; settings = account section only */
  variant?: 'gate' | 'settings'
}

type FormMode = 'sign-in' | 'sign-up' | 'forgot-password'

export function AuthPanel({ variant = 'settings' }: AuthPanelProps) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const syncStatus = useAuthStore((s) => s.syncStatus)
  const lastSyncedAt = useAuthStore((s) => s.lastSyncedAt)
  const dataReady = useAuthStore((s) => s.dataReady)
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signOut = useAuthStore((s) => s.signOut)
  const resetPassword = useAuthStore((s) => s.resetPassword)

  const [mode, setMode] = useState<FormMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Enter your email address')
      return
    }
    if (mode !== 'forgot-password' && password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password)
        toast.success('Welcome back')
      } else if (mode === 'sign-up') {
        await signUp(email.trim(), password)
        toast.success('Account created — you\'re signed in')
      } else {
        await resetPassword(email.trim())
        toast.success('Check your email for a reset link')
        setMode('sign-in')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.'
      if (message === AUTH_CONFIRM_EMAIL) {
        toast.success('Account created! Check your email to confirm, then sign in.')
        setMode('sign-in')
        setPassword('')
        return
      }
      if (message === AUTH_ACCOUNT_EXISTS) {
        toast.error('An account with this email already exists. Try signing in or reset your password.')
        setMode('sign-in')
        return
      }
      toast.error(message)
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
    let label = 'Synced'
    if (!dataReady && syncStatus === 'error') label = 'Not synced'
    else if (syncStatus === 'syncing') label = 'Saving…'
    else if (syncStatus === 'error') label = 'Not synced'
    return <Badge variant={variants[syncStatus]}>{label}</Badge>
  }

  if (loading && variant === 'settings') {
    return <p className="text-sm text-muted-foreground">Checking sign-in status…</p>
  }

  if (user && variant === 'settings') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Signed in as</span>
          <span className="text-sm font-medium">{user.email}</span>
          {syncBadge()}
        </div>
        {lastSyncedAt && dataReady && syncStatus === 'synced' && (
          <p className="text-xs text-muted-foreground">
            Last saved: {new Date(lastSyncedAt).toLocaleString()}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            void signOut()
            toast('Signed out')
          }}
        >
          Sign out
        </Button>
        <p className="text-xs text-muted-foreground">
          Your practice data saves automatically to the <code className="text-[11px]">user_app_snapshots</code>{' '}
          table in Supabase (one JSON row per account). Legacy tables like{' '}
          <code className="text-[11px]">active_concepts</code> are not used by this app.
        </p>
      </div>
    )
  }

  if (user && variant === 'gate') {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === 'forgot-password' && (
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      )}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      {mode !== 'forgot-password' && (
        <Input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        />
      )}
      <Button type="submit" size="sm" disabled={submitting} className={variant === 'gate' ? 'w-full' : ''}>
        {submitting
          ? 'Please wait…'
          : mode === 'sign-in'
            ? 'Sign in'
            : mode === 'sign-up'
              ? 'Create account'
              : 'Send reset link'}
      </Button>
      <div className="flex flex-wrap gap-2">
        {mode === 'sign-in' && (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode('sign-up')}>
              Need an account?
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode('forgot-password')}>
              Forgot password?
            </Button>
          </>
        )}
        {mode === 'sign-up' && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setMode('sign-in')}>
            Already have an account?
          </Button>
        )}
        {mode === 'forgot-password' && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setMode('sign-in')}>
            Back to sign in
          </Button>
        )}
      </div>
    </form>
  )
}
