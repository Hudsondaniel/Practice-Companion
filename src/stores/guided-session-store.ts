import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GuidedPhase, GuidedStep } from '@/types/practice-method'
import { normalizeSteps } from '@/lib/normalize-steps'

interface GuidedSessionState {
  isActive: boolean
  isPausedForDay: boolean
  /** True when user explicitly finished for the day — no resume until tomorrow */
  dayCompleted: boolean
  sessionDate: string | null
  phases: GuidedPhase[]
  phaseIndex: number
  phaseEndsAt: number | null
  isPaused: boolean
  pausedRemainingSeconds: number
  startedAt: string | null
  /** Seconds accumulated before current pause */
  accumulatedSeconds: number
  /** When the current active segment started (null while paused for the day) */
  segmentStartedAt: string | null
  lastPeakBpm: number | null
  completedStepKeys: string[]

  startSession: (phases: GuidedPhase[], options?: { fresh?: boolean }) => void
  resumeSession: () => void
  pauseSession: () => void
  endSession: () => void
  finishDaySession: () => void
  isDayCompleteForToday: () => boolean
  completeCurrentPhase: () => boolean
  goToPhase: (index: number) => void
  getSecondsRemaining: () => number
  tickTimer: () => void
  togglePause: () => void
  resetPhaseTimer: () => void
  setLastPeakBpm: (bpm: number) => void
  toggleStepComplete: (phaseId: string, stepIndex: number) => void
  getCompletedStepsForPhase: (phaseId: string) => number[]
  canResumeToday: () => boolean
  getDailyElapsedSeconds: () => number
}

function phaseDurationSeconds(phase: GuidedPhase | undefined): number {
  return (phase?.durationMinutes ?? 0) * 60
}

function startPhaseTimer(phase: GuidedPhase | undefined): {
  phaseEndsAt: number | null
  pausedRemainingSeconds: number
} {
  const duration = phaseDurationSeconds(phase)
  if (duration <= 0) return { phaseEndsAt: null, pausedRemainingSeconds: 0 }
  return { phaseEndsAt: Date.now() + duration * 1000, pausedRemainingSeconds: duration }
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!
}

function stepKey(phaseId: string, stepIndex: number): string {
  return `${phaseId}:${stepIndex}`
}

function segmentElapsedSeconds(segmentStartedAt: string | null): number {
  if (!segmentStartedAt) return 0
  return Math.floor((Date.now() - new Date(segmentStartedAt).getTime()) / 1000)
}

function normalizePhases(phases: GuidedPhase[]): GuidedPhase[] {
  return phases.map((p) => ({
    ...p,
    steps: normalizeSteps(p.steps as (GuidedStep | string)[]),
  }))
}

export const useGuidedSessionStore = create<GuidedSessionState>()(
  persist(
    (set, get) => ({
      isActive: false,
      isPausedForDay: false,
      dayCompleted: false,
      sessionDate: null,
      phases: [],
      phaseIndex: 0,
      phaseEndsAt: null,
      isPaused: false,
      pausedRemainingSeconds: 0,
      startedAt: null,
      accumulatedSeconds: 0,
      segmentStartedAt: null,
      lastPeakBpm: null,
      completedStepKeys: [],

      startSession: (phases, options) => {
        const today = todayIso()
        const state = get()

        if (!options?.fresh && state.canResumeToday()) {
          get().resumeSession()
          return
        }

        const timer = startPhaseTimer(phases[0])
        const now = new Date().toISOString()
        set({
          isActive: true,
          isPausedForDay: false,
          dayCompleted: false,
          sessionDate: today,
          phases,
          phaseIndex: 0,
          ...timer,
          isPaused: false,
          startedAt: now,
          accumulatedSeconds: 0,
          segmentStartedAt: now,
          completedStepKeys: [],
        })
      },

      resumeSession: () => {
        const { phases, phaseIndex, isPaused, pausedRemainingSeconds } = get()
        if (phases.length === 0) return

        const phase = phases[phaseIndex]
        const timer =
          isPaused && pausedRemainingSeconds > 0
            ? { phaseEndsAt: null, pausedRemainingSeconds }
            : startPhaseTimer(phase)

        set({
          isActive: true,
          isPausedForDay: false,
          sessionDate: todayIso(),
          segmentStartedAt: new Date().toISOString(),
          ...timer,
        })
      },

      pauseSession: () => {
        const { isPaused, phaseEndsAt, pausedRemainingSeconds, accumulatedSeconds, segmentStartedAt } =
          get()
        let remaining = pausedRemainingSeconds
        if (!isPaused && phaseEndsAt) {
          remaining = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000))
        }
        set({
          isActive: false,
          isPausedForDay: true,
          isPaused: true,
          phaseEndsAt: null,
          pausedRemainingSeconds: remaining,
          accumulatedSeconds: accumulatedSeconds + segmentElapsedSeconds(segmentStartedAt),
          segmentStartedAt: null,
        })
      },

      endSession: () => {
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => {})
        }
        set({
          isActive: false,
          isPausedForDay: false,
          dayCompleted: false,
          sessionDate: null,
          phases: [],
          phaseIndex: 0,
          phaseEndsAt: null,
          isPaused: false,
          pausedRemainingSeconds: 0,
          startedAt: null,
          accumulatedSeconds: 0,
          segmentStartedAt: null,
          completedStepKeys: [],
        })
      },

      finishDaySession: () => {
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => {})
        }
        const { accumulatedSeconds, segmentStartedAt, isActive } = get()
        set({
          isActive: false,
          isPausedForDay: false,
          dayCompleted: true,
          sessionDate: todayIso(),
          phases: [],
          phaseIndex: 0,
          phaseEndsAt: null,
          isPaused: false,
          pausedRemainingSeconds: 0,
          startedAt: null,
          accumulatedSeconds:
            accumulatedSeconds + (isActive ? segmentElapsedSeconds(segmentStartedAt) : 0),
          segmentStartedAt: null,
          completedStepKeys: [],
        })
      },

      isDayCompleteForToday: () => {
        const { dayCompleted, sessionDate } = get()
        return dayCompleted && sessionDate === todayIso()
      },

      getDailyElapsedSeconds: () => {
        const { accumulatedSeconds, segmentStartedAt, isActive } = get()
        return accumulatedSeconds + (isActive ? segmentElapsedSeconds(segmentStartedAt) : 0)
      },

      canResumeToday: () => {
        const { isPausedForDay, dayCompleted, sessionDate, phases } = get()
        return (
          isPausedForDay &&
          !dayCompleted &&
          sessionDate === todayIso() &&
          phases.length > 0
        )
      },

      completeCurrentPhase: () => {
        const { phaseIndex, phases } = get()
        const next = phaseIndex + 1
        if (next >= phases.length) return false
        const timer = startPhaseTimer(phases[next])
        set({
          phaseIndex: next,
          ...timer,
          isPaused: false,
        })
        return true
      },

      goToPhase: (index) => {
        const { phases } = get()
        if (index < 0 || index >= phases.length) return
        const timer = startPhaseTimer(phases[index])
        set({
          phaseIndex: index,
          ...timer,
          isPaused: false,
        })
      },

      getSecondsRemaining: () => {
        const { phaseEndsAt, isPaused, pausedRemainingSeconds, phases, phaseIndex } = get()
        if (isPaused) return pausedRemainingSeconds
        if (phaseEndsAt) return Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000))
        return phaseDurationSeconds(phases[phaseIndex])
      },

      tickTimer: () => {},

      togglePause: () => {
        const { isPaused, phaseEndsAt } = get()
        if (isPaused) {
          const remaining = get().pausedRemainingSeconds
          set({
            isPaused: false,
            phaseEndsAt: Date.now() + remaining * 1000,
            pausedRemainingSeconds: 0,
          })
        } else {
          const remaining = phaseEndsAt
            ? Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000))
            : get().pausedRemainingSeconds
          set({
            isPaused: true,
            phaseEndsAt: null,
            pausedRemainingSeconds: remaining,
          })
        }
      },

      resetPhaseTimer: () => {
        const { phases, phaseIndex } = get()
        const timer = startPhaseTimer(phases[phaseIndex])
        set({ ...timer, isPaused: false })
      },

      setLastPeakBpm: (bpm) => set({ lastPeakBpm: bpm }),

      toggleStepComplete: (phaseId, stepIndex) => {
        const key = stepKey(phaseId, stepIndex)
        const { completedStepKeys } = get()
        set({
          completedStepKeys: completedStepKeys.includes(key)
            ? completedStepKeys.filter((k) => k !== key)
            : [...completedStepKeys, key],
        })
      },

      getCompletedStepsForPhase: (phaseId) => {
        const prefix = `${phaseId}:`
        return get()
          .completedStepKeys.filter((k) => k.startsWith(prefix))
          .map((k) => Number(k.slice(prefix.length)))
      },
    }),
    {
      name: 'piano-mastery-guided-session',
      partialize: (s) => ({
        isActive: s.isActive,
        isPausedForDay: s.isPausedForDay,
        dayCompleted: s.dayCompleted,
        sessionDate: s.sessionDate,
        phases: s.phases,
        phaseIndex: s.phaseIndex,
        phaseEndsAt: s.phaseEndsAt,
        isPaused: s.isPaused,
        pausedRemainingSeconds: s.pausedRemainingSeconds,
        startedAt: s.startedAt,
        accumulatedSeconds: s.accumulatedSeconds,
        segmentStartedAt: s.segmentStartedAt,
        lastPeakBpm: s.lastPeakBpm,
        completedStepKeys: s.completedStepKeys,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.phases.length > 0) {
          state.phases = normalizePhases(state.phases)
        }
        if (state.accumulatedSeconds == null) state.accumulatedSeconds = 0
        if (state.isPausedForDay && state.startedAt && !state.segmentStartedAt && state.accumulatedSeconds === 0) {
          state.accumulatedSeconds = segmentElapsedSeconds(state.startedAt)
        }
        if (state.isActive && state.startedAt && !state.segmentStartedAt) {
          state.segmentStartedAt = state.startedAt
        }
        if (state.sessionDate && state.sessionDate !== todayIso()) {
          state.endSession()
          state.dayCompleted = false
        }
        if (state.dayCompleted == null) state.dayCompleted = false
        if (state.dayCompleted && state.sessionDate !== todayIso()) {
          state.dayCompleted = false
        }
      },
    },
  ),
)
