import toast from 'react-hot-toast'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useVocabularyStore } from '@/stores/vocabulary-store'

export function VocabularyWeekControls() {
  const currentWeek = useVocabularyStore((s) => s.currentWeek)
  const cycleStartedAt = useVocabularyStore((s) => s.cycleStartedAt)
  const previousWeek = useVocabularyStore((s) => s.previousWeek)
  const nextWeek = useVocabularyStore((s) => s.nextWeek)
  const setCurrentWeek = useVocabularyStore((s) => s.setCurrentWeek)
  const resetVocabularyCycle = useVocabularyStore((s) => s.resetVocabularyCycle)

  const handleReset = () => {
    if (
      !window.confirm(
        'Reset to week 1? Your motif clarity rating for this cycle will clear. You choose when to move forward — nothing changes automatically.',
      )
    ) {
      return
    }
    resetVocabularyCycle()
    toast.success('Vocabulary cycle reset — you\'re on week 1')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your pace</CardTitle>
        <CardDescription>
          Weeks advance when you say so — not by calendar. Pick a week, practice it, then move on
          when you&apos;re ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={previousWeek} disabled={currentWeek <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-[8rem] flex-col items-center">
            <span className="text-2xl font-bold tabular-nums">{currentWeek}</span>
            <span className="text-xs text-muted-foreground">of 12</span>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={nextWeek} disabled={currentWeek >= 12}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            aria-label="Jump to week"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>
          <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to week 1
          </Button>
        </div>
        {cycleStartedAt ? (
          <p className="text-xs text-muted-foreground">
            Cycle started {new Date(cycleStartedAt + 'T12:00:00').toLocaleDateString()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Tap <strong>Reset to week 1</strong> when you&apos;re ready to begin a fresh 12-week run.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Self-paced</Badge>
          <Badge variant="secondary">Week {currentWeek} active in guided sessions</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
