import type { StepPedagogy } from '@/types/practice-method'

export type SoundPillar = 'pentatonic' | 'blues' | 'altered'

export type CurriculumLevel = 1 | 2 | 3 | 4

export type VocabularyStepKind =
  | 'hear'
  | 'sing'
  | 'call-response'
  | 'motif'
  | 'deploy'
  | 'integrate'

export interface VocabularyStepTemplate {
  kind: VocabularyStepKind
  summary: string
  detail: string
  example?: string
  durationSeconds: number
  pedagogy: StepPedagogy
}

export interface WeekModule {
  week: number
  pillar: SoundPillar
  title: string
  objective: string
  integrationThread: string
  isFusionWeek: boolean
  heroRefs: string
  steps: VocabularyStepTemplate[]
}

export interface VocabularySessionMeta {
  level: CurriculumLevel
  macroWeek: number
  weekTitle: string
  pillar: SoundPillar
  isFusionWeek: boolean
  isDeload: boolean
  dayVariant: string
}
