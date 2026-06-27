import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useAdherenceStore } from '@/stores/adherence-store'
import type { GuidedPhase } from '@/types/practice-method'

vi.mock('@/lib/guided-fullscreen', () => ({
  enterGuidedFocusMode: vi.fn(),
  exitGuidedFocusModeIfActive: vi.fn(),
}))

const samplePhase: GuidedPhase = {
  id: 'deep-work',
  blockId: 'concept-forge',
  blockName: 'Deep Work',
  title: 'Test phase',
  durationMinutes: 5,
  objective: 'Test',
  steps: [{ summary: 'Step one', detail: 'Do the thing' }],
}

describe('guided-session-store lifecycle', () => {
  beforeEach(() => {
    useGuidedSessionStore.getState().endSession()
    usePracticeStore.setState({ todaySession: null, currentBlockId: null })
  })

  it('blocks a new start after the day is marked complete', () => {
    useGuidedSessionStore.getState().startSession([samplePhase])
    useGuidedSessionStore.getState().finishDaySession()

    const result = useGuidedSessionStore.getState().startSession([samplePhase])

    expect(result).toBe('day-complete')
    expect(useGuidedSessionStore.getState().isDayCompleteForToday()).toBe(true)
    expect(useGuidedSessionStore.getState().phaseIndex).toBe(0)
    expect(useGuidedSessionStore.getState().phases).toHaveLength(0)
  })

  it('resumes a paused session instead of restarting from phase 1', () => {
    useGuidedSessionStore.getState().startSession([samplePhase, { ...samplePhase, id: 'phase-2' }])
    useGuidedSessionStore.getState().goToPhase(1)
    useGuidedSessionStore.getState().pauseSession()

    const result = useGuidedSessionStore.getState().startSession([samplePhase, { ...samplePhase, id: 'phase-2' }])

    expect(result).toBe('resumed')
    expect(useGuidedSessionStore.getState().phaseIndex).toBe(1)
    expect(useGuidedSessionStore.getState().isActive).toBe(true)
  })

  it('marks todaySession completed when finishing for the day without forcing every block complete', () => {
    const today = new Date().toISOString().split('T')[0]!
    usePracticeStore.setState({
      todaySession: {
        id: 'today',
        date: today,
        dayType: 'identity',
        totalMinutes: 105,
        activeConceptId: 'c1',
        completed: false,
        blocks: [
          {
            blockId: 'concept-forge',
            plannedMinutes: 30,
            actualMinutes: 10,
            completed: true,
          },
          {
            blockId: 'transcription-integration',
            plannedMinutes: 25,
            actualMinutes: 0,
            completed: false,
          },
        ],
      },
    })

    useGuidedSessionStore.getState().startSession([samplePhase])
    useGuidedSessionStore.getState().finishDaySession()

    const session = usePracticeStore.getState().todaySession
    expect(session?.completed).toBe(true)
    expect(session?.blocks[0]?.completed).toBe(true)
    expect(session?.blocks[1]?.completed).toBe(false)
    expect(useGuidedSessionStore.getState().isDayCompleteForToday()).toBe(true)
  })

  it('ensureAdherenceLog is invoked on resume', () => {
    useGuidedSessionStore.getState().startSession([samplePhase, { ...samplePhase, id: 'phase-2' }])
    useGuidedSessionStore.getState().pauseSession()

    useAdherenceStore.setState({
      currentSessionId: null,
      currentSessionDate: null,
      logs: [],
      history: [],
      phaseStartedAt: null,
    })

    useGuidedSessionStore.getState().resumeSession()
    expect(useAdherenceStore.getState().currentSessionId).toBeTruthy()
    expect(useAdherenceStore.getState().currentSessionDate).toBe(
      new Date().toISOString().split('T')[0],
    )
  })
})
