import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurriculumLevel } from '@/features/vocabulary-lab/types'
import { defaultCycleStartDate } from '@/features/vocabulary-lab/rotation'

interface VocabularyState {
  curriculumLevel: CurriculumLevel
  cycleStartDate: string
  lastMotifClarityRating: number | null

  setCurriculumLevel: (level: CurriculumLevel) => void
  setCycleStartDate: (date: string) => void
  setLastMotifClarityRating: (rating: number) => void
}

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set) => ({
      curriculumLevel: 1,
      cycleStartDate: defaultCycleStartDate(),
      lastMotifClarityRating: null,

      setCurriculumLevel: (level) => set({ curriculumLevel: level }),
      setCycleStartDate: (date) => set({ cycleStartDate: date }),
      setLastMotifClarityRating: (rating) => set({ lastMotifClarityRating: rating }),
    }),
    { name: 'piano-mastery-vocabulary' },
  ),
)
