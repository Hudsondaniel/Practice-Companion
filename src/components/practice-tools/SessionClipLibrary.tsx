import { Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import { downloadRecording, useSessionToolsStore } from '@/stores/session-tools-store'

export function SessionClipLibrary() {
  const { savedClips, removeClip } = useSessionToolsStore()

  if (savedClips.length === 0) return null

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Session clips ({savedClips.length})
      </span>
      <ul className="max-h-32 space-y-1 overflow-y-auto">
        {savedClips.map((clip) => (
          <li
            key={clip.id}
            className="flex items-center justify-between gap-1 rounded border border-border bg-muted/20 px-2 py-1 text-[10px]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{clip.name}</p>
              <p className="text-muted-foreground">
                {formatTime(clip.durationSeconds)}
                {clip.markers.length > 0 && ` · ${clip.markers.length} markers`}
              </p>
            </div>
            <div className="flex shrink-0 gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => downloadRecording(clip.base64, `${clip.name}.webm`)}
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeClip(clip.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
