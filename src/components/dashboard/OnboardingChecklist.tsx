import { Link } from 'react-router-dom'
import { CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePracticeStore } from '@/stores/practice-store'
import { currentMonthYear } from '@/types/practice-method'
import { cn } from '@/lib/utils'

export function OnboardingChecklist() {
  const { activeConcept, isMonthConfigured } = usePracticeStore()
  const month = currentMonthYear()
  const monthDone = isMonthConfigured(month)
  const conceptDone = Boolean(activeConcept)
  const allDone = monthDone && conceptDone

  if (allDone) return null

  const steps = [
    {
      done: monthDone,
      title: 'Set up this month',
      detail: 'Choose your 3 tunes, keys, and practice focus.',
      href: '/library?tab=monthly',
      action: 'Monthly setup',
    },
    {
      done: conceptDone,
      title: 'Add your active concept',
      detail: 'One harmonic device to drill in guided sessions.',
      href: '/library?tab=concepts',
      action: 'Add concept',
    },
    {
      done: false,
      title: 'Start your first session',
      detail: 'About 2 hours of guided practice, broken into clear steps.',
      href: monthDone && conceptDone ? '/practice' : undefined,
      action: 'Start practice',
      locked: !monthDone || !conceptDone,
    },
  ]

  return (
    <Card className="border-primary/40 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Get started</CardTitle>
        <CardDescription>
          Complete these steps to unlock your full {month} practice plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : (
                <Circle
                  className={cn(
                    'mt-0.5 h-5 w-5 shrink-0',
                    step.locked ? 'text-muted-foreground/40' : 'text-muted-foreground',
                  )}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn('font-medium', step.done && 'text-muted-foreground line-through')}>
                  {i + 1}. {step.title}
                </p>
                {!step.done && (
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                )}
              </div>
              {!step.done && step.href && !step.locked && (
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link to={step.href}>{step.action}</Link>
                </Button>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
