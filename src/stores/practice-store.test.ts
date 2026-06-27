import { beforeEach, describe, expect, it } from 'vitest'
import { usePracticeStore } from '@/stores/practice-store'
import type { ActiveConcept } from '@/types/practice-method'
import { createDefaultPracticeSchedule } from '@/types/practice-schedule'

const concept: ActiveConcept = {
  id: 'c1',
  label: 'Shell voicings',
  description: 'Shell shapes in ii-V',
  harmonicContext: 'ii-V-I',
  keys: ['C'],
  sourceRecordings: [],
  keyFocusCluster: ['C', 'F'],
  dualTaskPhase: 1,
  stage: 'associative',
  consecutivePassDays: 0,
  startedAt: '2026-06-01',
}

const monthYear = '2026-06'
const threeTunes = [
  { id: 't1', title: 'Tune A', type: 'standard' as const, key: 'C', deploymentPoints: [], monthYear },
  { id: 't2', title: 'Tune B', type: 'standard' as const, key: 'F', deploymentPoints: [], monthYear },
  { id: 't3', title: 'Tune C', type: 'hymn' as const, key: 'Bb', deploymentPoints: [], monthYear },
]

describe('practice-store ensureTodaySession', () => {
  beforeEach(() => {
    usePracticeStore.setState({
      activeConcept: concept,
      monthlyPlan: {
        monthYear: new Date().toISOString().slice(0, 7),
        configuredAt: '2026-06-01T00:00:00.000Z',
        tunes: threeTunes,
        keyFocusCluster: ['C'],
        dualTaskPhase: 1,
        transcriptionProject: 'Test',
        heroPianists: [],
        reviewDay: 6,
      },
      todaySession: null,
      currentBlockId: null,
      practiceSchedule: createDefaultPracticeSchedule(),
    })
  })

  it('creates todaySession when month and concept are ready', () => {
    usePracticeStore.getState().ensureTodaySession('identity')
    const session = usePracticeStore.getState().todaySession
    expect(session).not.toBeNull()
    expect(session?.dayType).toBe('identity')
    expect(session?.blocks.length).toBeGreaterThan(0)
  })

  it('preserves todaySession on rest day when dayType is already saved', () => {
    const today = new Date().toISOString().split('T')[0]!
    usePracticeStore.getState().ensureTodaySession('identity')
    const before = usePracticeStore.getState().todaySession
    usePracticeStore.getState().ensureTodaySession('identity')
    expect(usePracticeStore.getState().todaySession?.id).toBe(before?.id)
    expect(usePracticeStore.getState().todaySession?.date).toBe(today)
  })

  it('clears todaySession when month becomes unconfigured', () => {
    usePracticeStore.getState().ensureTodaySession('identity')
    usePracticeStore.setState({ monthlyPlan: null })
    usePracticeStore.getState().ensureTodaySession('identity')
    expect(usePracticeStore.getState().todaySession).toBeNull()
  })

  it('completeBlock marks individual blocks without forcing all complete', () => {
    usePracticeStore.getState().ensureTodaySession('identity')
    const blockId = usePracticeStore.getState().todaySession!.blocks[0]!.blockId
    usePracticeStore.getState().completeBlock(blockId, 10)
    const session = usePracticeStore.getState().todaySession!
    expect(session.blocks[0]?.completed).toBe(true)
    expect(session.completed).toBe(false)
  })
})
