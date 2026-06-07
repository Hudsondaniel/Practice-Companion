import { SessionTimer } from './SessionTimer'
import { SessionNotes } from './SessionNotes'
import { AudioToolsSwitcher } from './AudioToolsSwitcher'

export function PracticeToolsPanel() {
  return (
    <aside className="flex h-full w-[40%] min-w-[320px] max-w-[480px] flex-col border-l border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Practice Tools</h2>
        <p className="text-xs text-muted-foreground">Always visible during practice</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        <SessionTimer />
        <AudioToolsSwitcher />
        <div className="h-px bg-border" />
        <SessionNotes />
      </div>
    </aside>
  )
}
