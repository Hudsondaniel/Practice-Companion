import { isDeloadWeek } from '@/lib/practice-week'
import type { CurriculumLevel } from '@/features/vocabulary-lab/types'
import { getLevel1Week } from '@/features/vocabulary-lab/curriculum-level-1'

const DAY_VARIANTS = [
  'Focus: rhythmic placement',
  'Focus: register and space',
  'Focus: articulation and time',
  'Focus: harmonic arrival',
  'Focus: motif recall',
  'Focus: hero dialogue',
  'Focus: integration and form',
] as const

export function clampMacroWeek(week: number): number {
  return Math.min(12, Math.max(1, Math.round(week)))
}

/** @deprecated Legacy calendar-based start — used only when migrating old saves */
export function defaultCycleStartDate(date = new Date()): string {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  d.setDate(1)
  return d.toISOString().split('T')[0]!
}

export function weeksSinceCycleStart(cycleStartDate: string, date = new Date()): number {
  const start = new Date(cycleStartDate + 'T12:00:00')
  const cur = new Date(date)
  cur.setHours(12, 0, 0, 0)
  const diffMs = cur.getTime() - start.getTime()
  return Math.max(0, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)))
}

/** @deprecated Legacy calendar week — use stored currentWeek instead */
export function getMacroWeekFromStartDate(cycleStartDate: string, date = new Date()): number {
  const elapsed = weeksSinceCycleStart(cycleStartDate, date)
  return (elapsed % 12) + 1
}

/** @deprecated alias */
export const getMacroWeek = getMacroWeekFromStartDate

export function getDayVariant(date = new Date()): string {
  return DAY_VARIANTS[date.getDay()] ?? DAY_VARIANTS[0]
}

export function isFusionWeek(macroWeek: number): boolean {
  return macroWeek === 4 || macroWeek === 8 || macroWeek === 12
}

export function getWeekModule(level: CurriculumLevel, macroWeek: number) {
  if (level === 1) return getLevel1Week(macroWeek)
  return getLevel1Week(macroWeek)
}

/** Self-paced: week comes from user choice, not elapsed calendar time */
export function getVocabularyContext(
  currentWeek: number,
  level: CurriculumLevel,
  date = new Date(),
) {
  const macroWeek = clampMacroWeek(currentWeek)
  const module = getWeekModule(level, macroWeek)
  return {
    macroWeek,
    module,
    isFusionWeek: module.isFusionWeek,
    /** Calendar deload off — user advances weeks manually */
    isDeload: false,
    dayVariant: getDayVariant(date),
    level,
  }
}

/** Optional helper if other features still need calendar deload awareness */
export function isCalendarDeloadWeek(date = new Date()): boolean {
  return isDeloadWeek(date)
}
