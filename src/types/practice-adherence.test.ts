import { describe, expect, it } from 'vitest'
import { computeAdherenceScore, buildSessionSummary } from '@/types/practice-adherence'
import type { PhaseCompletionLog } from '@/types/practice-adherence'

function log(status: PhaseCompletionLog['status']): PhaseCompletionLog {
  return {
    phaseId: 'p1',
    phaseTitle: 'Phase',
    blockId: 'concept-forge',
    sessionDate: '2026-06-10',
    plannedSeconds: 600,
    actualSeconds: 600,
    status,
    completedAt: '2026-06-10T12:00:00.000Z',
  }
}

describe('practice-adherence', () => {
  it('scores complete phases at 100', () => {
    expect(computeAdherenceScore([log('complete')])).toBe(100)
  })

  it('penalizes skipped phases', () => {
    expect(computeAdherenceScore([log('complete'), log('skipped')])).toBe(50)
  })

  it('builds session summary counts', () => {
    const summary = buildSessionSummary('s1', '2026-06-10', [
      log('complete'),
      log('skipped'),
      log('rushed'),
    ])
    expect(summary.totalPhases).toBe(3)
    expect(summary.completedPhases).toBe(1)
    expect(summary.skippedPhases).toBe(1)
    expect(summary.rushedPhases).toBe(1)
  })
})
