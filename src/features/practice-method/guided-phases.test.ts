import { describe, expect, it } from 'vitest'
import { generateGuidedPhases } from './guided-phases'
import type { ActiveConcept } from '@/types/practice-method'
import { allocateStepDurations } from '@/lib/step-timing'
import type { DeviceBacklogItem } from '@/types/practice-method'

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

const mockBacklog: DeviceBacklogItem[] = [
  {
    id: '1',
    label: 'Enclosure',
    description: 'Chromatic approach to 3rd',
    harmonicContext: 'V7',
    keys: ['C'],
    tier: 'current',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    label: 'Gospel IV',
    description: 'IV over V move',
    harmonicContext: 'G7 → C',
    keys: ['F'],
    tier: 'next',
    createdAt: new Date().toISOString(),
  },
]

describe('generateGuidedPhases', () => {
  it('adds concept library review as its own deep work phase', () => {
    const phases = generateGuidedPhases({
      dayType: 'identity',
      activeConcept: mockConcept,
      monthlyTunes: [],
      deviceBacklog: mockBacklog,
      date: new Date('2026-06-16T12:00:00'),
    })

    const review = phases.find((p) => p.id === 'concept-library-review')
    const deep = phases.find((p) => p.id === 'deep-work')
    expect(review).toBeDefined()
    expect(review!.sessionZone).toBe('deep-work')
    expect(review!.steps).toHaveLength(2)
    expect(review!.steps.every((s) => s.durationSeconds === 120)).toBe(true)
    expect(review!.durationMinutes).toBe(4)
    expect(deep!.steps.every((s) => !s.summary.startsWith('Library review:'))).toBe(true)
    expect(deep!.durationMinutes).toBe(32)

    const deepWorkPhases = phases.filter((p) => p.sessionZone === 'deep-work' && !p.isRecovery)
    expect(deepWorkPhases.map((p) => p.id)).toEqual(['concept-library-review', 'deep-work'])
  })

  it('includes one Vocabulary Lab phase (25 min)', () => {
    const phases = generateGuidedPhases({
      dayType: 'identity',
      activeConcept: mockConcept,
      monthlyTunes: [],
      date: new Date('2026-06-15T12:00:00'),
    })

    const vocabPhases = phases.filter((p) => p.blockId === 'agility-fluency-lab')
    expect(vocabPhases).toHaveLength(1)
    expect(vocabPhases[0]?.id).toBe('vocabulary-lab')
    expect(vocabPhases[0]?.durationMinutes).toBe(25)
    expect(vocabPhases[0]?.blockName).toBe('Vocabulary Lab')
  })

  it('vocabulary steps sum to phase duration', () => {
    const phases = generateGuidedPhases({
      dayType: 'identity',
      activeConcept: mockConcept,
      monthlyTunes: [],
      date: new Date('2026-06-15T12:00:00'),
    })
    const vocab = phases.find((p) => p.id === 'vocabulary-lab')
    expect(vocab).toBeDefined()
    const totalSeconds = vocab!.durationMinutes * 60
    const durations = allocateStepDurations(vocab!.steps, totalSeconds)
    expect(durations.reduce((a, b) => a + b, 0)).toBe(totalSeconds)
  })
})
