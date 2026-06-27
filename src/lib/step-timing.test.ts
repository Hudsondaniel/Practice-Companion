import { describe, expect, it } from 'vitest'
import {
  activeStepIndexFromElapsed,
  allocateStepDurations,
  stepSecondsRemaining,
} from '@/lib/step-timing'

describe('step-timing', () => {
  it('allocates phase duration across steps', () => {
    const durations = allocateStepDurations(['A', 'B', 'C'], 300)
    expect(durations).toHaveLength(3)
    expect(durations.reduce((a, b) => a + b, 0)).toBe(300)
  })

  it('tracks active step from elapsed time', () => {
    const durations = [100, 100, 100]
    expect(activeStepIndexFromElapsed(durations, 0)).toBe(0)
    expect(activeStepIndexFromElapsed(durations, 100)).toBe(1)
    expect(activeStepIndexFromElapsed(durations, 250)).toBe(2)
  })

  it('computes remaining seconds within active step', () => {
    const durations = [100, 100, 100]
    expect(stepSecondsRemaining(durations, 30, 0)).toBe(70)
    expect(stepSecondsRemaining(durations, 150, 1)).toBe(50)
  })
})
