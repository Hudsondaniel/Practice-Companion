import { useState } from 'react'
import { ClipboardList, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthPanel } from '@/components/auth/AuthPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/app-config'
import { APP_UNAVAILABLE_MESSAGE } from '@/lib/errors'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

export function CloudGate({ children }: { children: React.ReactNode }) {
  const loading = useAuthStore((s) => s.loading)
  const user = useAuthStore((s) => s.user)
  const dataReady = useAuthStore((s) => s.dataReady)
  const syncStatus = useAuthStore((s) => s.syncStatus)
  const syncError = useAuthStore((s) => s.syncError)
  const reloadFromCloud = useAuthStore((s) => s.reloadFromCloud)
  const [retrying, setRetrying] = useState(false)

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-warning/50">
          <CardHeader>
            <CardTitle>Service unavailable</CardTitle>
            <CardDescription>
              {import.meta.env.DEV
                ? 'Missing Supabase env vars (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).'
                : APP_UNAVAILABLE_MESSAGE}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <GateLoading message="Loading…" />
  }

  if (!user) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{APP_NAME}</CardTitle>
            <CardDescription>
              Sign in to access your practice plan. Your data stays with your account — not on this
              device alone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthPanel variant="gate" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dataReady || syncStatus === 'syncing') {
    return <GateLoading message="Loading your practice plan…" />
  }

  if (syncStatus === 'error') {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle>Couldn&apos;t load your data</CardTitle>
            <CardDescription>
              We couldn&apos;t connect to your account right now. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncError && (
              <p className="rounded-md border border-warning/40 bg-background px-3 py-2 text-sm text-muted-foreground">
                {syncError}
              </p>
            )}
            <Button
              disabled={retrying}
              className="w-full"
              onClick={async () => {
                setRetrying(true)
                try {
                  await reloadFromCloud()
                  if (useAuthStore.getState().dataReady) {
                    toast.success('You\'re all set')
                  }
                } catch {
                  toast.error('Still unable to connect')
                } finally {
                  setRetrying(false)
                }
              }}
            >
              {retrying ? 'Trying again…' : 'Try again'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Need help?{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return children
}

function GateLoading({ message }: { message: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-background p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
