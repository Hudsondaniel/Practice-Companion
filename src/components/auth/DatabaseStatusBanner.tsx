import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SYNC_OFFLINE_MESSAGE, SYNC_SAVING_MESSAGE } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth-store'

export function DatabaseStatusBanner() {
  const syncStatus = useAuthStore((s) => s.syncStatus)
  const syncError = useAuthStore((s) => s.syncError)
  const saveError = useAuthStore((s) => s.saveError)
  const dataReady = useAuthStore((s) => s.dataReady)
  const flushPendingSave = useAuthStore((s) => s.flushPendingSave)

  if (!dataReady) {
    return null
  }

  if (saveError) {
    return (
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-warning/40 bg-warning/10 px-4 py-2 text-sm">
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Couldn&apos;t save to cloud — your work is kept on this device. {saveError}</span>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => void flushPendingSave()}>
          Retry save
        </Button>
      </div>
    )
  }

  if (syncStatus === 'syncing') {
    return (
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
        <span>{SYNC_SAVING_MESSAGE}</span>
      </div>
    )
  }

  if (syncStatus === 'error' && syncError) {
    return (
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-warning/40 bg-warning/10 px-4 py-2 text-sm">
        <div className="flex items-center gap-2 text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{syncError ?? SYNC_OFFLINE_MESSAGE}</span>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => void flushPendingSave()}>
          Retry
        </Button>
      </div>
    )
  }

  return null
}
