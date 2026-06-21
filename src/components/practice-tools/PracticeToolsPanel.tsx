import { cn } from '@/lib/utils'
import { PracticeToolsContent } from './PracticeToolsContent'

interface PracticeToolsPanelProps {
  className?: string
}

export function PracticeToolsPanel({ className }: PracticeToolsPanelProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-[22rem] shrink-0 flex-col border-l border-border bg-sidebar/90 2xl:w-[26rem]',
        className,
      )}
    >
      <header className="shrink-0 border-b border-border bg-card/40 px-5 py-4">
        <h2 className="font-display text-base font-semibold tracking-tight">Practice Tools</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Timer, metronome, recording, and session notes — always at hand while you work.
        </p>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 scrollbar-thin">
        <PracticeToolsContent variant="panel" />
      </div>
    </aside>
  )
}
