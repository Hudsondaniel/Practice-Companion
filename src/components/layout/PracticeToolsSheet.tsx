import { useEffect } from 'react'
import { Timer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeToolsContent } from '@/components/practice-tools/PracticeToolsContent'
import { useUIStore } from '@/stores/ui-store'

export function PracticeToolsSheet() {
  const practiceToolsOpen = useUIStore((s) => s.practiceToolsOpen)
  const setPracticeToolsOpen = useUIStore((s) => s.setPracticeToolsOpen)

  useEffect(() => {
    if (!practiceToolsOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPracticeToolsOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [practiceToolsOpen, setPracticeToolsOpen])

  if (!practiceToolsOpen) return null

  return (
    <div className="fixed inset-0 z-40 xl:hidden" role="dialog" aria-modal="true" aria-label="Practice tools">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close practice tools"
        onClick={() => setPracticeToolsOpen(false)}
      />
      <aside
        className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-xl border border-border bg-card shadow-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">Practice Tools</h2>
            <p className="text-xs text-muted-foreground">Timer, metronome, and session notes</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setPracticeToolsOpen(false)} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-5">
          <PracticeToolsContent variant="panel" />
        </div>
      </aside>
    </div>
  )
}

export function PracticeToolsFab() {
  const togglePracticeTools = useUIStore((s) => s.togglePracticeTools)

  return (
    <Button
      type="button"
      size="lg"
      className="fixed z-20 h-12 gap-2 rounded-full px-4 shadow-lg xl:hidden"
      style={{
        right: 'max(1rem, env(safe-area-inset-right, 0px))',
        bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      onClick={togglePracticeTools}
      aria-label="Open practice tools"
    >
      <Timer className="h-4 w-4" />
      <span className="text-sm">Tools</span>
    </Button>
  )
}
