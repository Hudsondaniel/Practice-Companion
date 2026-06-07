import * as Tone from 'tone'

export type MetronomeSound = 'click' | 'wood' | 'beep' | 'rim' | 'accent'
export type MetronomeSubdivision = 'quarter' | 'eighth' | 'triplet'

export interface MetronomeConfig {
  bpm: number
  sound: MetronomeSound
  beatsPerMeasure: number
  subdivision: MetronomeSubdivision
  volume: number
  countInBars: number
}

export const METRONOME_SOUNDS: { id: MetronomeSound; label: string }[] = [
  { id: 'click', label: 'Click' },
  { id: 'wood', label: 'Wood block' },
  { id: 'beep', label: 'Beep' },
  { id: 'rim', label: 'Rimshot' },
  { id: 'accent', label: 'Accent downbeat' },
]

export const TIME_SIGNATURES = [
  { beats: 2, label: '2/4' },
  { beats: 3, label: '3/4' },
  { beats: 4, label: '4/4' },
  { beats: 5, label: '5/4' },
  { beats: 6, label: '6/8' },
  { beats: 7, label: '7/4' },
]

let metronomeLoop: Tone.Loop | null = null
let metronomeSynth: Tone.ToneAudioNode | null = null
let volumeNode: Tone.Volume | null = null
let beatCount = 0
let currentConfig: MetronomeConfig | null = null

function subdivisionInterval(sub: MetronomeSubdivision): string {
  if (sub === 'eighth') return '8n'
  if (sub === 'triplet') return '8t'
  return '4n'
}

function createSynth(sound: MetronomeSound): Tone.ToneAudioNode {
  switch (sound) {
    case 'wood':
      return new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
      })
    case 'beep':
      return new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      })
    case 'rim':
      return new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.02, sustain: 0 },
      })
    case 'accent':
      return new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.06, sustain: 0 },
      })
    case 'click':
    default:
      return new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
      })
  }
}

function triggerBeat(synth: Tone.ToneAudioNode, sound: MetronomeSound, time: number, isDownbeat: boolean) {
  if (sound === 'accent') {
    ;(synth as Tone.Synth).triggerAttackRelease(isDownbeat ? 'G4' : 'C4', '32n', time)
    return
  }
  if (sound === 'beep') {
    ;(synth as Tone.Synth).triggerAttackRelease(isDownbeat ? 'A5' : 'E5', '32n', time)
    return
  }
  if (sound === 'wood') {
    ;(synth as Tone.MembraneSynth).triggerAttackRelease(isDownbeat ? 'G2' : 'C3', '32n', time)
    return
  }
  if (sound === 'rim') {
    ;(synth as Tone.NoiseSynth).triggerAttackRelease('32n', time)
    return
  }
  ;(synth as Tone.MembraneSynth).triggerAttackRelease(isDownbeat ? 'E2' : 'C2', '32n', time)
}

async function playCountIn(config: MetronomeConfig) {
  if (config.countInBars <= 0) return
  const synth = createSynth(config.sound)
  const vol = new Tone.Volume(Tone.gainToDb(config.volume)).toDestination()
  synth.connect(vol)

  const beatsTotal = config.countInBars * config.beatsPerMeasure
  const interval = subdivisionInterval(config.subdivision)
  await Tone.start()

  return new Promise<void>((resolve) => {
    let count = 0
    const loop = new Tone.Loop((time) => {
      const isDownbeat = count % config.beatsPerMeasure === 0
      triggerBeat(synth, config.sound, time, isDownbeat)
      count++
      if (count >= beatsTotal) {
        loop.stop()
        loop.dispose()
        synth.dispose()
        vol.dispose()
        resolve()
      }
    }, interval)
    Tone.getTransport().bpm.value = config.bpm
    loop.start(0)
    Tone.getTransport().start()
  })
}

export async function startMetronome(config: MetronomeConfig) {
  await Tone.start()
  stopMetronome()
  currentConfig = config

  if (config.countInBars > 0) {
    Tone.getTransport().stop()
    await playCountIn(config)
  }

  metronomeSynth = createSynth(config.sound)
  volumeNode = new Tone.Volume(Tone.gainToDb(config.volume)).toDestination()
  metronomeSynth.connect(volumeNode)
  beatCount = 0

  const interval = subdivisionInterval(config.subdivision)
  metronomeLoop = new Tone.Loop((time) => {
    const isDownbeat = beatCount % config.beatsPerMeasure === 0
    triggerBeat(metronomeSynth!, config.sound, time, isDownbeat)
    beatCount++
  }, interval)

  Tone.getTransport().bpm.value = config.bpm
  metronomeLoop.start(0)
  Tone.getTransport().start()
}

export function stopMetronome() {
  metronomeLoop?.stop()
  metronomeLoop?.dispose()
  metronomeLoop = null
  if (metronomeSynth && 'dispose' in metronomeSynth) metronomeSynth.dispose()
  if (volumeNode) volumeNode.dispose()
  metronomeSynth = null
  volumeNode = null
  Tone.getTransport().stop()
  beatCount = 0
  currentConfig = null
}

export function setMetronomeBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm
  if (currentConfig) currentConfig.bpm = bpm
}

export function isMetronomeRunning(): boolean {
  return metronomeLoop !== null
}

/** Tap tempo: pass timestamps (ms), returns median BPM for last 4 taps */
export function calculateTapTempo(tapTimes: number[]): number | null {
  if (tapTimes.length < 2) return null
  const intervals: number[] = []
  for (let i = 1; i < tapTimes.length; i++) {
    intervals.push(tapTimes[i]! - tapTimes[i - 1]!)
  }
  intervals.sort((a, b) => a - b)
  const median = intervals[Math.floor(intervals.length / 2)]!
  return Math.round(60000 / median)
}
