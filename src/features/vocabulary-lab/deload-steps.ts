import type { VocabularyStepTemplate } from '@/features/vocabulary-lab/types'

/** Deload week: hear, sing, motif only — no new deployment pressure (25 min) */
export function getDeloadSteps(weekTitle: string): VocabularyStepTemplate[] {
  return [
    {
      kind: 'hear',
      summary: 'Deload — deep listening only',
      detail: `Revisit ${weekTitle} material from a hero recording. No piano. Mark 3 moments you love.`,
      durationSeconds: 600,
      pedagogy: {
        why: 'Deload consolidates ear memory without motor load',
        skill: 'Deep listening and taste refinement',
        masters: 'Your heroes from this sound family',
        listenFor: 'What still surprises you?',
        measure: '3 marked moments without playing',
      },
    },
    {
      kind: 'sing',
      summary: 'Deload — sing favorite cell',
      detail: 'Sing your favorite 2-bar cell from this week slowly. 6 reps. Change dynamics only.',
      durationSeconds: 600,
      pedagogy: {
        why: 'Singing maintains vocabulary without strain',
        skill: 'Audiation maintenance',
        masters: 'Vocal tradition of jazz pedagogy',
        listenFor: 'Relaxed, speech-like phrasing',
        measure: '6 reps without tension',
      },
    },
    {
      kind: 'motif',
      summary: 'Deload — gentle motif review',
      detail: 'Play your cell once in {home} at 60% tempo. Rhythmic variation only. Stop after 5 minutes.',
      durationSeconds: 300,
      pedagogy: {
        why: 'Light motor review prevents rust without overtraining',
        skill: 'Motif maintenance',
        masters: 'Maintenance practice tradition',
        listenFor: 'Sound quality over speed',
        measure: 'One cell, 3 gentle variants',
      },
    },
    {
      kind: 'call-response',
      summary: 'Deload — hum and answer softly',
      detail: 'Hum a phrase. Answer on piano pp. 4 exchanges. {keys}.',
      durationSeconds: 300,
      pedagogy: {
        why: 'Keeps dialogue alive at low volume',
        skill: 'Soft call-and-response',
        masters: 'Ballad and church whisper dynamics',
        listenFor: 'Intimacy in the phrase',
        measure: '4 soft exchanges',
      },
    },
    {
      kind: 'integrate',
      summary: 'Deload — mental replay',
      detail: 'Eyes closed: hear your best solo from this cycle in your head. No keyboard.',
      durationSeconds: 300,
      pedagogy: {
        why: 'Mental practice consolidates during deload',
        skill: 'Auditory imagery',
        masters: 'Mental practice research (piano pedagogy)',
        listenFor: 'Can you hear your own voice clearly?',
        measure: '4 minutes uninterrupted imagery',
      },
    },
  ]
}
