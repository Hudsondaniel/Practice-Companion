import type { GuidedStep } from '@/types/practice-method'
import { buildVocabularyLabSession } from '@/features/vocabulary-lab/daily-session'
import type { CurriculumLevel } from '@/features/vocabulary-lab/types'

export function step(summary: string, detail: string, example?: string, durationSeconds?: number): GuidedStep {
  return { summary, detail, example, durationSeconds }
}

export function stepsFromStrings(items: string[]): GuidedStep[] {
  return items.map((s) => ({ summary: s, detail: s }))
}

export function vocabularyLabSteps(
  keyCluster: string[],
  options: {
    currentWeek: number
    level?: CurriculumLevel
    date?: Date
    monthlyTuneTitles?: string[]
  },
) {
  return buildVocabularyLabSession(keyCluster, options)
}
