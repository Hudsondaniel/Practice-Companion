import { Link } from 'react-router-dom'
import { ExternalLink, FileMusic } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TranscriptionPlayer } from '@/components/transcription/TranscriptionPlayer'
import { formatTimestamp } from '@/lib/time-parse'
import { recordingTypeLabel, parseRecordingUrl } from '@/lib/recording-url'
import { TRANSCRIPTION_STAGE_LABELS } from '@/types/transcription'
import type { GuidedPhase } from '@/types/practice-method'
import type { TranscriptionProject } from '@/types/transcription'
import { ExtractToBacklogButton } from '@/components/transcription/ExtractToBacklogButton'
import { cn } from '@/lib/utils'

interface TranscriptionStagePanelProps {
  project: TranscriptionProject
  phase: GuidedPhase
  activeSegmentId: string | null
  onSelectSegment: (segmentId: string | null) => void
  onSegmentTimesChange?: (segmentId: string, start: number, end: number) => void
  compact?: boolean
}

export function TranscriptionStagePanel({
  project,
  phase,
  activeSegmentId,
  onSelectSegment,
  onSegmentTimesChange,
  compact = false,
}: TranscriptionStagePanelProps) {
  const parsed = parseRecordingUrl(project.recordingUrl)
  const stage = phase.transcriptionStage
  const highlightedIds = new Set(stage?.segmentIds ?? (stage?.segmentId ? [stage.segmentId] : []))

  const relevantSegments =
    highlightedIds.size > 0
      ? project.segments.filter((s) => highlightedIds.has(s.id))
      : project.segments

  return (
    <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <FileMusic className="h-3.5 w-3.5 shrink-0" />
            Transcription stage
          </p>
          <p className="truncate text-sm font-medium">{project.title}</p>
          <p className="truncate text-xs text-muted-foreground">{project.artist}</p>
          {project.practiceDate && (
            <Badge variant="outline" className="mt-1 text-[9px]">
              Daily hero · {project.practiceDate}
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {recordingTypeLabel(parsed.type)}
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{phase.title}</span>
        {' · '}
        Loop the section below while you work this step
      </p>

      {project.segments.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-background/60 p-3 text-xs text-muted-foreground">
          No sections marked yet.{' '}
          <Link to="/transcriptions" className="text-primary underline">
            Add time sections
          </Link>{' '}
          for this recording.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1">
            {(relevantSegments.length > 0 ? relevantSegments : project.segments).map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => onSelectSegment(seg.id === activeSegmentId ? null : seg.id)}
                className={cn(
                  'rounded-md border px-2 py-1 text-left text-[10px] transition-colors',
                  seg.id === activeSegmentId
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-background/80 text-muted-foreground hover:text-foreground',
                )}
              >
                <span className="font-medium">{seg.label}</span>
                <span className="ml-1 font-mono tabular-nums">
                  {formatTimestamp(seg.startSeconds)}–{formatTimestamp(seg.endSeconds)}
                </span>
                <span className="mt-0.5 block text-[9px] opacity-80">{TRANSCRIPTION_STAGE_LABELS[seg.status]}</span>
              </button>
            ))}
          </div>
          {activeSegmentId && (() => {
            const seg = project.segments.find((s) => s.id === activeSegmentId)
            return seg ? (
              <div className="flex justify-end">
                <ExtractToBacklogButton project={project} segment={seg} />
              </div>
            ) : null
          })()}

          <TranscriptionPlayer
            project={project}
            activeSegmentId={activeSegmentId}
            onSegmentTimesChange={onSegmentTimesChange}
          />
        </>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
          <a href={project.recordingUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3 w-3" />
            Open recording
          </a>
        </Button>
        {!compact && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
            <Link to="/transcriptions">Edit in Transcriptions</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
