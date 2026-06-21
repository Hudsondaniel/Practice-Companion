import { currentMonthYear } from '@/types/practice-method'
import type { DayType } from '@/types/practice-method'
import { formatMonthContext, getEarBlockDay, isDeloadWeek } from '@/lib/practice-week'
import { usePracticeStore } from '@/stores/practice-store'
import {
  getDayTypeForDate,
  getReviewWeekday,
  isScheduledPracticeDay,
  WEEKDAY_FULL,
} from '@/types/practice-schedule'

export function getDayType(date = new Date()): DayType | null {
  return getDayTypeForDate(usePracticeStore.getState().practiceSchedule, date)
}

export function isPracticeDay(date = new Date()): boolean {
  return isScheduledPracticeDay(usePracticeStore.getState().practiceSchedule, date)
}

export function isReviewDay(date = new Date()): boolean {
  return getDayType(date) === 'review'
}

export function getReviewDayLabel(): string | null {
  const review = getReviewWeekday(usePracticeStore.getState().practiceSchedule)
  return review != null ? WEEKDAY_FULL[review] : null
}

/** @deprecated use isReviewDay */
export function isSunday(date = new Date()): boolean {
  return isReviewDay(date)
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
  const schedule = usePracticeStore.getState().practiceSchedule
  if (!isScheduledPracticeDay(schedule, date)) return null
  const mode = getEarBlockDay(date)
  if (mode === 'off') return null
  return mode.replace(/-/g, ' ')
}

export { isDeloadWeek, getEarBlockDay }
