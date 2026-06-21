import { Badge } from '@/components/ui/badge'
import {
  formatMonthHeader,
  getDayType,
  getEarBlockLabel,
  getReviewDayLabel,
  isDeloadWeek,
  isPracticeDay,
  isReviewDay,
} from '@/lib/month-context'
import { DAY_TYPE_LABELS } from '@/types/practice-schedule'
import { usePracticeStore } from '@/stores/practice-store'

export function WeekContextBar() {
  const monthlyPlan = usePracticeStore((s) => s.monthlyPlan)
  const dayType = getDayType()
  const earBlock = getEarBlockLabel()
  const deload = isDeloadWeek()
  const review = isReviewDay()
  const rest = !isPracticeDay()
  const reviewLabel = getReviewDayLabel()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
      <span className="font-medium">{formatMonthHeader(monthlyPlan?.monthYear)}</span>
      {rest ? (
        <Badge variant="outline" className="text-[10px]">
          Rest day
        </Badge>
      ) : dayType ? (
        <Badge variant="secondary" className="text-[10px]">
          {DAY_TYPE_LABELS[dayType]} day
        </Badge>
      ) : null}
      {deload && (
        <Badge variant="warning" className="text-[10px]">
          Deload week
        </Badge>
      )}
      {review && (
        <Badge variant="outline" className="text-[10px]">
          Recording review{reviewLabel ? ` · ${reviewLabel}` : ''}
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
