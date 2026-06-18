import type { GuidedStep } from '@/types/practice-method'
import type { VocabularyStepTemplate } from '@/features/vocabulary-lab/types'

export function interpolateTemplate(
  text: string,
  keys: string[],
  tuneHint?: string,
): string {
  const keyList = keys.join(', ')
  const home = keys[0] ?? 'C'
  return text
    .replace(/\{keys\}/g, keyList)
    .replace(/\{home\}/g, home)
    .replace(/\{tune\}/g, tuneHint ?? 'a monthly tune')
}

export function buildGuidedSteps(
  templates: VocabularyStepTemplate[],
  keys: string[],
  tuneHint?: string,
): GuidedStep[] {
  return templates.map((t) => ({
    summary: interpolateTemplate(t.summary, keys, tuneHint),
    detail: interpolateTemplate(t.detail, keys, tuneHint),
    example: t.example ? interpolateTemplate(t.example, keys, tuneHint) : undefined,
    durationSeconds: t.durationSeconds,
    pedagogy: {
      why: interpolateTemplate(t.pedagogy.why, keys, tuneHint),
      skill: interpolateTemplate(t.pedagogy.skill, keys, tuneHint),
      masters: t.pedagogy.masters,
      listenFor: interpolateTemplate(t.pedagogy.listenFor, keys, tuneHint),
      measure: interpolateTemplate(t.pedagogy.measure, keys, tuneHint),
    },
  }))
}
