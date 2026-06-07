import type { ActiveConcept, DayType, GuidedPhase, MonthlyTune } from '@/types/practice-method'
import { PRACTICE_BLOCKS } from '@/types/practice-method'
import { formatTimestamp } from '@/lib/time-parse'
import type { TranscriptionSegment } from '@/types/transcription'
import { agilitySteps, step, stepsFromStrings } from '@/features/practice-method/step'
import {
  formatMonthContext,
  getDeloadVolumeMultiplier,
  getEarBlockDay,
  isDeloadWeek,
  isSlowFirstWeek,
  maxTempoPercentForConcept,
  shouldShowSightReading,
} from '@/lib/practice-week'

interface TranscriptionProjectContext {
  id: string
  artist: string
  title: string
  segments: TranscriptionSegment[]
}

interface PhaseContext {
  dayType: DayType
  activeConcept: ActiveConcept
  monthlyTunes: MonthlyTune[]
  transcriptionProject?: string
  transcriptionProjectData?: TranscriptionProjectContext
  transcriptionSegments?: { label: string; startSeconds: number; endSeconds: number; barRange?: string }[]
  date?: Date
}

function segmentHint(segments: TranscriptionSegment[], limit = 3): string | null {
  if (segments.length === 0) return null
  return segments
    .slice(0, limit)
    .map((s) => `${s.label} (${formatTimestamp(s.startSeconds)}–${formatTimestamp(s.endSeconds)}${s.barRange ? `, ${s.barRange}` : ''})`)
    .join('; ')
}

function pickSegment(
  segments: TranscriptionSegment[],
  prefer: (s: TranscriptionSegment) => boolean,
  fallbackIndex = 0,
): TranscriptionSegment | undefined {
  return segments.find(prefer) ?? segments[fallbackIndex]
}

function transcriptionStageForPhase(
  projectId: string,
  _segments: TranscriptionSegment[],
  segmentId?: string,
  segmentIds?: string[],
): GuidedPhase['transcriptionStage'] {
  return { projectId, segmentId, segmentIds: segmentIds ?? (segmentId ? [segmentId] : undefined) }
}

function scaleMinutes(minutes: number, multiplier: number): number {
  return Math.max(1, Math.round(minutes * multiplier))
}

function recoveryPhase(afterBlockId: string, title: string, activity: string): GuidedPhase {
  return {
    id: `recovery-after-${afterBlockId}`,
    blockId: 'concept-forge',
    blockName: 'Recovery',
    title,
    durationMinutes: 1,
    objective: 'Reset body and ears before the next block',
    steps: [
      step(activity, 'Stand away from the piano. Let ears and hands reset before the next block.'),
      step('Shake hands loose', 'Gently shake both hands and roll wrists. No stretching through pain.'),
      step('Three slow breaths', 'Inhale 4 counts, exhale 6. Roll shoulders back and down.'),
    ],
    isRecovery: true,
  }
}

function tensionCheckPhase(id: string): GuidedPhase {
  return {
    id,
    blockId: 'concept-forge',
    blockName: 'Recovery',
    title: 'Body Reset',
    durationMinutes: 2,
    objective: 'Prevent strain buildup (every ~25 min of playing)',
    steps: [
      step('Stop and shake out', 'Stop playing. Shake hands and forearms loose for 20 seconds.'),
      step('Shoulders and breath', 'Roll shoulders back. Three slow breaths with jaw unclenched.'),
      step('Tension scan', 'Scan neck, wrists, and grip. Release before continuing.'),
    ],
    isRecovery: true,
    scientificNote: 'Brief tension breaks reduce injury risk and improve retention.',
  }
}

function earBlockPhase(
  mode: ReturnType<typeof getEarBlockDay>,
  sectionHint: string | null,
  transcriptionProject?: TranscriptionProjectContext,
): GuidedPhase {
  const content: Record<string, GuidedPhase['steps']> = {
    'guide-tones': [
      step('Random ii-V-I', 'Play a random ii-V-I in any key at the piano.'),
      step('Sing guide tones first', 'Before playing, sing the 3rd and 7th of each chord.'),
      step('Three keys blind', 'Repeat in 3 keys without looking at your hands.'),
    ],
    'transcribe-bars': [
      step('Pick 2 bars', sectionHint
        ? `Work from your marked sections: ${sectionHint}. Pick one and loop it in Transcriptions.`
        : 'Choose 2 bars from your monthly transcription project.'),
      step('Listen, sing, find', 'Listen once, sing the line, then locate it on piano.'),
      step('Match recording', 'Repeat until pitch and rhythm match the source.'),
    ],
    'chord-quality': [
      step('Random voicing', 'Play a random rootless voicing.'),
      step('Name quality by ear', 'Identify maj7, min7, dom7, or alt before looking.'),
      step('10 reps', '10 reps across different roots, increasing speed slightly.'),
    ],
    rhythm: [
      step('Clap the rhythm', 'Clap a syncopated rhythm from a hero recording.'),
      step('One note on piano', 'Transfer to piano with a single note first.'),
      step('Add voicing', 'Add a full voicing while keeping the rhythm exact.'),
    ],
    off: [],
  }

  const transcribeSegment =
    mode === 'transcribe-bars' && transcriptionProject
      ? pickSegment(transcriptionProject.segments, (s) => s.status === 'listening' || s.status === 'partial')
      : undefined

  return {
    id: 'ear-block',
    blockId: 'concept-forge',
    blockName: 'Ear Training',
    title: `Ear Focus: ${mode.replace('-', ' ')}`,
    durationMinutes: 8,
    objective: 'Dedicated ear training before heavy motor work',
    steps: content[mode] ?? [],
    scientificNote: 'Auditory imagery strengthens pitch memory and supports transcription work.',
    transcriptionStage:
      transcribeSegment && transcriptionProject
        ? transcriptionStageForPhase(transcriptionProject.id, transcriptionProject.segments, transcribeSegment.id)
        : undefined,
  }
}

function sightReadingPhase(): GuidedPhase {
  return {
    id: 'sight-reading',
    blockId: 'standards-hymns-lab',
    blockName: 'Sight Reading',
    title: 'Fresh Eyes Reading',
    durationMinutes: 10,
    objective: 'Novel notation exposure. No repeats.',
    steps: [
      step('New material only', 'Open a book or lead sheet NOT worked on this week.'),
      step('One pass at 70%', 'Play through once at 70% tempo. No stops, no fixes.'),
      step('One observation', 'Note one voicing or rhythm that surprised you, then move on.'),
    ],
    scientificNote: 'Reading fluency grows from novel notation, separate from repertoire memory.',
  }
}

function injectTensionChecks(phases: GuidedPhase[]): GuidedPhase[] {
  const result: GuidedPhase[] = []
  let workMinutes = 0
  let tensionIndex = 0

  for (const phase of phases) {
    result.push(phase)
    if (phase.isRecovery) continue
    workMinutes += phase.durationMinutes
    if (workMinutes >= 25) {
      tensionIndex++
      result.push(tensionCheckPhase(`tension-${tensionIndex}`))
      workMinutes = 0
    }
  }
  return result
}

function applyDeloadScaling(phases: GuidedPhase[], multiplier: number): GuidedPhase[] {
  return phases.map((p) =>
    p.isRecovery ? p : { ...p, durationMinutes: scaleMinutes(p.durationMinutes, multiplier) },
  )
}

export function generateGuidedPhases(ctx: PhaseContext): GuidedPhase[] {
  const date = ctx.date ?? new Date()
  const { dayType, activeConcept, monthlyTunes, transcriptionProject, transcriptionProjectData, transcriptionSegments } = ctx
  const keys = activeConcept.keyFocusCluster.join(', ')
  const concept = activeConcept.label
  const tunes = monthlyTunes.map((t) => t.title).join(', ')
  const transcription = transcriptionProject ?? 'your transcription project'
  const projectSegments = transcriptionProjectData?.segments ?? []
  const sectionHint =
    projectSegments.length > 0
      ? segmentHint(projectSegments)
      : transcriptionSegments && transcriptionSegments.length > 0
        ? transcriptionSegments
            .slice(0, 3)
            .map((s) => `${s.label} (${formatTimestamp(s.startSeconds)}–${formatTimestamp(s.endSeconds)}${s.barRange ? `, ${s.barRange}` : ''})`)
            .join('; ')
        : null
  const projectId = transcriptionProjectData?.id
  const dualPhase = activeConcept.dualTaskPhase
  const isReview = dayType === 'review'
  const deload = isDeloadWeek(date)
  const volumeMultiplier = getDeloadVolumeMultiplier(date)
  const slowFirst = isSlowFirstWeek(activeConcept.startedAt)
  const tempoCap = Math.round(maxTempoPercentForConcept(activeConcept.startedAt) * 100)

  const blockIds = PRACTICE_BLOCKS.filter((b) => {
    if (isReview && b.id === 'consolidation') return false
    if (!isReview && b.id === 'recording-review') return false
    return true
  }).map((b) => b.id)

  const phases: GuidedPhase[] = []

  if (deload) {
    phases.push({
      id: 'deload-brief',
      blockId: 'concept-forge',
      blockName: 'Deload Week',
      title: 'Deload Briefing',
      durationMinutes: 2,
      objective: `${formatMonthContext(date)}: reduce volume, maintain touch`,
      steps: stepsFromStrings([
        'Week 4: cut volume ~40%, no new devices',
        'Focus on sound quality and relaxed technique',
        'Skip failure overload unless something is actively breaking',
      ]),
      scientificNote: 'Planned deload weeks prevent overtraining and consolidate gains.',
      isRecovery: true,
    })
  }

  if (blockIds.includes('concept-forge')) {
    phases.push(
      {
        id: 'forge-identity',
        blockId: 'concept-forge',
        blockName: 'Concept Forge',
        title: 'Key Identity Drill',
        durationMinutes: 12,
        objective: `Build reflex for "${concept}" in ${keys}`,
        engagementPrompt: 'Rate your clarity 1–5 before moving on.',
        promptClarityRating: true,
        steps: [
          step(
            `Loop each key: ${keys}`,
            '4-minute loop per key. Rotate keys if you finish early. Stay in time even when slow.',
          ),
          step(
            'Bare executions',
            '1 minute: 6–8 clean reps in time. No ornaments. Sound and articulation only.',
            'Like a drummer playing the phrase on one drum.',
          ),
          step(
            'Rhythmic shift',
            '1.5 min: 2 long values → 2 swing 8ths → 2 forte accents on the same shape.',
          ),
          step(
            'Multi-sensory rep',
            '1 min eyes closed: sing top note, speak chord function aloud on each rep.',
          ),
          step(
            'Mini improvisation',
            '30 sec: 2 bars where the concept appears once naturally.',
          ),
        ],
        tips: [
          'Sound and time before speed',
          'If it collapses, slow down 10%',
          ...(slowFirst ? [`Slow-first week: cap tempo at ${tempoCap}% until day 14`] : []),
        ],
        checkpoint: 'Did the concept feel obvious in at least one key?',
      },
      {
        id: 'forge-transpose',
        blockId: 'concept-forge',
        blockName: 'Concept Forge',
        title: 'Tune Transposition Push',
        durationMinutes: 8,
        objective: 'Deploy concept in monthly tune sections',
        steps: [
          step('Pick a tune section', `Choose a section from: ${tunes}. Mark deployment points mentally.`),
          step('Original key ×2', 'Play twice in original key. Concept at every deployment point.'),
          step('Neighbor key once', 'Transpose to neighboring key. Get through without stopping.'),
          step('Cycle until timer', 'Repeat the cycle. Depth over speed.'),
        ],
      },
    )
    phases.push(recoveryPhase('concept-forge', 'Reset: After Concept Forge', 'Stand, shake hands, 3 deep breaths'))
  }

  const earMode = getEarBlockDay(date)
  if (earMode !== 'off' && blockIds.includes('concept-forge')) {
    phases.push(earBlockPhase(earMode, sectionHint, transcriptionProjectData))
  }

  if (blockIds.includes('transcription-integration')) {
    const linkSegments = projectSegments.filter(
      (s) => s.linkedConceptId === activeConcept.id || !s.linkedConceptId,
    )
    const connectSegment = pickSegment(
      linkSegments.length > 0 ? linkSegments : projectSegments,
      (s) => s.linkedConceptId === activeConcept.id,
    )
    const borrowSegment = pickSegment(projectSegments, (s) => s.status === 'partial' || s.status === 'clean')
    const keysSegment = pickSegment(projectSegments, (s) => s.status === 'clean')
    const connectIds = (linkSegments.length > 0 ? linkSegments : projectSegments).slice(0, 3).map((s) => s.id)

    phases.push(
      {
        id: 'hero-connect',
        blockId: 'transcription-integration',
        blockName: 'Transcription Integration',
        title: 'Link Concept to Hero',
        durationMinutes: 8,
        objective: `Connect "${concept}" to ${transcription}`,
        engagementPrompt: 'Where does your hero use the same harmonic language as your concept?',
        transcriptionStage:
          projectId && connectSegment
            ? transcriptionStageForPhase(projectId, projectSegments, connectSegment.id, connectIds)
            : projectId
              ? transcriptionStageForPhase(projectId, projectSegments, undefined, connectIds)
              : undefined,
        steps: [
          step(
            "Add today's hero recording",
            'Use the form below: paste the recording link, artist/title, and mark the moment that connects to your active concept.',
            'Each practice day starts with a fresh hero line — it saves automatically to Transcriptions.',
          ),
          step(
            'Find shared language',
            `In today's recording, find 2–3 moments where the hero uses your concept OR its parent device (same harmonic family).`,
            'Not a new backlog item — connect what you are already working on.',
          ),
          step(
            'Mark the moments',
            sectionHint
              ? `Your sections: ${sectionHint}. Mark bar numbers and chord context for each.`
              : 'Write bar numbers and chord context. Hum each line once before playing.',
          ),
          step(
            'Play hero shape in your keys',
            'Play those hero moments in your key focus cluster. Compare feel to your concept reps from Concept Forge.',
          ),
        ],
        checkpoint: 'Can you explain how hero line and your concept relate in one sentence?',
      },
      {
        id: 'hero-borrow',
        blockId: 'transcription-integration',
        blockName: 'Transcription Integration',
        title: 'Borrow One Gesture',
        durationMinutes: 7,
        objective: 'Steal ONE complementary idea from the hero (not a second concept)',
        transcriptionStage:
          projectId && borrowSegment
            ? transcriptionStageForPhase(projectId, projectSegments, borrowSegment.id)
            : undefined,
        steps: [
          step(
            'Pick one gesture',
            'Choose ONE rhythmic accent, voicing color, or articulation from the hero line — not a new device.',
          ),
          step(
            'Pair with your concept',
            'Play your active concept, then immediately echo the borrowed gesture. Alternate 4 times.',
          ),
          step(
            'Combined phrase',
            'Create a 2-bar phrase: concept deployment → borrowed gesture. Slow, musical, repeatable.',
          ),
        ],
        tips: ['This feeds directly into Standards Lab and Cold Pressure today'],
      },
      {
        id: 'hero-keys',
        blockId: 'transcription-integration',
        blockName: 'Transcription Integration',
        title: 'Three-Key Integration',
        durationMinutes: 5,
        objective: 'Concept + borrowed gesture through 3 keys',
        transcriptionStage:
          projectId && keysSegment
            ? transcriptionStageForPhase(projectId, projectSegments, keysSegment.id)
            : undefined,
        steps: [
          step('Original key', '3–4 slow reps from transcription key. Say chord function aloud.'),
          step('Neighbor key', 'Move to neighboring key. Same phrase, no stops.'),
          step('Gig key', 'One pass in Bb, Eb, F, or G. 2 bars of free music using concept once.'),
        ],
      },
      {
        id: 'hero-deploy',
        blockId: 'transcription-integration',
        blockName: 'Transcription Integration',
        title: 'Live Tune Deployment',
        durationMinutes: 5,
        objective: 'Real-time deployment in 2 monthly tunes',
        transcriptionStage:
          projectId && projectSegments.length > 0
            ? transcriptionStageForPhase(
                projectId,
                projectSegments,
                keysSegment?.id ?? projectSegments[0]?.id,
                projectSegments.map((s) => s.id),
              )
            : undefined,
        steps: [
          step('Pick 2 tunes', `From your monthly lab: ${tunes}. One section each.`),
          step('Insert at deployment points', 'Concept at 2–3 mapped points per tune. Decisions over perfection.'),
          step('Optional: add gesture', 'If natural, add the borrowed hero gesture once per tune.'),
        ],
      },
    )
  }

  if (blockIds.includes('standards-hymns-lab')) {
    phases.push(
      {
        id: 'tunes-interleave',
        blockId: 'standards-hymns-lab',
        blockName: 'Standards / Hymns Lab',
        title: 'Interleaved Tune Circuit',
        durationMinutes: 22,
        objective: `All 3 tunes: ${tunes}`,
        steps: [
          step('Target tempo chorus', 'One chorus per tune at target tempo. Concept every deployment point.'),
          step(
            dayType === 'expansion' ? 'Distant key pass' : 'Neighbor key pass',
            dayType === 'expansion'
              ? 'Transpose to a distant key. Get through without stopping.'
              : 'Neighbor key only. Depth over range.',
          ),
          step('Slow pass', '~10% slower. Focus sound and voice-leading.'),
          step('Fast pass', '~10% faster. Test automaticity under slight pressure.'),
          step('Minimal pause rotation', 'Tune 1 → 2 → 3 with minimal pause between.'),
        ],
        tips: ['Mentally note any bar that fails 3×. You may need Repair Drill next.'],
      },
      {
        id: 'tunes-repair',
        blockId: 'standards-hymns-lab',
        blockName: 'Standards / Hymns Lab',
        title: 'Repair Drill',
        durationMinutes: deload ? 3 : 6,
        objective: 'Isolate and repair collapsed spots',
        steps: deload
          ? [
              step('Deload mode', 'Skip unless a bar failed 3× today.'),
              step('Otherwise', 'Slow pass on weakest tune only.'),
            ]
          : [
              step('Stop if needed', 'If any bar failed 3× in earlier blocks, STOP the interleaved cycle.'),
              step('Isolate 4 bars', 'Work a 4-bar window around the failure.'),
              step('Concept Forge loop', 'Run Key Identity Drill pattern on that window for 5–8 minutes.'),
              step('Reinsert once', 'Play the full tune once before leaving.'),
              step('No failures?', 'Use this time for slow pass on weakest tune.'),
            ],
      },
      {
        id: 'tunes-hero-feel',
        blockId: 'standards-hymns-lab',
        blockName: 'Standards / Hymns Lab',
        title: 'Hero Feel Pass',
        durationMinutes: 5,
        objective: 'Shape taste and phrasing, not correctness',
        steps: [
          step('Pick tune + hero', 'One monthly tune + one hero pianist from your monthly setup.'),
          step('Exaggerate their feel', 'Time, dynamics, phrasing, voicing — push it further than feels comfortable.'),
          step('Concept when natural', 'Let your concept appear only where the hero might use it.'),
          step('No analysis', 'Imitation and feel only while playing.'),
        ],
      },
    )
    phases.push(recoveryPhase('standards-hymns-lab', 'Reset: After Standards Lab', 'Hydrate, shoulder rolls, reset ears'))
  }

  if (blockIds.includes('cold-pressure')) {
    phases.push(
      {
        id: 'cold-material',
        blockId: 'cold-pressure',
        blockName: 'Cold / Pressure Block',
        title: 'Cold Start Material',
        durationMinutes: 8,
        objective: 'Transfer concept to unfamiliar tune',
        steps: [
          step('New tune only', 'Pick a tune NOT in your monthly set and not touched this week.'),
          step('Pass 1: feel form', 'Play through once, no stopping. Just feel the form.'),
          step('Pass 2: force concept', 'Replay. Force concept at least 3 times wherever musical.'),
          step('Quick reflection', '2 min: did vocabulary appear or did you interrupt the line?'),
        ],
      },
      {
        id: 'dual-task',
        blockId: 'cold-pressure',
        blockName: 'Cold / Pressure Block',
        title: 'Dual-Task Pressure Test',
        durationMinutes: 7,
        objective: `Dual-task Phase ${dualPhase}`,
        showAutomaticityChecklist: true,
        steps:
          dualPhase === 1
            ? [
                step('Count aloud', 'Pick one monthly tune. Count "1-2-3-4" aloud while playing 1–2 choruses.'),
                step('Concept must hold', 'If concept disappears, you are still in associative stage.'),
              ]
            : dualPhase === 2
              ? [
                  step('Count + foot tap', 'Count aloud AND tap offbeats with foot during 1–2 choruses.'),
                  step('Note failures', 'If concept drops, note which deployment point failed.'),
                ]
              : [
                  step('Name deployment points', 'Say each deployment point aloud as you reach it.'),
                  step('No stops', '1–2 choruses without stopping. Tests true automaticity.'),
                ],
      },
      {
        id: 'trust-run',
        blockId: 'cold-pressure',
        blockName: 'Cold / Pressure Block',
        title: 'Trust Run',
        durationMinutes: 5,
        objective: 'Play without monitoring. Let vocabulary emerge.',
        engagementPrompt: 'Hit record. This clip feeds your weekly review.',
        steps: [
          step('One rule', 'NO corrections, NO concept tracking, NO evaluating while playing.'),
          step('Record if possible', 'Use the Recording tab in the tools panel.'),
          step('One full pass', 'Any tune — monthly lab preferred.'),
        ],
      },
      {
        id: 'daily-log',
        blockId: 'cold-pressure',
        blockName: 'Cold / Pressure Block',
        title: 'Session Snapshot',
        durationMinutes: 2,
        objective: 'Two lines only, then move on',
        steps: [
          step('Line 1: stage', 'Concept stage today: cognitive / associative / automatic'),
          step('Line 2: tomorrow', 'Tomorrow focus: one specific key, tune, or block'),
          step('Session Notes', 'Write both lines in the tools panel Session Notes.'),
        ],
        checkpoint: 'Did you write both log lines?',
      },
    )
  }

  if (blockIds.includes('agility-fluency-lab')) {
    const daily = agilitySteps(activeConcept.keyFocusCluster, date)
    phases.push({
      id: 'agility-daily',
      blockId: 'agility-fluency-lab',
      blockName: 'Agility & Fluency Lab',
      title: `Portable Technique: ${daily[1]?.summary.split(':')[0]?.replace('Fluency — ', '') ?? 'Daily Circuit'}`,
      durationMinutes: 20,
      objective: 'Same 20-min routine every day on any piano',
      steps: daily,
      tips: [
        'Pattern rotates by weekday',
        '+2 BPM only after 3 clean passes at current tempo',
      ],
      checkpoint: 'Did you log peak clean BPM in Session Notes?',
    })
  }

  if (shouldShowSightReading(date) && !isReview) {
    phases.push(sightReadingPhase())
  }

  if (blockIds.includes('consolidation')) {
    phases.push(
      {
        id: 'mental-practice',
        blockId: 'consolidation',
        blockName: 'Consolidation & Listening',
        title: 'Mental Rehearsal',
        durationMinutes: 5,
        objective: 'Away from the instrument, eyes closed',
        steps: [
          step('3 keys in your head', `Execute "${concept}" in 3 keys with sound + fingering imagery.`),
          step('Tune imagery', 'Imagine 4 bars of one monthly tune. Insert concept once.'),
          step('Voice zoom', 'Repeat, focusing on top, inner, then bass voice.'),
        ],
        tips: ['Optional: repeat this 5 min before bed tonight'],
      },
      {
        id: 'active-listening',
        blockId: 'consolidation',
        blockName: 'Consolidation & Listening',
        title: 'Active Listening Hunt',
        durationMinutes: 5,
        objective: 'Hunt your concept in master recordings',
        steps: [
          step('Short excerpts', 'Play excerpts from your source recordings.'),
          step('Hum when you hear it', 'When device or parent ecosystem appears, hum the line.'),
          step('Name the function', 'In your head: "IV over V", "enclosure into 3rd", etc.'),
        ],
      },
    )
  }

  if (blockIds.includes('recording-review')) {
    phases.push({
      id: 'sound-review',
      blockId: 'recording-review',
      blockName: 'Recording Review',
      title: 'Gig-Ready Review',
      durationMinutes: 20,
      objective: 'Producer ears: would you keep this on a gig?',
      steps: [
        step('Collect clips', 'Gather recordings from this week (tunes, trust runs, saved session clips).'),
        step('Gig question', 'Listen 15–20 min: "Would I keep this on a gig or in church?"'),
        step('Hero question', '"Would my heroes leave this in or cringe?"'),
        step('Mark timecodes', 'Note where concept sounds forced or out of character.'),
        step('Update backlog', 'Update Device Backlog notes + next week key focus.'),
      ],
      checkpoint: 'Did you mark at least one timecode or confirm concept sounds gig-ready?',
    })
  }

  let result = deload ? applyDeloadScaling(phases, volumeMultiplier) : phases
  result = injectTensionChecks(result)

  if (result.length > 0) {
    const last = result[result.length - 1]!
    result[result.length - 1] = {
      ...last,
      tips: [...(last.tips ?? []), 'Optional: 5 min mental replay before bed tonight'],
    }
  }

  return result
}

export function getUniqueBlocks(phases: GuidedPhase[]): { blockId: string; blockName: string; phaseCount: number }[] {
  const seen = new Map<string, { blockName: string; phaseCount: number }>()
  for (const p of phases) {
    if (p.isRecovery) continue
    const existing = seen.get(p.blockId)
    if (existing) existing.phaseCount++
    else seen.set(p.blockId, { blockName: p.blockName, phaseCount: 1 })
  }
  return Array.from(seen.entries()).map(([blockId, v]) => ({ blockId, ...v }))
}
