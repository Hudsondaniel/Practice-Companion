import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useStreakStore } from '@/stores/streak-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useVocabularyStore } from '@/stores/vocabulary-store'
import { getVocabularyContext } from '@/features/vocabulary-lab/rotation'

export function Analytics() {
  const history = useAdherenceStore((s) => s.history)
  const practiceDays = useStreakStore((s) => s.practiceDays)
  const lastMotifClarity = useVocabularyStore((s) => s.lastMotifClarityRating)
  const currentWeek = useVocabularyStore((s) => s.currentWeek)
  const { curriculumLevel } = useVocabularyStore()
  const vocabCtx = useMemo(
    () => getVocabularyContext(currentWeek, curriculumLevel),
    [currentWeek, curriculumLevel],
  )
  const activeConcept = usePracticeStore((s) => s.activeConcept)

  const consistency = useMemo(() => {
    const weeks = new Map<string, { week: string; sessions: number; hours: number }>()
    for (const day of practiceDays.slice(-28)) {
      const d = new Date(day + 'T12:00:00')
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split('T')[0]!
      const cur = weeks.get(key) ?? { week: key.slice(5), sessions: 0, hours: 0 }
      cur.sessions++
      cur.hours += 2
      weeks.set(key, cur)
    }
    return [...weeks.values()].slice(-4)
  }, [practiceDays])

  const adherenceTrend = useMemo(
    () =>
      history
        .slice(0, 10)
        .reverse()
        .map((h, i) => ({
          session: `S${i + 1}`,
          score: h.adherenceScore,
          skipped: h.skippedPhases,
        })),
    [history],
  )

  const blockBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    for (const session of history.slice(0, 10)) {
      for (const log of session.logs) {
        if (log.status === 'skipped' || log.status === 'rushed') {
          counts.set(log.blockId, (counts.get(log.blockId) ?? 0) + 1)
        }
      }
    }
    const labels: Record<string, string> = {
      'concept-forge': 'Concept Forge',
      'transcription-integration': 'Transcription',
      'standards-hymns-lab': 'Standards Lab',
      'cold-pressure': 'Cold/Pressure',
      'agility-fluency-lab': 'Vocabulary Lab',
    }
    return [...counts.entries()].map(([id, count]) => ({
      block: labels[id] ?? id,
      issues: count,
    }))
  }, [history])

  const vocabularyProgress = useMemo(() => {
    return [
      {
        label: `Week ${vocabCtx.macroWeek}`,
        pillar: vocabCtx.module.pillar,
        clarity: lastMotifClarity ?? 0,
      },
    ]
  }, [vocabCtx, lastMotifClarity])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Live data from your practice sessions and streak</p>
      </div>

      {activeConcept && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Concept stage</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{activeConcept.label}</p>
            <p className="text-muted-foreground">
              Stage: {activeConcept.stage} · Pass days: {activeConcept.consecutivePassDays}/3 · Dual-task
              Phase {activeConcept.dualTaskPhase}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Practice consistency (4 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            {consistency.length === 0 ? (
              <p className="text-sm text-muted-foreground">Complete sessions to see weekly data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={consistency}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Days practiced" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adherence trend</CardTitle>
          </CardHeader>
          <CardContent>
            {adherenceTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No session history yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={adherenceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="session" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} name="Adherence %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {blockBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skipped / rushed blocks (recent)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={blockBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="block" width={100} fontSize={11} />
                <Tooltip />
                <Bar dataKey="issues" fill="var(--color-warning)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Lab</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">
            Week {vocabCtx.macroWeek}/12 · {vocabCtx.module.title}
          </p>
          <p className="text-sm text-muted-foreground capitalize">{vocabCtx.module.pillar} focus</p>
          {lastMotifClarity != null && (
            <p className="mt-2 text-sm">
              Last motif clarity: <strong>{lastMotifClarity}/5</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {vocabularyProgress.length > 0 && lastMotifClarity != null && (
        <Card>
          <CardHeader>
            <CardTitle>Motif clarity (latest fusion week)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{lastMotifClarity}/5</p>
            <p className="text-sm text-muted-foreground">From Vocabulary Lab fusion week rating</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
