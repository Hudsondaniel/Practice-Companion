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

/** Macro week 1–12 within the curriculum cycle */
export function getMacroWeek(cycleStartDate: string, date = new Date()): number {
  const elapsed = weeksSinceCycleStart(cycleStartDate, date)
  return (elapsed % 12) + 1
}

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

export function getVocabularyContext(
  cycleStartDate: string,
  level: CurriculumLevel,
  date = new Date(),
) {
  const macroWeek = getMacroWeek(cycleStartDate, date)
  const module = getWeekModule(level, macroWeek)
  return {
    macroWeek,
    module,
    isFusionWeek: module.isFusionWeek,
    isDeload: isDeloadWeek(date),
    dayVariant: getDayVariant(date),
    level,
  }
}
