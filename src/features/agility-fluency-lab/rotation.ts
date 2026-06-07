/**
 * Agility & Fluency Lab — portable technique block for ANY piano.
 *
 * Grounded in:
 * - Variable practice / transfer (Schmidt & Lee): calibrating on unfamiliar actions builds robust motor programs
 * - Williamon (musical excellence): brief warm-up calibration before demanding work
 * - Kochevitsky: velocity through relaxation, not force — evenness before speed
 * - Peterson/Harris pedagogy: rhythmic cells + bebop scales for jazz fluency
 * - Dohnányi/Hanon selective use: finger independence without mindless repetition
 */

export type FluencyCircuitWeek = 1 | 2 | 3 | 4

export interface FluencyCircuit {
  week: FluencyCircuitWeek
  name: string
  pattern: string
  keys: string
  reps: string[]
}

export interface AgilityDrill {
  id: string
  name: string
  durationMinutes: number
  instructions: string[]
  focus: 'independence' | 'rotation' | 'velocity' | 'coordination'
}

const FLUENCY_CIRCUITS: FluencyCircuit[] = [
  {
    week: 1,
    name: 'Diatonic Scale Circuit',
    pattern: 'Major + harmonic minor, 2 octaves, hands together',
    keys: 'Identity cluster + one neighbor',
    reps: [
      'Legato quarter notes — listen for even tone across registers',
      'Swing 8ths — light wrist, accent beat 2 and 4',
      'Crescendo up / diminuendo down — one octave',
      'Eyes closed — 1 slow pass per key',
    ],
  },
  {
    week: 2,
    name: 'Seventh Arpeggio Circuit',
    pattern: 'Maj7, dom7, min7 — root position and 1st inversion',
    keys: 'Circle of 4ths from home key',
    reps: [
      'Slow legato — voice-leading smooth, no pedal gaps',
      'Detached staccato — forearm release between notes',
      'Cross-hand arpeggio (L-R alternate) — 2 octaves',
      'Metronome +4 BPM only if 3 clean passes at current tempo',
    ],
  },
  {
    week: 3,
    name: 'Bebop & Chromatic Circuit',
    pattern: 'Dominant bebop scale + chromatic approach tones',
    keys: 'Gig keys: Bb, Eb, F',
    reps: [
      'Bebop dominant ascending/descending — swing feel',
      'Chromatic enclosure into chord tone — 1 bar cells',
      'Displace rhythm: start on & of 1, then & of 2',
      'Sing top note while playing — Peterson ear training',
    ],
  },
  {
    week: 4,
    name: 'Peterson Rhythmic Cell Circuit',
    pattern: '4-note Oscar Peterson cells — syncopated accent patterns',
    keys: 'Original transcription key + 2 neighbors',
    reps: [
      'Cell at quarter = 60 — memorize fingering',
      'Transpose cell up a half step without stopping',
      'Accent pattern: LONG-short-short-short',
      'Chain 2 cells into 2-bar phrase — no rush',
    ],
  },
]

const AGILITY_DRILLS_IDENTITY: AgilityDrill[] = [
  {
    id: 'double-thirds',
    name: 'Double-Note Bursts',
    durationMinutes: 2,
    focus: 'velocity',
    instructions: [
      'Chromatics in 3rds (or 6ths) — 2 bars forte, 2 bars piano',
      'Keep wrist floating — no pressing into keybed',
      'Identity keys only — depth over range',
    ],
  },
  {
    id: 'finger-independence',
    name: 'Finger Independence Hold',
    durationMinutes: 2,
    focus: 'independence',
    instructions: [
      'Hold 4th finger on any key — run 1-2-3-5 pattern in other fingers',
      'Switch: hold thumb, run 4-3-2-4',
      'Bach invention mindset — quiet held note, articulate moving fingers',
    ],
  },
  {
    id: 'octave-rotation',
    name: 'Octave Rotation / Repeated Notes',
    durationMinutes: 2,
    focus: 'rotation',
    instructions: [
      'Single-finger repeated notes — wrist rotation, not arm pump',
      'OR staccato octaves — rotate forearm, release between pairs',
      'Stop at first tension spike — reset shoulders',
    ],
  },
  {
    id: 'alberti-burst',
    name: 'Alberti / Broken Chord Burst',
    durationMinutes: 1,
    focus: 'coordination',
    instructions: [
      'Quick Alberti pattern in one position — even tone',
      'Move chromatically up 4 steps, back down',
      'Final pass: accent every 4th note',
    ],
  },
]

const AGILITY_DRILLS_EXPANSION: AgilityDrill[] = [
  {
    id: 'cross-hand',
    name: 'Cross-Hand Broken Octaves',
    durationMinutes: 2,
    focus: 'coordination',
    instructions: [
      'L-R broken octaves spanning 2+ octaves — no pedal',
      'Transpose to distant key (± whole step or more)',
      'Test transfer: can you keep evenness on unfamiliar register?',
    ],
  },
  {
    id: 'trill-evenness',
    name: 'Trill / Tremolo Evenness',
    durationMinutes: 2,
    focus: 'velocity',
    instructions: [
      'Slow trill 3-2 or 4-3 — even tone, relaxed hand',
      'Gradually narrow interval to semitone trill for 4 beats',
      'Stop while still clean — do not chase speed today',
    ],
  },
  {
    id: 'forearm-release',
    name: 'Forearm Release Drops',
    durationMinutes: 2,
    focus: 'rotation',
    instructions: [
      'Arm weight into single chord — immediate release (no hold)',
      'Repeat in 3 registers: bass, middle, treble',
      'Adapt to THIS piano\'s action — heavier or lighter touch',
    ],
  },
  {
    id: 'contrary-motion',
    name: 'Contrary Motion Scales',
    durationMinutes: 1,
    focus: 'independence',
    instructions: [
      'Hands in contrary motion — 1 octave, then 2',
      'Use distant key from identity cluster',
      'Final: one hand legato, one staccato',
    ],
  },
]

export function getFluencyCircuitForWeek(weekOfMonth: number): FluencyCircuit {
  const week = (((Math.ceil(weekOfMonth / 7) - 1) % 4) + 1) as FluencyCircuitWeek
  return FLUENCY_CIRCUITS.find((c) => c.week === week) ?? FLUENCY_CIRCUITS[0]!
}

export function getAgilityDrills(dayType: 'identity' | 'expansion' | 'review'): AgilityDrill[] {
  if (dayType === 'expansion') return AGILITY_DRILLS_EXPANSION
  return AGILITY_DRILLS_IDENTITY
}

export function getWeekOfMonth(date = new Date()): number {
  return date.getDate()
}
