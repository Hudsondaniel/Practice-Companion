import { useState } from 'react'
import { ChevronDown, ChevronRight, Circle, CheckCircle2 } from 'lucide-react'
import type { GuidedStep } from '@/types/practice-method'
import { normalizeStep } from '@/lib/normalize-steps'
import { cn } from '@/lib/utils'

interface ExpandableStepsProps {
  steps: (GuidedStep | string)[]
  completedIndices: number[]
  onToggleComplete: (index: number) => void
}

export function ExpandableSteps({ steps, completedIndices, onToggleComplete }: ExpandableStepsProps) {
  const [expanded, setExpanded] = useState<number | null>(0)

  return (
    <ol className="space-y-2">
      {steps.map((raw, i) => {
        const step = normalizeStep(raw)
        const isOpen = expanded === i
        const done = completedIndices.includes(i)
        return (
          <li
            key={`${step.summary}-${i}`}
            className={cn(
              'rounded-md border border-border transition-colors',
              done ? 'border-success/40 bg-success/5' : 'bg-muted/20',
            )}
          >
            <div className="flex items-start gap-2 px-3 py-3">
              <button
                type="button"
                onClick={() => onToggleComplete(i)}
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-success"
                title={done ? 'Mark incomplete' : 'Mark done'}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                className="flex flex-1 items-start gap-2 text-left"
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{step.summary}</span>
                {isOpen ? (
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
            </div>
            {isOpen && (
              <div className="border-t border-border px-4 pb-3 pt-2 text-sm text-muted-foreground">
                {step.detail}
                {step.example && (
                  <p className="mt-2 rounded bg-background/60 px-2 py-1.5 text-xs italic text-foreground/80">
                    Example: {step.example}
                  </p>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
