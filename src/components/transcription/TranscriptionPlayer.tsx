import { parseRecordingUrl } from '@/lib/recording-url'
import { AudioSegmentPlayer } from '@/components/transcription/AudioSegmentPlayer'
import { YouTubeSegmentPlayer } from '@/components/transcription/YouTubeSegmentPlayer'
import { SoundSliceEmbed } from '@/components/transcription/SoundSliceEmbed'
import type { TranscriptionProject, TranscriptionSegment } from '@/types/transcription'

interface TranscriptionPlayerProps {
  project: TranscriptionProject
  activeSegmentId: string | null
  onSegmentTimesChange?: (segmentId: string, start: number, end: number) => void
}

export function TranscriptionPlayer({
  project,
  activeSegmentId,
  onSegmentTimesChange,
}: TranscriptionPlayerProps) {
  const parsed = parseRecordingUrl(project.recordingUrl)
  const activeSegment = project.segments.find((s) => s.id === activeSegmentId) ?? null

  if (parsed.type === 'youtube' && parsed.youtubeId) {
    return (
      <YouTubeSegmentPlayer
        videoId={parsed.youtubeId}
        segments={project.segments}
        activeSegmentId={activeSegmentId}
      />
    )
  }

  if (parsed.type === 'soundslice' && parsed.soundsliceSlug) {
    return (
      <SoundSliceEmbed
        slug={parsed.soundsliceSlug}
        recordingUrl={project.recordingUrl}
        activeSegment={activeSegment}
      />
    )
  }

  const audioUrl = parsed.directUrl ?? project.recordingUrl

  return (
    <AudioSegmentPlayer
      url={audioUrl}
      segments={project.segments}
      activeSegmentId={activeSegmentId}
      onSegmentTimesChange={onSegmentTimesChange}
    />
  )
}

export type { TranscriptionSegment }
