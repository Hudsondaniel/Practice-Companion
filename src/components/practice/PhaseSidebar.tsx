import type { GuidedPhase } from '@/types/practice-method'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhaseSidebarProps {
  phases: GuidedPhase[]
  phaseIndex: number
  onSelectPhase: (index: number) => void
}

interface PhaseGroup {
  blockName: string
  items: { phase: GuidedPhase; index: number }[]
}

function groupPhasesByBlock(phases: GuidedPhase[]): PhaseGroup[] {
  const groups: PhaseGroup[] = []
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i]!
    const last = groups[groups.length - 1]
    if (last && last.blockName === phase.blockName) {
      last.items.push({ phase, index: i })
    } else {
      groups.push({ blockName: phase.blockName, items: [{ phase, index: i }] })
    }
  }
  return groups
}

export function PhaseSidebar({ phases, phaseIndex, onSelectPhase }: PhaseSidebarProps) {
  const groups = groupPhasesByBlock(phases)

  return (
    <div className="flex h-full flex-col">
      <p className="shrink-0 border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Session map
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto p-2 scrollbar-thin">
        <div className="space-y-3">
          {groups.map((group) => (
            <div key={group.blockName}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                {group.blockName}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ phase, index }) => (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => onSelectPhase(index)}
                    className={cn(
                      'w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      index === phaseIndex
                        ? 'bg-primary/20 text-primary'
                        : index < phaseIndex
                          ? 'text-success'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      phase.isRecovery && 'italic opacity-80',
                    )}
                  >
                    {index < phaseIndex && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                    {phase.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { groupPhasesByBlock }
