import { writeLocalBackup } from '@/lib/supabase-sync/local-backup'

/** Flush practice data to local backup + cloud without waiting for the debounced autosave. */
export function requestPracticePersist(): void {
  void import('@/stores/auth-store').then(({ useAuthStore }) => {
    const { user, dataReady } = useAuthStore.getState()
    if (!user?.id || !dataReady) return
    writeLocalBackup(user.id)
    void useAuthStore.getState().flushPendingSave()
  })
}
