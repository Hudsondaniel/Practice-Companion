import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  PanelLeft,
  PanelRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AutomaticityChecklist, ClarityRating } from '@/components/practice/PhaseExtras'
import { TimedStepRunner } from '@/components/practice/TimedStepRunner'
import { PhaseSidebar } from '@/components/practice/PhaseSidebar'
import { ResizablePanel } from '@/components/practice/ResizablePanel'
import { MonthlyTranscriptionSectionCapture } from '@/components/transcription/MonthlyTranscriptionSectionCapture'
import { TranscriptionStagePanel } from '@/components/transcription/TranscriptionStagePanel'
import { PracticeToolsContent } from '@/components/practice-tools/PracticeToolsContent'
import { useGuidedPanelLayout } from '@/hooks/use-guided-panel-layout'
import { useMediaQuery } from '@/hooks/use-media-query'
import { formatTime } from '@/lib/utils'
import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useSessionToolsStore } from '@/stores/session-tools-store'
import { useStreakStore } from '@/stores/streak-store'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'
import { useTranscriptionStore } from '@/stores/transcription-store'
import { currentMonthYear, type PracticeBlockId } from '@/types/practice-method'

interface GuidedSessionProps {
  onComplete: () => void
}

export function GuidedSession({ onComplete }: GuidedSessionProps) {
  const {
    phases,
    phaseIndex,
    isPaused,
    startedAt,
    tickTimer,
    togglePause,
    resetPhaseTimer,
    completeCurrentPhase,
    goToPhase,
    pauseSession,
    finishDaySession,
    getSecondsRemaining,
  } = useGuidedSessionStore()

  const { completeBlock, setCurrentBlock, monthlyPlan } = usePracticeStore()
  const transcriptionProjects = useTranscriptionStore((s) => s.projects)
  const selectedSegmentId = useTranscriptionStore((s) => s.selectedSegmentId)
  const setSelectedSegment = useTranscriptionStore((s) => s.setSelectedSegment)
  const setActiveProject = useTranscriptionStore((s) => s.setActiveProject)
  const updateSegment = useTranscriptionStore((s) => s.updateSegment)
  const { resetSession } = useSessionToolsStore()
  const logPhaseCompletion = useAdherenceStore((s) => s.logPhaseCompletion)
  const logSkippedPhases = useAdherenceStore((s) => s.logSkippedPhases)
  const finishSession = useAdherenceStore((s) => s.finishSession)
  const markPhaseStarted = useAdherenceStore((s) => s.markPhaseStarted)
  const { guidedLeftPanelOpen, guidedRightPanelOpen, toggleGuidedLeftPanel, toggleGuidedRightPanel, guidedLeftPanelWidth, guidedRightPanelWidth, setGuidedLeftPanelWidth, setGuidedRightPanelWidth, setGuidedLeftPanelOpen, setGuidedRightPanelOpen } =
    useUIStore()

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    if (!isDesktop) {
      setGuidedLeftPanelOpen(false)
      setGuidedRightPanelOpen(false)
    }
  }, [isDesktop, setGuidedLeftPanelOpen, setGuidedRightPanelOpen])

  const { leftMaxWidth, rightMaxWidth, setLeftWidthClamped, setRightWidthClamped } = useGuidedPanelLayout({
    leftOpen: guidedLeftPanelOpen,
    rightOpen: guidedRightPanelOpen,
    leftWidth: guidedLeftPanelWidth,
    rightWidth: guidedRightPanelWidth,
    setLeftWidth: setGuidedLeftPanelWidth,
    setRightWidth: setGuidedRightPanelWidth,
  })
  const recordPracticeDay = useStreakStore((s) => s.recordPracticeDay)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [checkpointAnswer, setCheckpointAnswer] = useState('')
  const [clarityRating, setClarityRating] = useState<number | null>(null)
  const [automaticityChecked, setAutomaticityChecked] = useState<Record<string, boolean>>({})
  const [, setTick] = useState(0)

  const phase = phases[phaseIndex]
  const secondsRemaining = getSecondsRemaining()
  const totalPhases = phases.length
  const progress = totalPhases > 0 ? ((phaseIndex + 1) / totalPhases) * 100 : 0

  const phaseDuration = (phase?.durationMinutes ?? 0) * 60
  const phaseElapsed = Math.max(0, phaseDuration - secondsRemaining)
  const phaseProgress =
    phaseDuration > 0 ? ((phaseDuration - secondsRemaining) / phaseDuration) * 100 : 0

  useEffect(() => {
    markPhaseStarted()
  }, [phaseIndex, markPhaseStarted])

  const monthlyTranscriptionProject =
    (monthlyPlan?.transcriptionProjectId
      ? transcriptionProjects.find((p) => p.id === monthlyPlan.transcriptionProjectId)
      : undefined) ??
    transcriptionProjects.find((p) => p.monthYear === currentMonthYear() && !p.practiceDate)

  const linkedTranscriptionProject =
    (phase?.transcriptionStage?.projectId
      ? transcriptionProjects.find((p) => p.id === phase.transcriptionStage!.projectId)
      : undefined) ?? monthlyTranscriptionProject

  const showSectionCapture =
    phase?.id === 'lang-capture' && Boolean(monthlyTranscriptionProject)
  const showTranscriptionPanel =
    Boolean(linkedTranscriptionProject) &&
    (Boolean(phase?.transcriptionStage) || phase?.blockId === 'transcription-integration')

  useEffect(() => {
    if (!linkedTranscriptionProject) return
    if (!phase?.transcriptionStage && phase?.blockId !== 'transcription-integration') return

    const { activeProjectId, selectedSegmentId } = useTranscriptionStore.getState()
    if (activeProjectId !== linkedTranscriptionProject.id) {
      setActiveProject(linkedTranscriptionProject.id)
    }

    const segmentId =
      phase.transcriptionStage?.segmentId ??
      phase.transcriptionStage?.segmentIds?.[0] ??
      linkedTranscriptionProject.segments[0]?.id

    if (segmentId && selectedSegmentId !== segmentId) {
      setSelectedSegment(segmentId)
    }
  }, [
    phase?.id,
    phase?.transcriptionStage,
    phase?.blockId,
    linkedTranscriptionProject?.id,
    linkedTranscriptionProject?.segments.length,
    setActiveProject,
    setSelectedSegment,
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer()
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [tickTimer])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const phaseCompleteNotified = useRef(false)

  useEffect(() => {
    if (secondsRemaining === 0 && phase && !isPaused) {
      if (!phaseCompleteNotified.current) {
        phaseCompleteNotified.current = true
        void import('@/lib/session-sounds').then((m) => m.playPhaseCompleteSound())
        toast('Phase time complete. Ready for next step.', { icon: '⏱️' })
      }
    } else {
      phaseCompleteNotified.current = false
    }
  }, [secondsRemaining, phase, isPaused])

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }, [])

  const markBlockCompleteIfNeeded = useCallback(
    (completedPhaseIndex: number) => {
      const completedPhase = phases[completedPhaseIndex]
      if (!completedPhase || completedPhase.isRecovery) return

      const nextPhase = phases[completedPhaseIndex + 1]
      const isLastInBlock =
        !nextPhase || nextPhase.isRecovery || nextPhase.blockId !== completedPhase.blockId

      if (isLastInBlock) {
        const blockMinutes = phases
          .filter((p) => p.blockId === completedPhase.blockId && !p.isRecovery)
          .reduce((sum, p) => sum + p.durationMinutes, 0)

        completeBlock(completedPhase.blockId as PracticeBlockId, blockMinutes)

        const nextWorkPhase = nextPhase?.isRecovery
          ? phases[completedPhaseIndex + 2]
          : nextPhase
        if (nextWorkPhase && !nextWorkPhase.isRecovery) {
          setCurrentBlock(nextWorkPhase.blockId as PracticeBlockId)
        }
      }
    },
    [phases, completeBlock, setCurrentBlock],
  )

  const logCurrentPhase = useCallback(() => {
    if (!phase || phase.isRecovery) return
    logPhaseCompletion(
      {
        phaseId: phase.id,
        phaseTitle: phase.title,
        blockId: phase.blockId,
        plannedSeconds: phase.durationMinutes * 60,
      },
      secondsRemaining,
    )
  }, [phase, secondsRemaining, logPhaseCompletion])

  const handleNavigatePhase = useCallback(
    (targetIndex: number) => {
      if (targetIndex === phaseIndex || targetIndex < 0 || targetIndex >= phases.length) return

      if (targetIndex > phaseIndex + 1) {
        const skipped = phases.slice(phaseIndex, targetIndex).filter((p) => !p.isRecovery)
        if (skipped.length > 0) {
          logSkippedPhases(
            skipped.map((p) => ({
              phaseId: p.id,
              phaseTitle: p.title,
              blockId: p.blockId,
              plannedSeconds: p.durationMinutes * 60,
            })),
            new Date().toISOString().split('T')[0]!,
          )
          toast(`Skipped ${skipped.length} phase${skipped.length > 1 ? 's' : ''}. Logged on Dashboard.`, {
            icon: '📋',
          })
        }
      } else if (targetIndex === phaseIndex + 1) {
        logCurrentPhase()
      }

    goToPhase(targetIndex)
    if (!isDesktop) setGuidedLeftPanelOpen(false)
  },
    [phaseIndex, phases, logSkippedPhases, logCurrentPhase, goToPhase, isDesktop, setGuidedLeftPanelOpen],
  )

  useEffect(() => {
    setClarityRating(null)
    setAutomaticityChecked({})
  }, [phase?.id])

  const handleFinishDay = () => {
    if (
      !window.confirm(
        'End session for today? You will not be able to resume until tomorrow. Progress so far will be saved.',
      )
    ) {
      return
    }
    if (phase && !phase.isRecovery) {
      logCurrentPhase()
    }
    finishSession()
    finishDaySession()
    recordPracticeDay()
    toast.success('Session complete for today. Fresh start tomorrow.')
    resetSession()
    onComplete()
  }

  const handleCompletePhase = () => {
    if (phase && !phase.isRecovery) {
      logCurrentPhase()
    }

    markBlockCompleteIfNeeded(phaseIndex)

    const hasNext = completeCurrentPhase()
    setCheckpointAnswer('')
    setClarityRating(null)

    if (!hasNext) {
      finishSession()
      finishDaySession()
      recordPracticeDay()
      toast.success('Session complete for today. Outstanding work.')
      resetSession()
      onComplete()
    }
  }

  const handleExit = () => {
    if (window.confirm('Pause for later today? You can resume from Today\'s Practice.')) {
      pauseSession()
      toast('Session paused. Resume anytime today — or use Done for today when finished.', { icon: '⏸️' })
      onComplete()
    }
  }

  if (!phase) return null

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggleGuidedLeftPanel}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={phase.isRecovery ? 'secondary' : 'default'} className="shrink-0">
                {phase.blockName}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">{phase.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleGuidedRightPanel}>
            <PanelRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void toggleFullscreen()}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="px-4 pt-2 md:px-6">
        <Progress value={progress} className="h-1" />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ResizablePanel
          side="left"
          open={guidedLeftPanelOpen}
          width={guidedLeftPanelWidth}
          maxWidth={leftMaxWidth}
          onWidthChange={setLeftWidthClamped}
          onToggle={toggleGuidedLeftPanel}
          overlayTitle="Session map"
        >
          <PhaseSidebar phases={phases} phaseIndex={phaseIndex} onSelectPhase={handleNavigatePhase} />
        </ResizablePanel>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="mx-auto w-full max-w-2xl flex-1"
            >
              {phase.scientificNote && (
                <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                  {phase.scientificNote}
                </div>
              )}

              <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
                {phase.blockName}
              </p>
              <h1 className="mb-2 font-display text-2xl font-bold md:text-3xl">{phase.title}</h1>
              <p className="mb-6 text-muted-foreground">{phase.objective}</p>

              <div className="mb-8 rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Phase timer</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resetPhaseTimer}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePause}>
                      {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div
                  className={cn(
                    'font-mono text-5xl font-bold tabular-nums md:text-6xl',
                    secondsRemaining <= 30 && secondsRemaining > 0 ? 'text-warning' : 'text-primary',
                    secondsRemaining === 0 && 'text-muted-foreground',
                  )}
                >
                  {formatTime(secondsRemaining)}
                </div>
                <Progress value={phaseProgress} className="mt-3" />
                <p className="mt-1 text-xs text-muted-foreground">{phase.durationMinutes} min planned</p>
              </div>

              <div className="mb-6 space-y-3">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">What to do</h2>
                {phase.engagementPrompt && (
                  <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
                    {phase.engagementPrompt}
                  </p>
                )}
                {showSectionCapture && monthlyTranscriptionProject && (
                  <MonthlyTranscriptionSectionCapture
                    projectId={monthlyTranscriptionProject.id}
                    onSaved={(segmentId) => {
                      setActiveProject(monthlyTranscriptionProject.id)
                      setSelectedSegment(segmentId)
                    }}
                  />
                )}
                {showTranscriptionPanel && linkedTranscriptionProject && (
                  <TranscriptionStagePanel
                    project={linkedTranscriptionProject}
                    phase={phase}
                    activeSegmentId={selectedSegmentId}
                    onSelectSegment={setSelectedSegment}
                    onSegmentTimesChange={(segmentId, start, end) =>
                      updateSegment(linkedTranscriptionProject.id, segmentId, {
                        startSeconds: start,
                        endSeconds: end,
                      })
                    }
                  />
                )}
                <TimedStepRunner
                  steps={phase.steps}
                  phaseDurationSeconds={phaseDuration}
                  elapsedSeconds={phaseElapsed}
                  isPaused={isPaused}
                />
              </div>

              {phase.promptClarityRating && (
                <ClarityRating value={clarityRating} onChange={setClarityRating} />
              )}

              {phase.showAutomaticityChecklist && (
                <AutomaticityChecklist
                  checked={automaticityChecked}
                  onToggle={(id) =>
                    setAutomaticityChecked((prev) => ({ ...prev, [id]: !prev[id] }))
                  }
                />
              )}

              {phase.tips && phase.tips.length > 0 && (
                <div className="mb-6 rounded-md border border-primary/30 bg-primary/5 p-4">
                  <p className="mb-2 text-xs font-medium uppercase text-primary">Coach tips</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {phase.tips.map((tip) => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {phase.checkpoint && (
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium">{phase.checkpoint}</label>
                  <input
                    type="text"
                    value={checkpointAnswer}
                    onChange={(e) => setCheckpointAnswer(e.target.value)}
                    placeholder="Brief answer (optional)"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}

              {startedAt && (
                <p className="text-xs text-muted-foreground">
                  Session started {new Date(startedAt).toLocaleTimeString()}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <ResizablePanel
          side="right"
          open={guidedRightPanelOpen}
          width={guidedRightPanelWidth}
          maxWidth={rightMaxWidth}
          onWidthChange={setRightWidthClamped}
          onToggle={toggleGuidedRightPanel}
          overlayTitle="Practice tools"
        >
          <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-sidebar/40 px-4 py-4 scrollbar-thin">
            <PracticeToolsContent variant="panel" phaseId={phase.id} phaseTitle={phase.title} />
          </div>
        </ResizablePanel>
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:py-4 md:px-6">
        <Button
          variant="outline"
          onClick={() => handleNavigatePhase(phaseIndex - 1)}
          disabled={phaseIndex === 0}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={togglePause} className="lg:hidden">
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleFinishDay}>
            Done for today
          </Button>
        </div>

        <Button onClick={handleCompletePhase} size="lg" className="w-full gap-2 sm:w-auto">
          {phaseIndex >= totalPhases - 1 ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Done for today
            </>
          ) : (
            <>
              Complete Phase
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </footer>
    </div>
  )
}
