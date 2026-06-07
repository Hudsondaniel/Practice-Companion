import { describe, expect, it } from 'vitest'
import { extractYouTubeId, parseRecordingUrl } from '@/lib/recording-url'

describe('parseRecordingUrl', () => {
  it('detects YouTube watch URLs', () => {
    const result = parseRecordingUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(result.type).toBe('youtube')
    expect(result.youtubeId).toBe('dQw4w9WgXcQ')
  })

  it('detects youtu.be URLs', () => {
    const result = parseRecordingUrl('https://youtu.be/abc123XYZ')
    expect(result.type).toBe('youtube')
    expect(result.youtubeId).toBe('abc123XYZ')
  })

  it('detects SoundSlice URLs', () => {
    const result = parseRecordingUrl('https://www.soundslice.com/slices/TeXc/')
    expect(result.type).toBe('soundslice')
    expect(result.soundsliceSlug).toBe('TeXc')
    expect(result.embedUrl).toContain('/embed/')
  })

  it('detects direct audio files', () => {
    const result = parseRecordingUrl('https://example.com/take.mp3')
    expect(result.type).toBe('audio')
    expect(result.directUrl).toContain('.mp3')
  })
})

describe('extractYouTubeId', () => {
  it('reads v param from youtube.com', () => {
    const url = new URL('https://www.youtube.com/watch?v=test123')
    expect(extractYouTubeId(url)).toBe('test123')
  })
})
