import { describe, expect, it } from 'vitest'
import { createEmptyAppSnapshot } from '@/lib/supabase-sync/snapshot'
import {
  mergeAppSnapshots,
  practiceDaysFromSnapshot,
  reconcileSnapshot,
} from '@/lib/supabase-sync/merge-snapshot'
import type { AppSnapshot } from '@/types/app-snapshot'

function withPracticeDays(snapshot: AppSnapshot, days: string[]): AppSnapshot {
  return {
    ...snapshot,
    streak: { practiceDays: days, longestStreak: days.length },
  }
}

function withAdherenceDate(snapshot: AppSnapshot, date: string): AppSnapshot {
  return {
    ...snapshot,
    adherence: {
      history: [
        {
          sessionId: `session-${date}`,
          date,
          totalPhases: 1,
          completedPhases: 1,
          skippedPhases: 0,
          rushedPhases: 0,
          adherenceScore: 100,
          logs: [],
        },
      ],
    },
  }
}

describe('merge-snapshot', () => {
  it('reconcileSnapshot backfills practiceDays from adherence history', () => {
    const snap = withAdherenceDate(createEmptyAppSnapshot(), '2026-06-03')
    const reconciled = reconcileSnapshot(snap)
    expect(reconciled.streak.practiceDays).toContain('2026-06-03')
  })

  it('mergeAppSnapshots unions practice days from both snapshots', () => {
    const cloud = withPracticeDays(createEmptyAppSnapshot(), ['2026-06-01'])
    const local = withPracticeDays(createEmptyAppSnapshot(), ['2026-06-04'])
    const merged = mergeAppSnapshots(cloud, local)
    expect(practiceDaysFromSnapshot(merged)).toEqual(['2026-06-01', '2026-06-04'])
  })

  it('mergeAppSnapshots keeps adherence history from both sides', () => {
    const cloud = withAdherenceDate(createEmptyAppSnapshot(), '2026-06-02')
    const local = withAdherenceDate(createEmptyAppSnapshot(), '2026-06-05')
    const merged = mergeAppSnapshots(cloud, local)
    expect(merged.adherence.history.map((h) => h.date).sort()).toEqual(['2026-06-02', '2026-06-05'])
  })
})
