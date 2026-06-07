import { useAdherenceStore } from '@/stores/adherence-store'
import { useGuidedSessionStore } from '@/stores/guided-session-store'
import { usePracticeStore } from '@/stores/practice-store'
import { useTranscriptionStore } from '@/stores/transcription-store'

export function performSoftMonthRestart() {
  const plan = usePracticeStore.getState().monthlyPlan
  if (!plan) return
  usePracticeStore.getState().softRestartMonth()
  useAdherenceStore.getState().clearHistoryForMonth(plan.monthYear)
  if (useGuidedSessionStore.getState().isActive) {
    useGuidedSessionStore.getState().endSession()
  }
}

export function performHardMonthRestart() {
  const plan = usePracticeStore.getState().monthlyPlan
  if (!plan) return
  useTranscriptionStore.getState().clearDailyForMonth(plan.monthYear)
  useAdherenceStore.getState().clearHistoryForMonth(plan.monthYear)
  usePracticeStore.getState().hardRestartMonth()
  if (useGuidedSessionStore.getState().isActive) {
    useGuidedSessionStore.getState().endSession()
  }
}

export function performArchiveMonth() {
  const plan = usePracticeStore.getState().monthlyPlan
  if (plan) {
    useAdherenceStore.getState().clearHistoryForMonth(plan.monthYear)
  }
  usePracticeStore.getState().archiveMonthAndClear()
  if (useGuidedSessionStore.getState().isActive) {
    useGuidedSessionStore.getState().endSession()
  }
}
