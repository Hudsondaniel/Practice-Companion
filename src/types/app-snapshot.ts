import type { SessionAdherenceSummary } from '@/types/practice-adherence'
import type {
  ActiveConcept,
  DailyPracticeSession,
  DeviceBacklogItem,
  MonthlyPlan,
  MonthlyTune,
  PracticeBlockId,
} from '@/types/practice-method'
import type { TranscriptionProject } from '@/types/transcription'
import type { CurriculumLevel } from '@/features/vocabulary-lab/types'
import type { MetronomeSound, MetronomeSubdivision } from '@/lib/metronome'

export const APP_SNAPSHOT_VERSION = 1 as const

export interface PracticeSnapshot {
  activeConcept: ActiveConcept | null
  deviceBacklog: DeviceBacklogItem[]
  monthlyTunes: MonthlyTune[]
  monthlyPlan: MonthlyPlan | null
  archivedMonthlyPlans: MonthlyPlan[]
  todaySession: DailyPracticeSession | null
  currentBlockId: PracticeBlockId | null
  streak: number
  weeklyHours: number
}

export interface TranscriptionSnapshot {
  projects: TranscriptionProject[]
  activeProjectId: string | null
  selectedSegmentId: string | null
}

export interface VocabularySnapshot {
  curriculumLevel: CurriculumLevel
  cycleStartDate: string
  lastMotifClarityRating: number | null
}

export interface AdherenceSnapshot {
  history: SessionAdherenceSummary[]
}

export interface StreakSnapshot {
  practiceDays: string[]
  longestStreak: number
}

export interface SessionToolsSnapshot {
  sessionNotes: string
  bpm: number
  metronomeSound: MetronomeSound
  beatsPerMeasure: number
  subdivision: MetronomeSubdivision
  metronomeVolume: number
  countInBars: number
  lastSessionDurationSeconds: number | null
}

export interface GuidedSessionSnapshot {
  isPausedForDay: boolean
  dayCompleted: boolean
  sessionDate: string | null
  phases: unknown[]
  phaseIndex: number
  pausedRemainingSeconds: number
  accumulatedSeconds: number
  completedStepKeys: string[]
}

export interface AppSnapshot {
  version: typeof APP_SNAPSHOT_VERSION
  practice: PracticeSnapshot
  transcriptions: TranscriptionSnapshot
  vocabulary: VocabularySnapshot
  adherence: AdherenceSnapshot
  streak: StreakSnapshot
  sessionTools: SessionToolsSnapshot
  guidedSession: GuidedSessionSnapshot | null
}

export function isAppSnapshot(value: unknown): value is AppSnapshot {
  if (!value || typeof value !== 'object') return false
  const v = value as AppSnapshot
  return v.version === APP_SNAPSHOT_VERSION && typeof v.practice === 'object'
}
