import type { ActiveConcept, DayType, DeviceBacklogItem, GuidedPhase, MonthlyTune } from '@/types/practice-method'
import { PRACTICE_BLOCKS, SESSION_ZONES } from '@/types/practice-method'
import { formatTimestamp } from '@/lib/time-parse'
import type { TranscriptionSegment } from '@/types/transcription'
import { vocabularyLabSteps, step, stepsFromStrings } from '@/features/practice-method/step'
import {
  buildColdPressureSteps,
  buildConceptReviewSteps,
  buildDeepWorkSteps,
  buildEarBlockSteps,
  buildLangCaptureSteps,
  buildLangInternalizeSteps,
  buildRecordingReviewSteps,
  buildRepertoireCircuitSteps,
  conceptReviewMinutes,
} from '@/features/practice-method/phase-step-details'
import { useVocabularyStore } from '@/stores/vocabulary-store'
import {
  formatMonthContext,
  getDeloadVolumeMultiplier,
  getEarBlockDay,
  isDeloadWeek,
  isSlowFirstWeek,
  maxTempoPercentForConcept,
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
  deviceBacklog?: DeviceBacklogItem[]
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

function injectTensionChecks(phases: GuidedPhase[]): GuidedPhase[] {
  const result: GuidedPhase[] = []
  let workMinutes = 0
  let added = false

  for (const phase of phases) {
    result.push(phase)
    if (phase.isRecovery) continue
    workMinutes += phase.durationMinutes
    if (!added && workMinutes >= 55) {
      result.push(tensionCheckPhase('tension-mid'))
      added = true
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
  const { dayType, activeConcept, monthlyTunes, deviceBacklog = [], transcriptionProject, transcriptionProjectData, transcriptionSegments } = ctx
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
  const earMode = getEarBlockDay(date)

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
    const reviewSteps = buildConceptReviewSteps(
      deviceBacklog,
      activeConcept,
      activeConcept.keyFocusCluster,
    )
    const reviewMinutes = conceptReviewMinutes(reviewSteps)

    phases.push({
      id: 'concept-library-review',
      sessionZone: 'deep-work',
      blockId: 'concept-forge',
      blockName: 'Deep Work',
      title: 'Concept Library Review',
      durationMinutes: Math.max(2, reviewMinutes),
      objective: `Retrieval pass — ${reviewSteps.length} concept(s) in Practice Library, 2 minutes each`,
      engagementPrompt: 'Touch every device in your backlog. Sound and time, not perfection.',
      steps: reviewSteps,
      tips: [
        'Current tier: confirm the active device still feels obvious',
        'Next/future tier: one key at 70% tempo if rusty',
      ],
      checkpoint: 'Did each concept still feel retrievable?',
    })

    const deepWorkSteps = buildDeepWorkSteps({ concept, keys, tunes })

    if (earMode !== 'off') {
      deepWorkSteps.push(...buildEarBlockSteps(earMode, sectionHint))
    }

    const baseDeepWorkMinutes = earMode !== 'off' ? 32 : 28

    phases.push({
      id: 'deep-work',
      sessionZone: 'deep-work',
      blockId: 'concept-forge',
      blockName: 'Deep Work',
      title: 'Concept & Deployment',
      durationMinutes: baseDeepWorkMinutes,
      objective: `Build and deploy "${concept}" in ${keys}`,
      engagementPrompt: 'Rate your clarity 1–5 before moving on.',
      promptClarityRating: true,
      steps: deepWorkSteps,
      tips: [
        'Sound and time before speed',
        'If it collapses, slow down 10%',
        ...(slowFirst ? [`Slow-first week: cap tempo at ${tempoCap}% until day 14`] : []),
        ...(earMode !== 'off' ? [`Ear focus today: ${earMode.replace(/-/g, ' ')}`] : []),
      ],
      checkpoint: 'Did the concept feel obvious in at least one key?',
      transcriptionStage:
        earMode === 'transcribe-bars' && transcriptionProjectData
          ? (() => {
              const seg = pickSegment(
                transcriptionProjectData.segments,
                (s) => s.status === 'listening' || s.status === 'partial',
              )
              return seg
                ? transcriptionStageForPhase(transcriptionProjectData.id, transcriptionProjectData.segments, seg.id)
                : undefined
            })()
          : undefined,
    })
  }

  if (blockIds.includes('transcription-integration')) {
    const workSegment = pickSegment(projectSegments, (s) => s.status === 'listening' || s.status === 'partial')
    const segmentIds = projectSegments.slice(0, 3).map((s) => s.id)

    phases.push(
      {
        id: 'lang-capture',
        sessionZone: 'language',
        blockId: 'transcription-integration',
        blockName: 'Language Acquisition',
        title: "Capture Today's Line",
        durationMinutes: 10,
        objective: 'Add any hero recording you want to absorb — no need to match your active concept',
        engagementPrompt: 'Pick a line you love from any recording. Vocabulary acquisition, not concept matching.',
        transcriptionStage:
          projectId && projectSegments.length > 0
            ? transcriptionStageForPhase(projectId, projectSegments, workSegment?.id, segmentIds)
            : undefined,
        steps: buildLangCaptureSteps(sectionHint),
      },
      {
        id: 'lang-internalize',
        sessionZone: 'language',
        blockId: 'transcription-integration',
        blockName: 'Language Acquisition',
        title: 'Internalize Vocabulary',
        durationMinutes: 15,
        objective: `Absorb language from ${transcription}`,
        transcriptionStage:
          projectId && workSegment
            ? transcriptionStageForPhase(projectId, projectSegments, workSegment.id)
            : undefined,
        steps: buildLangInternalizeSteps(transcription, tunes),
        tips: ['Steal language, not a second concept. One gesture is enough.'],
      },
    )
    phases.push(recoveryPhase('transcription-integration', 'Reset: Mid-Session', 'Stand, shake hands, 3 deep breaths'))
  }

  if (blockIds.includes('standards-hymns-lab')) {
    phases.push({
      id: 'repertoire-circuit',
      sessionZone: 'repertoire',
      blockId: 'standards-hymns-lab',
      blockName: 'Repertoire & Transfer',
      title: 'Monthly Tune Circuit',
      durationMinutes: 28,
      objective: `All 3 tunes with depth: ${tunes}`,
      steps: buildRepertoireCircuitSteps(tunes, dayType),
      tips: ['If any bar fails 3×, isolate 4 bars and slow-loop before moving on.'],
    })
  }

  if (blockIds.includes('cold-pressure')) {
    phases.push({
      id: 'repertoire-pressure',
      sessionZone: 'repertoire',
      blockId: 'cold-pressure',
      blockName: 'Repertoire & Transfer',
      title: 'Cold Transfer & Trust',
      durationMinutes: 17,
      objective: `Pressure test + trust run · Dual-task Phase ${dualPhase}`,
      showAutomaticityChecklist: true,
      engagementPrompt: 'Hit record on the trust run if you can.',
      steps: buildColdPressureSteps(dualPhase),
      checkpoint: 'Did you write both log lines?',
    })
  }

  if (blockIds.includes('agility-fluency-lab')) {
    const { currentWeek, curriculumLevel } = useVocabularyStore.getState()
    const vocab = vocabularyLabSteps(activeConcept.keyFocusCluster, {
      currentWeek,
      level: curriculumLevel,
      date,
      monthlyTuneTitles: monthlyTunes.map((t) => t.title),
    })
    phases.push({
      id: 'vocabulary-lab',
      sessionZone: 'technique',
      blockId: 'agility-fluency-lab',
      blockName: 'Vocabulary Lab',
      title: vocab.phaseTitle,
      durationMinutes: vocab.durationMinutes,
      objective: vocab.objective,
      steps: vocab.steps,
      tips: vocab.tips,
      promptClarityRating: vocab.promptMotifClarity,
      checkpoint: vocab.promptMotifClarity
        ? 'Tri-sound audible? Rate motif clarity 1–5 before finishing.'
        : 'Did today\'s vocabulary feel like language, not scales?',
    })
  }

  if (blockIds.includes('recording-review')) {
    phases.push({
      id: 'sound-review',
      blockId: 'recording-review',
      blockName: 'Recording Review',
      title: 'Gig-Ready Review',
      durationMinutes: 20,
      objective: 'Producer ears: would you keep this on a gig?',
      steps: buildRecordingReviewSteps(),
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
    const key = p.sessionZone ?? p.blockId
    const name = p.sessionZone
      ? (SESSION_ZONES.find((z) => z.id === p.sessionZone)?.name ?? p.blockName)
      : p.blockName
    const existing = seen.get(key)
    if (existing) existing.phaseCount++
    else seen.set(key, { blockName: name, phaseCount: 1 })
  }
  return Array.from(seen.entries()).map(([blockId, v]) => ({ blockId, ...v }))
}
