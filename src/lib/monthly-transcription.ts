import { parseRecordingUrl } from '@/lib/recording-url'
import { useTranscriptionStore } from '@/stores/transcription-store'

export interface MonthlyTranscriptionInput {
  artist: string
  title: string
  recordingUrl: string
  key?: string
  monthYear: string
  existingProjectId?: string
}

/** Create or update the single monthly transcription project (sections added during practice). */
export function syncMonthlyTranscriptionProject(input: MonthlyTranscriptionInput): string {
  const { artist, title, recordingUrl, key, monthYear, existingProjectId } = input
  const store = useTranscriptionStore.getState()
  const parsed = parseRecordingUrl(recordingUrl)

  const existing =
    (existingProjectId ? store.getProject(existingProjectId) : undefined) ??
    store.getMonthlyProject(monthYear)

  if (existing && !existing.practiceDate) {
    store.updateProject(existing.id, {
      artist,
      title,
      recordingUrl: parsed.normalizedUrl || recordingUrl,
      key: key || undefined,
      monthYear,
    })
    return existing.id
  }

  return store.addProject({
    artist,
    title,
    recordingUrl,
    key: key || undefined,
    monthYear,
    segments: [],
  })
}

export function getMonthlyTranscriptionLabel(
  artist: string,
  title: string,
): string {
  return `${artist} — ${title}`
}
