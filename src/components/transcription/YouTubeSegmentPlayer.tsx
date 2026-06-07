import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Repeat, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTimestamp, formatSectionTime, segmentDuration } from '@/lib/time-parse'
import { cn } from '@/lib/utils'
import type { TranscriptionSegment } from '@/types/transcription'

interface YouTubeSegmentPlayerProps {
  videoId: string
  segments: TranscriptionSegment[]
  activeSegmentId: string | null
}

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  setPlaybackRate: (rate: number) => void
  destroy: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        config: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: { onReady?: () => void; onStateChange?: (e: { data: number }) => void }
        },
      ) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
  return ytApiPromise
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const

export function YouTubeSegmentPlayer({ videoId, segments, activeSegmentId }: YouTubeSegmentPlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const loopRef = useRef(true)

  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loopSection, setLoopSection] = useState(true)

  const activeSegment = segments.find((s) => s.id === activeSegmentId) ?? null

  useEffect(() => {
    loopRef.current = loopSection
  }, [loopSection])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    let destroyed = false

    void loadYouTubeApi().then(() => {
      if (destroyed || !hostRef.current || !window.YT) return

      playerRef.current?.destroy()
      const player = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            setReady(true)
            setDuration(player.getDuration())
            if (activeSegment) player.seekTo(activeSegment.startSeconds, true)
          },
          onStateChange: (e) => {
            setIsPlaying(e.data === window.YT!.PlayerState.PLAYING)
          },
        },
      })
      playerRef.current = player

      interval = setInterval(() => {
        const p = playerRef.current
        if (!p?.getCurrentTime) return
        const t = p.getCurrentTime()
        setCurrentTime(t)

        const seg = activeSegment
        if (seg && loopRef.current && t >= seg.endSeconds - 0.05) {
          p.seekTo(seg.startSeconds, true)
          p.playVideo()
        }
      }, 200)
    })

    return () => {
      destroyed = true
      if (interval) clearInterval(interval)
      playerRef.current?.destroy()
      playerRef.current = null
      setReady(false)
    }
  }, [videoId, activeSegment?.id, activeSegment?.startSeconds, activeSegment?.endSeconds])

  useEffect(() => {
    const p = playerRef.current
    if (!p || !ready) return
    p.setPlaybackRate(playbackRate)
  }, [playbackRate, ready])

  useEffect(() => {
    const p = playerRef.current
    if (!p || !ready || !activeSegment) return
    p.seekTo(activeSegment.startSeconds, true)
    setCurrentTime(activeSegment.startSeconds)
  }, [activeSegment?.id, activeSegment?.startSeconds, ready])

  const playSection = () => {
    const p = playerRef.current
    if (!p) return
    if (activeSegment) p.seekTo(activeSegment.startSeconds, true)
    p.playVideo()
  }

  const sectionStart = activeSegment?.startSeconds ?? 0
  const displayTime = activeSegment
    ? formatSectionTime(currentTime, sectionStart)
    : formatTimestamp(currentTime)
  const displayDuration = activeSegment
    ? formatTimestamp(segmentDuration(activeSegment))
    : formatTimestamp(duration)

  return (
    <div className="space-y-3">
      {activeSegment && (
        <p className="text-xs text-muted-foreground">
          Looping section: <span className="font-medium text-foreground">{activeSegment.label}</span>
          {' · '}
          {formatTimestamp(activeSegment.startSeconds)}–{formatTimestamp(activeSegment.endSeconds)}
        </p>
      )}

      <div className="aspect-video overflow-hidden rounded-md border border-border bg-black">
        <div ref={hostRef} className="h-full w-full" />
      </div>

      <div className="flex items-center justify-center gap-1 font-mono text-sm tabular-nums text-muted-foreground">
        <span>{displayTime}</span>
        <span>/</span>
        <span>{displayDuration}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button variant="default" size="icon" className="h-9 w-9" disabled={!ready} onClick={playSection}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!ready}
          onClick={() => {
            playerRef.current?.pauseVideo()
            if (activeSegment) playerRef.current?.seekTo(activeSegment.startSeconds, true)
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant={loopSection ? 'default' : 'outline'}
          size="icon"
          className="h-8 w-8"
          disabled={!ready || !activeSegment}
          onClick={() => setLoopSection((v) => !v)}
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
