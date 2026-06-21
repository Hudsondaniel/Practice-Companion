import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SYNC_OFFLINE_MESSAGE, SYNC_SAVING_MESSAGE } from '@/lib/errors'
import { useAuthStore } from '@/stores/auth-store'

export function DatabaseStatusBanner() {
  const syncStatus = useAuthStore((s) => s.syncStatus)
  const syncError = useAuthStore((s) => s.syncError)
  const dataReady = useAuthStore((s) => s.dataReady)
  const syncNow = useAuthStore((s) => s.syncNow)

  if (dataReady && syncStatus !== 'error') {
    if (syncStatus === 'syncing') {
      return (
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
          <span>{SYNC_SAVING_MESSAGE}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-warning/40 bg-warning/10 px-4 py-2 text-sm">
      <div className="flex items-center gap-2 text-warning">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>{syncError ?? SYNC_OFFLINE_MESSAGE}</span>
      </div>
      {syncStatus === 'error' && (
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => void syncNow()}>
          Retry
        </Button>
      )}
    </div>
  )
}
