import type { FluencyExercise } from '@/types/fluency'

const STAGNATION_THRESHOLD_WEEKS = 2

export interface RotationRecommendation {
  exerciseId: string
  reason: string
  suggestedReplacement?: string
}

export function detectStagnation(exercises: FluencyExercise[]): RotationRecommendation[] {
  return exercises
    .filter((e) => e.stagnationWeeks >= STAGNATION_THRESHOLD_WEEKS)
    .map((e) => ({
      exerciseId: e.id,
      reason: `No BPM progress in ${e.stagnationWeeks} weeks (stuck at ${e.currentBpm}/${e.targetBpm})`,
      suggestedReplacement: getRotationSuggestion(e.category),
    }))
}

function getRotationSuggestion(category: FluencyExercise['category']): string {
  const rotations: Record<FluencyExercise['category'], string> = {
    scales: 'Arpeggios in same keys — test evenness transfer',
    arpeggios: 'Bebop scales — add swing articulation',
    'bebop-scales': 'Oscar Peterson transcription fragment',
    chromatic: 'Czerny velocity study — structured rotation',
    czerny: 'Hanon — finger independence focus',
    hanon: 'Chromatic — full range relaxation check',
    'oscar-peterson': 'Bebop scales — consolidate vocabulary',
    'transcription-fragment': 'Scales in transcription keys — velocity push',
  }
  return rotations[category]
}

export function shouldRotate(exercise: FluencyExercise): boolean {
  return exercise.stagnationWeeks >= STAGNATION_THRESHOLD_WEEKS
}
