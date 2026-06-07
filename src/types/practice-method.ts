/** Practice Method v2.0.0 + Agility & Fluency Lab — core domain types */

export const BASE_SESSION_MINUTES = 120

export type PracticeBlockId =
  | 'concept-forge'
  | 'transcription-integration'
  | 'standards-hymns-lab'
  | 'cold-pressure'
  | 'agility-fluency-lab'
  | 'consolidation'
  | 'recording-review'

export type DayType = 'identity' | 'expansion' | 'review'

export type ConceptStage = 'cognitive' | 'associative' | 'automatic'

export type DualTaskPhase = 1 | 2 | 3

export type BacklogTier = 'current' | 'next' | 'future'

export interface PracticeBlock {
  id: PracticeBlockId
  name: string
  durationMinutes: number
  focus: string
  description: string
}

export const PRACTICE_BLOCKS: PracticeBlock[] = [
  {
    id: 'concept-forge',
    name: 'Concept Forge',
    durationMinutes: 20,
    focus: 'Retrieval-sized Active Concept',
    description: 'Multi-sensory reps in 1–3 keys, limited early transposition, rhythmic & dynamic variation',
  },
  {
    id: 'transcription-integration',
    name: 'Transcription Integration',
    durationMinutes: 20,
    focus: 'Link concept to transcription',
    description: 'Connect active concept to hero lines, borrow one gesture, integrate through keys and monthly tunes',
  },
  {
    id: 'standards-hymns-lab',
    name: 'Standards / Hymns Lab',
    durationMinutes: 30,
    focus: 'Monthly tune set',
    description: 'Interleaved standards/hymns; tempo and key variability; failure-overload rule; Hero Imitation Pass',
  },
  {
    id: 'cold-pressure',
    name: 'Cold / Pressure Block',
    durationMinutes: 20,
    focus: 'Transfer & stress',
    description: 'Unfamiliar material, dual-task tests, no-evaluation trust run, quick diagnostic log',
  },
  {
    id: 'agility-fluency-lab',
    name: 'Agility & Fluency Lab',
    durationMinutes: 20,
    focus: 'Portable technique on any piano',
    description:
      'Instrument calibration, fluency circuits, agility drills, and peak velocity snapshot — works on any action',
  },
  {
    id: 'consolidation',
    name: 'Consolidation & Listening',
    durationMinutes: 10,
    focus: 'Ear + imagery',
    description: 'Mental practice + active listening for the concept in master recordings',
  },
  {
    id: 'recording-review',
    name: 'Recording Review',
    durationMinutes: 20,
    focus: 'Sound-target review',
    description: 'Mandatory weekly review — would you keep this on a gig?',
  },
]

export interface GuidedStep {
  summary: string
  detail: string
  example?: string
}

export interface GuidedPhase {
  id: string
  blockId: PracticeBlockId
  blockName: string
  title: string
  durationMinutes: number
  objective: string
  steps: GuidedStep[]
  tips?: string[]
  checkpoint?: string
  isRecovery?: boolean
  scientificNote?: string
  /** Interactive prompt shown mid-phase */
  engagementPrompt?: string
  /** Links this phase to a transcription project + section for in-session playback */
  transcriptionStage?: {
    projectId: string
    segmentId?: string
    segmentIds?: string[]
  }
  /** Show automaticity checklist before completing phase */
  showAutomaticityChecklist?: boolean
  /** Prompt clarity rating 1-5 after phase */
  promptClarityRating?: boolean
}

export interface DeviceBacklogItem {
  id: string
  label: string
  description: string
  harmonicContext: string
  keys: string[]
  tier: BacklogTier
  sourceRecording?: string
  ecosystem?: string
  notes?: string
  createdAt: string
}

export interface ActiveConcept {
  id: string
  label: string
  description: string
  harmonicContext: string
  keys: string[]
  sourceRecordings: string[]
  keyFocusCluster: string[]
  dualTaskPhase: DualTaskPhase
  stage: ConceptStage
  consecutivePassDays: number
  startedAt: string
  ecosystem?: string
}

export interface MonthlyTune {
  id: string
  title: string
  type: 'standard' | 'hymn' | 'virtuoso'
  key: string
  deploymentPoints: DeploymentPoint[]
  monthYear: string
}

export interface DeploymentPoint {
  id: string
  barRange: string
  chordFunction: string
  notes?: string
}

export interface AutomaticityCriterion {
  id: string
  name: string
  description: string
  passedToday: boolean
}

export const AUTOMATICITY_CRITERIA: Omit<AutomaticityCriterion, 'passedToday'>[] = [
  {
    id: 'cold-deployment',
    name: 'Cold Deployment',
    description: 'Concept appears in first chorus of new tune without prompting',
  },
  {
    id: 'dual-task',
    name: 'Dual-Task',
    description: 'Concept holds while counting aloud 1-2-3-4',
  },
  {
    id: 'simultaneous-singing',
    name: 'Simultaneous Singing',
    description: 'Concept holds while singing melody or bass line',
  },
  {
    id: 'spontaneous',
    name: 'Spontaneous Appearance',
    description: 'Appears at least twice without conscious decision',
  },
  {
    id: 'sound-target',
    name: 'Sound Target Test',
    description: 'Weekly recording review — sounds gig-ready, not student-y',
  },
]

export interface DailyPracticeSession {
  id: string
  date: string
  dayType: DayType
  totalMinutes: number
  blocks: SessionBlock[]
  activeConceptId: string
  dailyLog?: {
    conceptStage: ConceptStage
    tomorrowFocus: string
  }
  completed: boolean
}

export interface SessionBlock {
  blockId: PracticeBlockId
  plannedMinutes: number
  actualMinutes: number
  completed: boolean
  notes?: string
}

export interface MonthlyPlan {
  monthYear: string
  configuredAt: string
  tunes: MonthlyTune[]
  keyFocusCluster: string[]
  dualTaskPhase: DualTaskPhase
  /** Display label, e.g. "Oscar Peterson — C Jam Blues" */
  transcriptionProject: string
  /** Link to Transcriptions store project */
  transcriptionProjectId?: string
  heroPianists: string[]
  reviewDay: number
  /** Optional 5th week extension on the same tune lab */
  extendedWeek?: boolean
}

export function currentMonthYear(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
