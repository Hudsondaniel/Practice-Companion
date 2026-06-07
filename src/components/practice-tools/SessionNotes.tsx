import { Textarea } from '@/components/ui/textarea'
import { useSessionToolsStore } from '@/stores/session-tools-store'

export function SessionNotes() {
  const { sessionNotes, setSessionNotes } = useSessionToolsStore()

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session Notes</span>
      <Textarea
        placeholder="Concept stage, tomorrow focus, failure windows..."
        value={sessionNotes}
        onChange={(e) => setSessionNotes(e.target.value)}
        className="min-h-[80px] resize-none text-sm"
      />
    </div>
  )
}
