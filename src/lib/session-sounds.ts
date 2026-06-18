import * as Tone from 'tone'

let stepSynth: Tone.Synth | null = null
let phaseSynth: Tone.Synth | null = null

async function ensureAudio(): Promise<void> {
  if (Tone.getContext().state !== 'running') {
    await Tone.start()
  }
}

export async function playStepCompleteSound(): Promise<void> {
  try {
    await ensureAudio()
    if (!stepSynth) {
      stepSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
      }).toDestination()
    }
    stepSynth.volume.value = -14
    stepSynth.triggerAttackRelease('E5', '16n')
  } catch {
    // Audio may be blocked until user gesture — fail silently
  }
}

export async function playPhaseCompleteSound(): Promise<void> {
  try {
    await ensureAudio()
    if (!phaseSynth) {
      phaseSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.05, release: 0.15 },
      }).toDestination()
    }
    phaseSynth.volume.value = -12
    const now = Tone.now()
    phaseSynth.triggerAttackRelease('G4', '8n', now)
    phaseSynth.triggerAttackRelease('C5', '8n', now + 0.15)
  } catch {
    // Audio may be blocked until user gesture — fail silently
  }
}
