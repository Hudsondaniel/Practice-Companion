import type { RecordingSourceType } from '@/types/transcription'

export interface ParsedRecordingUrl {
  type: RecordingSourceType
  /** Original normalized URL */
  normalizedUrl: string
  /** Direct audio/video file URL */
  directUrl?: string
  youtubeId?: string
  soundsliceSlug?: string
  /** SoundSlice or YouTube embed URL */
  embedUrl?: string
}

const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac|webm)(\?|$)/i

function tryParseUrl(raw: string): URL | null {
  try {
    const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`
    return new URL(withProtocol)
  } catch {
    return null
  }
}

export function extractYouTubeId(url: URL): string | null {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.slice(1).split('/')[0] || null
  }
  if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
    if (url.pathname.startsWith('/embed/')) {
      return url.pathname.split('/')[2] ?? null
    }
    return url.searchParams.get('v')
  }
  return null
}

export function extractSoundSliceSlug(url: URL): string | null {
  if (!url.hostname.includes('soundslice.com')) return null
  const parts = url.pathname.split('/').filter(Boolean)
  const sliceIdx = parts.indexOf('slices')
  if (sliceIdx === -1 || !parts[sliceIdx + 1]) return null
  return parts[sliceIdx + 1]!
}

export function parseRecordingUrl(raw: string): ParsedRecordingUrl {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { type: 'unknown', normalizedUrl: '' }
  }

  const url = tryParseUrl(trimmed)
  if (!url) {
    return { type: 'unknown', normalizedUrl: trimmed }
  }

  const normalizedUrl = url.toString()

  const youtubeId = extractYouTubeId(url)
  if (youtubeId) {
    return {
      type: 'youtube',
      normalizedUrl,
      youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0`,
    }
  }

  const soundsliceSlug = extractSoundSliceSlug(url)
  if (soundsliceSlug) {
    return {
      type: 'soundslice',
      normalizedUrl,
      soundsliceSlug,
      embedUrl: `https://www.soundslice.com/slices/${soundsliceSlug}/embed/`,
    }
  }

  if (AUDIO_EXT.test(url.pathname)) {
    return { type: 'audio', normalizedUrl, directUrl: normalizedUrl }
  }

  return { type: 'unknown', normalizedUrl, directUrl: normalizedUrl }
}

export function buildSoundSliceEmbedUrl(slug: string, startSeconds?: number, loop = false): string {
  const base = `https://www.soundslice.com/slices/${slug}/embed/`
  const params = new URLSearchParams()
  if (startSeconds != null && startSeconds > 0) {
    params.set('top', String(Math.floor(startSeconds)))
  }
  if (loop) params.set('loop', '1')
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function recordingTypeLabel(type: RecordingSourceType): string {
  switch (type) {
    case 'audio':
      return 'Audio file'
    case 'youtube':
      return 'YouTube'
    case 'soundslice':
      return 'SoundSlice'
    default:
      return 'Link'
  }
}
