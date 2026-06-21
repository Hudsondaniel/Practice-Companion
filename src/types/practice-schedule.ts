import type { DayType } from '@/types/practice-method'

/** 0 = Sunday … 6 = Saturday (matches Date.getDay()) */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface WeekdayScheduleEntry {
  enabled: boolean
  dayType: DayType
}

export interface PracticeWeekSchedule {
  days: [
    WeekdayScheduleEntry,
    WeekdayScheduleEntry,
    WeekdayScheduleEntry,
    WeekdayScheduleEntry,
    WeekdayScheduleEntry,
    WeekdayScheduleEntry,
    WeekdayScheduleEntry,
  ]
}

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
export const WEEKDAY_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/** Mon → Sun display order */
export const WEEKDAY_DISPLAY_ORDER: WeekdayIndex[] = [1, 2, 3, 4, 5, 6, 0]

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  identity: 'Identity',
  expansion: 'Expansion',
  review: 'Review',
}

/** Matches the original method: Sun review, Mon–Wed identity, Thu–Sat expansion */
export function createDefaultPracticeSchedule(): PracticeWeekSchedule {
  return {
    days: [
      { enabled: true, dayType: 'review' },
      { enabled: true, dayType: 'identity' },
      { enabled: true, dayType: 'identity' },
      { enabled: true, dayType: 'identity' },
      { enabled: true, dayType: 'expansion' },
      { enabled: true, dayType: 'expansion' },
      { enabled: true, dayType: 'expansion' },
    ],
  }
}

export function normalizePracticeSchedule(raw: unknown): PracticeWeekSchedule {
  const fallback = createDefaultPracticeSchedule()
  if (!raw || typeof raw !== 'object') return fallback
  const days = (raw as PracticeWeekSchedule).days
  if (!Array.isArray(days) || days.length !== 7) return fallback

  return {
    days: days.map((entry, i) => {
      const base = fallback.days[i as WeekdayIndex]
      if (!entry || typeof entry !== 'object') return base
      const enabled = Boolean(entry.enabled)
      const dayType =
        entry.dayType === 'identity' || entry.dayType === 'expansion' || entry.dayType === 'review'
          ? entry.dayType
          : base.dayType
      return { enabled, dayType }
    }) as PracticeWeekSchedule['days'],
  }
}

export function getWeekdayEntry(
  schedule: PracticeWeekSchedule,
  date = new Date(),
): WeekdayScheduleEntry {
  return schedule.days[date.getDay() as WeekdayIndex]
}

export function isScheduledPracticeDay(schedule: PracticeWeekSchedule, date = new Date()): boolean {
  return getWeekdayEntry(schedule, date).enabled
}

/** Returns session type for a date, or null on rest days */
export function getDayTypeForDate(
  schedule: PracticeWeekSchedule,
  date = new Date(),
): DayType | null {
  const entry = getWeekdayEntry(schedule, date)
  return entry.enabled ? entry.dayType : null
}

export function countEnabledDays(schedule: PracticeWeekSchedule): number {
  return schedule.days.filter((d) => d.enabled).length
}

export function getReviewWeekday(schedule: PracticeWeekSchedule): WeekdayIndex | null {
  const idx = schedule.days.findIndex((d) => d.enabled && d.dayType === 'review')
  return idx >= 0 ? (idx as WeekdayIndex) : null
}

export function formatScheduleSummary(schedule: PracticeWeekSchedule): string {
  const enabled = schedule.days
    .map((d, i) => (d.enabled ? WEEKDAY_SHORT[i as WeekdayIndex] : null))
    .filter(Boolean)
  if (enabled.length === 0) return 'No practice days'
  if (enabled.length === 7) return 'Every day'
  return enabled.join(', ')
}

export function getNextPracticeDate(
  schedule: PracticeWeekSchedule,
  from = new Date(),
): { date: Date; dayType: DayType } | null {
  const cursor = new Date(from)
  cursor.setHours(12, 0, 0, 0)

  for (let i = 0; i < 14; i++) {
    const entry = getWeekdayEntry(schedule, cursor)
    const isToday =
      cursor.toISOString().split('T')[0] === from.toISOString().split('T')[0]
    if (entry.enabled && (!isToday || i > 0)) {
      return { date: new Date(cursor), dayType: entry.dayType }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return null
}

/** Streak counts consecutive scheduled practice days with logged practice; rest days are skipped */
export function computeStreakWithSchedule(
  practiceDays: string[],
  fromDate: string,
  schedule: PracticeWeekSchedule,
): number {
  const practiced = new Set(practiceDays)
  let streak = 0
  const cursor = new Date(fromDate + 'T12:00:00')

  for (let i = 0; i < 400; i++) {
    const iso = cursor.toISOString().split('T')[0]!
    const entry = schedule.days[cursor.getDay() as WeekdayIndex]

    if (entry.enabled) {
      if (practiced.has(iso)) {
        streak++
      } else {
        break
      }
    }

    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export const SCHEDULE_PRESETS: { id: string; label: string; schedule: PracticeWeekSchedule }[] = [
  {
    id: 'method-default',
    label: 'Full week (method default)',
    schedule: createDefaultPracticeSchedule(),
  },
  {
    id: 'weekdays',
    label: 'Weekdays only',
    schedule: {
      days: [
        { enabled: false, dayType: 'review' },
        { enabled: true, dayType: 'identity' },
        { enabled: true, dayType: 'identity' },
        { enabled: true, dayType: 'identity' },
        { enabled: true, dayType: 'expansion' },
        { enabled: true, dayType: 'expansion' },
        { enabled: false, dayType: 'expansion' },
      ],
    },
  },
  {
    id: 'mwf',
    label: 'Mon / Wed / Fri',
    schedule: {
      days: [
        { enabled: false, dayType: 'review' },
        { enabled: true, dayType: 'identity' },
        { enabled: false, dayType: 'identity' },
        { enabled: true, dayType: 'expansion' },
        { enabled: false, dayType: 'expansion' },
        { enabled: true, dayType: 'review' },
        { enabled: false, dayType: 'expansion' },
      ],
    },
  },
]
