import { currentMonthYear } from '@/types/practice-method'

/** Week 4 of each month = deload (40% volume, no new devices) */
export function isDeloadWeek(date = new Date()): boolean {
  const weekOfMonth = Math.ceil(date.getDate() / 7)
  return weekOfMonth === 4
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
  const w = Math.ceil(date.getDate() / 7)
  return isDeloadWeek(date) ? `Week ${w} (Deload)` : `Week ${w}`
}

export function formatMonthContext(date = new Date()): string {
  return `${currentMonthYear(date)} ${getMonthWeekLabel(date)}`
}
