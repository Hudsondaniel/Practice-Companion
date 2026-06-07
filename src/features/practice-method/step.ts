import type { GuidedStep } from '@/types/practice-method'
import { getDailyAgilityFluencySteps } from '@/features/agility-fluency-lab/daily-routine'

export function step(summary: string, detail: string, example?: string): GuidedStep {
  return { summary, detail, example }
}

export function stepsFromStrings(items: string[]): GuidedStep[] {
  return items.map((s) => ({ summary: s, detail: s }))
}

export function agilitySteps(keyCluster: string[], date = new Date()): GuidedStep[] {
  const daily = getDailyAgilityFluencySteps(keyCluster, date)
  const details = [
    'Play 5 pianissimo notes from low to high. Notice key weight, escapement, and bench height. Adjust bench before main work.',
    `Today's pattern: ${daily.patternName}. Work in keys ${keyCluster.join(', ')}. Stop and drop tempo 10% if tension builds.`,
    'Choose chromatic double-3rds OR finger-independence (hold 4th, run 1-2-3-5). Five minutes only. Clean beats fast.',
    'Write peak clean BPM in Session Notes. Tomorrow starts from this baseline (+2 BPM only after 3 clean passes).',
  ]
  return daily.steps.map((s, i) => step(s.split('.')[0] ?? s, details[i] ?? s))
}
