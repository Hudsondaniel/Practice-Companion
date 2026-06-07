import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FluencyExercise, FluencyProfile } from '@/types/fluency'

interface FluencyState {
  exercises: FluencyExercise[]
  profile: FluencyProfile
  activeExerciseId: string | null

  rotateExercise: (exerciseId: string) => void
  updateBpm: (exerciseId: string, bpm: number) => void
  setActiveExercise: (id: string | null) => void
}

const DEFAULT_EXERCISES: FluencyExercise[] = [
  {
    id: 'fe-1',
    name: 'Chromatic — 4 octaves, legato',
    category: 'chromatic',
    description: 'Full-range chromatic scale, even tone, relaxed wrist',
    targetBpm: 140,
    currentBpm: 112,
    keys: ['C'],
    durationMinutes: 10,
    metrics: ['velocity', 'evenness', 'relaxation'],
    stagnationWeeks: 0,
    lastRotatedAt: new Date().toISOString(),
  },
  {
    id: 'fe-2',
    name: 'Bebop dominant — all positions',
    category: 'bebop-scales',
    description: 'Dominant bebop scale ascending/descending, swing feel',
    targetBpm: 160,
    currentBpm: 130,
    keys: ['F', 'Bb', 'Eb'],
    durationMinutes: 8,
    metrics: ['articulation', 'accuracy'],
    stagnationWeeks: 1,
    lastRotatedAt: new Date().toISOString(),
  },
  {
    id: 'fe-3',
    name: 'Oscar Peterson ii–V pattern',
    category: 'oscar-peterson',
    description: 'Transcribed Peterson ii–V–I line in 3 keys',
    targetBpm: 180,
    currentBpm: 145,
    keys: ['C', 'F', 'Bb'],
    durationMinutes: 12,
    metrics: ['velocity', 'articulation', 'accuracy'],
    stagnationWeeks: 0,
    lastRotatedAt: new Date().toISOString(),
  },
]

export const useFluencyStore = create<FluencyState>()(
  persist(
    (set) => ({
      exercises: DEFAULT_EXERCISES,
      activeExerciseId: 'fe-1',
      profile: {
        velocityScore: 78,
        evennessScore: 82,
        articulationScore: 74,
        accuracyScore: 85,
        relaxationScore: 71,
        compositeScore: 78,
        trend: 'improving',
      },

      rotateExercise: (exerciseId) =>
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === exerciseId
              ? { ...e, stagnationWeeks: 0, lastRotatedAt: new Date().toISOString() }
              : e,
          ),
        })),

      updateBpm: (exerciseId, bpm) =>
        set((s) => ({
          exercises: s.exercises.map((e) =>
            e.id === exerciseId ? { ...e, currentBpm: bpm } : e,
          ),
        })),

      setActiveExercise: (id) => set({ activeExerciseId: id }),
    }),
    { name: 'piano-mastery-fluency' },
  ),
)
