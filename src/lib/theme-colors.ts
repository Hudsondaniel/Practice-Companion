import { resolveTheme, useUIStore } from '@/stores/ui-store'

/** WaveSurfer canvas cannot read CSS variables — resolve to hex at runtime */
export function getWaveformColors(): {
  waveColor: string
  progressColor: string
  cursorColor: string
} {
  const isLight = resolveTheme(useUIStore.getState().theme) === 'light'
  if (isLight) {
    return {
      waveColor: '#9a7b1a',
      progressColor: '#5c4a12',
      cursorColor: '#1a1a1f',
    }
  }
  return {
    waveColor: '#c9a227',
    progressColor: '#f4e4a6',
    cursorColor: '#f4f4f5',
  }
}
