import { useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildSoundSliceEmbedUrl } from '@/lib/recording-url'
import { formatTimestamp } from '@/lib/time-parse'
import type { TranscriptionSegment } from '@/types/transcription'

interface SoundSliceEmbedProps {
  slug: string
  recordingUrl: string
  activeSegment: TranscriptionSegment | null
  onJumpToSegment?: (segment: TranscriptionSegment) => void
}

export function SoundSliceEmbed({
  slug,
  recordingUrl,
  activeSegment,
  onJumpToSegment,
}: SoundSliceEmbedProps) {
  const embedUrl = useMemo(
    () =>
      buildSoundSliceEmbedUrl(
        slug,
        activeSegment?.startSeconds,
        Boolean(activeSegment),
      ),
    [slug, activeSegment?.startSeconds, activeSegment?.id],
  )

  return (
    <div className="space-y-3">
      {activeSegment ? (
        <p className="text-xs text-muted-foreground">
          Jumped to <span className="font-medium text-foreground">{activeSegment.label}</span>
          {' · '}
          {formatTimestamp(activeSegment.startSeconds)}–{formatTimestamp(activeSegment.endSeconds)}
          {' · '}
          Use SoundSlice&apos;s loop controls for this section
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Select a section below to jump the player to that time
        </p>
      )}

      <div className="overflow-hidden rounded-md border border-border bg-black">
        <iframe
          key={embedUrl}
          title="SoundSlice player"
          src={embedUrl}
          className="aspect-video w-full min-h-[320px]"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={recordingUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Open in SoundSlice
          </a>
        </Button>
        {activeSegment && onJumpToSegment && (
          <Button variant="secondary" size="sm" onClick={() => onJumpToSegment(activeSegment)}>
            Reload section at {formatTimestamp(activeSegment.startSeconds)}
          </Button>
        )}
      </div>
    </div>
  )
}
