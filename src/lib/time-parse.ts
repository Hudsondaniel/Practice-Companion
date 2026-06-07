/** Parse and format timestamps for transcription segments (seconds) */

export function formatTimestamp(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const whole = Math.floor(s)
  const tenth = Math.round((s - whole) * 10)
  if (tenth > 0) {
    return `${m}:${whole.toString().padStart(2, '0')}.${tenth}`
  }
  return `${m}:${whole.toString().padStart(2, '0')}`
}

/** Format time relative to a segment start (0-based section clock) */
export function formatSectionTime(seconds: number, sectionStart: number): string {
  return formatTimestamp(Math.max(0, seconds - sectionStart))
}

/** Parse "1:30", "1:30.5", or "90" into seconds */
export function parseTimeInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const n = Number(trimmed)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  const match = trimmed.match(/^(\d+):(\d{1,2})(?:\.(\d))?$/)
  if (!match) return null

  const minutes = Number(match[1])
  const secs = Number(match[2])
  const tenth = match[3] ? Number(match[3]) / 10 : 0
  if (secs >= 60) return null
  return minutes * 60 + secs + tenth
}

export function segmentDuration(segment: { startSeconds: number; endSeconds: number }): number {
  return Math.max(0, segment.endSeconds - segment.startSeconds)
}
