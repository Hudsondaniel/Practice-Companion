import { describe, expect, it } from 'vitest'
import { allocateStepDurations } from '@/lib/step-timing'
import { buildVocabularyLabSession } from '@/features/vocabulary-lab/daily-session'
import { defaultCycleStartDate } from '@/features/vocabulary-lab/rotation'

describe('buildVocabularyLabSession', () => {
  it('produces 6 steps totaling 25 minutes for a normal week', () => {
    const session = buildVocabularyLabSession(['C', 'F', 'Bb'], {
      cycleStartDate: defaultCycleStartDate(),
      date: new Date('2026-06-15T12:00:00'),
    })
    expect(session.steps).toHaveLength(6)
    expect(session.durationMinutes).toBe(25)
    const durations = allocateStepDurations(session.steps, session.durationMinutes * 60)
    const total = durations.reduce((a, b) => a + b, 0)
    expect(total).toBe(25 * 60)
  })

  it('includes pedagogy on every step', () => {
    const session = buildVocabularyLabSession(['C'], {
      cycleStartDate: defaultCycleStartDate(),
      date: new Date('2026-06-15T12:00:00'),
    })
    for (const step of session.steps) {
      expect(step.pedagogy?.why).toBeTruthy()
      expect(step.pedagogy?.masters).toBeTruthy()
    }
  })

  it('flags fusion weeks for motif clarity', () => {
    const session = buildVocabularyLabSession(['C'], {
      cycleStartDate: '2026-03-01',
      date: new Date('2026-03-22T12:00:00'),
    })
    if (session.meta.macroWeek === 4) {
      expect(session.promptMotifClarity).toBe(true)
    }
  })
})
