import type { GuidedStep } from '@/types/practice-method'

export function normalizeStep(step: GuidedStep | string): GuidedStep {
  if (typeof step === 'string') return { summary: step, detail: step }
  if (step && typeof step === 'object' && 'summary' in step) return step
  return { summary: 'Practice step', detail: '' }
}

export function normalizeSteps(steps: (GuidedStep | string)[] | undefined): GuidedStep[] {
  if (!steps?.length) return []
  return steps.map(normalizeStep)
}
