/** Fluency Engine — Oscar Peterson-level technical freedom */

export type FluencyMetric = 'velocity' | 'evenness' | 'articulation' | 'accuracy' | 'relaxation'

export type ExerciseCategory =
  | 'scales'
  | 'arpeggios'
  | 'bebop-scales'
  | 'chromatic'
  | 'czerny'
  | 'hanon'
  | 'oscar-peterson'
  | 'transcription-fragment'

export interface FluencyExercise {
  id: string
  name: string
  category: ExerciseCategory
  description: string
  targetBpm: number
  currentBpm: number
  keys: string[]
  durationMinutes: number
  metrics: FluencyMetric[]
  stagnationWeeks: number
  lastRotatedAt: string
}

export interface FluencySession {
  id: string
  exerciseId: string
  date: string
  bpm: number
  scores: Record<FluencyMetric, number>
  notes?: string
}

export interface FluencyProfile {
  velocityScore: number
  evennessScore: number
  articulationScore: number
  accuracyScore: number
  relaxationScore: number
  compositeScore: number
  trend: 'improving' | 'stable' | 'declining'
}
