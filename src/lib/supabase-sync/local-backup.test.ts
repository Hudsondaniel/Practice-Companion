import { beforeEach, describe, expect, it } from 'vitest'
import { readLocalBackup, writeLocalBackup, clearLocalBackup } from '@/lib/supabase-sync/local-backup'
import { usePracticeStore } from '@/stores/practice-store'
import type { ActiveConcept } from '@/types/practice-method'

const concept: ActiveConcept = {
  id: 'c1',
  label: 'Test concept',
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

describe('local-backup', () => {
  beforeEach(() => {
    clearLocalBackup()
    usePracticeStore.setState({
      activeConcept: concept,
      deviceBacklog: [],
      monthlyTunes: [],
      monthlyPlan: null,
      todaySession: null,
    })
  })

  it('writes and reads a non-empty snapshot for the user', () => {
    writeLocalBackup('user-1')
    const backup = readLocalBackup('user-1')
    expect(backup?.practice.activeConcept?.label).toBe('Test concept')
  })

  it('returns null for a different user id', () => {
    writeLocalBackup('user-1')
    expect(readLocalBackup('user-2')).toBeNull()
  })

  it('clears backup from sessionStorage', () => {
    writeLocalBackup('user-1')
    clearLocalBackup()
    expect(readLocalBackup('user-1')).toBeNull()
  })
})
