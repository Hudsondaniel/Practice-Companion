import { useState } from 'react'
import toast from 'react-hot-toast'
import { RotateCcw, Archive, CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMonthContext, getMonthWeekLabel } from '@/lib/practice-week'
import { performArchiveMonth, performHardMonthRestart, performSoftMonthRestart } from '@/lib/month-actions'
import { usePracticeStore } from '@/stores/practice-store'
import { currentMonthYear } from '@/types/practice-method'

export function MonthControls() {
  const monthlyPlan = usePracticeStore((s) => s.monthlyPlan)
  const extendCurrentMonth = usePracticeStore((s) => s.extendCurrentMonth)
  const month = currentMonthYear()
  const configured = Boolean(
    monthlyPlan && monthlyPlan.monthYear === month && monthlyPlan.tunes.length === 3,
  )
  const [confirmHard, setConfirmHard] = useState(false)

  if (!configured || !monthlyPlan) return null

  const configuredDate = new Date(monthlyPlan.configuredAt).toLocaleDateString()

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Month controls</CardTitle>
        <CardDescription>
          {monthlyPlan.monthYear} · {formatMonthContext()} · {getMonthWeekLabel()}
          {monthlyPlan.extendedWeek && ' · Extended week active'}
          <span className="mt-1 block text-xs">Configured {configuredDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            if (window.confirm('Soft restart: reset session progress and dual-task phase for this month. Keep tunes, concepts, and transcriptions.')) {
              performSoftMonthRestart()
              toast.success('Month soft-restarted. Session progress cleared.')
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Soft restart
        </Button>
        {!confirmHard ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => setConfirmHard(true)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Hard restart…
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              performHardMonthRestart()
              setConfirmHard(false)
              toast.success('Hard restart complete. Deployment points and daily heroes cleared.')
            }}
          >
            Confirm hard restart
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={monthlyPlan.extendedWeek}
          onClick={() => {
            extendCurrentMonth()
            toast.success('Extended week enabled for this month.')
          }}
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Extend +1 week
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            if (
              window.confirm(
                `Archive ${monthlyPlan.monthYear} and clear the plan? You'll need to initialize ${currentMonthYear()} fresh.`,
              )
            ) {
              performArchiveMonth()
              toast.success('Month archived. Initialize the new month below.')
            }
          }}
        >
          <Archive className="h-3.5 w-3.5" />
          Archive month
        </Button>
      </CardContent>
    </Card>
  )
}
