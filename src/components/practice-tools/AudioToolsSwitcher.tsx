import { useState } from 'react'
import { Mic, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Metronome } from './Metronome'
import { RecordingControls } from './RecordingControls'
import { WaveformDisplay } from './WaveformDisplay'
import { SessionClipLibrary } from './SessionClipLibrary'
import { TempoTrainer } from './TempoTrainer'

type AudioTab = 'metronome' | 'recording'

interface AudioToolsSwitcherProps {
  phaseId?: string
  phaseTitle?: string
}

export function AudioToolsSwitcher({ phaseId, phaseTitle }: AudioToolsSwitcherProps) {
  const [tab, setTab] = useState<AudioTab>('metronome')

  return (
    <div className="space-y-3">
      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => setTab('metronome')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            tab === 'metronome'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Music className="h-3.5 w-3.5" />
          Metronome
        </button>
        <button
          type="button"
          onClick={() => setTab('recording')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
            tab === 'recording'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Mic className="h-3.5 w-3.5" />
          Recording
        </button>
      </div>

      {tab === 'metronome' ? (
        <div className="space-y-4">
          <Metronome />
          <TempoTrainer />
        </div>
      ) : (
        <div className="space-y-4">
          <RecordingControls phaseId={phaseId} phaseTitle={phaseTitle} />
          <WaveformDisplay />
          <SessionClipLibrary />
        </div>
      )}
    </div>
  )
}
