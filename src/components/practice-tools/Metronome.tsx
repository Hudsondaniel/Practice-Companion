import { useRef, useState } from 'react'
import { Hand, Minus, Play, Plus, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  METRONOME_SOUNDS,
  TIME_SIGNATURES,
  calculateTapTempo,
  type MetronomeSubdivision,
} from '@/lib/metronome'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { usePracticeStore } from '@/stores/practice-store'
import { isSlowFirstWeek, maxTempoPercentForConcept } from '@/lib/practice-week'

const SUBDIVISIONS: { id: MetronomeSubdivision; label: string }[] = [
  { id: 'quarter', label: 'Quarter notes' },
  { id: 'eighth', label: 'Eighth notes' },
  { id: 'triplet', label: 'Triplets' },
]

export function Metronome() {
  const {
    bpm,
    metronomeSound,
    beatsPerMeasure,
    subdivision,
    metronomeVolume,
    countInBars,
    isMetronomePlaying,
    setBpm,
    setMetronomeSound,
    setBeatsPerMeasure,
    setSubdivision,
    setMetronomeVolume,
    setCountInBars,
    toggleMetronome,
  } = useSessionToolsStore()

  const activeConcept = usePracticeStore((s) => s.activeConcept)
  const slowFirst = activeConcept ? isSlowFirstWeek(activeConcept.startedAt) : false
  const tempoCap = activeConcept ? maxTempoPercentForConcept(activeConcept.startedAt) : 1
  const maxBpm = slowFirst ? Math.round(300 * tempoCap) : 300

  const tapTimesRef = useRef<number[]>([])
  const [tapHint, setTapHint] = useState<string | null>(null)

  const handleTap = () => {
    const now = Date.now()
    tapTimesRef.current = [...tapTimesRef.current, now].slice(-5)
    const tempo = calculateTapTempo(tapTimesRef.current)
    if (tempo) {
      setBpm(Math.min(maxBpm, Math.max(40, tempo)))
      setTapHint(`${tempo} BPM`)
      setTimeout(() => setTapHint(null), 1200)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Metronome</span>
        <Button
          variant={isMetronomePlaying ? 'destructive' : 'secondary'}
          size="sm"
          onClick={() => void toggleMetronome()}
        >
          {isMetronomePlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {isMetronomePlaying ? 'Stop' : 'Start'}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setBpm(Math.max(40, bpm - 1))}>
          <Minus className="h-3 w-3" />
        </Button>
        <div className="text-center">
          <div className="text-2xl font-bold tabular-nums text-primary">{bpm}</div>
          <div className="text-xs text-muted-foreground">BPM</div>
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setBpm(Math.min(maxBpm, bpm + 1))}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button variant="outline" className="w-full gap-2 text-xs" onClick={handleTap}>
        <Hand className="h-3 w-3" />
        Tap tempo
        {tapHint && <span className="text-primary">{tapHint}</span>}
      </Button>

      {slowFirst && (
        <p className="text-center text-[10px] text-warning">
          Slow-first week: tempo capped at {Math.round(tempoCap * 100)}% ({maxBpm} BPM max)
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] uppercase text-muted-foreground">Time sig</span>
          <select
            value={beatsPerMeasure}
            onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          >
            {TIME_SIGNATURES.map((ts) => (
              <option key={ts.label} value={ts.beats}>
                {ts.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] uppercase text-muted-foreground">Subdivision</span>
          <select
            value={subdivision}
            onChange={(e) => setSubdivision(e.target.value as MetronomeSubdivision)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          >
            {SUBDIVISIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-[10px] uppercase text-muted-foreground">Sound</span>
        <select
          value={metronomeSound}
          onChange={(e) => setMetronomeSound(e.target.value as typeof metronomeSound)}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
        >
          {METRONOME_SOUNDS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="flex justify-between text-[10px] uppercase text-muted-foreground">
          <span>Volume</span>
          <span>{Math.round(metronomeVolume * 100)}%</span>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={metronomeVolume}
          onChange={(e) => setMetronomeVolume(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-[10px] uppercase text-muted-foreground">Count-in (bars)</span>
        <select
          value={countInBars}
          onChange={(e) => setCountInBars(Number(e.target.value))}
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
        >
          {[0, 1, 2, 4].map((n) => (
            <option key={n} value={n}>
              {n === 0 ? 'Off' : `${n} bar${n > 1 ? 's' : ''}`}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
