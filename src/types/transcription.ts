/** Transcription workspace — recording link + timed segments for practice */

export type SegmentStatus = 'listening' | 'partial' | 'clean'

/** Workflow stage labels shown in UI */
export const TRANSCRIPTION_STAGE_LABELS: Record<SegmentStatus, string> = {
  listening: 'Stage 1 · Listen & map',
  partial: 'Stage 2 · Find on piano',
  clean: 'Stage 3 · Match recording',
}

export type RecordingSourceType = 'audio' | 'youtube' | 'soundslice' | 'unknown'

export interface TranscriptionSegment {
  id: string
  label: string
  startSeconds: number
  endSeconds: number
  barRange?: string
  chordContext?: string
  notes?: string
  status: SegmentStatus
  linkedConceptId?: string
}

export interface TranscriptionProject {
  id: string
  artist: string
  title: string
  recordingUrl: string
  sourceType: RecordingSourceType
  key?: string
  monthYear?: string
  /** ISO date (YYYY-MM-DD) when captured during Link Concept to Hero */
  practiceDate?: string
  /** Active concept this daily hero line connects to */
  linkedConceptId?: string
  segments: TranscriptionSegment[]
  createdAt: string
  updatedAt: string
}

export type TranscriptionSegmentInput = Omit<TranscriptionSegment, 'id'>

export type TranscriptionProjectInput = Omit<
  TranscriptionProject,
  'id' | 'sourceType' | 'segments' | 'createdAt' | 'updatedAt'
> & {
  segments?: TranscriptionSegmentInput[]
}
