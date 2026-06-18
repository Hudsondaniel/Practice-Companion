import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'

/** Starts Supabase auth listener and auto-save subscriptions. */
export function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => initialize(), [initialize])

  return children
}
