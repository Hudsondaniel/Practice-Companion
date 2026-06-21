import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useStreakStore } from '@/stores/streak-store'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { isDeloadWeek, isSunday } from '@/lib/month-context'
import { currentMonthYear } from '@/types/practice-method'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DayCell {
  date: string
  dayNum: number
  practiced: boolean
  adherenceScore: number | null
  hasHero: boolean
  isDeload: boolean
  isReview: boolean
  inMonth: boolean
}

function buildMonthGrid(monthYear: string, practiceDays: Set<string>, adherenceByDate: Map<string, number>, heroDates: Set<string>): DayCell[] {
  const [y, m] = monthYear.split('-').map(Number)
  const first = new Date(y!, m! - 1, 1, 12, 0, 0)
  const last = new Date(y!, m!, 0, 12, 0, 0)
  const startPad = first.getDay()
  const cells: DayCell[] = []

  for (let i = 0; i < startPad; i++) {
    cells.push({
      date: '',
      dayNum: 0,
      practiced: false,
      adherenceScore: null,
      hasHero: false,
      isDeload: false,
      isReview: false,
      inMonth: false,
    })
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const date = new Date(y!, m! - 1, d, 12, 0, 0)
    const iso = date.toISOString().split('T')[0]!
    cells.push({
      date: iso,
      dayNum: d,
      practiced: practiceDays.has(iso),
      adherenceScore: adherenceByDate.get(iso) ?? null,
      hasHero: heroDates.has(iso),
      isDeload: isDeloadWeek(date),
      isReview: isSunday(date),
      inMonth: true,
    })
  }

  return cells
}

export function PracticeMonthView() {
  const practiceDays = useStreakStore((s) => s.practiceDays)
  const history = useAdherenceStore((s) => s.history)
  const projects = useTranscriptionStore((s) => s.projects)
  const monthYear = currentMonthYear()

  const practiceSet = useMemo(() => new Set(practiceDays), [practiceDays])

  const adherenceByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const session of history) {
      if (session.date.startsWith(monthYear)) {
        map.set(session.date, session.adherenceScore)
      }
    }
    return map
  }, [history, monthYear])

  const heroDates = useMemo(() => {
    const set = new Set<string>()
    for (const p of projects) {
      if (p.practiceDate?.startsWith(monthYear)) set.add(p.practiceDate)
    }
    return set
  }, [projects, monthYear])

  const cells = useMemo(
    () => buildMonthGrid(monthYear, practiceSet, adherenceByDate, heroDates),
    [monthYear, practiceSet, adherenceByDate, heroDates],
  )

  const practicedCount = cells.filter((c) => c.inMonth && c.practiced).length
  const heroCount = cells.filter((c) => c.inMonth && c.hasHero).length

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>Practice Month · {monthYear}</CardTitle>
            <CardDescription>
              {practicedCount} practice days · {heroCount} daily hero lines · click a day for details
            </CardDescription>
          </div>
          <Link to="/practice" className="text-sm text-primary hover:underline">
            Start session →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => (
            <div
              key={i}
              className={cn(
                'relative flex min-h-[40px] flex-col items-center justify-center rounded-md border p-0.5 text-xs sm:min-h-[52px] sm:p-1',
                !cell.inMonth && 'border-transparent bg-transparent',
                cell.inMonth && !cell.practiced && 'border-border bg-muted/20',
                cell.practiced && 'border-success/40 bg-success/15',
                cell.isDeload && cell.inMonth && 'ring-1 ring-warning/40',
              )}
              title={
                cell.inMonth
                  ? `${cell.date}${cell.adherenceScore != null ? ` · ${cell.adherenceScore}% adherence` : ''}${cell.hasHero ? ' · hero added' : ''}`
                  : undefined
              }
            >
              {cell.inMonth && (
                <>
                  <span className="font-mono font-medium">{cell.dayNum}</span>
                  {cell.hasHero && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />}
                  {cell.isReview && (
                    <span className="absolute right-0.5 top-0.5 text-[8px] text-warning">R</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded bg-success/40" /> Practiced
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" /> Daily hero
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-4 rounded ring-1 ring-warning/40" /> Deload week
          </span>
          <span>R = Sunday review</span>
        </div>
      </CardContent>
    </Card>
  )
}
