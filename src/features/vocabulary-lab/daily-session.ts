import type { GuidedStep } from '@/types/practice-method'
import type { CurriculumLevel, VocabularySessionMeta } from '@/features/vocabulary-lab/types'
import { buildGuidedSteps } from '@/features/vocabulary-lab/step-builder'
import { getDeloadSteps } from '@/features/vocabulary-lab/deload-steps'
import { getVocabularyContext } from '@/features/vocabulary-lab/rotation'

export interface VocabularyLabSession {
  steps: GuidedStep[]
  meta: VocabularySessionMeta
  phaseTitle: string
  objective: string
  tips: string[]
  promptMotifClarity: boolean
  durationMinutes: number
}

const PHASE_MINUTES = 25

export function buildVocabularyLabSession(
  keyCluster: string[],
  options: {
    currentWeek: number
    level?: CurriculumLevel
    date?: Date
    monthlyTuneTitles?: string[]
  },
): VocabularyLabSession {
  const date = options.date ?? new Date()
  const level = options.level ?? 1
  const ctx = getVocabularyContext(options.currentWeek, level, date)
  const tuneHint =
    options.monthlyTuneTitles && options.monthlyTuneTitles.length > 0
      ? options.monthlyTuneTitles.join(', ')
      : undefined

  const templates = ctx.isDeload
    ? getDeloadSteps(ctx.module.title)
    : ctx.module.steps.map((s) => ({
        ...s,
        detail:
          ctx.dayVariant && !ctx.isDeload
            ? `${s.detail} (${ctx.dayVariant}.)`
            : s.detail,
      }))

  const steps = buildGuidedSteps(templates, keyCluster, tuneHint)

  const pillarLabel =
    ctx.module.pillar === 'pentatonic'
      ? 'Pentatonic'
      : ctx.module.pillar === 'blues'
        ? 'Blues'
        : 'Altered'

  return {
    steps,
    meta: {
      level,
      macroWeek: ctx.macroWeek,
      weekTitle: ctx.module.title,
      pillar: ctx.module.pillar,
      isFusionWeek: ctx.isFusionWeek,
      isDeload: ctx.isDeload,
      dayVariant: ctx.dayVariant,
    },
    phaseTitle: `Week ${ctx.macroWeek}: ${ctx.module.title}`,
    objective: ctx.module.objective,
    tips: [
      `Sound family: ${pillarLabel} · Heroes: ${ctx.module.heroRefs}`,
      ctx.module.integrationThread,
      ctx.isDeload ? 'Deload week — hear, sing, motif only. No new vocabulary.' : ctx.dayVariant,
      ctx.isFusionWeek ? 'Fusion week — rate motif clarity 1–5 before finishing.' : '',
    ].filter(Boolean),
    promptMotifClarity: ctx.isFusionWeek,
    durationMinutes: PHASE_MINUTES,
  }
}
