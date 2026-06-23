import { createDefaultPracticeSchedule, getDayTypeForDate, normalizePracticeSchedule } from '@/types/practice-schedule'
import {
  APP_SNAPSHOT_VERSION,
  type AppSnapshot,
  isAppSnapshot,
} from '@/types/app-snapshot'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { useStreakStore } from '@/stores/streak-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import type { GuidedPhase, MonthlyPlan } from '@/types/practice-method'

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!
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

  const guidedSession =
    guided.isPausedForDay && guided.sessionDate
      ? {
          isPausedForDay: guided.isPausedForDay,
          dayCompleted: guided.dayCompleted,
          sessionDate: guided.sessionDate,
          phases: guided.phases,
          phaseIndex: guided.phaseIndex,
          pausedRemainingSeconds: guided.pausedRemainingSeconds,
          accumulatedSeconds: guided.accumulatedSeconds,
          completedStepKeys: guided.completedStepKeys,
        }
      : null

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
  const monthlyPlan = normalizeMonthlyPlan(snapshot.practice.monthlyPlan)

  usePracticeStore.setState({
    activeConcept: snapshot.practice.activeConcept,
    deviceBacklog: snapshot.practice.deviceBacklog,
    monthlyTunes: snapshot.practice.monthlyTunes,
    monthlyPlan,
    archivedMonthlyPlans: snapshot.practice.archivedMonthlyPlans.map((p) => normalizeMonthlyPlan(p)!),
    todaySession: snapshot.practice.todaySession,
    currentBlockId: snapshot.practice.currentBlockId,
    streak: snapshot.practice.streak,
    weeklyHours: snapshot.practice.weeklyHours,
    practiceSchedule: normalizePracticeSchedule(snapshot.practice.practiceSchedule),
  })
  usePracticeStore.getState().ensureTodaySession(
    getDayTypeForDate(normalizePracticeSchedule(snapshot.practice.practiceSchedule)) ?? undefined,
  )

  useTranscriptionStore.setState({
    projects: snapshot.transcriptions.projects,
    activeProjectId: snapshot.transcriptions.activeProjectId,
    selectedSegmentId: snapshot.transcriptions.selectedSegmentId,
  })

  useAdherenceStore.setState({
    history: snapshot.adherence.history,
    currentSessionId: null,
    currentSessionDate: null,
    phaseStartedAt: null,
    logs: [],
  })

  useStreakStore.setState(snapshot.streak)

  useSessionToolsStore.setState({
    sessionNotes: snapshot.sessionTools.sessionNotes,
    bpm: snapshot.sessionTools.bpm,
    metronomeSound: snapshot.sessionTools.metronomeSound,
    beatsPerMeasure: snapshot.sessionTools.beatsPerMeasure,
    subdivision: snapshot.sessionTools.subdivision,
    metronomeVolume: normalizeMetronomeVolume(snapshot.sessionTools.metronomeVolume),
    countInBars: snapshot.sessionTools.countInBars,
    lastSessionDurationSeconds: snapshot.sessionTools.lastSessionDurationSeconds,
  })

  if (snapshot.guidedSession) {
    const g = snapshot.guidedSession
    useGuidedSessionStore.setState({
      isActive: false,
      isPausedForDay: g.isPausedForDay,
      dayCompleted: g.dayCompleted,
      sessionDate: g.sessionDate,
      phases: g.phases as GuidedPhase[],
      phaseIndex: g.phaseIndex,
      phaseEndsAt: null,
      isPaused: true,
      pausedRemainingSeconds: g.pausedRemainingSeconds,
      startedAt: null,
      accumulatedSeconds: g.accumulatedSeconds,
      segmentStartedAt: null,
      lastPeakBpm: null,
      completedStepKeys: g.completedStepKeys,
    })
  } else {
    useGuidedSessionStore.getState().endSession()
  }

  normalizeGuidedAfterCloudLoad()
}

export function resetAllStores(): void {
  hydrateAppSnapshot(createEmptyAppSnapshot())
}

export function snapshotIsEmpty(snapshot: AppSnapshot): boolean {
  return (
    !snapshot.practice.activeConcept &&
    snapshot.practice.deviceBacklog.length === 0 &&
    snapshot.practice.monthlyTunes.length === 0 &&
    !snapshot.practice.monthlyPlan &&
    snapshot.transcriptions.projects.length === 0
  )
}

export function parseAppSnapshot(raw: unknown): AppSnapshot | null {
  if (!isAppSnapshot(raw)) return null
  return raw
}
