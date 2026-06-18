import type { GuidedStep } from '@/types/practice-method'
import { normalizeStep } from '@/lib/normalize-steps'

/** Split phase duration across steps; explicit step.durationSeconds wins when set. */
export function allocateStepDurations(
  steps: (GuidedStep | string)[],
  phaseDurationSeconds: number,
): number[] {
  const normalized = steps.map(normalizeStep)
  if (normalized.length === 0) return []

  const explicit = normalized.map((s) => s.durationSeconds ?? 0)
  const explicitTotal = explicit.reduce((a, b) => a + b, 0)
  const unspecifiedCount = explicit.filter((d) => d <= 0).length

  if (unspecifiedCount === 0 && explicitTotal > 0) {
    const scale = phaseDurationSeconds / explicitTotal
    return explicit.map((d) => Math.max(1, Math.round(d * scale)))
  }

  const remaining = Math.max(normalized.length, phaseDurationSeconds - explicitTotal)
  const perUnspecified = unspecifiedCount > 0 ? Math.floor(remaining / unspecifiedCount) : 0
  let leftover = phaseDurationSeconds - explicitTotal - perUnspecified * unspecifiedCount

  const durations = explicit.map((d) => (d > 0 ? d : perUnspecified))
  for (let i = durations.length - 1; i >= 0 && leftover > 0; i--) {
    if (explicit[i]! <= 0) {
      durations[i]!++
      leftover--
    }
  }
  for (let i = 0; leftover > 0; i++) {
    durations[i % durations.length]!++
    leftover--
  }

  const sum = durations.reduce((a, b) => a + b, 0)
  if (sum !== phaseDurationSeconds && durations.length > 0) {
    durations[durations.length - 1]! += phaseDurationSeconds - sum
  }

  return durations.map((d) => Math.max(1, d))
}

export function activeStepIndexFromElapsed(
  stepDurations: number[],
  elapsedSeconds: number,
): number {
  if (stepDurations.length === 0) return 0
  let cumulative = 0
  for (let i = 0; i < stepDurations.length; i++) {
    cumulative += stepDurations[i]!
    if (elapsedSeconds < cumulative) return i
  }
  return stepDurations.length - 1
}

export function stepSecondsRemaining(
  stepDurations: number[],
  elapsedSeconds: number,
  activeIndex: number,
): number {
  let start = 0
  for (let i = 0; i < activeIndex; i++) start += stepDurations[i]!
  const end = start + (stepDurations[activeIndex] ?? 0)
  return Math.max(0, end - elapsedSeconds)
}
