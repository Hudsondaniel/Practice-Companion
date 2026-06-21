import { cn } from '@/lib/utils'
import { SessionTimer } from './SessionTimer'
import { SessionNotes } from './SessionNotes'
import { AudioToolsSwitcher } from './AudioToolsSwitcher'

interface PracticeToolsContentProps {
  variant?: 'compact' | 'panel'
  phaseId?: string
  phaseTitle?: string
}

export function PracticeToolsContent({
  variant = 'compact',
  phaseId,
  phaseTitle,
}: PracticeToolsContentProps) {
  const isPanel = variant === 'panel'

  return (
    <div className={cn('flex flex-col gap-4', isPanel && 'min-h-0 flex-1')}>
      <SessionTimer size={isPanel ? 'lg' : 'md'} className={isPanel ? 'shrink-0' : undefined} />

      <section className={cn('rounded-xl border border-border bg-card p-4', isPanel && 'shrink-0')}>
        <AudioToolsSwitcher phaseId={phaseId} phaseTitle={phaseTitle} />
      </section>

      <section
        className={cn(
          'rounded-xl border border-border bg-card p-4',
          isPanel && 'flex min-h-[11rem] flex-1 flex-col',
        )}
      >
        <SessionNotes textareaClassName={isPanel ? 'min-h-[9rem] flex-1' : undefined} />
      </section>
    </div>
  )
}
