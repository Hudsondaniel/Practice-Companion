import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarOff, Maximize2, Play, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MonthRolloverBanner } from '@/components/month/MonthRolloverBanner'
import { GuidedSession } from '@/components/practice/GuidedSession'
import { generateGuidedPhases, getUniqueBlocks } from '@/features/practice-method/guided-phases'
import { getDayType, isPracticeDay } from '@/lib/month-context'
import {
  BASE_SESSION_MINUTES,
  SESSION_ZONES,
  currentMonthYear,
  type DayType,
} from '@/types/practice-method'
import {
  DAY_TYPE_LABELS as SCHEDULE_DAY_LABELS,
  WEEKDAY_FULL,
  getNextPracticeDate,
} from '@/types/practice-schedule'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { useVocabularyStore } from '@/stores/vocabulary-store'

export function TodaysPractice() {
  const scheduledDayType = getDayType()
  const isRestDay = !isPracticeDay()
  const [practiceAnyway, setPracticeAnyway] = useState(false)
  const dayType: DayType | null =
    scheduledDayType ?? (practiceAnyway ? 'identity' : null)

  const {
    activeConcept,
    monthlyTunes,
    monthlyPlan,
    todaySession,
    deviceBacklog,
    initTodaySession,
    ensureTodaySession,
    setCurrentBlock,
    isMonthConfigured,
    practiceSchedule,
  } = usePracticeStore()

  const isActive = useGuidedSessionStore((s) => s.isActive)
  const isPausedForDay = useGuidedSessionStore((s) => s.isPausedForDay)
  const sessionDate = useGuidedSessionStore((s) => s.sessionDate)
  const phases = useGuidedSessionStore((s) => s.phases)
  const phaseIndex = useGuidedSessionStore((s) => s.phaseIndex)
  const startSession = useGuidedSessionStore((s) => s.startSession)
  const resumeSession = useGuidedSessionStore((s) => s.resumeSession)
  const isDayCompleteForToday = useGuidedSessionStore((s) => s.isDayCompleteForToday())
  const lastMotifClarity = useVocabularyStore((s) => s.lastMotifClarityRating)

  const today = new Date().toISOString().split('T')[0]!
  const pausedSession = isPausedForDay && sessionDate === today && phases.length > 0
  const startSessionLog = useAdherenceStore((s) => s.startSessionLog)
  const monthConfigured = isMonthConfigured(currentMonthYear())
  const transcriptionProjects = useTranscriptionStore((s) => s.projects)

  useEffect(() => {
    setPracticeAnyway(false)
  }, [today])

  useEffect(() => {
    if (dayType) ensureTodaySession(dayType)
    else ensureTodaySession()
  }, [ensureTodaySession, dayType])

  const sessionZones =
    dayType === 'review'
      ? [
          ...SESSION_ZONES.filter((z) => z.id !== 'technique'),
          {
            id: 'technique' as const,
            name: 'Recording Review',
            description: 'Sound-target review of your weekly clips',
          },
        ]
      : SESSION_ZONES

  const completedCount = todaySession?.blocks.filter((b) => b.completed).length ?? 0
  const totalBlocks = todaySession?.blocks.length ?? 0
  const progress = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0

  const nextPractice = isRestDay ? getNextPracticeDate(practiceSchedule) : null

  const startGuidedSession = useCallback(
    async (fresh = false) => {
      if (!dayType) {
        toast.error('Today is a rest day — tap Practice anyway first')
        return
      }
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
        transcriptionProjects.find((p) => p.practiceDate === today) ??
        (monthlyPlan?.transcriptionProjectId
          ? transcriptionProjects.find((p) => p.id === monthlyPlan.transcriptionProjectId)
          : undefined) ??
        transcriptionProjects.find((p) => p.monthYear === currentMonthYear() && !p.practiceDate)

      const generatedPhases = generateGuidedPhases({
        dayType,
        activeConcept,
        monthlyTunes,
        deviceBacklog,
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
      deviceBacklog,
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
      today,
    ],
  )

  const handleSessionComplete = () => {
    if (isDayCompleteForToday) {
      toast.success('Session complete for today')
    }
  }

  if (isActive) {
    return <GuidedSession onComplete={handleSessionComplete} />
  }

  const dayBadgeLabel = dayType
    ? dayType === 'review'
      ? `${SCHEDULE_DAY_LABELS.review} day`
      : `${SCHEDULE_DAY_LABELS[dayType]} day`
    : 'Rest day'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Today&apos;s Practice</h1>
          <p className="text-muted-foreground">{BASE_SESSION_MINUTES}-minute guided session</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vocabulary Lab lives in the sidebar —{' '}
            <Link to="/vocabulary" className="text-primary hover:underline">
              view week &amp; 12-week plan
            </Link>
          </p>
        </div>
        <Badge
          variant={dayType === 'review' ? 'warning' : isRestDay ? 'outline' : 'secondary'}
          className="w-fit"
        >
          {practiceAnyway && isRestDay ? 'Optional practice' : dayBadgeLabel}
        </Badge>
      </div>

      <MonthRolloverBanner />

      {isRestDay && !practiceAnyway && (
        <Card className="border-border bg-muted/20">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <CalendarOff className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium">Rest day</p>
                <p className="text-sm text-muted-foreground">
                  {WEEKDAY_FULL[new Date().getDay()]} isn&apos;t on your practice schedule.
                  {nextPractice && (
                    <>
                      {' '}
                      Next session:{' '}
                      <strong>
                        {WEEKDAY_FULL[nextPractice.date.getDay()]} ({SCHEDULE_DAY_LABELS[nextPractice.dayType]})
                      </strong>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings">Edit schedule</Link>
              </Button>
              <Button size="sm" onClick={() => setPracticeAnyway(true)}>
                Practice anyway
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isDayCompleteForToday && dayType && (
        <Card className="border-success/40 bg-success/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-success">Done for today</p>
              <p className="text-sm text-muted-foreground">
                Your session is complete. A fresh guided session will be available on your next
                practice day.
              </p>
            </div>
            {lastMotifClarity != null && (
              <Badge variant="secondary">Motif clarity: {lastMotifClarity}/5</Badge>
            )}
          </CardContent>
        </Card>
      )}

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

      {dayType && (
        <>
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
                  Four focused zones, fewer context switches. Timed steps walk you through each phase
                  automatically — pause anytime or tap Done for today when finished.
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
                disabled={!monthConfigured || isDayCompleteForToday}
              >
                <Maximize2 className="h-5 w-5" />
                {isDayCompleteForToday
                  ? 'Complete until next practice day'
                  : pausedSession
                    ? 'Continue Session'
                    : 'Start Guided Session'}
              </Button>

              {lastMotifClarity != null && (
                <p className="text-xs text-muted-foreground">
                  Last motif clarity (fusion week): <strong>{lastMotifClarity}/5</strong>
                </p>
              )}
            </CardContent>
          </Card>

          {todaySession && completedCount > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Today&apos;s progress</span>
                  <span>
                    {completedCount}/{totalBlocks} blocks
                  </span>
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

          <div>
            <h2 className="mb-3 text-lg font-semibold">Session zones</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Four macro blocks replace six separate switches — same method benefits, less mental overhead.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {sessionZones.map((zone, i) => (
                <Card key={zone.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {i + 1}. {zone.name}
                    </CardTitle>
                    <CardDescription>{zone.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {activeConcept && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Guided phases today</CardTitle>
                <CardDescription>
                  {generateGuidedPhases({ dayType, activeConcept, monthlyTunes, deviceBacklog }).filter((p) => !p.isRecovery).length}{' '}
                  work phases across 4 zones (timed steps auto-advance)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getUniqueBlocks(
                    generateGuidedPhases({ dayType, activeConcept, monthlyTunes, deviceBacklog }),
                  ).map((b) => (
                    <Badge key={b.blockId} variant="outline">
                      {b.blockName} ({b.phaseCount} phases)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
