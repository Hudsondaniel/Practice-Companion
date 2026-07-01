import { create } from 'zustand'
import { localDateIso } from '@/lib/local-date'
import { requestPracticePersist } from '@/lib/supabase-sync/persist'
import { computeStreakWithSchedule } from '@/types/practice-schedule'
import { usePracticeStore } from '@/stores/practice-store'

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
  return localDateIso(date)
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
        const schedule = usePracticeStore.getState().practiceSchedule
        const current = computeStreakWithSchedule(next, date, schedule)
        set({
          practiceDays: next,
          longestStreak: Math.max(get().longestStreak, current, computeLongest(next)),
        })
        requestPracticePersist()
      },

      getCurrentStreak: (today = todayIso()) =>
        computeStreakWithSchedule(
          get().practiceDays,
          today,
          usePracticeStore.getState().practiceSchedule,
        ),

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
          const iso = localDateIso(d)
          result.push({ date: iso, practiced: set.has(iso) })
        }
        return result
      },
    }),
)
