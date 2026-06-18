import { VocabularyCurriculumPlan } from '@/components/vocabulary/VocabularyCurriculumPlan'
import { VocabularyWeekCard } from '@/components/vocabulary/VocabularyWeekCard'

export function VocabularyLab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vocabulary Lab</h1>
        <p className="text-muted-foreground">
          12-week spiral curriculum — pentatonic, blues, and altered language (not scale drills)
        </p>
      </div>

      <VocabularyWeekCard />
      <VocabularyCurriculumPlan />
    </div>
  )
}
