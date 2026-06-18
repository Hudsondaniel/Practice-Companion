import { useEffect, useMemo, useRef } from 'react'
import { playStepCompleteSound } from '@/lib/session-sounds'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { GuidedStep } from '@/types/practice-method'
import { normalizeStep } from '@/lib/normalize-steps'
import {
  activeStepIndexFromElapsed,
  allocateStepDurations,
  stepSecondsRemaining,
} from '@/lib/step-timing'
import { formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface TimedStepRunnerProps {
  steps: (GuidedStep | string)[]
  phaseDurationSeconds: number
  elapsedSeconds: number
  isPaused: boolean
}

export function TimedStepRunner({
  steps,
  phaseDurationSeconds,
  elapsedSeconds,
  isPaused,
}: TimedStepRunnerProps) {
  const normalized = useMemo(() => steps.map(normalizeStep), [steps])
  const stepDurations = useMemo(
    () => allocateStepDurations(steps, phaseDurationSeconds),
    [steps, phaseDurationSeconds],
  )

  const activeIndex = activeStepIndexFromElapsed(stepDurations, elapsedSeconds)
  const prevActiveIndex = useRef(activeIndex)
  const hasMounted = useRef(false)

  useEffect(() => {
    prevActiveIndex.current = activeIndex
    hasMounted.current = false
  }, [steps, phaseDurationSeconds])

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      prevActiveIndex.current = activeIndex
      return
    }
    if (!isPaused && activeIndex > prevActiveIndex.current) {
      void playStepCompleteSound()
    }
    prevActiveIndex.current = activeIndex
  }, [activeIndex, isPaused])

  const stepRemaining = stepSecondsRemaining(stepDurations, elapsedSeconds, activeIndex)
  const stepDuration = stepDurations[activeIndex] ?? 1
  const stepProgress =
    stepDuration > 0 ? ((stepDuration - stepRemaining) / stepDuration) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {activeIndex + 1} of {normalized.length}
        </span>
        <span className="font-mono tabular-nums">
          {formatTime(stepRemaining)} left on this step
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeIndex}-${normalized[activeIndex]?.summary}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="rounded-lg border border-primary/30 bg-primary/5 p-4"
        >
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {activeIndex + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold leading-snug">
                {normalized[activeIndex]?.summary}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {normalized[activeIndex]?.detail}
              </p>
              {normalized[activeIndex]?.example && (
                <p className="mt-3 rounded-md bg-background/70 px-3 py-2 text-xs italic text-foreground/85">
                  Example: {normalized[activeIndex].example}
                </p>
              )}
              {normalized[activeIndex]?.pedagogy && (
                <div className="mt-4 space-y-2 rounded-md border border-border bg-background/80 p-3 text-xs">
                  <p className="font-medium uppercase tracking-wide text-primary">Coach</p>
                  <p>
                    <span className="font-medium text-foreground">Why: </span>
                    <span className="text-muted-foreground">{normalized[activeIndex].pedagogy.why}</span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Skill: </span>
                    <span className="text-muted-foreground">{normalized[activeIndex].pedagogy.skill}</span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Masters: </span>
                    <span className="text-muted-foreground">{normalized[activeIndex].pedagogy.masters}</span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Listen for: </span>
                    <span className="text-muted-foreground">{normalized[activeIndex].pedagogy.listenFor}</span>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Measure: </span>
                    <span className="text-muted-foreground">{normalized[activeIndex].pedagogy.measure}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <Progress value={stepProgress} className="h-1.5" />
        </motion.div>
      </AnimatePresence>

      <ol className="space-y-1">
        {normalized.map((step, i) => {
          let start = 0
          for (let j = 0; j < i; j++) start += stepDurations[j]!
          const done = elapsedSeconds >= start + (stepDurations[i] ?? 0)
          const current = i === activeIndex
          return (
            <li
              key={`${step.summary}-${i}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                current && !isPaused && 'bg-muted/50 text-foreground',
                done && 'text-success',
                !done && !current && 'text-muted-foreground',
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
              ) : (
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    current ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
              )}
              <span className="flex-1 truncate">{step.summary}</span>
              <span className="shrink-0 font-mono tabular-nums text-[10px]">
                {formatTime(stepDurations[i] ?? 0)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
