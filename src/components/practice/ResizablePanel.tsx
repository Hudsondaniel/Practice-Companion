import { useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'

const COLLAPSED_WIDTH = 40

interface ResizablePanelProps {
  side: 'left' | 'right'
  width: number
  minWidth?: number
  maxWidth?: number
  open: boolean
  onWidthChange: (width: number) => void
  onToggle: () => void
  children: React.ReactNode
  className?: string
  overlayTitle?: string
  /** When closed, render nothing instead of a collapsed rail */
  hideWhenClosed?: boolean
}

export function ResizablePanel({
  side,
  width,
  minWidth = 180,
  maxWidth = 480,
  open,
  onWidthChange,
  onToggle,
  children,
  className,
  overlayTitle,
  hideWhenClosed = false,
}: ResizablePanelProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const dragging = useRef(false)
  const handleRef = useRef<HTMLDivElement>(null)

  const clampWidth = useCallback(
    (next: number) => Math.min(maxWidth, Math.max(minWidth, next)),
    [minWidth, maxWidth],
  )

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isDesktop) return
      e.preventDefault()
      e.stopPropagation()
      dragging.current = true
      handleRef.current?.setPointerCapture(e.pointerId)
      const startX = e.clientX
      const startW = width
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (ev: PointerEvent) => {
        if (!dragging.current) return
        const delta = side === 'left' ? ev.clientX - startX : startX - ev.clientX
        onWidthChange(clampWidth(startW + delta))
      }

      const onUp = (ev: PointerEvent) => {
        dragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        handleRef.current?.releasePointerCapture(ev.pointerId)
        handleRef.current?.removeEventListener('pointermove', onMove)
        handleRef.current?.removeEventListener('pointerup', onUp)
        handleRef.current?.removeEventListener('pointercancel', onUp)
      }

      handleRef.current?.addEventListener('pointermove', onMove)
      handleRef.current?.addEventListener('pointerup', onUp)
      handleRef.current?.addEventListener('pointercancel', onUp)
    },
    [width, side, onWidthChange, clampWidth, isDesktop],
  )

  if (!isDesktop) {
    if (!open) return null

    return (
      <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={overlayTitle}>
        <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close panel" onClick={onToggle} />
        <aside
          className={cn(
            'absolute inset-y-0 flex w-[min(100%,20rem)] flex-col border-border bg-background shadow-xl',
            side === 'left' ? 'left-0 border-r' : 'right-0 border-l',
            className,
          )}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {overlayTitle ?? (side === 'left' ? 'Session map' : 'Practice tools')}
            </p>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle} aria-label="Close panel">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        </aside>
      </div>
    )
  }

  if (!open) {
    if (hideWhenClosed) return null

    return (
      <aside
        style={{ width: COLLAPSED_WIDTH, minWidth: COLLAPSED_WIDTH, maxWidth: COLLAPSED_WIDTH }}
        className={cn(
          'flex h-full shrink-0 flex-col items-center justify-start border-border bg-background pt-2',
          side === 'left' ? 'border-r' : 'border-l',
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onToggle}
          aria-label={side === 'left' ? 'Open session map' : 'Open practice tools'}
        >
          {side === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </aside>
    )
  }

  return (
    <aside
      style={{ width, flex: `0 0 ${width}px` }}
      className={cn(
        'relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-border bg-background',
        side === 'left' ? 'border-r' : 'border-l',
        className,
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      <div
        ref={handleRef}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        onPointerDown={onPointerDown}
        className={cn(
          'absolute inset-y-0 z-20 w-1.5 touch-none bg-transparent',
          side === 'left' ? 'right-0 cursor-col-resize' : 'left-0 cursor-col-resize',
        )}
      >
        <div
          className={cn(
            'absolute inset-y-0 w-px bg-border transition-colors hover:bg-primary/60',
            side === 'left' ? 'right-0' : 'left-0',
          )}
        />
      </div>
    </aside>
  )
}

export { COLLAPSED_WIDTH }
