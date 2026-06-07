import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Square, Trash2 } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import { getWaveformColors } from '@/lib/theme-colors'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export function WaveformDisplay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const theme = useUIStore((s) => s.theme)
  const { waveformPeaks, recordingBlobUrl, recordingBase64, clearRecording, restoreRecordingFromBase64 } =
    useSessionToolsStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)

  const audioSource = recordingBlobUrl ?? recordingBase64
  const hasAudio = Boolean(audioSource || waveformPeaks.length > 0)

  useEffect(() => {
    restoreRecordingFromBase64()
  }, [restoreRecordingFromBase64])

  useEffect(() => {
    if (!containerRef.current) return

    const colors = getWaveformColors()
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: colors.waveColor,
      progressColor: colors.progressColor,
      cursorColor: colors.cursorColor,
      barWidth: 2,
      barGap: 1,
      height: 72,
      normalize: true,
      dragToSeek: true,
    })

    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => setIsPlaying(false))
    ws.on('ready', (d) => {
      setReady(true)
      setDuration(d)
      setCurrentTime(0)
    })
    ws.on('timeupdate', (time) => setCurrentTime(time))

    wavesurferRef.current = ws

    return () => {
      ws.destroy()
      wavesurferRef.current = null
      setReady(false)
      setIsPlaying(false)
    }
  }, [theme])

  useEffect(() => {
    const ws = wavesurferRef.current
    if (!ws) return

    setReady(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setPlaybackRate(1)

    if (audioSource) {
      void ws.load(audioSource)
      return
    }

    if (waveformPeaks.length > 0) {
      void ws.load('', [waveformPeaks], waveformPeaks.length / 10)
      return
    }

    ws.empty()
  }, [audioSource, waveformPeaks, theme])

  useEffect(() => {
    const ws = wavesurferRef.current
    if (!ws || !ready) return
    ws.setPlaybackRate(playbackRate)
  }, [playbackRate, ready])

  useEffect(() => {
    const ws = wavesurferRef.current
    if (!ws || !ready) return
    const media = ws.getMediaElement()
    if (media) media.volume = volume
  }, [volume, ready])

  const ws = () => wavesurferRef.current

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Player</span>
        {hasAudio && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearRecording}>
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div ref={containerRef} className="min-h-[72px] rounded-md border border-border bg-muted/40 p-1" />

      {!hasAudio && (
        <p className="text-center text-xs text-muted-foreground">Record to capture and playback</p>
      )}

      {hasAudio && (
        <>
          <div className="flex items-center justify-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
            <span>{formatTime(Math.floor(currentTime))}</span>
            <span>/</span>
            <span>{formatTime(Math.floor(duration))}</span>
          </div>

          <div className="flex items-center justify-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => ws()?.skip(-5)} disabled={!ready}>
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button variant="default" size="icon" className="h-9 w-9" onClick={() => void ws()?.playPause()} disabled={!ready}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { ws()?.stop(); setCurrentTime(0) }} disabled={!ready}>
              <Square className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => ws()?.skip(5)} disabled={!ready}>
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { ws()?.setTime(0); setCurrentTime(0) }} disabled={!ready}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground">Speed</span>
            <div className="flex flex-wrap gap-1">
              {PLAYBACK_RATES.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  disabled={!ready}
                  onClick={() => setPlaybackRate(rate)}
                  className={cn(
                    'rounded border px-2 py-0.5 text-[10px] font-medium transition-colors',
                    playbackRate === rate
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="flex justify-between text-[10px] uppercase text-muted-foreground">
              <span>Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </label>
        </>
      )}
    </div>
  )
}
