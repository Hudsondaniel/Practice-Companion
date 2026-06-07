import { useMemo } from 'react'
import { useStreakStore } from '@/stores/streak-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function buildCalendar(practiceDays: string[], days: number) {
  const set = new Set(practiceDays)
  const result: { date: string; practiced: boolean }[] = []
  const cursor = new Date()
  cursor.setHours(12, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(cursor)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]!
    result.push({ date: iso, practiced: set.has(iso) })
  }
  return result
}

function computeCurrentStreak(practiceDays: string[]): number {
  if (practiceDays.length === 0) return 0
  const set = new Set(practiceDays)
  const today = new Date().toISOString().split('T')[0]!
  let streak = 0
  const cursor = new Date(today + 'T12:00:00')
  while (set.has(cursor.toISOString().split('T')[0]!)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function computeLongestStreak(practiceDays: string[]): number {
  if (practiceDays.length === 0) return 0
  const sorted = [...practiceDays].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]! + 'T12:00:00')
    const curr = new Date(sorted[i]! + 'T12:00:00')
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      run++
      best = Math.max(best, run)
    } else if (diff > 1) {
      run = 1
    }
  }
  return best
}

export function StreakCalendar() {
  const practiceDays = useStreakStore((s) => s.practiceDays)
  const storedLongest = useStreakStore((s) => s.longestStreak)

  const currentStreak = useMemo(() => computeCurrentStreak(practiceDays), [practiceDays])
  const longestStreak = useMemo(
    () => Math.max(storedLongest, computeLongestStreak(practiceDays)),
    [practiceDays, storedLongest],
  )
  const calendar = useMemo(() => buildCalendar(practiceDays, 49), [practiceDays])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Streak</CardTitle>
        <CardDescription>Keep your daily practice chain alive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-6">
          <div>
            <p className="text-3xl font-bold text-primary">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest streak</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendar.map(({ date, practiced }) => (
            <div
              key={date}
              title={date}
              className={cn(
                'aspect-square rounded-sm',
                practiced ? 'bg-primary' : 'bg-muted/50',
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Last 7 weeks · darker gold = practice day</p>
      </CardContent>
    </Card>
  )
}
