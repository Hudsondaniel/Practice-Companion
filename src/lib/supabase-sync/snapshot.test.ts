import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  collectAppSnapshot,
  createEmptyAppSnapshot,
  hydrateAppSnapshot,
  snapshotIsEmpty,
} from '@/lib/supabase-sync/snapshot'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useAdherenceStore } from '@/stores/adherence-store'
import type { ActiveConcept, GuidedPhase } from '@/types/practice-method'

vi.mock('@/lib/guided-fullscreen', () => ({
  enterGuidedFocusMode: vi.fn(),
  exitGuidedFocusModeIfActive: vi.fn(),
}))

const concept: ActiveConcept = {
  id: 'c1',
  label: 'Voicings',
  description: 'Test',
  harmonicContext: 'V7',
  keys: ['C'],
  sourceRecordings: [],
  keyFocusCluster: ['C'],
  dualTaskPhase: 1,
  stage: 'associative',
  consecutivePassDays: 0,
  startedAt: '2026-06-01',
}

const samplePhase: GuidedPhase = {
  id: 'deep-work',
  blockId: 'concept-forge',
  blockName: 'Deep Work',
  title: 'Deep Work',
  durationMinutes: 5,
  objective: 'Practice',
  steps: [{ summary: 'Step', detail: 'Detail' }],
}

describe('snapshot roundtrip', () => {
  beforeEach(() => {
    hydrateAppSnapshot(createEmptyAppSnapshot())
  })

  it('collects and restores active concept', () => {
    usePracticeStore.setState({ activeConcept: concept })
    const snap = collectAppSnapshot()
    expect(snap.practice.activeConcept?.label).toBe('Voicings')

    hydrateAppSnapshot(createEmptyAppSnapshot())
    expect(usePracticeStore.getState().activeConcept).toBeNull()

    hydrateAppSnapshot(snap)
    expect(usePracticeStore.getState().activeConcept?.label).toBe('Voicings')
  })

  it('persists day-complete guided state without phases', () => {
    const today = new Date().toISOString().split('T')[0]!
    useGuidedSessionStore.setState({
      dayCompleted: true,
      sessionDate: today,
      phases: [],
      phaseIndex: 0,
      accumulatedSeconds: 3600,
    })

    const snap = collectAppSnapshot()
    expect(snap.guidedSession?.dayCompleted).toBe(true)

    useGuidedSessionStore.getState().endSession()
    hydrateAppSnapshot(snap)

    expect(useGuidedSessionStore.getState().isDayCompleteForToday()).toBe(true)
    expect(useGuidedSessionStore.getState().accumulatedSeconds).toBe(3600)
  })

  it('restores paused guided session with phases', () => {
    const today = new Date().toISOString().split('T')[0]!
    useGuidedSessionStore.setState({
      isActive: false,
      isPausedForDay: true,
      dayCompleted: false,
      sessionDate: today,
      phases: [samplePhase, { ...samplePhase, id: 'phase-2' }],
      phaseIndex: 1,
      isPaused: true,
      pausedRemainingSeconds: 120,
      phaseRunBudgetSeconds: 120,
    })

    const snap = collectAppSnapshot()
    hydrateAppSnapshot(createEmptyAppSnapshot())
    hydrateAppSnapshot(snap)

    expect(useGuidedSessionStore.getState().canResumeToday()).toBe(true)
    expect(useGuidedSessionStore.getState().phaseIndex).toBe(1)
  })

  it('restores adherence history', () => {
    useAdherenceStore.setState({
      history: [
        {
          sessionId: 's1',
          date: '2026-06-10',
          totalPhases: 1,
          completedPhases: 1,
          skippedPhases: 0,
          rushedPhases: 0,
          adherenceScore: 100,
          logs: [],
        },
      ],
    })

    const snap = collectAppSnapshot()
    hydrateAppSnapshot(createEmptyAppSnapshot())
    hydrateAppSnapshot(snap)
    expect(useAdherenceStore.getState().history).toHaveLength(1)
  })

  it('snapshotIsEmpty ignores completed todaySession', () => {
    const snap = createEmptyAppSnapshot()
    snap.practice.todaySession = {
      id: 't1',
      date: new Date().toISOString().split('T')[0]!,
      dayType: 'identity',
      totalMinutes: 105,
      activeConceptId: 'c1',
      completed: true,
      blocks: [],
    }
    expect(snapshotIsEmpty(snap)).toBe(false)
  })
})
