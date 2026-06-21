import { create } from 'zustand'
import type { CurriculumLevel } from '@/features/vocabulary-lab/types'
import { clampMacroWeek, getMacroWeekFromStartDate } from '@/features/vocabulary-lab/rotation'

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!
}

interface VocabularyState {
  curriculumLevel: CurriculumLevel
  /** User-controlled position in the 12-week spiral (1–12) */
  currentWeek: number
  /** Last time the user started or reset the cycle */
  cycleStartedAt: string | null
  lastMotifClarityRating: number | null

  setCurriculumLevel: (level: CurriculumLevel) => void
  setCurrentWeek: (week: number) => void
  previousWeek: () => void
  nextWeek: () => void
  /** Back to week 1 — choose when to begin; not tied to calendar */
  resetVocabularyCycle: () => void
  setLastMotifClarityRating: (rating: number) => void
}

export const useVocabularyStore = create<VocabularyState>()((set, get) => ({
  curriculumLevel: 1,
  currentWeek: 1,
  cycleStartedAt: null,
  lastMotifClarityRating: null,

  setCurriculumLevel: (level) => set({ curriculumLevel: level }),

  setCurrentWeek: (week) => set({ currentWeek: clampMacroWeek(week) }),

  previousWeek: () => {
    const next = Math.max(1, get().currentWeek - 1)
    set({ currentWeek: next })
  },

  nextWeek: () => {
    const next = Math.min(12, get().currentWeek + 1)
    set({ currentWeek: next })
  },

  resetVocabularyCycle: () =>
    set({
      currentWeek: 1,
      cycleStartedAt: todayIso(),
      lastMotifClarityRating: null,
    }),

  setLastMotifClarityRating: (rating) => set({ lastMotifClarityRating: rating }),
}))

/** Hydrate from cloud snapshot (supports legacy cycleStartDate) */
export function normalizeVocabularyFromSnapshot(raw: {
  curriculumLevel?: CurriculumLevel
  currentWeek?: number
  cycleStartedAt?: string | null
  cycleStartDate?: string
  lastMotifClarityRating?: number | null
}): Pick<VocabularyState, 'curriculumLevel' | 'currentWeek' | 'cycleStartedAt' | 'lastMotifClarityRating'> {
  let currentWeek = 1
  if (typeof raw.currentWeek === 'number' && raw.currentWeek >= 1 && raw.currentWeek <= 12) {
    currentWeek = raw.currentWeek
  } else if (raw.cycleStartDate) {
    currentWeek = getMacroWeekFromStartDate(raw.cycleStartDate)
  }

  return {
    curriculumLevel: (raw.curriculumLevel ?? 1) as CurriculumLevel,
    currentWeek: clampMacroWeek(currentWeek),
    cycleStartedAt: raw.cycleStartedAt ?? raw.cycleStartDate ?? null,
    lastMotifClarityRating: raw.lastMotifClarityRating ?? null,
  }
}
