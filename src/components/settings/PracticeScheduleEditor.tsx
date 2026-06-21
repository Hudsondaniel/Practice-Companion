import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePracticeStore } from '@/stores/practice-store'
import type { DayType } from '@/types/practice-method'
import {
  DAY_TYPE_LABELS,
  SCHEDULE_PRESETS,
  WEEKDAY_DISPLAY_ORDER,
  WEEKDAY_FULL,
  WEEKDAY_SHORT,
  countEnabledDays,
  formatScheduleSummary,
  type WeekdayIndex,
} from '@/types/practice-schedule'

const DAY_TYPES: DayType[] = ['identity', 'expansion', 'review']

export function PracticeScheduleEditor() {
  const practiceSchedule = usePracticeStore((s) => s.practiceSchedule)
  const setPracticeSchedule = usePracticeStore((s) => s.setPracticeSchedule)

  const [draft, setDraft] = useState(practiceSchedule)
  const dirty = JSON.stringify(draft) !== JSON.stringify(practiceSchedule)

  useEffect(() => {
    setDraft(practiceSchedule)
  }, [practiceSchedule])

  const applyPreset = (presetId: string) => {
    const preset = SCHEDULE_PRESETS.find((p) => p.id === presetId)
    if (preset) setDraft(preset.schedule)
  }

  const toggleDay = (index: WeekdayIndex) => {
    setDraft((prev) => {
      const next = { ...prev, days: [...prev.days] as typeof prev.days }
      const enabled = !next.days[index].enabled
      if (!enabled && countEnabledDays({ days: next.days }) <= 1) {
        toast.error('Keep at least one practice day')
        return prev
      }
      next.days[index] = { ...next.days[index], enabled }
      return next
    })
  }

  const setDayType = (index: WeekdayIndex, dayType: DayType) => {
    setDraft((prev) => {
      const next = { ...prev, days: [...prev.days] as typeof prev.days }
      next.days[index] = { ...next.days[index], dayType, enabled: true }
      return next
    })
  }

  const save = () => {
    if (countEnabledDays(draft) === 0) {
      toast.error('Select at least one practice day')
      return
    }
    setPracticeSchedule(draft)
    toast.success('Practice schedule saved')
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Current: <strong>{formatScheduleSummary(practiceSchedule)}</strong>
      </p>

      <div className="flex flex-wrap gap-2">
        {SCHEDULE_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyPreset(preset.id)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {WEEKDAY_DISPLAY_ORDER.map((index) => {
          const entry = draft.days[index]
          return (
            <div
              key={index}
              className={cn(
                'flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2',
                entry.enabled ? 'bg-card' : 'bg-muted/20 opacity-80',
              )}
            >
              <button
                type="button"
                onClick={() => toggleDay(index)}
                className={cn(
                  'flex h-9 w-12 shrink-0 items-center justify-center rounded-md text-sm font-semibold transition-colors',
                  entry.enabled
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
                aria-pressed={entry.enabled}
              >
                {WEEKDAY_SHORT[index]}
              </button>
              <span className="min-w-[5rem] text-sm">{WEEKDAY_FULL[index]}</span>
              {entry.enabled ? (
                <div className="flex flex-wrap gap-1">
                  {DAY_TYPES.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      size="sm"
                      variant={entry.dayType === type ? 'default' : 'ghost'}
                      className="h-7 text-xs"
                      onClick={() => setDayType(index, type)}
                    >
                      {DAY_TYPE_LABELS[type]}
                    </Button>
                  ))}
                </div>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Rest
                </Badge>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Identity days focus your home keys. Expansion days stretch to neighboring keys. Review days
        swap in recording review instead of consolidation.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={save} disabled={!dirty}>
          Save schedule
        </Button>
        {dirty && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(practiceSchedule)}>
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
