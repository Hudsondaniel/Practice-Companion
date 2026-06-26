import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/** Starts Supabase auth listener, auto-save subscriptions, and emergency flush on background. */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const flushPendingSave = useAuthStore((s) => s.flushPendingSave)

  useEffect(() => initialize(), [initialize])

  useEffect(() => {
    const flush = () => {
      void flushPendingSave()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    }

    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [flushPendingSave])

  return children
}
