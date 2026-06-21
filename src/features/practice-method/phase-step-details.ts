import type { ActiveConcept, DeviceBacklogItem, GuidedStep } from '@/types/practice-method'
import { step } from '@/features/practice-method/step'
import type { getEarBlockDay } from '@/lib/practice-week'

const CONCEPT_REVIEW_SECONDS = 120

const TIER_HINT: Record<DeviceBacklogItem['tier'], string> = {
  current: 'Active focus — confirm retrieval',
  next: 'Queued next — keep it warm',
  future: 'Future device — light touch only',
}

export function conceptsForReview(
  backlog: DeviceBacklogItem[],
  activeConcept: ActiveConcept,
): DeviceBacklogItem[] {
  if (backlog.length === 0) {
    return [
      {
        id: activeConcept.id,
        label: activeConcept.label,
        description: activeConcept.description,
        harmonicContext: activeConcept.harmonicContext,
        keys: activeConcept.keys,
        tier: 'current',
        sourceRecording: activeConcept.sourceRecordings[0],
        ecosystem: activeConcept.ecosystem,
        createdAt: activeConcept.startedAt,
      },
    ]
  }
  return backlog
}

export function buildConceptReviewSteps(
  backlog: DeviceBacklogItem[],
  activeConcept: ActiveConcept,
  keyCluster: string[],
): GuidedStep[] {
  const items = conceptsForReview(backlog, activeConcept)
  return items.map((item) => {
    const keys = item.keys.length > 0 ? item.keys.join(', ') : keyCluster.join(', ')
    const isActive = item.id === activeConcept.id
    return step(
      `Library review: ${item.label}`,
      [
        `2-minute retrieval — ${TIER_HINT[item.tier]}.`,
        `Context: ${item.harmonicContext}.`,
        item.description,
        `In ${keys}, play 4–6 clean reps with solid time and tone. No ornaments.`,
        'Say the chord function aloud on rep 1.',
        isActive
          ? 'This is your active concept — confirm it still feels obvious.'
          : 'If rusty, use one key at 70% tempo.',
        item.sourceRecording ? `Optional: hear ${item.sourceRecording} before you play.` : '',
      ]
        .filter(Boolean)
        .join(' '),
      item.notes ? `Your notes: ${item.notes}` : undefined,
      CONCEPT_REVIEW_SECONDS,
    )
  })
}

export function conceptReviewMinutes(steps: GuidedStep[]): number {
  const seconds = steps.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0)
  return Math.ceil(seconds / 60)
}

export function buildDeepWorkSteps(opts: {
  concept: string
  keys: string
  tunes: string
}): GuidedStep[] {
  const { concept, keys, tunes } = opts

  return [
    step(
      `Loop each key: ${keys}`,
      `Set a 4-minute timer per key in your cluster (${keys}). Loop a short progression or vamp where "${concept}" belongs. Stay in time even when slow — if timing slips, drop 10% tempo before adding complexity. Rotate keys if you finish early.`,
      'One key, one loop, one sound. Depth before range.',
      480,
    ),
    step(
      'Bare executions',
      '1 minute: 6–8 clean reps in time. No ornaments, no fills. Prioritize articulation and even tone. If a rep fails, reset immediately — do not grind bad reps.',
      'Like a drummer playing the phrase on one drum.',
      120,
    ),
    step(
      'Rhythmic shift',
      'Same concept shape, three rhythmic costumes: (1) two long values, (2) two swing 8ths, (3) two forte accents on the same notes. Rhythm changes; pitch content stays identical.',
      'If one variant collapses, isolate it for 30 seconds before moving on.',
      180,
    ),
    step(
      'Multi-sensory rep',
      'Eyes closed: sing the top note of each voicing or line, then speak the chord function aloud on every rep. Re-open eyes only to check hand position.',
      'Hearing + speaking locks the concept beyond finger memory.',
      120,
    ),
    step(
      'Deploy on monthly tune',
      tunes
        ? `From: ${tunes}. Pick an 8–16 bar section. Play twice in the tune's written key. At each deployment point you mapped in Practice Library, land "${concept}" on purpose — pause is OK, but the concept must arrive on the right chord. If a point fails twice, slow-loop that bar only, then continue.`
        : `Set up monthly tunes in Practice Library first. Then play an 8–16 bar section twice, landing "${concept}" wherever harmony invites it.`,
      'Deployment points = exact bars/chords where the concept must appear on command (e.g. "bars 5–8, V7").',
    ),
    step(
      'Neighbor key pass',
      'Transpose the same section to one neighboring key (±1 semitone or whole step). Get through without stopping. Accept rough edges — continuity matters more than perfection today.',
      'If you stall more than twice in one bar, drop tempo 15% and finish the pass.',
    ),
    step(
      'Mini improvisation',
      `30 seconds: improvise freely, but "${concept}" must appear once naturally in 2 bars — not forced, not repeated mechanically. Then stop.`,
      'One honest appearance beats five forced ones.',
    ),
  ]
}

export function buildEarBlockSteps(
  mode: ReturnType<typeof getEarBlockDay>,
  sectionHint: string | null,
): GuidedStep[] {
  const content: Record<string, GuidedStep[]> = {
    'guide-tones': [
      step(
        'Ear focus · Random ii–V–I',
        'Play a random ii–V–I in any key. Use rootless voicings if you can. Keep tempo moderate — this is ear work, not a technique sprint.',
      ),
      step(
        'Ear focus · Sing guide tones first',
        'Before touching the keys, sing the 3rd and 7th of each chord through the progression. Then play what you sang.',
        'Guide tones define chord quality — if you can sing them, you can hear changes.',
      ),
      step(
        'Ear focus · Three keys blind',
        'Repeat in 3 keys without looking at your hands. Say "two-five-one in [key]" aloud before each pass.',
      ),
    ],
    'transcribe-bars': [
      step(
        'Ear focus · Pick 2 bars',
        sectionHint
          ? `Work from your marked sections: ${sectionHint}. Pick one phrase and loop it in Transcriptions.`
          : 'Choose 2 bars from your monthly transcription project — a line you want in your fingers.',
      ),
      step(
        'Ear focus · Listen, sing, find',
        'Listen once without piano. Sing the line. Then locate it on the keyboard. Match rhythm first, pitch second.',
      ),
      step(
        'Ear focus · Match recording',
        'Loop until pitch and rhythm match the source. Use slow playback if needed. Stop when 4 consecutive reps match.',
      ),
    ],
    'chord-quality': [
      step(
        'Ear focus · Random voicing',
        'Play a random rootless voicing — any inversion. Do not look at the keys until after you name the quality.',
      ),
      step(
        'Ear focus · Name quality by ear',
        'Identify maj7, min7, dom7, or alt before confirming visually. Say it aloud, then check.',
      ),
      step(
        'Ear focus · 10 reps',
        '10 reps across different roots. Increase speed slightly only when naming is instant.',
      ),
    ],
    rhythm: [
      step(
        'Ear focus · Clap the rhythm',
        'Pick 2–4 bars from a hero recording with clear syncopation. Clap the rhythm exactly — no piano yet. Loop until the feel is automatic.',
        'Rhythm must live in your body before it lives in voicings.',
      ),
      step(
        'Ear focus · One note on piano',
        'Transfer the same rhythm to piano using one note only. Same phrase, same placement in time. If timing slips, clap again first.',
      ),
      step(
        'Ear focus · Add voicing',
        'Keep the exact rhythm. Add a full chord voicing on the changes. The rhythm is primary — do not let harmony rush the phrase.',
      ),
    ],
    off: [],
  }

  return content[mode] ?? []
}

export function buildLangCaptureSteps(sectionHint: string | null): GuidedStep[] {
  return [
    step(
      "Add today's recording",
      'Paste a recording link and mark the passage you want to learn. Any artist, any tune — vocabulary acquisition, not concept matching. Pick something you would steal from on a gig.',
      'This builds your jazz language library over time.',
      240,
    ),
    step(
      'Listen 3× without piano',
      'Hear shape, articulation, and time feel. Hum the line once. Notice where the player breathes and where they insist rhythmically.',
      undefined,
      180,
    ),
    step(
      'Mark the section',
      sectionHint
        ? `Your sections: ${sectionHint}. Confirm start/end times in the player so the loop is tight.`
        : 'Set start/end times so the player loops your target phrase — usually 2–8 bars.',
      undefined,
      180,
    ),
  ]
}

export function buildLangInternalizeSteps(transcription: string, tunes: string): GuidedStep[] {
  return [
    step(
      'Sing then find',
      'Sing the line from memory, then locate it on piano. Match rhythm before pitch. If you cannot sing it, you are not ready to speed up.',
    ),
    step(
      'Slow loop',
      `Loop the section from ${transcription} slowly until your hands match the recording. Use the transcription player — aim for 4 clean consecutive reps.`,
    ),
    step(
      'Three keys',
      'Play the line in 3 keys from your cluster. Say chord function aloud on each key change.',
    ),
    step(
      'Optional deploy',
      tunes
        ? `If natural, drop one fragment (2–4 notes) into a monthly tune: ${tunes}. One gesture only — do not force the whole line.`
        : 'If natural, drop one small fragment into a tune you are working on. One gesture only.',
    ),
  ]
}

export function buildRepertoireCircuitSteps(
  tunes: string,
  dayType: 'identity' | 'expansion' | 'review',
): GuidedStep[] {
  return [
    step(
      'Target tempo chorus',
      tunes
        ? `One chorus per tune (${tunes}) at target tempo. Land your active concept at deployment points — same rules as Deep Work.`
        : 'One chorus per monthly tune at target tempo. Land your active concept at deployment points.',
    ),
    step(
      dayType === 'expansion' ? 'Distant key pass' : 'Neighbor key pass',
      dayType === 'expansion'
        ? 'Transpose one tune to a distant key (e.g. a 4th or 5th away). Get through without stopping — continuity over polish.'
        : 'Neighbor key only (±1 whole step). Depth over range today.',
    ),
    step(
      'Slow then fast',
      'Pass 1: ~10% slower than target — prioritize sound and voicing. Pass 2: ~10% faster — test automaticity without collapsing time.',
    ),
    step(
      'Hero feel pass',
      'One tune: exaggerate time, dynamics, and phrasing from a hero pianist you are studying. Sound like them for 8 bars, then return to your voice.',
    ),
    step(
      'Minimal pause rotation',
      'Tune 1 → 2 → 3 with minimal pause between. Simulate set conditions — no long resets between tunes.',
    ),
  ]
}

export function buildColdPressureSteps(
  dualPhase: 1 | 2 | 3,
): GuidedStep[] {
  const dualSteps: GuidedStep[] =
    dualPhase === 1
      ? [
          step(
            'Count aloud',
            'One monthly tune: count "1-2-3-4" aloud for 1–2 choruses. Your active concept must hold — note any bar where it drops.',
          ),
        ]
      : dualPhase === 2
        ? [
            step(
              'Count + foot tap',
              'Count aloud AND tap offbeats with your foot. Concept must survive both tasks. Mark where it breaks.',
            ),
          ]
        : [
            step(
              'Name deployment points',
              'Say each deployment point aloud as you reach it while playing. No stops, no corrections mid-chorus.',
            ),
          ]

  return [
    step(
      'Cold tune',
      'Pick a tune NOT in your monthly set. Feel the form for 8 bars, then force your active concept 3× in one chorus. Unfamiliar harmony is the point.',
    ),
    ...dualSteps,
    step(
      'Trust run',
      'One full pass: NO corrections, NO self-tracking while playing. Record if possible. Play as if someone is listening.',
    ),
    step(
      'Session snapshot',
      'Two lines in Session Notes: (1) concept stage today, (2) tomorrow focus. Be specific — "work bars 9–12 in F" beats "practice more."',
    ),
  ]
}

export function buildRecordingReviewSteps(): GuidedStep[] {
  return [
    step(
      'Collect clips',
      'Gather recordings from this week — monthly tunes, trust runs, vocabulary lab clips, anything you saved.',
    ),
    step(
      'Gig question',
      'Listen 15–20 min with producer ears: "Would I keep this on a gig or in church?" Note yes/no per clip.',
    ),
    step(
      'Hero question',
      '"Would my heroes leave this in or cringe?" Mark moments that sound like you vs. like an exercise.',
    ),
    step(
      'Mark timecodes',
      'Note where your concept sounds forced, out of time, or out of character. One timestamp is enough to guide tomorrow.',
    ),
    step(
      'Update backlog',
        'Update concept library notes in Practice Library + next week key focus based on what you heard.',
    ),
  ]
}
