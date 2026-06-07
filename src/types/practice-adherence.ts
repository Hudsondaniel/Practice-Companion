export type PhaseCompletionStatus = 'complete' | 'early' | 'rushed' | 'skipped'

export interface PhaseCompletionLog {
  phaseId: string
  phaseTitle: string
  blockId: string
  sessionDate: string
  plannedSeconds: number
  actualSeconds: number
  status: PhaseCompletionStatus
  completedAt: string
}

export interface SessionAdherenceSummary {
  sessionId: string
  date: string
  totalPhases: number
  completedPhases: number
  skippedPhases: number
  rushedPhases: number
  adherenceScore: number
  logs: PhaseCompletionLog[]
}

export function computeAdherenceScore(logs: PhaseCompletionLog[]): number {
  if (logs.length === 0) return 0
  const weights = { complete: 1, early: 0.85, rushed: 0.5, skipped: 0 }
  const sum = logs.reduce((acc, l) => acc + weights[l.status], 0)
  return Math.round((sum / logs.length) * 100)
}

export function buildSessionSummary(
  sessionId: string,
  date: string,
  logs: PhaseCompletionLog[],
): SessionAdherenceSummary {
  return {
    sessionId,
    date,
    totalPhases: logs.length,
    completedPhases: logs.filter((l) => l.status === 'complete' || l.status === 'early').length,
    skippedPhases: logs.filter((l) => l.status === 'skipped').length,
    rushedPhases: logs.filter((l) => l.status === 'rushed').length,
    adherenceScore: computeAdherenceScore(logs),
    logs,
  }
}
