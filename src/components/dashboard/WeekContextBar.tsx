import { Badge } from '@/components/ui/badge'
import { formatMonthHeader, getDayType, getEarBlockLabel, isDeloadWeek, isSunday } from '@/lib/month-context'
import { usePracticeStore } from '@/stores/practice-store'

export function WeekContextBar() {
  const monthlyPlan = usePracticeStore((s) => s.monthlyPlan)
  const dayType = getDayType()
  const earBlock = getEarBlockLabel()
  const deload = isDeloadWeek()
  const sunday = isSunday()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="font-medium">{formatMonthHeader(monthlyPlan?.monthYear)}</span>
      <Badge variant="secondary" className="text-[10px] capitalize">
        {dayType} day
      </Badge>
      {deload && (
        <Badge variant="warning" className="text-[10px]">
          Deload week
        </Badge>
      )}
      {sunday && (
        <Badge variant="outline" className="text-[10px]">
          Recording review
        </Badge>
      )}
      {earBlock && (
        <Badge variant="outline" className="text-[10px] capitalize">
          Ear: {earBlock}
        </Badge>
      )}
      {monthlyPlan?.extendedWeek && (
        <Badge variant="outline" className="text-[10px]">
          Extended month
        </Badge>
      )}
    </div>
  )
}
