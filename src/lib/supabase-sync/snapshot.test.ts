import { describe, expect, it } from 'vitest'
import { APP_SNAPSHOT_VERSION, isAppSnapshot } from '@/types/app-snapshot'
import type { CurriculumLevel } from '@/features/vocabulary-lab/types'
import { createDefaultPracticeSchedule } from '@/types/practice-schedule'
import { snapshotIsEmpty } from '@/lib/supabase-sync/snapshot'

describe('app snapshot', () => {
  it('validates snapshot shape', () => {
    const snap = {
      version: APP_SNAPSHOT_VERSION,
      practice: {
        activeConcept: null,
        deviceBacklog: [],
        monthlyTunes: [],
        monthlyPlan: null,
        archivedMonthlyPlans: [],
        todaySession: null,
        currentBlockId: null,
        streak: 0,
        weeklyHours: 0,
        practiceSchedule: createDefaultPracticeSchedule(),
      },
      transcriptions: { projects: [], activeProjectId: null, selectedSegmentId: null },
      vocabulary: {
        curriculumLevel: 1 as CurriculumLevel,
        currentWeek: 1,
        cycleStartedAt: null,
        lastMotifClarityRating: null,
      },
      adherence: { history: [] },
      streak: { practiceDays: [], longestStreak: 0 },
      sessionTools: {
        sessionNotes: '',
        bpm: 120,
        metronomeSound: 'click' as const,
        beatsPerMeasure: 4,
        subdivision: 'quarter' as const,
        metronomeVolume: -12,
        countInBars: 0,
        lastSessionDurationSeconds: 0,
      },
      guidedSession: null,
    }
    expect(isAppSnapshot(snap)).toBe(true)
    expect(snapshotIsEmpty(snap)).toBe(true)
  })
})
