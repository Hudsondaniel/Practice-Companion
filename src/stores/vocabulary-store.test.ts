import { describe, expect, it } from 'vitest'
import { normalizeVocabularyFromSnapshot } from '@/stores/vocabulary-store'

describe('normalizeVocabularyFromSnapshot', () => {
  it('uses currentWeek when present', () => {
    const v = normalizeVocabularyFromSnapshot({ currentWeek: 5, curriculumLevel: 1 })
    expect(v.currentWeek).toBe(5)
  })

  it('migrates legacy cycleStartDate to currentWeek', () => {
    const v = normalizeVocabularyFromSnapshot({
      cycleStartDate: '2026-01-01',
      curriculumLevel: 1,
    })
    expect(v.currentWeek).toBeGreaterThanOrEqual(1)
    expect(v.currentWeek).toBeLessThanOrEqual(12)
    expect(v.cycleStartedAt).toBe('2026-01-01')
  })
})
