import { describe, expect, it } from 'vitest'
import {
  computeStreakWithSchedule,
  createDefaultPracticeSchedule,
  getDayTypeForDate,
  isScheduledPracticeDay,
  normalizePracticeSchedule,
} from '@/types/practice-schedule'

describe('practice schedule', () => {
  it('defaults match original method week', () => {
    const schedule = createDefaultPracticeSchedule()
    expect(getDayTypeForDate(schedule, new Date('2026-06-07T12:00:00'))).toBe('review') // Sun
    expect(getDayTypeForDate(schedule, new Date('2026-06-08T12:00:00'))).toBe('identity') // Mon
    expect(getDayTypeForDate(schedule, new Date('2026-06-11T12:00:00'))).toBe('expansion') // Thu
  })

  it('rest days return null day type', () => {
    const schedule = normalizePracticeSchedule({
      days: [
        { enabled: false, dayType: 'review' },
        { enabled: true, dayType: 'identity' },
        { enabled: false, dayType: 'identity' },
        { enabled: true, dayType: 'expansion' },
        { enabled: false, dayType: 'expansion' },
        { enabled: true, dayType: 'review' },
        { enabled: false, dayType: 'expansion' },
      ],
    })
    expect(isScheduledPracticeDay(schedule, new Date('2026-06-07T12:00:00'))).toBe(false) // Sun
    expect(getDayTypeForDate(schedule, new Date('2026-06-08T12:00:00'))).toBe('identity') // Mon
  })

  it('streak skips rest days', () => {
    const schedule = createDefaultPracticeSchedule()
    // practiced Mon–Wed only; Sun rest shouldn't break if we didn't practice Sun
    const days = ['2026-06-08', '2026-06-09', '2026-06-10']
    expect(computeStreakWithSchedule(days, '2026-06-10', schedule)).toBe(3)
  })
})
