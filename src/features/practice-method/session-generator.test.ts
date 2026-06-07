import { describe, expect, it } from 'vitest'
import { generatePracticeSession } from './session-generator'
import { BASE_SESSION_MINUTES } from '@/types/practice-method'

describe('generatePracticeSession', () => {
  it('generates 120-minute session with 6 blocks on identity day', () => {
    const session = generatePracticeSession({
      availableMinutes: BASE_SESSION_MINUTES,
      dayType: 'identity',
      activeConceptLabel: 'Peterson enclosure',
      keyCluster: ['C', 'Db', 'D'],
      dualTaskPhase: 1,
      monthlyTunes: ['Autumn Leaves', 'All The Things You Are'],
      isReviewDay: false,
    })

    expect(session.totalMinutes).toBe(BASE_SESSION_MINUTES)
    expect(session.blocks).toHaveLength(6)
    expect(session.blocks.some((b) => b.blockId === 'agility-fluency-lab')).toBe(true)
    expect(session.blocks.some((b) => b.blockId === 'recording-review')).toBe(false)
  })

  it('replaces consolidation with recording review on review day', () => {
    const session = generatePracticeSession({
      availableMinutes: BASE_SESSION_MINUTES,
      dayType: 'review',
      activeConceptLabel: 'Peterson enclosure',
      keyCluster: ['C'],
      dualTaskPhase: 1,
      monthlyTunes: ['Autumn Leaves'],
      isReviewDay: true,
    })

    expect(session.blocks.some((b) => b.blockId === 'recording-review')).toBe(true)
    expect(session.blocks.some((b) => b.blockId === 'consolidation')).toBe(false)
    expect(session.blocks.some((b) => b.blockId === 'agility-fluency-lab')).toBe(true)
  })
})
