import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PhaseCompletionLog, SessionAdherenceSummary } from '@/types/practice-adherence'
import { buildSessionSummary } from '@/types/practice-adherence'

interface AdherenceState {
  currentSessionId: string | null
  currentSessionDate: string | null
  phaseStartedAt: number | null
  logs: PhaseCompletionLog[]
  history: SessionAdherenceSummary[]

  startSessionLog: (sessionId: string, date: string) => void
  markPhaseStarted: () => void
  logPhaseCompletion: (
    entry: Omit<PhaseCompletionLog, 'actualSeconds' | 'completedAt' | 'status' | 'sessionDate'>,
    secondsRemaining: number,
  ) => void
  logSkippedPhases: (
    phases: { phaseId: string; phaseTitle: string; blockId: string; plannedSeconds: number }[],
    sessionDate: string,
  ) => void
  finishSession: () => SessionAdherenceSummary | null
  getLatestSummary: () => SessionAdherenceSummary | null
  getRecentSummaries: (count?: number) => SessionAdherenceSummary[]
  clearHistoryForMonth: (monthYear: string) => void
  getSkipPatterns: () => { blockId: string; blockLabel: string; skipCount: number; total: number }[]
}

function classifyStatus(plannedSeconds: number, actualSeconds: number): PhaseCompletionLog['status'] {
  if (actualSeconds >= plannedSeconds * 0.85) return 'complete'
  if (actualSeconds >= plannedSeconds * 0.5) return 'early'
  return 'rushed'
}

const BLOCK_LABELS: Record<string, string> = {
  'concept-forge': 'Concept Forge',
  'transcription-integration': 'Transcription Integration',
  'standards-hymns-lab': 'Standards / Hymns Lab',
  'cold-pressure': 'Cold / Pressure',
  'agility-fluency-lab': 'Vocabulary Lab',
  consolidation: 'Consolidation',
  'recording-review': 'Recording Review',
}

export function computeSkipPatterns(history: SessionAdherenceSummary[]) {
  const counts = new Map<string, { skip: number; total: number }>()
  for (const session of history.slice(0, 14)) {
    for (const log of session.logs ?? []) {
      const cur = counts.get(log.blockId) ?? { skip: 0, total: 0 }
      cur.total++
      if (log.status === 'skipped' || log.status === 'rushed') cur.skip++
      counts.set(log.blockId, cur)
    }
  }
  return [...counts.entries()]
    .map(([blockId, { skip, total }]) => ({
      blockId,
      blockLabel: BLOCK_LABELS[blockId] ?? blockId,
      skipCount: skip,
      total,
    }))
    .filter((p) => p.skipCount > 0)
    .sort((a, b) => b.skipCount - a.skipCount)
}

export const useAdherenceStore = create<AdherenceState>()(
  persist(
    (set, get) => ({
      currentSessionId: null,
      currentSessionDate: null,
      phaseStartedAt: null,
      logs: [],
      history: [],

      startSessionLog: (sessionId, date) => {
        set({
          currentSessionId: sessionId,
          currentSessionDate: date,
          logs: [],
          phaseStartedAt: Date.now(),
        })
      },

      markPhaseStarted: () => set({ phaseStartedAt: Date.now() }),

      logPhaseCompletion: (entry, secondsRemaining) => {
        const { phaseStartedAt, currentSessionDate, logs } = get()
        const actualSeconds = phaseStartedAt
          ? Math.max(1, Math.round((Date.now() - phaseStartedAt) / 1000))
          : Math.max(1, entry.plannedSeconds - secondsRemaining)
        const status = classifyStatus(entry.plannedSeconds, actualSeconds)

        set({
          logs: [
            ...logs,
            {
              ...entry,
              sessionDate: currentSessionDate ?? new Date().toISOString().split('T')[0]!,
              actualSeconds,
              status,
              completedAt: new Date().toISOString(),
            },
          ],
          phaseStartedAt: Date.now(),
        })
      },

      logSkippedPhases: (phases, sessionDate) => {
        const { logs } = get()
        const skipped: PhaseCompletionLog[] = phases.map((p) => ({
          ...p,
          sessionDate,
          actualSeconds: 0,
          status: 'skipped',
          completedAt: new Date().toISOString(),
        }))
        set({ logs: [...logs, ...skipped], phaseStartedAt: Date.now() })
      },

      finishSession: () => {
        const { currentSessionId, currentSessionDate, logs, history } = get()
        if (!currentSessionId || !currentSessionDate || logs.length === 0) return null

        const summary = buildSessionSummary(currentSessionId, currentSessionDate, logs)
        set({
          history: [summary, ...history].slice(0, 30),
          currentSessionId: null,
          currentSessionDate: null,
          logs: [],
          phaseStartedAt: null,
        })
        return summary
      },

      getLatestSummary: () => get().history[0] ?? null,

      getRecentSummaries: (count = 7) => get().history.slice(0, count),

      clearHistoryForMonth: (monthYear) =>
        set((s) => ({
          history: s.history.filter((h) => !h.date.startsWith(monthYear)),
          logs: s.logs.filter((l) => !l.sessionDate.startsWith(monthYear)),
        })),

      getSkipPatterns: () => computeSkipPatterns(get().history),
    }),
    { name: 'piano-mastery-adherence' },
  ),
)
