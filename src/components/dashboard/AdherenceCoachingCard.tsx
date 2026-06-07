import { AlertCircle } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { computeSkipPatterns, useAdherenceStore } from '@/stores/adherence-store'

export function AdherenceCoachingCard() {
  const history = useAdherenceStore((s) => s.history)
  const patterns = useMemo(() => computeSkipPatterns(history), [history])
  const latest = history[0] ?? null

  if (patterns.length === 0 && !latest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice patterns</CardTitle>
          <CardDescription>Complete guided sessions to see adherence coaching</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice patterns</CardTitle>
        <CardDescription>
          {latest
            ? `Last session: ${latest.adherenceScore}% adherence · ${latest.skippedPhases} skipped · ${latest.rushedPhases} rushed`
            : 'Recent skip and rush patterns'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.length === 0 ? (
          <p className="text-sm text-success">No recurring skips in recent sessions. Keep it up.</p>
        ) : (
          patterns.slice(0, 4).map((p) => (
            <div key={p.blockId} className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="font-medium">{p.blockLabel}</p>
                <p className="text-xs text-muted-foreground">
                  Skipped or rushed {p.skipCount} of {p.total} recent phase logs. Consider protecting this block
                  tomorrow.
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
