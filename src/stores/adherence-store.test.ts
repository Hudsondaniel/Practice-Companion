import { beforeEach, describe, expect, it } from 'vitest'
import { useAdherenceStore } from '@/stores/adherence-store'

describe('adherence-store', () => {
  beforeEach(() => {
    useAdherenceStore.setState({
      currentSessionId: null,
      currentSessionDate: null,
      phaseStartedAt: null,
      logs: [],
      history: [],
    })
  })

  it('ensureSessionLog creates a log only when none exists for today', () => {
    const today = '2026-06-10'
    useAdherenceStore.getState().ensureSessionLog(today)
    const firstId = useAdherenceStore.getState().currentSessionId
    expect(firstId).toBeTruthy()

    useAdherenceStore.getState().ensureSessionLog(today)
    expect(useAdherenceStore.getState().currentSessionId).toBe(firstId)
  })

  it('ensureSessionLog replaces stale session from another day', () => {
    useAdherenceStore.getState().startSessionLog('old-session', '2026-06-09')
    useAdherenceStore.getState().ensureSessionLog('2026-06-10')
    expect(useAdherenceStore.getState().currentSessionDate).toBe('2026-06-10')
    expect(useAdherenceStore.getState().currentSessionId).not.toBe('old-session')
  })

  it('finishSession persists summary when logs exist', () => {
    useAdherenceStore.getState().startSessionLog('sess-1', '2026-06-10')
    useAdherenceStore.getState().logPhaseCompletion(
      {
        phaseId: 'deep-work',
        phaseTitle: 'Deep Work',
        blockId: 'concept-forge',
        plannedSeconds: 600,
      },
      0,
    )

    const summary = useAdherenceStore.getState().finishSession()
    expect(summary).not.toBeNull()
    expect(summary?.sessionId).toBe('sess-1')
    expect(useAdherenceStore.getState().history).toHaveLength(1)
    expect(useAdherenceStore.getState().currentSessionId).toBeNull()
  })

  it('finishSession returns null when no session was started', () => {
    expect(useAdherenceStore.getState().finishSession()).toBeNull()
  })
})
