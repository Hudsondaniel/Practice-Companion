import type { GuidedPhase } from '@/types/practice-method'
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
import { useVocabularyStore } from '@/stores/vocabulary-store'

function getDayTypeFromDateLocal(): 'identity' | 'expansion' | 'review' {
  const day = new Date().getDay()
  if (day === 0) return 'review'
  if (day <= 3) return 'identity'
  return 'expansion'
}

/** Collect current client state for cloud sync (excludes large audio blobs). */
export function collectAppSnapshot(): AppSnapshot {
  const practice = usePracticeStore.getState()
  const transcriptions = useTranscriptionStore.getState()
  const vocabulary = useVocabularyStore.getState()
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
    },
    transcriptions: {
      projects: transcriptions.projects,
      activeProjectId: transcriptions.activeProjectId,
      selectedSegmentId: transcriptions.selectedSegmentId,
    },
    vocabulary: {
      curriculumLevel: vocabulary.curriculumLevel,
      cycleStartDate: vocabulary.cycleStartDate,
      lastMotifClarityRating: vocabulary.lastMotifClarityRating,
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

/** Apply cloud snapshot to all stores. */
export function hydrateAppSnapshot(snapshot: AppSnapshot): void {
  usePracticeStore.setState({
    activeConcept: snapshot.practice.activeConcept,
    deviceBacklog: snapshot.practice.deviceBacklog,
    monthlyTunes: snapshot.practice.monthlyTunes,
    monthlyPlan: snapshot.practice.monthlyPlan,
    archivedMonthlyPlans: snapshot.practice.archivedMonthlyPlans,
    todaySession: snapshot.practice.todaySession,
    currentBlockId: snapshot.practice.currentBlockId,
    streak: snapshot.practice.streak,
    weeklyHours: snapshot.practice.weeklyHours,
  })
  usePracticeStore.getState().ensureTodaySession(getDayTypeFromDateLocal())

  useTranscriptionStore.setState({
    projects: snapshot.transcriptions.projects,
    activeProjectId: snapshot.transcriptions.activeProjectId,
    selectedSegmentId: snapshot.transcriptions.selectedSegmentId,
  })

  useVocabularyStore.setState(snapshot.vocabulary)

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
    metronomeVolume: snapshot.sessionTools.metronomeVolume,
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
  }
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

// Re-export for tests — avoid duplicate day type helper in production path
export { getDayTypeFromDateLocal as getDayTypeFromDate }
