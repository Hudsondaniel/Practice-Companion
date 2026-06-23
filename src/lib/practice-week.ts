import { usePracticeStore } from '@/stores/practice-store'

/** ISO date (YYYY-MM-DD) when the user started their current practice month */
export function getPracticeMonthStartDate(): Date | null {
  const plan = usePracticeStore.getState().monthlyPlan
  if (!plan) return null
  const startedAt = plan.monthStartedAt ?? plan.configuredAt?.split('T')[0]
  if (!startedAt) return null
  return new Date(startedAt + 'T12:00:00')
}

/** Day number within the practice month (1 = first day of the month plan) */
export function getDayOfPracticeMonth(date = new Date(), monthStart?: Date | null): number {
  const start = monthStart ?? getPracticeMonthStartDate()
  if (!start) return date.getDate()
  const diffMs = date.getTime() - start.getTime()
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
}

/** Week within the practice month (1–5), relative to when the user started — not calendar */
export function getWeekOfPracticeMonth(date = new Date()): number {
  const day = getDayOfPracticeMonth(date)
  return Math.ceil(day / 7)
}

/** Week 4 of the practice month = deload (40% volume, no new devices) */
export function isDeloadWeek(date = new Date()): boolean {
  return getWeekOfPracticeMonth(date) === 4
}

export function getDeloadVolumeMultiplier(date = new Date()): number {
  return isDeloadWeek(date) ? 0.6 : 1
}

export function getMaintenanceIntervalDays(passNumber: number): number {
  const ladder = [1, 3, 7, 14, 30]
  return ladder[Math.min(passNumber, ladder.length - 1)]!
}

export function isSlowFirstWeek(conceptStartedAt: string): boolean {
  const days = (Date.now() - new Date(conceptStartedAt).getTime()) / (1000 * 60 * 60 * 24)
  return days < 14
}

export function maxTempoPercentForConcept(conceptStartedAt: string): number {
  return isSlowFirstWeek(conceptStartedAt) ? 0.7 : 1
}

export function getEarBlockDay(date = new Date()): 'guide-tones' | 'transcribe-bars' | 'chord-quality' | 'rhythm' | 'off' {
  const day = date.getDay()
  if (day === 0 || day === 6) return 'off'
  const map = ['off', 'guide-tones', 'transcribe-bars', 'chord-quality', 'rhythm', 'off'] as const
  return map[day] ?? 'off'
}

export function shouldShowSightReading(date = new Date()): boolean {
  return [1, 3, 5].includes(date.getDay())
}

export function getMonthWeekLabel(date = new Date()): string {
  const w = getWeekOfPracticeMonth(date)
  return isDeloadWeek(date) ? `Week ${w} (Deload)` : `Week ${w}`
}

export function formatMonthContext(date = new Date()): string {
  const plan = usePracticeStore.getState().monthlyPlan
  const label = plan?.monthYear ?? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  return `${label} ${getMonthWeekLabel(date)}`
}
