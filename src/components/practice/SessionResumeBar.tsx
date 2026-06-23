import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'
import { useGuidedSessionStore } from '@/stores/guided-session-store'

export function SessionResumeBar() {
  const canResume = useGuidedSessionStore((s) => s.canResumeToday())
  const isActive = useGuidedSessionStore((s) => s.isActive)
  const phaseIndex = useGuidedSessionStore((s) => s.phaseIndex)
  const phases = useGuidedSessionStore((s) => s.phases)
  const getDailyElapsedSeconds = useGuidedSessionStore((s) => s.getDailyElapsedSeconds)
  const frozenByBackground = useGuidedSessionStore((s) => s.frozenByBackground)
  const isPaused = useGuidedSessionStore((s) => s.isPaused)

  if (isActive || !canResume) return null

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-primary">Session paused for today</p>
        <p className="truncate text-xs text-muted-foreground">
          Phase {phaseIndex + 1}/{phases.length} · {formatTime(getDailyElapsedSeconds())} logged
          {frozenByBackground || isPaused ? ' · timers held while away' : ''}
        </p>
      </div>
      <Button asChild size="sm" className="shrink-0 gap-1.5">
        <Link to="/practice">
          <Play className="h-3.5 w-3.5" />
          Resume
        </Link>
      </Button>
    </div>
  )
}
