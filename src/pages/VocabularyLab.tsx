import { VocabularyCurriculumPlan } from '@/components/vocabulary/VocabularyCurriculumPlan'
import { VocabularyWeekCard } from '@/components/vocabulary/VocabularyWeekCard'
import { VocabularyWeekControls } from '@/components/vocabulary/VocabularyWeekControls'

export function VocabularyLab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Vocabulary Lab</h1>
        <p className="text-muted-foreground">
          12-week spiral curriculum — pentatonic, blues, and altered language. You choose when to
          start and which week to work on.
        </p>
      </div>

      <VocabularyWeekControls />
      <VocabularyWeekCard />
      <VocabularyCurriculumPlan />
    </div>
  )
}
