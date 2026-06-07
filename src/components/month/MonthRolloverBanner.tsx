import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { currentMonthYear } from '@/types/practice-method'
import { usePracticeStore } from '@/stores/practice-store'
import { performArchiveMonth } from '@/lib/month-actions'

export function MonthRolloverBanner() {
  const monthlyPlan = usePracticeStore((s) => s.monthlyPlan)
  const current = currentMonthYear()
  const needsRollover = Boolean(monthlyPlan && monthlyPlan.monthYear !== current)

  if (!monthlyPlan || !needsRollover) return null

  return (
    <Card className="border-warning/50 bg-warning/10">
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-warning">
              {monthlyPlan.monthYear} ended · calendar is now {current}
            </p>
            <p className="text-sm text-muted-foreground">
              Archive your {monthlyPlan.monthYear} plan and initialize {current} in Practice Library, or keep
              practicing {monthlyPlan.monthYear} tunes until you&apos;re ready to switch.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              performArchiveMonth()
              toast.success(`${monthlyPlan.monthYear} archived. Set up ${current} in Practice Library.`)
            }}
          >
            Archive & start {current}
          </Button>
          <Button size="sm" asChild>
            <Link to="/library">Open Monthly Setup</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
