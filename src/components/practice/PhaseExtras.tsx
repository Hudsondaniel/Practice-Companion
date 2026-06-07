import { AUTOMATICITY_CRITERIA } from '@/types/practice-method'
import { cn } from '@/lib/utils'

interface AutomaticityChecklistProps {
  checked: Record<string, boolean>
  onToggle: (id: string) => void
}

export function AutomaticityChecklist({ checked, onToggle }: AutomaticityChecklistProps) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Automaticity check</p>
      <ul className="space-y-2">
        {AUTOMATICITY_CRITERIA.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(checked[c.id])}
                onChange={() => onToggle(c.id)}
                className="mt-0.5 accent-primary"
              />
              <span>
                <span className="font-medium">{c.name}</span>
                <span className="block text-xs text-muted-foreground">{c.description}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ClarityRatingProps {
  value: number | null
  onChange: (n: number) => void
}

export function ClarityRating({ value, onChange }: ClarityRatingProps) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
      <p className="mb-2 text-xs font-medium text-primary">Concept clarity today (1–5)</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors',
              value === n
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:bg-muted',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
