import { create } from 'zustand'

interface StreakState {
  /** ISO dates YYYY-MM-DD when user completed meaningful practice */
  practiceDays: string[]
  longestStreak: number

  recordPracticeDay: (date?: string) => void
  getCurrentStreak: (today?: string) => number
  getLongestStreak: () => number
  practicedOn: (date: string) => boolean
  getRecentCalendar: (days?: number) => { date: string; practiced: boolean }[]
}

function todayIso(date = new Date()): string {
  return date.toISOString().split('T')[0]!
}

function computeStreak(sortedDays: string[], fromDate: string): number {
  if (sortedDays.length === 0) return 0
  const set = new Set(sortedDays)
  let streak = 0
  const cursor = new Date(fromDate + 'T12:00:00')
  while (set.has(cursor.toISOString().split('T')[0]!)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

function computeLongest(sortedDays: string[]): number {
  if (sortedDays.length === 0) return 0
  const sorted = [...sortedDays].sort()
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

export const useStreakStore = create<StreakState>()((set, get) => ({
      practiceDays: [],
      longestStreak: 0,

      recordPracticeDay: (date = todayIso()) => {
        const { practiceDays } = get()
        if (practiceDays.includes(date)) return
        const next = [...practiceDays, date].sort()
        const current = computeStreak(next, date)
        set({
          practiceDays: next,
          longestStreak: Math.max(get().longestStreak, current, computeLongest(next)),
        })
      },

      getCurrentStreak: (today = todayIso()) => computeStreak(get().practiceDays, today),

      getLongestStreak: () => Math.max(get().longestStreak, computeLongest(get().practiceDays)),

      practicedOn: (date) => get().practiceDays.includes(date),

      getRecentCalendar: (days = 49) => {
        const set = new Set(get().practiceDays)
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
      },
    }),
)
