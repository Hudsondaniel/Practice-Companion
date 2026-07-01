import type { AppSnapshot } from '@/types/app-snapshot'
import type { SessionAdherenceSummary } from '@/types/practice-adherence'
import type { DailyPracticeSession } from '@/types/practice-method'

function uniqueSorted(dates: string[]): string[] {
  return [...new Set(dates.filter(Boolean))].sort()
}

function computeLongestStreak(practiceDays: string[]): number {
  if (practiceDays.length === 0) return 0
  const sorted = [...practiceDays].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1]!}T12:00:00`)
    const curr = new Date(`${sorted[i]!}T12:00:00`)
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

/** Collect practice-day dates from every durable field in a snapshot. */
export function practiceDaysFromSnapshot(snapshot: AppSnapshot): string[] {
  const fromStreak = snapshot.streak?.practiceDays ?? []
  const fromAdherence = (snapshot.adherence?.history ?? []).map((h) => h.date)
  const fromGuided =
    snapshot.guidedSession?.sessionDate &&
    (snapshot.guidedSession.dayCompleted ||
      (snapshot.guidedSession.accumulatedSeconds ?? 0) >= 60)
      ? [snapshot.guidedSession.sessionDate]
      : []
  const fromToday =
    snapshot.practice.todaySession?.completed && snapshot.practice.todaySession.date
      ? [snapshot.practice.todaySession.date]
      : []
  return uniqueSorted([...fromStreak, ...fromAdherence, ...fromGuided, ...fromToday])
}

export function mergeAdherenceHistory(
  a: SessionAdherenceSummary[],
  b: SessionAdherenceSummary[],
): SessionAdherenceSummary[] {
  const byId = new Map<string, SessionAdherenceSummary>()
  for (const entry of [...a, ...b]) {
    const existing = byId.get(entry.sessionId)
    if (!existing || entry.logs.length >= existing.logs.length) {
      byId.set(entry.sessionId, entry)
    }
  }
  return [...byId.values()].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 30)
}

function mergeTodaySession(
  a: DailyPracticeSession | null,
  b: DailyPracticeSession | null,
): DailyPracticeSession | null {
  if (!a) return b
  if (!b) return a
  if (a.date !== b.date) return a.date > b.date ? a : b
  if (a.completed || b.completed) {
    return {
      ...a,
      completed: a.completed || b.completed,
      blocks: a.blocks.map((block, i) => ({
        ...block,
        completed: block.completed || Boolean(b.blocks[i]?.completed),
      })),
    }
  }
  return a
}

/** Ensure streak + adherence history are internally consistent. */
export function reconcileSnapshot(snapshot: AppSnapshot): AppSnapshot {
  const practiceDays = practiceDaysFromSnapshot(snapshot)
  const longest = Math.max(
    snapshot.streak?.longestStreak ?? 0,
    computeLongestStreak(practiceDays),
  )
  return {
    ...snapshot,
    streak: {
      practiceDays,
      longestStreak: longest,
    },
  }
}

export function snapshotHasMorePracticeData(a: AppSnapshot, b: AppSnapshot): boolean {
  const daysA = practiceDaysFromSnapshot(a).length
  const daysB = practiceDaysFromSnapshot(b).length
  if (daysA !== daysB) return daysA > daysB
  const histA = a.adherence?.history?.length ?? 0
  const histB = b.adherence?.history?.length ?? 0
  return histA > histB
}

/** Merge cloud + local/backup — never discard practice days from either side. */
export function mergeAppSnapshots(primary: AppSnapshot, secondary: AppSnapshot): AppSnapshot {
  const practiceDays = uniqueSorted([
    ...practiceDaysFromSnapshot(primary),
    ...practiceDaysFromSnapshot(secondary),
  ])

  const merged: AppSnapshot = {
    ...primary,
    practice: {
      ...primary.practice,
      todaySession: mergeTodaySession(
        primary.practice.todaySession,
        secondary.practice.todaySession,
      ),
      archivedMonthlyPlans:
        primary.practice.archivedMonthlyPlans.length >= secondary.practice.archivedMonthlyPlans.length
          ? primary.practice.archivedMonthlyPlans
          : secondary.practice.archivedMonthlyPlans,
    },
    adherence: {
      history: mergeAdherenceHistory(
        primary.adherence?.history ?? [],
        secondary.adherence?.history ?? [],
      ),
    },
    streak: {
      practiceDays,
      longestStreak: Math.max(
        primary.streak?.longestStreak ?? 0,
        secondary.streak?.longestStreak ?? 0,
        computeLongestStreak(practiceDays),
      ),
    },
    guidedSession: primary.guidedSession ?? secondary.guidedSession,
  }

  return reconcileSnapshot(merged)
}
