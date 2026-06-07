import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EMPTY } from '@/lib/copy'
import { useAdherenceStore } from '@/stores/adherence-store'
import type { PhaseCompletionStatus } from '@/types/practice-adherence'

const STATUS_LABEL: Record<PhaseCompletionStatus, string> = {
  complete: 'Complete',
  early: 'Early finish',
  rushed: 'Rushed',
  skipped: 'Skipped',
}

const STATUS_VARIANT: Record<PhaseCompletionStatus, 'success' | 'warning' | 'secondary'> = {
  complete: 'success',
  early: 'secondary',
  rushed: 'warning',
  skipped: 'warning',
}

export function SessionAdherenceCard() {
  const history = useAdherenceStore((s) => s.history)
  const latest = history[0] ?? null
  const recent = history.slice(0, 5)

  if (!latest) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Adherence</CardTitle>
          <CardDescription>Complete a guided session to track phase completion patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We log whether you finish each phase, rush through, or skip ahead. That shows up here after your first
            session.
          </p>
        </CardContent>
      </Card>
    )
  }

  const summary = latest

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Adherence</CardTitle>
        <CardDescription>
          Last session · {summary.date} · {summary.adherenceScore}% adherence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Overall adherence</span>
            <span className="font-medium text-primary">{summary.adherenceScore}%</span>
          </div>
          <Progress value={summary.adherenceScore} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border border-border p-2">
            <p className="text-lg font-bold text-success">{summary.completedPhases}</p>
            <p className="text-muted-foreground">Finished</p>
          </div>
          <div className="rounded-md border border-border p-2">
            <p className="text-lg font-bold text-warning">{summary.rushedPhases}</p>
            <p className="text-muted-foreground">Rushed</p>
          </div>
          <div className="rounded-md border border-border p-2">
            <p className="text-lg font-bold text-destructive">{summary.skippedPhases}</p>
            <p className="text-muted-foreground">Skipped</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-muted-foreground">Phase breakdown</p>
          <ul className="max-h-40 space-y-1 overflow-y-auto">
            {summary.logs?.map((log) => (
              <li
                key={`${log.phaseId}-${log.completedAt}`}
                className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1 text-xs"
              >
                <span className="truncate">{log.phaseTitle}</span>
                <Badge variant={STATUS_VARIANT[log.status]}>{STATUS_LABEL[log.status]}</Badge>
              </li>
            ))}
          </ul>
        </div>

        {recent.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">Recent trend</p>
            <div className="flex gap-1">
              {recent.map((s) => (
                <div
                  key={s.sessionId}
                  className="flex-1 rounded bg-muted/40 p-1 text-center text-[10px]"
                  title={s.date}
                >
                  <div
                    className="mx-auto mb-0.5 h-8 w-full rounded-sm bg-primary/20"
                    style={{ height: `${Math.max(4, s.adherenceScore / 3)}px` }}
                  />
                  {s.adherenceScore}%
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.skippedPhases > 0 && (
          <p className="text-xs text-muted-foreground">
            You jumped past {summary.skippedPhases} phase{summary.skippedPhases > 1 ? 's' : ''} without completing
            them. Consider revisiting those blocks tomorrow.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function adherenceScoreLabel(score: number | null): string {
  if (score == null) return EMPTY
  return `${score}%`
}
