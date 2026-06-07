import { Circle, Download, Flag, Save, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import { downloadRecording, useSessionToolsStore } from '@/stores/session-tools-store'
import { useRecorder } from '@/hooks/useRecorder'

interface RecordingControlsProps {
  phaseId?: string
  phaseTitle?: string
}

export function RecordingControls({ phaseId, phaseTitle }: RecordingControlsProps) {
  const {
    isRecording,
    recordingDuration,
    recordingQuality,
    recordingMarkers,
    recordingBase64,
    startRecording,
    stopRecording,
    setRecordingQuality,
    addRecordingMarker,
    saveCurrentRecording,
  } = useSessionToolsStore()
  const { start, stop, error } = useRecorder()

  const handleToggle = async () => {
    if (isRecording) {
      await stop()
      stopRecording()
    } else {
      await start()
      startRecording()
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recording</span>
        <span className="font-mono text-sm tabular-nums">{formatTime(recordingDuration)}</span>
      </div>

      <select
        value={recordingQuality}
        onChange={(e) => setRecordingQuality(e.target.value as 'standard' | 'high')}
        disabled={isRecording}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      >
        <option value="standard">Standard (128 kbps)</option>
        <option value="high">High quality (256 kbps)</option>
      </select>

      <Button
        variant={isRecording ? 'destructive' : 'outline'}
        className="w-full"
        onClick={() => void handleToggle()}
      >
        {isRecording ? (
          <>
            <Square className="h-4 w-4" /> Stop Recording
          </>
        ) : (
          <>
            <Circle className="h-4 w-4 fill-destructive text-destructive" /> Start Recording
          </>
        )}
      </Button>

      {isRecording && (
        <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => addRecordingMarker()}>
          <Flag className="h-3 w-3" />
          Drop marker ({recordingMarkers.length})
        </Button>
      )}

      {recordingMarkers.length > 0 && (
        <ul className="max-h-20 space-y-0.5 overflow-y-auto text-[10px] text-muted-foreground">
          {recordingMarkers.map((m, i) => (
            <li key={i}>
              {formatTime(m.time)} · {m.label}
            </li>
          ))}
        </ul>
      )}

      {recordingBase64 && !isRecording && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 text-xs"
            onClick={() => saveCurrentRecording(phaseId, phaseTitle)}
          >
            <Save className="h-3 w-3" />
            Save to session
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => downloadRecording(recordingBase64, `${phaseId ?? 'practice'}-take.webm`)}
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
