import { create } from 'zustand'
import { enterGuidedFocusMode, exitGuidedFocusModeIfActive } from '@/lib/guided-fullscreen'
import { localDateIso } from '@/lib/local-date'
import { requestPracticePersist } from '@/lib/supabase-sync/persist'
import type { GuidedPhase } from '@/types/practice-method'
import { useAdherenceStore } from '@/stores/adherence-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useStreakStore } from '@/stores/streak-store'

export type StartSessionResult = 'started' | 'resumed' | 'day-complete'

interface GuidedSessionState {
  isActive: boolean
  isPausedForDay: boolean
  dayCompleted: boolean
  sessionDate: string | null
  phases: GuidedPhase[]
  phaseIndex: number
  isPaused: boolean
  pausedRemainingSeconds: number
  phaseRunStartedAt: number | null
  phaseRunBudgetSeconds: number
  startedAt: string | null
  accumulatedSeconds: number
  segmentStartedAt: string | null
  lastPeakBpm: number | null
  completedStepKeys: string[]
  manualStepIndex: number | null
  frozenByBackground: boolean

  startSession: (phases: GuidedPhase[], options?: { forceFresh?: boolean }) => StartSessionResult
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
  setManualStepIndex: (index: number | null) => void
  goToStep: (stepIndex: number) => void
  nextStep: () => void
  previousStep: () => void
  freezeForBackground: () => void
  reconcileAfterBackground: () => void
  canResumeToday: () => boolean
  getDailyElapsedSeconds: () => number
  hasRecoverableSession: () => boolean
}

function phaseDurationSeconds(phase: GuidedPhase | undefined): number {
  return (phase?.durationMinutes ?? 0) * 60
}

function todayIso(): string {
  return localDateIso()
}

function stepKey(phaseId: string, stepIndex: number): string {
  return `${phaseId}:${stepIndex}`
}

function segmentElapsedSeconds(segmentStartedAt: string | null): number {
  if (!segmentStartedAt) return 0
  return Math.floor((Date.now() - new Date(segmentStartedAt).getTime()) / 1000)
}

function logPracticeDayIfNeeded(): void {
  useStreakStore.getState().recordPracticeDay(todayIso())
}

function markTodaySessionComplete(): void {
  const today = todayIso()
  const session = usePracticeStore.getState().todaySession
  if (!session || session.date !== today) return
  usePracticeStore.setState({
    todaySession: {
      ...session,
      completed: true,
    },
    currentBlockId: null,
  })
}

function ensureAdherenceLog(): void {
  useAdherenceStore.getState().ensureSessionLog(todayIso())
}

function beginPhaseRun(remainingSeconds: number): {
  phaseRunStartedAt: number | null
  phaseRunBudgetSeconds: number
  pausedRemainingSeconds: number
  isPaused: boolean
} {
  if (remainingSeconds <= 0) {
    return {
      phaseRunStartedAt: null,
      phaseRunBudgetSeconds: 0,
      pausedRemainingSeconds: 0,
      isPaused: true,
    }
  }
  return {
    phaseRunStartedAt: Date.now(),
    phaseRunBudgetSeconds: remainingSeconds,
    pausedRemainingSeconds: 0,
    isPaused: false,
  }
}

export const useGuidedSessionStore = create<GuidedSessionState>()((set, get) => ({
  isActive: false,
  isPausedForDay: false,
  dayCompleted: false,
  sessionDate: null,
  phases: [],
  phaseIndex: 0,
  isPaused: false,
  pausedRemainingSeconds: 0,
  phaseRunStartedAt: null,
  phaseRunBudgetSeconds: 0,
  startedAt: null,
  accumulatedSeconds: 0,
  segmentStartedAt: null,
  lastPeakBpm: null,
  completedStepKeys: [],
  manualStepIndex: null,
  frozenByBackground: false,

  startSession: (phases, options) => {
    const today = todayIso()
    const state = get()

    if (state.isDayCompleteForToday() && !options?.forceFresh) {
      return 'day-complete'
    }

    if (!options?.forceFresh && state.canResumeToday()) {
      get().resumeSession()
      return 'resumed'
    }

    if (
      !options?.forceFresh &&
      state.sessionDate === today &&
      state.phases.length > 0 &&
      !state.dayCompleted
    ) {
      get().resumeSession()
      return 'resumed'
    }

    if (!options?.forceFresh && state.sessionDate === today && state.dayCompleted) {
      return 'day-complete'
    }

    const duration = phaseDurationSeconds(phases[0])
    const run = beginPhaseRun(duration)
    const now = new Date().toISOString()
    set({
      isActive: true,
      isPausedForDay: false,
      dayCompleted: false,
      sessionDate: today,
      phases,
      phaseIndex: 0,
      ...run,
      startedAt: now,
      accumulatedSeconds: 0,
      segmentStartedAt: now,
      completedStepKeys: [],
      manualStepIndex: null,
      frozenByBackground: false,
    })
    logPracticeDayIfNeeded()
    ensureAdherenceLog()
    void enterGuidedFocusMode()
    return 'started'
  },

  resumeSession: () => {
    const { phases, phaseIndex, isPaused, pausedRemainingSeconds } = get()
    if (phases.length === 0) return

    const remaining =
      isPaused && pausedRemainingSeconds > 0
        ? pausedRemainingSeconds
        : phaseDurationSeconds(phases[phaseIndex])
    const run = beginPhaseRun(remaining)

    set({
      isActive: true,
      isPausedForDay: false,
      sessionDate: todayIso(),
      segmentStartedAt: new Date().toISOString(),
      frozenByBackground: false,
      ...run,
    })
    logPracticeDayIfNeeded()
    ensureAdherenceLog()
    void enterGuidedFocusMode()
  },

  pauseSession: () => {
    const { isPaused, accumulatedSeconds, segmentStartedAt } = get()
    const remaining = get().getSecondsRemaining()
    if (!isPaused && get().phaseRunStartedAt) {
      set({
        isPaused: true,
        phaseRunStartedAt: null,
        pausedRemainingSeconds: remaining,
        phaseRunBudgetSeconds: remaining,
      })
    }
    set({
      isActive: false,
      isPausedForDay: true,
      accumulatedSeconds: accumulatedSeconds + segmentElapsedSeconds(segmentStartedAt),
      segmentStartedAt: null,
      frozenByBackground: false,
    })
    if (get().getDailyElapsedSeconds() > 0) {
      logPracticeDayIfNeeded()
    }
    void exitGuidedFocusModeIfActive()
  },

  endSession: () => {
    exitGuidedFocusModeIfActive()
    set({
      isActive: false,
      isPausedForDay: false,
      dayCompleted: false,
      sessionDate: null,
      phases: [],
      phaseIndex: 0,
      isPaused: false,
      pausedRemainingSeconds: 0,
      phaseRunStartedAt: null,
      phaseRunBudgetSeconds: 0,
      startedAt: null,
      accumulatedSeconds: 0,
      segmentStartedAt: null,
      completedStepKeys: [],
      manualStepIndex: null,
      frozenByBackground: false,
    })
  },

  finishDaySession: () => {
    exitGuidedFocusModeIfActive()
    const { accumulatedSeconds, segmentStartedAt, isActive } = get()
    const total =
      accumulatedSeconds + (isActive ? segmentElapsedSeconds(segmentStartedAt) : 0)
    set({
      isActive: false,
      isPausedForDay: false,
      dayCompleted: true,
      sessionDate: todayIso(),
      phases: [],
      phaseIndex: 0,
      isPaused: false,
      pausedRemainingSeconds: 0,
      phaseRunStartedAt: null,
      phaseRunBudgetSeconds: 0,
      startedAt: null,
      accumulatedSeconds: total,
      segmentStartedAt: null,
      completedStepKeys: [],
      manualStepIndex: null,
      frozenByBackground: false,
    })
    markTodaySessionComplete()
    logPracticeDayIfNeeded()
    requestPracticePersist()
  },

  isDayCompleteForToday: () => {
    const { dayCompleted, sessionDate } = get()
    if (dayCompleted && sessionDate === todayIso()) return true
    const todaySession = usePracticeStore.getState().todaySession
    return todaySession?.date === todayIso() && todaySession.completed
  },

  getDailyElapsedSeconds: () => {
    const { accumulatedSeconds, segmentStartedAt, isActive } = get()
    return accumulatedSeconds + (isActive ? segmentElapsedSeconds(segmentStartedAt) : 0)
  },

  canResumeToday: () => {
    const { isPausedForDay, dayCompleted, sessionDate, phases } = get()
    return isPausedForDay && !dayCompleted && sessionDate === todayIso() && phases.length > 0
  },

  hasRecoverableSession: () => {
    const { sessionDate, phases, dayCompleted } = get()
    return sessionDate === todayIso() && phases.length > 0 && !dayCompleted
  },

  completeCurrentPhase: () => {
    const { phaseIndex, phases } = get()
    const next = phaseIndex + 1
    if (next >= phases.length) return false
    const run = beginPhaseRun(phaseDurationSeconds(phases[next]))
    set({
      phaseIndex: next,
      manualStepIndex: null,
      frozenByBackground: false,
      ...run,
    })
    return true
  },

  goToPhase: (index) => {
    const { phases } = get()
    if (index < 0 || index >= phases.length) return
    const run = beginPhaseRun(phaseDurationSeconds(phases[index]))
    set({
      phaseIndex: index,
      manualStepIndex: null,
      frozenByBackground: false,
      ...run,
    })
  },

  getSecondsRemaining: () => {
    const { isPaused, pausedRemainingSeconds, phaseRunStartedAt, phaseRunBudgetSeconds, phases, phaseIndex } =
      get()
    if (isPaused) return pausedRemainingSeconds
    if (phaseRunStartedAt != null) {
      const elapsed = Math.floor((Date.now() - phaseRunStartedAt) / 1000)
      return Math.max(0, phaseRunBudgetSeconds - elapsed)
    }
    return phaseDurationSeconds(phases[phaseIndex])
  },

  tickTimer: () => {},

  togglePause: () => {
    const { isPaused, pausedRemainingSeconds, phaseRunStartedAt, phaseRunBudgetSeconds } = get()
    if (isPaused) {
      const run = beginPhaseRun(pausedRemainingSeconds)
      set({ ...run, frozenByBackground: false })
    } else {
      let remaining = pausedRemainingSeconds
      if (phaseRunStartedAt != null) {
        const elapsed = Math.floor((Date.now() - phaseRunStartedAt) / 1000)
        remaining = Math.max(0, phaseRunBudgetSeconds - elapsed)
      }
      set({
        isPaused: true,
        phaseRunStartedAt: null,
        pausedRemainingSeconds: remaining,
        phaseRunBudgetSeconds: remaining,
        frozenByBackground: false,
      })
    }
  },

  resetPhaseTimer: () => {
    const { phases, phaseIndex } = get()
    const run = beginPhaseRun(phaseDurationSeconds(phases[phaseIndex]))
    set({ ...run, manualStepIndex: null, frozenByBackground: false })
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

  setManualStepIndex: (index) => set({ manualStepIndex: index }),

  goToStep: (stepIndex) => {
    const phase = get().phases[get().phaseIndex]
    if (!phase) return
    const max = Math.max(0, phase.steps.length - 1)
    set({ manualStepIndex: Math.min(max, Math.max(0, stepIndex)) })
  },

  nextStep: () => {
    const { manualStepIndex, phaseIndex, phases } = get()
    const phase = phases[phaseIndex]
    if (!phase) return
    const current = manualStepIndex ?? 0
    get().goToStep(Math.min(phase.steps.length - 1, current + 1))
  },

  previousStep: () => {
    const { manualStepIndex } = get()
    const current = manualStepIndex ?? 0
    get().goToStep(Math.max(0, current - 1))
  },

  freezeForBackground: () => {
    const state = get()
    if (!state.isActive || state.isPaused) return
    const remaining = state.getSecondsRemaining()
    const { accumulatedSeconds, segmentStartedAt } = state
    set({
      isPaused: true,
      phaseRunStartedAt: null,
      pausedRemainingSeconds: remaining,
      phaseRunBudgetSeconds: remaining,
      accumulatedSeconds: accumulatedSeconds + segmentElapsedSeconds(segmentStartedAt),
      segmentStartedAt: null,
      frozenByBackground: true,
    })
    if (state.getDailyElapsedSeconds() > 0) {
      logPracticeDayIfNeeded()
    }
  },

  reconcileAfterBackground: () => {
    const { frozenByBackground, isActive, isPaused } = get()
    if (!isActive || !frozenByBackground || !isPaused) return
  },
}))
