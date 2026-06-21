import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { isSunday } from '@/lib/month-context'

export function Recordings() {
  const savedClips = useSessionToolsStore((s) => s.savedClips)
  const removeClip = useSessionToolsStore((s) => s.removeClip)
  const sunday = isSunday()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">Recordings</h1>
        <p className="text-muted-foreground">Clips saved from guided sessions during Recording phases</p>
      </div>

      <Card className={sunday ? 'border-primary/40 bg-primary/5' : 'border-border'}>
        <CardHeader>
          <CardTitle>Weekly Sound-Target Review</CardTitle>
          <CardDescription>
            {sunday
              ? 'Today is review day — listen with producer ears: would you keep this on a gig?'
              : 'Sunday recording review swaps Consolidation for mandatory clip review.'}
          </CardDescription>
        </CardHeader>
        {sunday && savedClips.length > 0 && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review your {Math.min(3, savedClips.length)} most recent clips below. Mark forced or student-y usages.
            </p>
          </CardContent>
        )}
      </Card>

      {savedClips.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No saved clips yet. Use the Recording tab in guided session to capture and save practice clips.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {savedClips.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{rec.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(rec.createdAt).toLocaleDateString()}
                    {rec.phaseTitle && ` · ${rec.phaseTitle}`}
                  </p>
                  {rec.markers.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {rec.markers.length} marker{rec.markers.length === 1 ? '' : 's'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{formatTime(rec.durationSeconds)}</span>
                  {rec.phaseId && <Badge variant="secondary">{rec.phaseId}</Badge>}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeClip(rec.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" asChild>
        <Link to="/practice">Record in guided session →</Link>
      </Button>
    </div>
  )
}
