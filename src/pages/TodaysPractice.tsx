import { useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Maximize2, Play, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MonthRolloverBanner } from '@/components/month/MonthRolloverBanner'
import { GuidedSession } from '@/components/practice/GuidedSession'
import { generateGuidedPhases, getUniqueBlocks } from '@/features/practice-method/guided-phases'
import { BASE_SESSION_MINUTES, PRACTICE_BLOCKS, currentMonthYear } from '@/types/practice-method'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { cn } from '@/lib/utils'

function getDayType(): 'identity' | 'expansion' | 'review' {
  const day = new Date().getDay()
  if (day === 0) return 'review'
  if (day <= 3) return 'identity'
  return 'expansion'
}

export function TodaysPractice() {
  const dayType = getDayType()
  const {
    activeConcept,
    monthlyTunes,
    monthlyPlan,
    todaySession,
    initTodaySession,
    setCurrentBlock,
    isMonthConfigured,
  } = usePracticeStore()

  const isActive = useGuidedSessionStore((s) => s.isActive)
  const isPausedForDay = useGuidedSessionStore((s) => s.isPausedForDay)
  const sessionDate = useGuidedSessionStore((s) => s.sessionDate)
  const phases = useGuidedSessionStore((s) => s.phases)
  const phaseIndex = useGuidedSessionStore((s) => s.phaseIndex)
  const startSession = useGuidedSessionStore((s) => s.startSession)
  const resumeSession = useGuidedSessionStore((s) => s.resumeSession)
  const lastPeakBpm = useGuidedSessionStore((s) => s.lastPeakBpm)

  const today = new Date().toISOString().split('T')[0]!
  const pausedSession = isPausedForDay && sessionDate === today && phases.length > 0
  const startSessionLog = useAdherenceStore((s) => s.startSessionLog)
  const monthConfigured = isMonthConfigured(currentMonthYear())
  const transcriptionProjects = useTranscriptionStore((s) => s.projects)

  useEffect(() => {
    if (!todaySession) initTodaySession(dayType)
  }, [todaySession, initTodaySession, dayType])

  const sessionBlocks = PRACTICE_BLOCKS.filter((b) => {
    if (dayType === 'review' && b.id === 'consolidation') return false
    if (dayType !== 'review' && b.id === 'recording-review') return false
    return true
  })

  const completedCount = todaySession?.blocks.filter((b) => b.completed).length ?? 0
  const totalBlocks = todaySession?.blocks.length ?? 0
  const progress = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0

  const startGuidedSession = useCallback(
    async (fresh = false) => {
      if (!monthConfigured) {
        toast.error('Initialize this month in Practice Library first')
        return
      }
      if (!activeConcept) {
        toast.error('Set an active concept in Practice Library → Concepts')
        return
      }

      if (!fresh && pausedSession) {
        resumeSession()
        try {
          await document.documentElement.requestFullscreen()
        } catch {
          toast('Fullscreen unavailable. Session resumed in windowed mode.')
        }
        toast.success(`Resumed at phase ${phaseIndex + 1} of ${phases.length}`)
        return
      }

      const linkedTranscription =
        transcriptionProjects.find(
          (p) =>
            p.practiceDate === today &&
            (!p.linkedConceptId || p.linkedConceptId === activeConcept?.id),
        ) ??
        (monthlyPlan?.transcriptionProjectId
          ? transcriptionProjects.find((p) => p.id === monthlyPlan.transcriptionProjectId)
          : undefined) ??
        transcriptionProjects.find((p) => p.monthYear === currentMonthYear() && !p.practiceDate)

      const generatedPhases = generateGuidedPhases({
        dayType,
        activeConcept,
        monthlyTunes,
        transcriptionProject: linkedTranscription
          ? `${linkedTranscription.artist} — ${linkedTranscription.title}`
          : monthlyPlan?.transcriptionProject,
        transcriptionProjectData: linkedTranscription
          ? {
              id: linkedTranscription.id,
              artist: linkedTranscription.artist,
              title: linkedTranscription.title,
              segments: linkedTranscription.segments,
            }
          : undefined,
        transcriptionSegments: linkedTranscription?.segments.map((s) => ({
          label: s.label,
          startSeconds: s.startSeconds,
          endSeconds: s.endSeconds,
          barRange: s.barRange,
        })),
      })

      const firstBlock = generatedPhases.find((p) => !p.isRecovery)
      if (firstBlock) setCurrentBlock(firstBlock.blockId)

      startSession(generatedPhases, { fresh: true })
      startSessionLog(`session-${Date.now()}`, new Date().toISOString().split('T')[0]!)

      try {
        await document.documentElement.requestFullscreen()
      } catch {
        toast('Fullscreen unavailable. Session started in windowed mode.')
      }

      toast.success('Guided session started')
    },
    [
      activeConcept,
      dayType,
      monthlyTunes,
      monthlyPlan,
      monthConfigured,
      transcriptionProjects,
      pausedSession,
      phaseIndex,
      phases.length,
      setCurrentBlock,
      startSession,
      resumeSession,
      startSessionLog,
    ],
  )

  const handleSessionComplete = () => {
    toast.success('120-minute session complete')
  }

  if (isActive) {
    return <GuidedSession onComplete={handleSessionComplete} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Today&apos;s Practice</h1>
          <p className="text-muted-foreground">
            {BASE_SESSION_MINUTES}-minute guided session · Practice Method v2.0.0
          </p>
        </div>
        <Badge variant={dayType === 'review' ? 'warning' : 'secondary'} className="w-fit">
          {dayType === 'review' ? 'Review Day (Sunday)' : `${dayType} day`}
        </Badge>
      </div>

      <MonthRolloverBanner />

      {!monthConfigured && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <p className="text-sm">
              Initialize <strong>{currentMonthYear()}</strong> before starting. Choose tunes, keys, and method settings.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/library">Monthly Setup →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hero start card */}
      <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-transparent">
        <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
          {pausedSession && (
            <div className="w-full max-w-md rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
              <p className="font-medium text-primary">Paused session ready</p>
              <p className="mt-1 text-muted-foreground">
                Phase {phaseIndex + 1} of {phases.length} · pick up where you left off
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Button size="sm" onClick={() => void startGuidedSession(false)}>
                  <Play className="h-3 w-3" />
                  Resume Session
                </Button>
                <Button size="sm" variant="outline" onClick={() => void startGuidedSession(true)}>
                  Start Fresh
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold">Ready to practice?</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Enter fullscreen guided mode. You&apos;ll be walked through every phase with timers,
              instructions, and checkpoints, including the 20-min Agility &amp; Fluency Lab for any piano.
            </p>
          </div>

          {activeConcept && (
            <div className="rounded-lg border border-border bg-card/80 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Active concept: </span>
              <span className="font-medium text-primary">{activeConcept.label}</span>
              <span className="mx-2 text-muted-foreground">·</span>
              <span className="text-muted-foreground">{activeConcept.keyFocusCluster.join(', ')}</span>
            </div>
          )}

          <Button
            size="lg"
            className="gap-2 px-8 text-base"
            onClick={() => void startGuidedSession(pausedSession)}
            disabled={!monthConfigured}
          >
            <Maximize2 className="h-5 w-5" />
            {pausedSession ? 'Continue Session' : 'Start Guided Session'}
          </Button>

          {lastPeakBpm && (
            <p className="text-xs text-muted-foreground">
              Last peak clean BPM (Agility &amp; Fluency): <strong>{lastPeakBpm}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress overview */}
      {todaySession && completedCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span>Today&apos;s progress</span>
              <span>{completedCount}/{totalBlocks} blocks</span>
            </div>
            <Progress value={progress} />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => void startGuidedSession()}>
                <Play className="h-3 w-3" />
                Resume Session
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  initTodaySession(dayType)
                  toast.success('Session reset')
                }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Block overview */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Session blocks</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {sessionBlocks.map((block, i) => {
            const sessionBlock = todaySession?.blocks.find((b) => b.blockId === block.id)
            const isComplete = sessionBlock?.completed ?? false

            return (
              <Card
                key={block.id}
                className={cn(isComplete && 'border-success/40 opacity-75')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {i + 1}. {block.name}
                    </CardTitle>
                    <Badge variant={isComplete ? 'success' : 'secondary'}>
                      {block.durationMinutes} min
                    </Badge>
                  </div>
                  <CardDescription>{block.focus}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{block.description}</p>
                  {block.id === 'agility-fluency-lab' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Daily 20-min routine: touch check → rotating pattern → agility burst → log BPM
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Phase count preview */}
      {activeConcept && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guided phases today</CardTitle>
            <CardDescription>
              {generateGuidedPhases({ dayType, activeConcept, monthlyTunes }).length} interactive
              phases with timers and checkpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getUniqueBlocks(
                generateGuidedPhases({ dayType, activeConcept, monthlyTunes }),
              ).map((b) => (
                <Badge key={b.blockId} variant="outline">
                  {b.blockName} ({b.phaseCount} phases)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
