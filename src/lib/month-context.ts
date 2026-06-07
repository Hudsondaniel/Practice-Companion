import { currentMonthYear } from '@/types/practice-method'
import { formatMonthContext, getEarBlockDay, isDeloadWeek } from '@/lib/practice-week'

export function getDayType(date = new Date()): 'identity' | 'expansion' | 'review' {
  const day = date.getDay()
  if (day === 0) return 'review'
  if (day <= 3) return 'identity'
  return 'expansion'
}

export function isSunday(date = new Date()): boolean {
  return date.getDay() === 0
}

export function needsMonthRollover(planMonthYear: string | undefined, date = new Date()): boolean {
  if (!planMonthYear) return false
  return planMonthYear !== currentMonthYear(date)
}

export function formatMonthHeader(planMonthYear: string | undefined, date = new Date()): string {
  if (!planMonthYear) return formatMonthContext(date)
  const current = currentMonthYear(date)
  if (planMonthYear !== current) {
    return `${planMonthYear} plan active · calendar is ${current}`
  }
  return formatMonthContext(date)
}

export function getEarBlockLabel(date = new Date()): string | null {
  const mode = getEarBlockDay(date)
  if (mode === 'off') return null
  return mode.replace(/-/g, ' ')
}

export { isDeloadWeek, getEarBlockDay }
