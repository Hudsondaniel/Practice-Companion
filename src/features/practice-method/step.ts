import type { GuidedStep } from '@/types/practice-method'

export function step(summary: string, detail: string, example?: string, durationSeconds?: number): GuidedStep {
  return { summary, detail, example, durationSeconds }
}

export function stepsFromStrings(items: string[]): GuidedStep[] {
  return items.map((s) => ({ summary: s, detail: s }))
}
