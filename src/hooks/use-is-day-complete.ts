import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!
}

/** Reactive check — subscribes to both guided session and todaySession.completed. */
export function useIsDayCompleteForToday(): boolean {
  const guidedDone = useGuidedSessionStore(
    (s) => s.dayCompleted && s.sessionDate === todayIso(),
  )
  const todaySessionDone = usePracticeStore(
    (s) => s.todaySession?.date === todayIso() && Boolean(s.todaySession.completed),
  )
  return guidedDone || todaySessionDone
}
