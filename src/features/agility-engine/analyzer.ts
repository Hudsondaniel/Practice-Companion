import type { RepertoirePiece, SupportingExercise, TechnicalRequirement } from '@/types/agility'

const REPERTOIRE_CATALOG: RepertoirePiece[] = [
  {
    id: 'rep-1',
    title: 'Liebestraum No. 3',
    composer: 'Liszt',
    difficulty: 8,
    status: 'polishing',
    technicalRequirements: ['arpeggio-velocity', 'rotation', 'forearm-release'],
    currentTempo: 72,
    targetTempo: 88,
    progressPercent: 65,
  },
  {
    id: 'rep-2',
    title: 'Piano Sonata No. 8 "Pathétique"',
    composer: 'Beethoven',
    difficulty: 7,
    status: 'learning',
    technicalRequirements: ['octaves', 'repeated-notes', 'finger-independence'],
    currentTempo: 100,
    targetTempo: 132,
    progressPercent: 45,
  },
  {
    id: 'rep-3',
    title: 'Toccata in E Minor',
    composer: 'Khachaturian',
    difficulty: 9,
    status: 'learning',
    technicalRequirements: ['repeated-notes', 'octaves', 'cross-rhythms', 'finger-independence'],
    currentTempo: 80,
    targetTempo: 152,
    progressPercent: 30,
  },
]

const EXERCISE_TEMPLATES: Record<TechnicalRequirement, Omit<SupportingExercise, 'id' | 'repertoirePieceId'>> = {
  octaves: {
    name: 'Octave velocity — wrist rotation',
    requirement: 'octaves',
    description: 'Staccato octaves, alternating hands, metronome +2 BPM weekly',
    durationMinutes: 8,
  },
  'repeated-notes': {
    name: 'Repeated note endurance',
    requirement: 'repeated-notes',
    description: 'Single-finger repeated notes, relaxation between bursts',
    durationMinutes: 6,
  },
  'double-thirds': {
    name: 'Double third sequences',
    requirement: 'double-thirds',
    description: 'Chromatic double thirds, forearm alignment check',
    durationMinutes: 10,
  },
  'arpeggio-velocity': {
    name: 'Arpeggio velocity — spread voicings',
    requirement: 'arpeggio-velocity',
    description: 'Wide-spread arpeggios with rotation, Liszt-style',
    durationMinutes: 10,
  },
  'finger-independence': {
    name: 'Finger independence — held notes',
    requirement: 'finger-independence',
    description: 'Hold upper voice, articulate lower — Bach invention style',
    durationMinutes: 8,
  },
  rotation: {
    name: 'Forearm rotation drills',
    requirement: 'rotation',
    description: 'Slow rotation through arpeggio figures, video check',
    durationMinutes: 5,
  },
  'forearm-release': {
    name: 'Forearm release — arm weight',
    requirement: 'forearm-release',
    description: 'Drop-and-release into keys, no pressing',
    durationMinutes: 5,
  },
  trills: {
    name: 'Trill evenness',
    requirement: 'trills',
    description: 'Slow trills with even tone, gradual acceleration',
    durationMinutes: 6,
  },
  'cross-rhythms': {
    name: 'Cross-rhythm coordination',
    requirement: 'cross-rhythms',
    description: '3 against 2, 3 against 4 — hands separate then together',
    durationMinutes: 8,
  },
}

export function getRepertoireCatalog(): RepertoirePiece[] {
  return REPERTOIRE_CATALOG
}

export function analyzeRepertoire(pieceId: string): SupportingExercise[] {
  const piece = REPERTOIRE_CATALOG.find((p) => p.id === pieceId)
  if (!piece) return []

  return piece.technicalRequirements.map((req, i) => ({
    id: `se-${pieceId}-${i}`,
    repertoirePieceId: pieceId,
    ...EXERCISE_TEMPLATES[req],
  }))
}

export function getWeakestRequirement(piece: RepertoirePiece): TechnicalRequirement | null {
  return piece.technicalRequirements[0] ?? null
}
