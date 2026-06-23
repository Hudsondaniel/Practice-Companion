import { create } from 'zustand'
import { parseRecordingUrl } from '@/lib/recording-url'
import { currentMonthYear } from '@/types/practice-method'
import type {
  TranscriptionProject,
  TranscriptionProjectInput,
  TranscriptionSegment,
  TranscriptionSegmentInput,
} from '@/types/transcription'

interface TranscriptionState {
  projects: TranscriptionProject[]
  activeProjectId: string | null
  selectedSegmentId: string | null

  addProject: (input: TranscriptionProjectInput) => string
  updateProject: (id: string, updates: Partial<Omit<TranscriptionProject, 'id' | 'createdAt'>>) => void
  deleteProject: (id: string) => void
  setActiveProject: (id: string | null) => void
  setSelectedSegment: (segmentId: string | null) => void

  addSegment: (projectId: string, segment: TranscriptionSegmentInput) => string
  updateSegment: (projectId: string, segmentId: string, updates: Partial<TranscriptionSegmentInput>) => void
  deleteSegment: (projectId: string, segmentId: string) => void

  getProject: (id: string) => TranscriptionProject | undefined
  getActiveProject: () => TranscriptionProject | undefined
  getMonthlyProject: (monthYear?: string) => TranscriptionProject | undefined
  getDailyHeroProject: (practiceDate: string, conceptId?: string) => TranscriptionProject | undefined
  clearDailyForMonth: (monthYear: string) => void
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useTranscriptionStore = create<TranscriptionState>()((set, get) => ({
      projects: [],
      activeProjectId: null,
      selectedSegmentId: null,

      addProject: (input) => {
        const id = newId('tr')
        const parsed = parseRecordingUrl(input.recordingUrl)
        const now = new Date().toISOString()
        const project: TranscriptionProject = {
          id,
          artist: input.artist,
          title: input.title,
          recordingUrl: parsed.normalizedUrl || input.recordingUrl,
          sourceType: parsed.type,
          key: input.key,
          monthYear: input.monthYear ?? currentMonthYear(),
          practiceDate: input.practiceDate,
          linkedConceptId: input.linkedConceptId,
          segments: (input.segments ?? []).map((s) => ({ ...s, id: newId('seg') })),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          projects: [project, ...state.projects],
          activeProjectId: id,
        }))
        return id
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p
            const recordingUrl = updates.recordingUrl ?? p.recordingUrl
            const parsed = updates.recordingUrl ? parseRecordingUrl(recordingUrl) : null
            return {
              ...p,
              ...updates,
              recordingUrl: parsed?.normalizedUrl ?? recordingUrl,
              sourceType: parsed?.type ?? p.sourceType,
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
          selectedSegmentId: null,
        })),

      setActiveProject: (id) =>
        set((state) => {
          if (state.activeProjectId === id) return state
          return { activeProjectId: id, selectedSegmentId: null }
        }),

      setSelectedSegment: (segmentId) => set({ selectedSegmentId: segmentId }),

      addSegment: (projectId, segment) => {
        const segId = newId('seg')
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const next: TranscriptionSegment = { ...segment, id: segId }
            return {
              ...p,
              segments: [...p.segments, next],
              updatedAt: new Date().toISOString(),
            }
          }),
          selectedSegmentId: segId,
        }))
        return segId
      },

      updateSegment: (projectId, segmentId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            return {
              ...p,
              segments: p.segments.map((s) => (s.id === segmentId ? { ...s, ...updates } : s)),
              updatedAt: new Date().toISOString(),
            }
          }),
        })),

      deleteSegment: (projectId, segmentId) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            return {
              ...p,
              segments: p.segments.filter((s) => s.id !== segmentId),
              updatedAt: new Date().toISOString(),
            }
          }),
          selectedSegmentId: state.selectedSegmentId === segmentId ? null : state.selectedSegmentId,
        })),

      getProject: (id) => get().projects.find((p) => p.id === id),

      getActiveProject: () => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return undefined
        return projects.find((p) => p.id === activeProjectId)
      },

      getMonthlyProject: (monthYear = currentMonthYear()) =>
        get().projects.find((p) => p.monthYear === monthYear && !p.practiceDate),

      getDailyHeroProject: (practiceDate, conceptId) => {
        const matches = get().projects.filter((p) => p.practiceDate === practiceDate)
        if (conceptId) {
          return matches.find((p) => p.linkedConceptId === conceptId) ?? matches[0]
        }
        return matches[0]
      },

      clearDailyForMonth: (monthYear) =>
        set((s) => ({
          projects: s.projects.filter((p) => !p.practiceDate?.startsWith(monthYear)),
          activeProjectId:
            s.activeProjectId &&
            s.projects.find((p) => p.id === s.activeProjectId)?.practiceDate?.startsWith(monthYear)
              ? null
              : s.activeProjectId,
          selectedSegmentId: null,
        })),
    }),
)
