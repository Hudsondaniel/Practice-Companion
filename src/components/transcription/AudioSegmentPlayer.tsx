import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Repeat, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/plugins/regions'
import { Button } from '@/components/ui/button'
import { formatTimestamp, formatSectionTime, segmentDuration } from '@/lib/time-parse'
import { getWaveformColors } from '@/lib/theme-colors'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import type { TranscriptionSegment } from '@/types/transcription'

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 0.25] as const

interface AudioSegmentPlayerProps {
  url: string
  segments: TranscriptionSegment[]
  activeSegmentId: string | null
  onSegmentTimesChange?: (segmentId: string, start: number, end: number) => void
}

export function AudioSegmentPlayer({
  url,
  segments,
  activeSegmentId,
  onSegmentTimesChange,
}: AudioSegmentPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null)
  const theme = useUIStore((s) => s.theme)

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loopSection, setLoopSection] = useState(true)
  const [focusSection, setFocusSection] = useState(true)
  const loopRef = useRef(true)
  const activeSegmentIdRef = useRef(activeSegmentId)

  const activeSegment = segments.find((s) => s.id === activeSegmentId) ?? null

  useEffect(() => {
    loopRef.current = loopSection
  }, [loopSection])

  useEffect(() => {
    activeSegmentIdRef.current = activeSegmentId
  }, [activeSegmentId])

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
      height: 96,
      normalize: true,
      dragToSeek: true,
    })

    const regions = ws.registerPlugin(RegionsPlugin.create())
    ws.on('play', () => setIsPlaying(true))
    ws.on('pause', () => setIsPlaying(false))
    ws.on('finish', () => setIsPlaying(false))
    ws.on('ready', (d) => {
      setReady(true)
      setDuration(d)
    })
    ws.on('timeupdate', (t) => setCurrentTime(t))

    regions.on('region-updated', (region) => {
      onSegmentTimesChange?.(region.id, region.start, region.end)
    })

    regions.on('region-out', (region) => {
      if (loopRef.current && region.id === activeSegmentIdRef.current) {
        region.play()
      }
    })

    wsRef.current = ws
    regionsRef.current = regions

    return () => {
      ws.destroy()
      wsRef.current = null
      regionsRef.current = null
      setReady(false)
    }
  }, [theme])

  useEffect(() => {
    const ws = wsRef.current
    if (!ws || !url) return

    setReady(false)
    setIsPlaying(false)
    setCurrentTime(0)
    void ws.load(url)
  }, [url, theme])

  useEffect(() => {
    const ws = wsRef.current
    const regions = regionsRef.current
    if (!ws || !regions || !ready) return

    regions.clearRegions()

    if (focusSection && activeSegment) {
      const { startSeconds, endSeconds } = activeSegment
      regions.addRegion({
        id: activeSegment.id,
        start: startSeconds,
        end: endSeconds,
        color: 'rgba(201, 162, 39, 0.35)',
        drag: true,
        resize: true,
      })
      const segLen = segmentDuration(activeSegment)
      const containerWidth = containerRef.current?.clientWidth ?? 600
      ws.zoom(Math.max(containerWidth / Math.max(segLen, 1), 20))
      ws.setScrollTime(Math.max(0, startSeconds - 0.5))
    } else {
      ws.zoom(0)
      for (const seg of segments) {
        regions.addRegion({
          id: seg.id,
          start: seg.startSeconds,
          end: seg.endSeconds,
          color:
            seg.id === activeSegmentId
              ? 'rgba(201, 162, 39, 0.35)'
              : 'rgba(100, 116, 139, 0.2)',
          drag: true,
          resize: true,
        })
      }
    }
  }, [ready, segments, activeSegment, activeSegmentId, focusSection])

  useEffect(() => {
    const ws = wsRef.current
    if (!ws || !ready) return
    ws.setPlaybackRate(playbackRate)
  }, [playbackRate, ready])

  const playActiveSection = () => {
    const ws = wsRef.current
    const regions = regionsRef.current
    if (!ws || !regions) return

    if (activeSegment) {
      const region = regions.getRegions().find((r) => r.id === activeSegment.id)
      if (region) {
        region.play()
        return
      }
      void ws.play(activeSegment.startSeconds, activeSegment.endSeconds)
      return
    }
    void ws.play()
  }

  const sectionStart = activeSegment?.startSeconds ?? 0
  const sectionEnd = activeSegment?.endSeconds ?? duration
  const displayTime = focusSection && activeSegment ? formatSectionTime(currentTime, sectionStart) : formatTimestamp(currentTime)
  const displayDuration =
    focusSection && activeSegment ? formatTimestamp(segmentDuration(activeSegment)) : formatTimestamp(duration)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          {focusSection && activeSegment ? (
            <>
              Section: <span className="font-medium text-foreground">{activeSegment.label}</span>
              {' · '}
              Track {formatTimestamp(sectionStart)}–{formatTimestamp(sectionEnd)}
            </>
          ) : (
            'Full recording'
          )}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={focusSection ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFocusSection(true)}
            disabled={!activeSegment}
          >
            Section only
          </Button>
          <Button
            type="button"
            variant={!focusSection ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFocusSection(false)}
          >
            Full track
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          'min-h-[96px] rounded-md border border-border bg-muted/40 p-1',
          focusSection && activeSegment && 'ring-1 ring-primary/40',
        )}
      />

      <div className="flex items-center justify-center gap-1 font-mono text-sm tabular-nums text-muted-foreground">
        <span>{displayTime}</span>
        <span>/</span>
        <span>{displayDuration}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!ready}
          onClick={() => {
            const ws = wsRef.current
            if (!ws) return
            const t = activeSegment && focusSection ? activeSegment.startSeconds : Math.max(0, currentTime - 5)
            ws.setTime(t)
          }}
        >
          <SkipBack className="h-3.5 w-3.5" />
        </Button>
        <Button variant="default" size="icon" className="h-9 w-9" disabled={!ready} onClick={playActiveSection}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!ready}
          onClick={() => {
            wsRef.current?.pause()
            if (activeSegment && focusSection) {
              wsRef.current?.setTime(activeSegment.startSeconds)
            } else {
              wsRef.current?.setTime(0)
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!ready}
          onClick={() => {
            const ws = wsRef.current
            if (!ws) return
            const t =
              activeSegment && focusSection
                ? Math.min(activeSegment.endSeconds, currentTime + 5)
                : Math.min(duration, currentTime + 5)
            ws.setTime(t)
          }}
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={loopSection ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          disabled={!ready || !activeSegment}
          onClick={() => setLoopSection((v) => !v)}
          title="Loop section"
        >
          <Repeat className="h-3.5 w-3.5" />
        </Button>
      </div>

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
  )
}
