import { create } from 'zustand'
import type {
  ActiveConcept,
  ConceptStage,
  DailyPracticeSession,
  DayType,
  DeviceBacklogItem,
  MonthlyPlan,
  MonthlyTune,
  PracticeBlockId,
  SessionBlock,
} from '@/types/practice-method'
import { currentMonthYear } from '@/types/practice-method'
import { PRACTICE_BLOCKS } from '@/types/practice-method'
import {
  createDefaultPracticeSchedule,
  getDayTypeForDate,
  getReviewWeekday,
  normalizePracticeSchedule,
  type PracticeWeekSchedule,
} from '@/types/practice-schedule'

interface PracticeState {
  activeConcept: ActiveConcept | null
  deviceBacklog: DeviceBacklogItem[]
  monthlyTunes: MonthlyTune[]
  monthlyPlan: MonthlyPlan | null
  archivedMonthlyPlans: MonthlyPlan[]
  todaySession: DailyPracticeSession | null
  currentBlockId: PracticeBlockId | null
  streak: number
  weeklyHours: number
  practiceSchedule: PracticeWeekSchedule

  setPracticeSchedule: (schedule: PracticeWeekSchedule) => void
  updateWeekdaySchedule: (
    index: number,
    update: Partial<PracticeWeekSchedule['days'][number]>,
  ) => void

  isMonthConfigured: (monthYear?: string) => boolean
  needsMonthRollover: () => boolean
  configureMonth: (plan: Omit<MonthlyPlan, 'configuredAt'>) => void
  softRestartMonth: () => void
  hardRestartMonth: () => void
  archiveMonthAndClear: () => void
  extendCurrentMonth: () => void
  updateMonthlyTune: (tuneId: string, updates: Partial<MonthlyTune>) => void
  addDeploymentPoint: (tuneId: string, point: Omit<MonthlyTune['deploymentPoints'][0], 'id'>) => void
  removeDeploymentPoint: (tuneId: string, pointId: string) => void
  setActiveConcept: (concept: ActiveConcept) => void
  updateConceptStage: (stage: ConceptStage) => void
  incrementPassDays: () => void
  retireConcept: () => void
  promoteNextConcept: () => void
  addBacklogItem: (item: Omit<DeviceBacklogItem, 'id' | 'createdAt'>) => void
  deleteBacklogItem: (id: string) => void
  activateConcept: (id: string) => void
  updateBacklogItem: (id: string, updates: Partial<DeviceBacklogItem>) => void
  setBacklogTier: (id: string, tier: DeviceBacklogItem['tier']) => void
  setMonthlyTunes: (tunes: MonthlyTune[]) => void
  initTodaySession: (dayType: DayType) => void
  /** Reset block progress when the calendar day changes (or create if missing) */
  ensureTodaySession: (dayType?: DayType) => void
  completeBlock: (blockId: PracticeBlockId, actualMinutes: number, notes?: string) => void
  setCurrentBlock: (blockId: PracticeBlockId | null) => void
  setDailyLog: (stage: ConceptStage, tomorrowFocus: string) => void
}

function buildSessionBlocks(dayType: DayType): SessionBlock[] {
  return PRACTICE_BLOCKS.filter((b) => {
    if (dayType === 'review' && b.id === 'consolidation') return false
    if (dayType !== 'review' && b.id === 'recording-review') return false
    return true
  }).map((b) => ({
    blockId: b.id,
    plannedMinutes: b.durationMinutes,
    actualMinutes: 0,
    completed: false,
  }))
}

function getDayTypeFromDate(schedule: PracticeWeekSchedule): DayType | null {
  return getDayTypeForDate(schedule)
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0]!
}

function createTodaySession(dayType: DayType, activeConceptId: string): DailyPracticeSession {
  const blocks = buildSessionBlocks(dayType)
  const totalMinutes = blocks.reduce((sum, b) => sum + b.plannedMinutes, 0)
  return {
    id: crypto.randomUUID(),
    date: todayIso(),
    dayType,
    totalMinutes,
    blocks,
    activeConceptId,
    completed: false,
  }
}

export const usePracticeStore = create<PracticeState>()((set, get) => ({
      activeConcept: null,
      deviceBacklog: [],
      monthlyTunes: [],
      monthlyPlan: null,
      archivedMonthlyPlans: [],
      todaySession: null,
      currentBlockId: null,
      streak: 0,
      weeklyHours: 0,
      practiceSchedule: createDefaultPracticeSchedule(),

      setPracticeSchedule: (schedule) => {
        const normalized = normalizePracticeSchedule(schedule)
        const reviewDay = getReviewWeekday(normalized)
        set((s) => ({
          practiceSchedule: normalized,
          monthlyPlan:
            s.monthlyPlan && reviewDay != null
              ? { ...s.monthlyPlan, reviewDay }
              : s.monthlyPlan,
        }))
      },

      updateWeekdaySchedule: (index, update) => {
        const schedule = get().practiceSchedule
        const days = [...schedule.days] as PracticeWeekSchedule['days']
        if (index < 0 || index > 6) return
        days[index] = { ...days[index], ...update }
        get().setPracticeSchedule({ days })
      },

      isMonthConfigured: (monthYear = currentMonthYear()) => {
        const plan = get().monthlyPlan
        return plan?.monthYear === monthYear && plan.tunes.length === 3
      },

      needsMonthRollover: () => {
        const plan = get().monthlyPlan
        if (!plan) return false
        return plan.monthYear !== currentMonthYear()
      },

      configureMonth: (planInput) => {
        const plan: MonthlyPlan = {
          ...planInput,
          configuredAt: new Date().toISOString(),
        }
        const current = get().deviceBacklog.find((i) => i.tier === 'current')
        set({
          monthlyPlan: plan,
          monthlyTunes: plan.tunes,
        })
        if (get().activeConcept) {
          set({
            activeConcept: {
              ...get().activeConcept!,
              keyFocusCluster: plan.keyFocusCluster,
              dualTaskPhase: plan.dualTaskPhase,
              sourceRecordings: current?.sourceRecording
                ? [current.sourceRecording]
                : get().activeConcept!.sourceRecordings,
            },
          })
        }
      },

      softRestartMonth: () => {
        const plan = get().monthlyPlan
        if (!plan) return
        const dayType = getDayTypeFromDate(get().practiceSchedule)
        if (dayType) get().initTodaySession(dayType)
        if (get().activeConcept) {
          set({
            activeConcept: {
              ...get().activeConcept!,
              dualTaskPhase: 1,
              consecutivePassDays: 0,
            },
          })
        }
      },

      hardRestartMonth: () => {
        const plan = get().monthlyPlan
        if (!plan) return
        const clearedTunes = plan.tunes.map((t) => ({ ...t, deploymentPoints: [] }))
        const updatedPlan = { ...plan, tunes: clearedTunes, dualTaskPhase: 1 as const, extendedWeek: false }
        set({
          monthlyPlan: updatedPlan,
          monthlyTunes: clearedTunes,
        })
        get().softRestartMonth()
      },

      archiveMonthAndClear: () => {
        const plan = get().monthlyPlan
        if (plan) {
          set((s) => ({
            archivedMonthlyPlans: [plan, ...s.archivedMonthlyPlans].slice(0, 12),
            monthlyPlan: null,
            monthlyTunes: [],
            todaySession: null,
            currentBlockId: null,
          }))
        } else {
          set({ monthlyPlan: null, monthlyTunes: [], todaySession: null, currentBlockId: null })
        }
      },

      extendCurrentMonth: () => {
        const plan = get().monthlyPlan
        if (!plan) return
        set({
          monthlyPlan: { ...plan, extendedWeek: true },
        })
      },

      updateMonthlyTune: (tuneId, updates) =>
        set((s) => {
          const tunes = s.monthlyTunes.map((t) => (t.id === tuneId ? { ...t, ...updates } : t))
          return {
            monthlyTunes: tunes,
            monthlyPlan: s.monthlyPlan ? { ...s.monthlyPlan, tunes } : null,
          }
        }),

      addDeploymentPoint: (tuneId, point) =>
        set((s) => {
          const tunes = s.monthlyTunes.map((t) =>
            t.id === tuneId
              ? { ...t, deploymentPoints: [...t.deploymentPoints, { ...point, id: crypto.randomUUID() }] }
              : t,
          )
          return {
            monthlyTunes: tunes,
            monthlyPlan: s.monthlyPlan ? { ...s.monthlyPlan, tunes } : null,
          }
        }),

      removeDeploymentPoint: (tuneId, pointId) =>
        set((s) => {
          const tunes = s.monthlyTunes.map((t) =>
            t.id === tuneId
              ? { ...t, deploymentPoints: t.deploymentPoints.filter((p) => p.id !== pointId) }
              : t,
          )
          return {
            monthlyTunes: tunes,
            monthlyPlan: s.monthlyPlan ? { ...s.monthlyPlan, tunes } : null,
          }
        }),

      setActiveConcept: (concept) => set({ activeConcept: concept }),

      updateConceptStage: (stage) =>
        set((s) => ({
          activeConcept: s.activeConcept ? { ...s.activeConcept, stage } : null,
        })),

      incrementPassDays: () =>
        set((s) => ({
          activeConcept: s.activeConcept
            ? { ...s.activeConcept, consecutivePassDays: s.activeConcept.consecutivePassDays + 1 }
            : null,
        })),

      retireConcept: () => {
        const { activeConcept, deviceBacklog } = get()
        if (!activeConcept) return

        const updatedBacklog = deviceBacklog.map((item) => {
          if (item.id === activeConcept.id) return { ...item, tier: 'future' as const, notes: 'Retired — maintenance' }
          if (item.tier === 'next') return { ...item, tier: 'current' as const }
          return item
        })

        const next = updatedBacklog.find((i) => i.tier === 'current' && i.id !== activeConcept.id)
          ?? updatedBacklog.find((i) => i.tier === 'current')

        if (next && next.id !== activeConcept.id) {
          const newConcept: ActiveConcept = {
            id: next.id,
            label: next.label,
            description: next.description,
            harmonicContext: next.harmonicContext,
            keys: next.keys,
            sourceRecordings: next.sourceRecording ? [next.sourceRecording] : [],
            keyFocusCluster: get().monthlyPlan?.keyFocusCluster ?? next.keys.slice(0, 3),
            dualTaskPhase: get().monthlyPlan?.dualTaskPhase ?? 1,
            stage: 'cognitive',
            consecutivePassDays: 0,
            startedAt: new Date().toISOString(),
            ecosystem: next.ecosystem,
          }
          set({ deviceBacklog: updatedBacklog, activeConcept: newConcept })
        } else {
          set({
            deviceBacklog: updatedBacklog,
            activeConcept: { ...activeConcept, consecutivePassDays: 0, stage: 'cognitive' },
          })
        }
      },

      promoteNextConcept: () => {
        const { deviceBacklog, activeConcept } = get()
        const next = deviceBacklog.find((i) => i.tier === 'next')
        if (!next) return

        const updatedBacklog = deviceBacklog.map((item) => {
          if (item.id === next.id) return { ...item, tier: 'current' as const }
          if (item.id === activeConcept?.id) return { ...item, tier: 'future' as const }
          return item
        })

        const newConcept: ActiveConcept = {
          id: next.id,
          label: next.label,
          description: next.description,
          harmonicContext: next.harmonicContext,
          keys: next.keys,
          sourceRecordings: next.sourceRecording ? [next.sourceRecording] : [],
          keyFocusCluster: next.keys.slice(0, 3),
          dualTaskPhase: 1,
          stage: 'cognitive',
          consecutivePassDays: 0,
          startedAt: new Date().toISOString(),
          ecosystem: next.ecosystem,
        }

        set({ deviceBacklog: updatedBacklog, activeConcept: newConcept })
      },

      addBacklogItem: (item) =>
        set((s) => ({
          deviceBacklog: [
            ...s.deviceBacklog,
            { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      deleteBacklogItem: (id) => {
        const { deviceBacklog, activeConcept } = get()
        const next = deviceBacklog.filter((i) => i.id !== id)
        set({
          deviceBacklog: next,
          activeConcept: activeConcept?.id === id ? null : activeConcept,
        })
      },

      activateConcept: (id) => {
        get().setBacklogTier(id, 'current')
      },

      updateBacklogItem: (id, updates) =>
        set((s) => ({
          deviceBacklog: s.deviceBacklog.map((item) => (item.id === id ? { ...item, ...updates } : item)),
        })),

      setBacklogTier: (id, tier) => {
        const { deviceBacklog, activeConcept } = get()
        if (tier === 'current') {
          const item = deviceBacklog.find((i) => i.id === id)
          if (!item) return
          const updated = deviceBacklog.map((i) => ({
            ...i,
            tier:
              i.id === id
                ? ('current' as const)
                : i.tier === 'current'
                  ? ('future' as const)
                  : i.tier,
          }))
          const newConcept: ActiveConcept = {
            id: item.id,
            label: item.label,
            description: item.description,
            harmonicContext: item.harmonicContext,
            keys: item.keys,
            sourceRecordings: item.sourceRecording ? [item.sourceRecording] : [],
            keyFocusCluster: get().monthlyPlan?.keyFocusCluster ?? item.keys.slice(0, 3),
            dualTaskPhase: get().monthlyPlan?.dualTaskPhase ?? 1,
            stage: 'cognitive',
            consecutivePassDays: 0,
            startedAt: new Date().toISOString(),
            ecosystem: item.ecosystem,
          }
          set({ deviceBacklog: updated, activeConcept: newConcept })
          return
        }
        set({
          deviceBacklog: deviceBacklog.map((i) => (i.id === id ? { ...i, tier } : i)),
        })
        if (activeConcept?.id === id) {
          set({ activeConcept: null })
        }
      },

      setMonthlyTunes: (tunes) => set({ monthlyTunes: tunes }),

      initTodaySession: (dayType) => {
        const blocks = buildSessionBlocks(dayType)
        set({
          todaySession: createTodaySession(dayType, get().activeConcept?.id ?? ''),
          currentBlockId: blocks[0]?.blockId ?? null,
        })
      },

      ensureTodaySession: (dayType) => {
        const schedule = get().practiceSchedule
        const dt = dayType ?? getDayTypeFromDate(schedule)
        const today = todayIso()
        const session = get().todaySession

        if (!dt) {
          if (session?.date === today) {
            set({ todaySession: null, currentBlockId: null })
          }
          return
        }

        if (session && session.date === today && session.dayType === dt) return
        const blocks = buildSessionBlocks(dt)
        set({
          todaySession: createTodaySession(dt, get().activeConcept?.id ?? ''),
          currentBlockId: blocks[0]?.blockId ?? null,
        })
      },

      completeBlock: (blockId, actualMinutes, notes) =>
        set((s) => {
          if (!s.todaySession) return s
          const blocks = s.todaySession.blocks.map((b) =>
            b.blockId === blockId
              ? { ...b, completed: true, actualMinutes, notes }
              : b,
          )
          const allDone = blocks.every((b) => b.completed)
          const nextIncomplete = blocks.find((b) => !b.completed)
          return {
            todaySession: { ...s.todaySession, blocks, completed: allDone },
            currentBlockId: nextIncomplete?.blockId ?? null,
          }
        }),

      setCurrentBlock: (blockId) => set({ currentBlockId: blockId }),

      setDailyLog: (stage, tomorrowFocus) =>
        set((s) => ({
          todaySession: s.todaySession
            ? { ...s.todaySession, dailyLog: { conceptStage: stage, tomorrowFocus } }
            : null,
        })),
    }),
)
