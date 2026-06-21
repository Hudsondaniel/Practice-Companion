import { useEffect, useState } from 'react'
import { cn, formatTime } from '@/lib/utils'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { useSessionToolsStore } from '@/stores/session-tools-store'

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!
}

export function SessionTimer({
  size = 'md',
  className,
}: {
  size?: 'md' | 'lg'
  className?: string
}) {
  const isGuidedActive = useGuidedSessionStore((s) => s.isActive)
  const isPausedForDay = useGuidedSessionStore((s) => s.isPausedForDay)
  const sessionDate = useGuidedSessionStore((s) => s.sessionDate)
  const dayStartedAt = useGuidedSessionStore((s) => s.startedAt)
  const getDailyElapsedSeconds = useGuidedSessionStore((s) => s.getDailyElapsedSeconds)
  const { isRecording, tickRecording } = useSessionToolsStore()
  const [elapsed, setElapsed] = useState(0)

  const hasDaySession =
    sessionDate === todayIso() && (isGuidedActive || isPausedForDay || dayStartedAt != null)

  useEffect(() => {
    const update = () => {
      if (hasDaySession) {
        setElapsed(getDailyElapsedSeconds())
        return
      }
      setElapsed(0)
    }

    update()
    if (!isGuidedActive) return

    const interval = setInterval(() => {
      update()
      if (isRecording) tickRecording()
    }, 1000)
    return () => clearInterval(interval)
  }, [hasDaySession, isGuidedActive, isPausedForDay, sessionDate, dayStartedAt, getDailyElapsedSeconds, isRecording, tickRecording])

  const statusLabel = isGuidedActive
    ? "Today's session"
    : isPausedForDay
      ? "Paused · continues when you resume"
      : hasDaySession
        ? "Today's session"
        : 'Starts with guided session'

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-gradient-to-b from-muted/50 to-muted/20 p-4 text-center',
        className,
      )}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session Timer</div>
      <div
        className={cn(
          'font-mono font-bold tabular-nums text-primary',
          size === 'lg' ? 'mt-1 text-4xl' : 'text-3xl',
        )}
      >
        {formatTime(elapsed)}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{statusLabel}</p>
      {dayStartedAt && hasDaySession && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Started {new Date(dayStartedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
