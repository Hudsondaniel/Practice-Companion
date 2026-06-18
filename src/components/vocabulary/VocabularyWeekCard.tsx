import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getVocabularyContext } from '@/features/vocabulary-lab/rotation'
import { useVocabularyStore } from '@/stores/vocabulary-store'

const PILLAR_LABELS = {
  pentatonic: 'Pentatonic',
  blues: 'Blues',
  altered: 'Altered / melodic minor',
} as const

export function VocabularyWeekCard({ compact = false }: { compact?: boolean }) {
  const cycleStartDate = useVocabularyStore((s) => s.cycleStartDate)
  const level = useVocabularyStore((s) => s.curriculumLevel)
  const lastRating = useVocabularyStore((s) => s.lastMotifClarityRating)
  const ctx = getVocabularyContext(cycleStartDate, level)

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">Vocabulary Week {ctx.macroWeek}/12</Badge>
        <Badge variant="outline">{PILLAR_LABELS[ctx.module.pillar]}</Badge>
        {ctx.isFusionWeek && <Badge variant="warning">Fusion week</Badge>}
        {ctx.isDeload && <Badge variant="outline">Deload</Badge>}
        {lastRating != null && (
          <span className="text-xs text-muted-foreground">Last motif clarity: {lastRating}/5</span>
        )}
      </div>
    )
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Vocabulary Lab · Week {ctx.macroWeek} of 12</CardTitle>
        <CardDescription>Level {level} spiral — language, not scales</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium">{ctx.module.title}</p>
        <p className="text-sm text-muted-foreground">{ctx.module.objective}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge>{PILLAR_LABELS[ctx.module.pillar]}</Badge>
          {ctx.isFusionWeek && <Badge variant="warning">Fusion / record week</Badge>}
          {ctx.isDeload && <Badge variant="outline">Deload — hear & sing only</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          Integration: {ctx.module.integrationThread}
        </p>
        {lastRating != null && (
          <p className="text-xs text-muted-foreground">Last motif clarity: {lastRating}/5</p>
        )}
      </CardContent>
    </Card>
  )
}
