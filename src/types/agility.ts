/** Agility Engine — repertoire-driven technical support */

export type TechnicalRequirement =
  | 'octaves'
  | 'repeated-notes'
  | 'double-thirds'
  | 'arpeggio-velocity'
  | 'finger-independence'
  | 'rotation'
  | 'forearm-release'
  | 'trills'
  | 'cross-rhythms'

export interface RepertoirePiece {
  id: string
  title: string
  composer: string
  difficulty: number
  status: 'learning' | 'polishing' | 'performance-ready' | 'maintenance'
  technicalRequirements: TechnicalRequirement[]
  currentTempo: number
  targetTempo: number
  progressPercent: number
}

export interface SupportingExercise {
  id: string
  name: string
  requirement: TechnicalRequirement
  repertoirePieceId: string
  description: string
  durationMinutes: number
}
