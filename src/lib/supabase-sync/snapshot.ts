import { createDefaultPracticeSchedule, getDayTypeForDate, normalizePracticeSchedule } from '@/types/practice-schedule'
import {
  APP_SNAPSHOT_VERSION,
  type AppSnapshot,
  isAppSnapshot,
} from '@/types/app-snapshot'
import { localDateIso } from '@/lib/local-date'
import { reconcileSnapshot } from '@/lib/supabase-sync/merge-snapshot'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { useStreakStore } from '@/stores/streak-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import type { GuidedPhase, MonthlyPlan } from '@/types/practice-method'

function todayIso(): string {
  return localDateIso()
}

function normalizeMetronomeVolume(volume: number): number {
  if (volume < 0 || volume > 1) return 0.5
  return volume
}

function normalizeMonthlyPlan(plan: MonthlyPlan | null): MonthlyPlan | null {
  if (!plan) return null
  return {
    ...plan,
    monthStartedAt: plan.monthStartedAt ?? plan.configuredAt?.split('T')[0] ?? todayIso(),
  }
}

/** Empty practice state — new accounts start here; nothing is kept in localStorage. */
export function createEmptyAppSnapshot(): AppSnapshot {
  return {
    version: APP_SNAPSHOT_VERSION,
    practice: {
      activeConcept: null,
      deviceBacklog: [],
      monthlyTunes: [],
      monthlyPlan: null,
      archivedMonthlyPlans: [],
      todaySession: null,
      currentBlockId: null,
      streak: 0,
      weeklyHours: 0,
      practiceSchedule: createDefaultPracticeSchedule(),
    },
    transcriptions: {
      projects: [],
      activeProjectId: null,
      selectedSegmentId: null,
    },
    adherence: { history: [] },
    streak: { practiceDays: [], longestStreak: 0 },
    sessionTools: {
      sessionNotes: '',
      bpm: 120,
      metronomeSound: 'click',
      beatsPerMeasure: 4,
      subdivision: 'quarter',
      metronomeVolume: 0.5,
      countInBars: 0,
      lastSessionDurationSeconds: null,
    },
    guidedSession: null,
  }
}

/** Collect in-memory state for cloud save (excludes audio blobs). */
export function collectAppSnapshot(): AppSnapshot {
  const practice = usePracticeStore.getState()
  const transcriptions = useTranscriptionStore.getState()
  const adherence = useAdherenceStore.getState()
  const streak = useStreakStore.getState()
  const tools = useSessionToolsStore.getState()
  const guided = useGuidedSessionStore.getState()

  const guidedSession = (() => {
    if (!guided.sessionDate) return null
    const hasSavedState =
      guided.phases.length > 0 || guided.dayCompleted || guided.isPausedForDay
    if (!hasSavedState) return null
    return {
      isActive: guided.isActive,
      isPausedForDay: guided.isPausedForDay,
      isPaused: guided.isPaused,
      dayCompleted: guided.dayCompleted,
      sessionDate: guided.sessionDate,
      phases: guided.phases,
      phaseIndex: guided.phaseIndex,
      pausedRemainingSeconds:
        guided.phases.length > 0 ? guided.getSecondsRemaining() : guided.pausedRemainingSeconds,
      phaseRunBudgetSeconds: guided.phaseRunBudgetSeconds,
      accumulatedSeconds: guided.accumulatedSeconds,
      startedAt: guided.startedAt,
      segmentStartedAt: guided.segmentStartedAt,
      completedStepKeys: guided.completedStepKeys,
      manualStepIndex: guided.manualStepIndex,
    }
  })()

  return {
    version: APP_SNAPSHOT_VERSION,
    practice: {
      activeConcept: practice.activeConcept,
      deviceBacklog: practice.deviceBacklog,
      monthlyTunes: practice.monthlyTunes,
      monthlyPlan: practice.monthlyPlan,
      archivedMonthlyPlans: practice.archivedMonthlyPlans,
      todaySession: practice.todaySession,
      currentBlockId: practice.currentBlockId,
      streak: practice.streak,
      weeklyHours: practice.weeklyHours,
      practiceSchedule: practice.practiceSchedule,
    },
    transcriptions: {
      projects: transcriptions.projects,
      activeProjectId: transcriptions.activeProjectId,
      selectedSegmentId: transcriptions.selectedSegmentId,
    },
    adherence: {
      history: adherence.history,
    },
    streak: {
      practiceDays: streak.practiceDays,
      longestStreak: streak.longestStreak,
    },
    sessionTools: {
      sessionNotes: tools.sessionNotes,
      bpm: tools.bpm,
      metronomeSound: tools.metronomeSound,
      beatsPerMeasure: tools.beatsPerMeasure,
      subdivision: tools.subdivision,
      metronomeVolume: tools.metronomeVolume,
      countInBars: tools.countInBars,
      lastSessionDurationSeconds: tools.lastSessionDurationSeconds,
    },
    guidedSession,
  }
}

function normalizeGuidedAfterCloudLoad(): void {
  const state = useGuidedSessionStore.getState()
  if (state.sessionDate && state.sessionDate !== todayIso()) {
    state.endSession()
    useGuidedSessionStore.setState({ dayCompleted: false })
  }
  if (state.dayCompleted && state.sessionDate !== todayIso()) {
    useGuidedSessionStore.setState({ dayCompleted: false })
  }
}

/** Apply cloud snapshot to in-memory stores. */
export function hydrateAppSnapshot(snapshot: AppSnapshot): void {
  const normalized = reconcileSnapshot(snapshot)
  const monthlyPlan = normalizeMonthlyPlan(normalized.practice.monthlyPlan)

  usePracticeStore.setState({
    activeConcept: normalized.practice.activeConcept,
    deviceBacklog: normalized.practice.deviceBacklog,
    monthlyTunes: normalized.practice.monthlyTunes,
    monthlyPlan,
    archivedMonthlyPlans: normalized.practice.archivedMonthlyPlans.map((p) => normalizeMonthlyPlan(p)!),
    todaySession: normalized.practice.todaySession,
    currentBlockId: normalized.practice.currentBlockId,
    streak: normalized.practice.streak,
    weeklyHours: normalized.practice.weeklyHours,
    practiceSchedule: normalizePracticeSchedule(normalized.practice.practiceSchedule),
  })
  usePracticeStore.getState().ensureTodaySession(
    (() => {
      const today = todayIso()
      const saved = normalized.practice.todaySession
      const schedule = normalizePracticeSchedule(normalized.practice.practiceSchedule)
      if (saved?.date === today) return saved.dayType
      return getDayTypeForDate(schedule) ?? undefined
    })(),
  )

  useTranscriptionStore.setState({
    projects: normalized.transcriptions.projects,
    activeProjectId: normalized.transcriptions.activeProjectId,
    selectedSegmentId: normalized.transcriptions.selectedSegmentId,
  })

  useAdherenceStore.setState({
    history: normalized.adherence.history,
    currentSessionId: null,
    currentSessionDate: null,
    phaseStartedAt: null,
    logs: [],
  })

  useStreakStore.setState(normalized.streak)

  useSessionToolsStore.setState({
    sessionNotes: normalized.sessionTools.sessionNotes,
    bpm: normalized.sessionTools.bpm,
    metronomeSound: normalized.sessionTools.metronomeSound,
    beatsPerMeasure: normalized.sessionTools.beatsPerMeasure,
    subdivision: normalized.sessionTools.subdivision,
    metronomeVolume: normalizeMetronomeVolume(normalized.sessionTools.metronomeVolume),
    countInBars: normalized.sessionTools.countInBars,
    lastSessionDurationSeconds: normalized.sessionTools.lastSessionDurationSeconds,
  })

  if (normalized.guidedSession) {
    const g = normalized.guidedSession
    const today = todayIso()

    if (g.sessionDate === today && g.dayCompleted) {
      useGuidedSessionStore.setState({
        isActive: false,
        isPausedForDay: false,
        dayCompleted: true,
        sessionDate: g.sessionDate,
        phases: [],
        phaseIndex: 0,
        isPaused: true,
        pausedRemainingSeconds: 0,
        phaseRunStartedAt: null,
        phaseRunBudgetSeconds: 0,
        startedAt: g.startedAt ?? null,
        accumulatedSeconds: g.accumulatedSeconds ?? 0,
        segmentStartedAt: null,
        lastPeakBpm: null,
        completedStepKeys: g.completedStepKeys ?? [],
        manualStepIndex: null,
        frozenByBackground: false,
      })
    } else {
      const inProgress =
        g.sessionDate === today && !g.dayCompleted && (g.phases as GuidedPhase[]).length > 0
      const pausedForDay = g.isPausedForDay ?? !inProgress
      const remaining =
        typeof g.pausedRemainingSeconds === 'number'
          ? g.pausedRemainingSeconds
          : phaseDurationFromPhases(g.phases as GuidedPhase[], g.phaseIndex)
      const midSession = inProgress && !pausedForDay

      useGuidedSessionStore.setState({
        isActive: midSession,
        isPausedForDay: pausedForDay,
        dayCompleted: g.dayCompleted ?? false,
        sessionDate: g.sessionDate,
        phases: g.phases as GuidedPhase[],
        phaseIndex: g.phaseIndex ?? 0,
        isPaused: midSession ? (g.isPaused ?? true) : true,
        pausedRemainingSeconds: remaining,
        phaseRunStartedAt: null,
        phaseRunBudgetSeconds: g.phaseRunBudgetSeconds ?? remaining,
        startedAt: g.startedAt ?? null,
        accumulatedSeconds: g.accumulatedSeconds ?? 0,
        segmentStartedAt: midSession && !(g.isPaused ?? true) ? (g.segmentStartedAt ?? null) : null,
        lastPeakBpm: null,
        completedStepKeys: g.completedStepKeys ?? [],
        manualStepIndex: g.manualStepIndex ?? null,
        frozenByBackground: false,
      })
    }
  } else if (
    normalized.practice.todaySession?.date === todayIso() &&
    normalized.practice.todaySession.completed
  ) {
    useGuidedSessionStore.setState({
      isActive: false,
      isPausedForDay: false,
      dayCompleted: true,
      sessionDate: todayIso(),
      phases: [],
      phaseIndex: 0,
      isPaused: true,
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
    })
  } else {
    useGuidedSessionStore.getState().endSession()
  }

  normalizeGuidedAfterCloudLoad()
}

export function resetAllStores(): void {
  hydrateAppSnapshot(createEmptyAppSnapshot())
}

function phaseDurationFromPhases(phases: GuidedPhase[], phaseIndex: number): number {
  const phase = phases[phaseIndex]
  return (phase?.durationMinutes ?? 0) * 60
}

export function snapshotIsEmpty(snapshot: AppSnapshot): boolean {
  return (
    !snapshot.practice.activeConcept &&
    snapshot.practice.deviceBacklog.length === 0 &&
    snapshot.practice.monthlyTunes.length === 0 &&
    !snapshot.practice.monthlyPlan &&
    snapshot.transcriptions.projects.length === 0 &&
    snapshot.adherence.history.length === 0 &&
    snapshot.streak.practiceDays.length === 0 &&
    !snapshot.guidedSession &&
    !snapshot.practice.todaySession?.completed
  )
}

export function parseAppSnapshot(raw: unknown): AppSnapshot | null {
  if (!isAppSnapshot(raw)) return null
  return raw
}
