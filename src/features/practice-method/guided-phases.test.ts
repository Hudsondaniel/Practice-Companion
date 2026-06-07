import { describe, expect, it } from 'vitest'
import { generateGuidedPhases } from './guided-phases'
import type { ActiveConcept } from '@/types/practice-method'

const mockConcept: ActiveConcept = {
  id: '1',
  label: 'Test concept',
  description: 'Test',
  harmonicContext: 'V7',
  keys: ['C'],
  sourceRecordings: [],
  keyFocusCluster: ['C', 'Db'],
  dualTaskPhase: 1,
  stage: 'associative',
  consecutivePassDays: 0,
  startedAt: new Date().toISOString(),
}

describe('generateGuidedPhases', () => {
  it('includes one daily agility-fluency phase (20 min)', () => {
    const phases = generateGuidedPhases({
      dayType: 'identity',
      activeConcept: mockConcept,
      monthlyTunes: [],
    })

    const agilityPhases = phases.filter((p) => p.blockId === 'agility-fluency-lab')
    expect(agilityPhases).toHaveLength(1)
    expect(agilityPhases[0]?.id).toBe('agility-daily')
    expect(agilityPhases[0]?.durationMinutes).toBe(20)
  })
})
