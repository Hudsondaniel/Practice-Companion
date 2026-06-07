import { useSessionToolsStore } from '@/stores/session-tools-store'
import { Progress } from '@/components/ui/progress'

export function TempoTrainer() {
  const { bpm } = useSessionToolsStore()
  const targetBpm = 160
  const progress = Math.min(100, (bpm / targetBpm) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tempo Trainer</span>
        <span className="text-xs text-muted-foreground">{bpm} / {targetBpm} BPM</span>
      </div>
      <Progress value={progress} />
      <p className="text-xs text-muted-foreground">
        Gradual tempo push: +2 BPM when 3 clean passes at current tempo
      </p>
    </div>
  )
}
