import { generatePracticeSession, type GeneratedSession } from '@/features/practice-method/session-generator'
import type { DayType } from '@/types/practice-method'

export interface AICoachInput {
  availableMinutes: number
  repertoire: string[]
  technicalExercises: string[]
  transcriptionProject: string
  goals: string[]
  weaknesses: string[]
  activeConceptLabel: string
  keyCluster: string[]
  dualTaskPhase: number
  monthlyTunes: string[]
  dayType: DayType
}

export interface AICoachOutput {
  session: GeneratedSession
  aiInsights: string[]
  difficultyProgression: string
  recoveryPlan: string
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export async function generateAIPracticePlan(input: AICoachInput): Promise<AICoachOutput> {
  const session = generatePracticeSession({
    availableMinutes: input.availableMinutes,
    dayType: input.dayType,
    activeConceptLabel: input.activeConceptLabel,
    keyCluster: input.keyCluster,
    dualTaskPhase: input.dualTaskPhase,
    monthlyTunes: input.monthlyTunes,
    isReviewDay: input.dayType === 'review',
  })

  if (!OPENAI_API_KEY) {
    return buildLocalFallback(input, session)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an elite piano performance coach implementing Practice Method v2.0.0.
Generate concise coaching insights for an advanced pianist practicing ${input.availableMinutes} minutes.
Focus on: retrieval-sized concepts, interleaving, dual-task progression, injury prevention, and musicality.
Respond in JSON: { "insights": string[], "difficultyProgression": string, "recoveryPlan": string }`,
          },
          {
            role: 'user',
            content: JSON.stringify(input),
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    })

    if (!response.ok) throw new Error('OpenAI API error')

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)

    return {
      session,
      aiInsights: parsed.insights ?? [],
      difficultyProgression: parsed.difficultyProgression ?? '',
      recoveryPlan: parsed.recoveryPlan ?? '',
    }
  } catch {
    return buildLocalFallback(input, session)
  }
}

function buildLocalFallback(input: AICoachInput, session: GeneratedSession): AICoachOutput {
  return {
    session,
    aiInsights: [
      `Prioritize "${input.activeConceptLabel}" in Blocks 1 and 3 — identity keys first.`,
      `Weakness focus: ${input.weaknesses[0] ?? 'evenness under tempo'}. Add 5 min to Fluency Engine before Block 4.`,
      `Transcription bridge: extract one device from "${input.transcriptionProject}" during Block 2.`,
      input.dayType === 'review'
        ? 'Sunday: Block 5 is mandatory 20-min recording review. No skipping.'
        : 'Block 4c trust run: no corrections. Let vocabulary emerge.',
    ],
    difficultyProgression:
      'Week 1-2: identity keys + dual-task Phase 1. Week 3-4: expand keys, Phase 2. Promote concept only after 3 consecutive pass days.',
    recoveryPlan:
      '1-min break after Concept Forge. 2-min after Standards Lab — hydrate, shoulder rolls. Stop if tension exceeds 6/10.',
  }
}

export async function generateRecordingFeedback(transcript: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    return 'Local mode: Review for forced concept deployments, student-y voicings, and tempo instability. Mark timecodes for weekly review.'
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a jazz/gospel piano producer. Give harsh but constructive feedback on practice recordings. Focus on musicality, not theory.',
          },
          { role: 'user', content: transcript },
        ],
        max_tokens: 500,
      }),
    })

    const data = await response.json()
    return data.choices[0].message.content
  } catch {
    return 'Unable to generate AI feedback. Use weekly sound-target review criteria manually.'
  }
}
