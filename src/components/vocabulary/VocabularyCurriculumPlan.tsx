import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LEVEL_1_WEEKS } from '@/features/vocabulary-lab/curriculum-level-1'
import { getVocabularyContext } from '@/features/vocabulary-lab/rotation'
import { useVocabularyStore } from '@/stores/vocabulary-store'
import { cn } from '@/lib/utils'

const PILLAR_LABELS = {
  pentatonic: 'Pentatonic',
  blues: 'Blues',
  altered: 'Altered / melodic minor',
} as const

const PILLAR_BLOCKS = [
  { pillar: 'pentatonic' as const, weeks: [1, 2, 3, 4], label: 'Block 1 · Pentatonic identity' },
  { pillar: 'blues' as const, weeks: [5, 6, 7, 8], label: 'Block 2 · Blues speech' },
  { pillar: 'altered' as const, weeks: [9, 10, 11, 12], label: 'Block 3 · Outside color & capstone' },
]

interface VocabularyCurriculumPlanProps {
  defaultExpanded?: boolean
  id?: string
}

export function VocabularyCurriculumPlan({
  defaultExpanded = true,
  id = 'vocabulary-plan',
}: VocabularyCurriculumPlanProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const cycleStartDate = useVocabularyStore((s) => s.cycleStartDate)
  const level = useVocabularyStore((s) => s.curriculumLevel)
  const ctx = getVocabularyContext(cycleStartDate, level)

  return (
    <Card id={id} className="scroll-mt-6">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">12-week Vocabulary Lab plan</CardTitle>
            <CardDescription>
              Level {level} spiral cycle — not a 12-month calendar. Your monthly tune plan lives in
              Practice Library.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setExpanded((e) => !e)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show plan
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            After 12 weeks you should hear and deploy three melodic families (pentatonic, blues,
            altered) as spoken language — with signature motifs, tri-sound integration, and a
            recorded capstone solo on your monthly tune.
          </p>

          {PILLAR_BLOCKS.map((block) => (
            <div key={block.pillar} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {block.label}
              </p>
              <ol className="space-y-2">
                {block.weeks.map((weekNum) => {
                  const week = LEVEL_1_WEEKS.find((w) => w.week === weekNum)!
                  const isCurrent = weekNum === ctx.macroWeek
                  return (
                    <li
                      key={weekNum}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-sm transition-colors',
                        isCurrent
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-border bg-muted/20',
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">Week {weekNum}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {PILLAR_LABELS[week.pillar]}
                        </Badge>
                        {week.isFusionWeek && (
                          <Badge variant="warning" className="text-[10px]">
                            Fusion / record
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge className="text-[10px]">You are here</Badge>
                        )}
                      </div>
                      <p className="mt-1 font-medium leading-snug">{week.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{week.objective}</p>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Integration: {week.integrationThread}
                      </p>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
