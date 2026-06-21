import type { DayType, PracticeBlockId } from '@/types/practice-method'
import { BASE_SESSION_MINUTES, PRACTICE_BLOCKS } from '@/types/practice-method'

export interface GeneratedBlock {
  blockId: PracticeBlockId
  name: string
  startMinute: number
  durationMinutes: number
  instructions: string[]
  subBlocks?: { name: string; minutes: number; instructions: string[] }[]
}

export interface GeneratedSession {
  totalMinutes: number
  dayType: DayType
  blocks: GeneratedBlock[]
  focusAreas: string[]
  recoveryPeriods: { afterBlock: PracticeBlockId; minutes: number; activity: string }[]
  estimatedCompletionTime: string
}

interface SessionInput {
  availableMinutes: number
  dayType: DayType
  activeConceptLabel: string
  keyCluster: string[]
  dualTaskPhase: number
  monthlyTunes: string[]
  isReviewDay: boolean
}

export function generatePracticeSession(input: SessionInput): GeneratedSession {
  const isReview = input.dayType === 'review' || input.isReviewDay

  const blocks = PRACTICE_BLOCKS.filter((b) => {
    if (isReview && b.id === 'consolidation') return false
    if (!isReview && b.id === 'recording-review') return false
    return true
  })

  const scale = input.availableMinutes / BASE_SESSION_MINUTES
  let cursor = 0
  const generated: GeneratedBlock[] = blocks.map((block) => {
    const duration = Math.round(block.durationMinutes * scale)
    const start = cursor
    cursor += duration

    const instructions = getBlockInstructions(block.id, input)
    return {
      blockId: block.id,
      name: block.name,
      startMinute: start,
      durationMinutes: duration,
      instructions,
      subBlocks: getSubBlocks(block.id, duration, input),
    }
  })

  return {
    totalMinutes: input.availableMinutes,
    dayType: input.dayType,
    blocks: generated,
    focusAreas: [
      `Active Concept: ${input.activeConceptLabel}`,
      `Key cluster: ${input.keyCluster.join(', ')}`,
      `Dual-task Phase ${input.dualTaskPhase}`,
      `Monthly lab: ${input.monthlyTunes.join(', ')}`,
    ],
    recoveryPeriods: [
      { afterBlock: 'concept-forge', minutes: 1, activity: 'Stand, shake hands, 3 deep breaths' },
      { afterBlock: 'standards-hymns-lab', minutes: 2, activity: 'Hydrate, shoulder rolls, reset ears' },
      { afterBlock: 'agility-fluency-lab', minutes: 1, activity: 'Shake hands, reset ears after vocabulary work' },
    ],
    estimatedCompletionTime: formatCompletion(cursor),
  }
}

function getBlockInstructions(
  blockId: PracticeBlockId,
  input: SessionInput,
): string[] {
  switch (blockId) {
    case 'concept-forge':
      return [
        `Core Key Identity: ${input.keyCluster.join(', ')} — 4-min loop per key`,
        'Bare executions → rhythmic/dynamic shift → multi-sensory → mini-music',
        'Light Transposition: monthly tune section, original ×2 → neighbor key ×1',
      ]
    case 'transcription-integration':
      return [
        'Language acquisition from any hero recording',
        'Listen, sing, and internalize lines — not tied to active concept',
        'Optional deploy of stolen vocabulary into monthly tunes',
      ]
    case 'standards-hymns-lab':
      return [
        'Interleaved loop: all 3 tunes — original, transpose, slow, fast',
        'Failure overload if any bar fails 3× — isolate 4-bar window',
        'Hero Imitation Pass: one tune, one hero, feel over analysis',
      ]
    case 'cold-pressure':
      return [
        'Unfamiliar cold tune — 3 forced deployments',
        `Dual-task Phase ${input.dualTaskPhase} on monthly tune`,
        'No-evaluation trust run — record, no corrections',
        'Daily log: concept stage + tomorrow focus',
      ]
    case 'agility-fluency-lab':
      return [
        'Sound immersion: hear today\'s pentatonic, blues, or altered color',
        'Sing → call/response → motif extraction (language, not scales)',
        'Harmonic deployment on monthly tune or ii–V–I',
        'Tri-sound integration: pentatonic, blues, altered in one phrase',
      ]
    case 'consolidation':
      return [
        'Mental practice: 3 keys, imagine monthly tune deployment',
        'Active listening: hunt Active Concept in source recordings',
      ]
    case 'recording-review':
      return [
        'Mandatory sound-target review — 15-20 min of your recordings',
        'Mark forced/student-y usages with timecodes',
        'Update concept library notes and next week focus',
      ]
    default:
      return []
  }
}

function getSubBlocks(
  blockId: PracticeBlockId,
  totalMinutes: number,
  input: SessionInput,
) {
  if (blockId === 'concept-forge') {
    const core = Math.round(totalMinutes * 0.6)
    return [
      { name: 'Core Key Identity', minutes: core, instructions: [`Keys: ${input.keyCluster.join(', ')}`] },
      { name: 'Light Transposition', minutes: totalMinutes - core, instructions: ['Monthly tune deployment'] },
    ]
  }
  if (blockId === 'transcription-integration') {
    return [
      { name: 'Hero Link', minutes: Math.round(totalMinutes * 0.5), instructions: [] },
      { name: 'Three Key Pass', minutes: Math.round(totalMinutes * 0.25), instructions: [] },
      { name: 'Monthly Tune Deployment', minutes: Math.round(totalMinutes * 0.25), instructions: [] },
    ]
  }
  if (blockId === 'agility-fluency-lab') {
    return [
      { name: 'Hear & sing', minutes: 8, instructions: [] },
      { name: 'Call & motif', minutes: 10, instructions: [] },
      { name: 'Deploy & integrate', minutes: 7, instructions: [] },
    ]
  }
  return undefined
}

function formatCompletion(totalMinutes: number): string {
  const now = new Date()
  now.setMinutes(now.getMinutes() + totalMinutes)
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
