import { create } from 'zustand'
import type { MetronomeConfig, MetronomeSound, MetronomeSubdivision } from '@/lib/metronome'

async function metronomeApi() {
  return import('@/lib/metronome')
}

export interface RecordingMarker {
  time: number
  label: string
}

export interface SessionRecordingClip {
  id: string
  name: string
  base64: string
  durationSeconds: number
  createdAt: string
  phaseId?: string
  phaseTitle?: string
  markers: RecordingMarker[]
}

export type RecordingQuality = 'standard' | 'high'

interface SessionToolsState {
  bpm: number
  metronomeSound: MetronomeSound
  beatsPerMeasure: number
  subdivision: MetronomeSubdivision
  metronomeVolume: number
  countInBars: number
  isMetronomePlaying: boolean
  isRecording: boolean
  recordingDuration: number
  recordingQuality: RecordingQuality
  recordingMarkers: RecordingMarker[]
  sessionTimerStartedAt: string | null
  lastSessionDurationSeconds: number | null
  sessionNotes: string
  waveformPeaks: number[]
  recordingBlobUrl: string | null
  recordingBase64: string | null
  savedClips: SessionRecordingClip[]

  getMetronomeConfig: () => MetronomeConfig
  setBpm: (bpm: number) => void
  setMetronomeSound: (sound: MetronomeSound) => void
  setBeatsPerMeasure: (beats: number) => void
  setSubdivision: (sub: MetronomeSubdivision) => void
  setMetronomeVolume: (volume: number) => void
  setCountInBars: (bars: number) => void
  toggleMetronome: () => Promise<void>
  restartMetronomeIfPlaying: () => Promise<void>
  setRecordingQuality: (q: RecordingQuality) => void
  startRecording: () => void
  stopRecording: () => void
  tickRecording: () => void
  addRecordingMarker: (label?: string) => void
  saveCurrentRecording: (phaseId?: string, phaseTitle?: string) => void
  removeClip: (id: string) => void
  renameClip: (id: string, name: string) => void
  startSessionTimer: () => void
  stopSessionTimer: () => void
  setLastSessionDuration: (seconds: number) => void
  getSessionElapsedSeconds: () => number
  setSessionNotes: (notes: string) => void
  setWaveformPeaks: (peaks: number[]) => void
  setRecordingBlobUrl: (url: string | null) => void
  setRecordingBase64: (data: string | null) => void
  restoreRecordingFromBase64: () => void
  clearRecording: () => void
  resetSession: () => void
}

function clipId() {
  return `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useSessionToolsStore = create<SessionToolsState>()((set, get) => ({
      bpm: 120,
      metronomeSound: 'click',
      beatsPerMeasure: 4,
      subdivision: 'quarter',
      metronomeVolume: 0.8,
      countInBars: 0,
      isMetronomePlaying: false,
      isRecording: false,
      recordingDuration: 0,
      recordingQuality: 'standard',
      recordingMarkers: [],
      sessionTimerStartedAt: null,
      lastSessionDurationSeconds: null,
      sessionNotes: '',
      waveformPeaks: [],
      recordingBlobUrl: null,
      recordingBase64: null,
      savedClips: [],

      getMetronomeConfig: () => {
        const s = get()
        return {
          bpm: s.bpm,
          sound: s.metronomeSound,
          beatsPerMeasure: s.beatsPerMeasure,
          subdivision: s.subdivision,
          volume: s.metronomeVolume,
          countInBars: s.countInBars,
        }
      },

      setBpm: (bpm) => {
        set({ bpm })
        void metronomeApi().then((m) => m.setMetronomeBpm(bpm))
      },

      setMetronomeSound: (sound) => {
        set({ metronomeSound: sound })
        void get().restartMetronomeIfPlaying()
      },

      setBeatsPerMeasure: (beats) => {
        set({ beatsPerMeasure: beats })
        void get().restartMetronomeIfPlaying()
      },

      setSubdivision: (sub) => {
        set({ subdivision: sub })
        void get().restartMetronomeIfPlaying()
      },

      setMetronomeVolume: (volume) => {
        set({ metronomeVolume: volume })
        void get().restartMetronomeIfPlaying()
      },

      setCountInBars: (bars) => set({ countInBars: bars }),

      restartMetronomeIfPlaying: async () => {
        const { isMetronomePlaying } = get()
        const m = await metronomeApi()
        if (!isMetronomePlaying && !m.isMetronomeRunning()) return
        await m.startMetronome(get().getMetronomeConfig())
        set({ isMetronomePlaying: true })
      },

      toggleMetronome: async () => {
        const m = await metronomeApi()
        if (get().isMetronomePlaying || m.isMetronomeRunning()) {
          m.stopMetronome()
          set({ isMetronomePlaying: false })
          return
        }
        await m.startMetronome(get().getMetronomeConfig())
        set({ isMetronomePlaying: true })
      },

      setRecordingQuality: (q) => set({ recordingQuality: q }),

      startRecording: () =>
        set({ isRecording: true, recordingDuration: 0, recordingMarkers: [], waveformPeaks: [] }),

      stopRecording: () => set({ isRecording: false }),

      tickRecording: () =>
        set((s) => (s.isRecording ? { recordingDuration: s.recordingDuration + 1 } : s)),

      addRecordingMarker: (label) => {
        const { recordingDuration, recordingMarkers } = get()
        set({
          recordingMarkers: [
            ...recordingMarkers,
            { time: recordingDuration, label: label ?? `Marker ${recordingMarkers.length + 1}` },
          ],
        })
      },

      saveCurrentRecording: (phaseId, phaseTitle) => {
        const { recordingBase64, recordingDuration, recordingMarkers, savedClips } = get()
        if (!recordingBase64) return
        const clip: SessionRecordingClip = {
          id: clipId(),
          name: phaseTitle ? `${phaseTitle} take` : `Take ${savedClips.length + 1}`,
          base64: recordingBase64,
          durationSeconds: recordingDuration,
          createdAt: new Date().toISOString(),
          phaseId,
          phaseTitle,
          markers: [...recordingMarkers],
        }
        set({ savedClips: [clip, ...savedClips].slice(0, 20) })
      },

      removeClip: (id) => set((s) => ({ savedClips: s.savedClips.filter((c) => c.id !== id) })),

      renameClip: (id, name) =>
        set((s) => ({
          savedClips: s.savedClips.map((c) => (c.id === id ? { ...c, name } : c)),
        })),

      startSessionTimer: () => {
        set({
          sessionTimerStartedAt: new Date().toISOString(),
          lastSessionDurationSeconds: null,
        })
      },

      stopSessionTimer: () => {
        const { sessionTimerStartedAt } = get()
        const elapsed = sessionTimerStartedAt
          ? Math.floor((Date.now() - new Date(sessionTimerStartedAt).getTime()) / 1000)
          : get().lastSessionDurationSeconds ?? 0
        set({
          sessionTimerStartedAt: null,
          lastSessionDurationSeconds: elapsed,
        })
      },

      setLastSessionDuration: (seconds) =>
        set({
          sessionTimerStartedAt: null,
          lastSessionDurationSeconds: seconds,
        }),

      getSessionElapsedSeconds: () => {
        const { sessionTimerStartedAt, lastSessionDurationSeconds } = get()
        if (sessionTimerStartedAt) {
          return Math.floor((Date.now() - new Date(sessionTimerStartedAt).getTime()) / 1000)
        }
        return lastSessionDurationSeconds ?? 0
      },

      setSessionNotes: (notes) => set({ sessionNotes: notes }),

      setWaveformPeaks: (peaks) => set({ waveformPeaks: peaks }),

      setRecordingBlobUrl: (url) => {
        const prev = get().recordingBlobUrl
        if (prev && prev !== url && !prev.startsWith('data:')) URL.revokeObjectURL(prev)
        set({ recordingBlobUrl: url })
      },

      setRecordingBase64: (data) => set({ recordingBase64: data }),

      restoreRecordingFromBase64: () => {
        const { recordingBase64, recordingBlobUrl } = get()
        if (recordingBlobUrl || !recordingBase64) return
        set({ recordingBlobUrl: recordingBase64 })
      },

      clearRecording: () => {
        const prev = get().recordingBlobUrl
        if (prev && !prev.startsWith('data:')) URL.revokeObjectURL(prev)
        set({
          recordingBlobUrl: null,
          recordingBase64: null,
          waveformPeaks: [],
          recordingDuration: 0,
          recordingMarkers: [],
        })
      },

      resetSession: () => {
        void metronomeApi().then((m) => m.stopMetronome())
        const prev = get().recordingBlobUrl
        if (prev && !prev.startsWith('data:')) URL.revokeObjectURL(prev)
        set({
          sessionNotes: '',
          recordingDuration: 0,
          isRecording: false,
          isMetronomePlaying: false,
          waveformPeaks: [],
          recordingBlobUrl: null,
          recordingBase64: null,
          recordingMarkers: [],
        })
      },
    }),
)

export function downloadRecording(base64: string, filename: string) {
  const a = document.createElement('a')
  a.href = base64
  a.download = filename.endsWith('.webm') ? filename : `${filename}.webm`
  a.click()
}
