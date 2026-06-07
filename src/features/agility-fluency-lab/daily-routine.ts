/**
 * Daily Agility & Fluency — same 20-min routine every day, any piano.
 */

export type DailyPattern = 'scales' | 'arpeggios' | 'chromatic' | 'bebop'

const PATTERNS: Record<DailyPattern, { name: string; work: string }> = {
  scales: {
    name: 'Scales',
    work: 'Major + harmonic minor, 2 octaves HT — legato then swing 8ths in your key cluster',
  },
  arpeggios: {
    name: 'Arpeggios',
    work: 'Dom7 + maj7 root position — 2 octaves, even tone, relaxed wrist',
  },
  chromatic: {
    name: 'Chromatic',
    work: 'Chromatic scale 2 octaves HT — pp to mf, focus evenness not speed',
  },
  bebop: {
    name: 'Bebop',
    work: 'Dominant bebop scale up/down — swing feel, sing the passing tone',
  },
}

export function getDailyPattern(date = new Date()): DailyPattern {
  const map: DailyPattern[] = ['scales', 'arpeggios', 'chromatic', 'bebop', 'scales', 'arpeggios', 'chromatic']
  return map[date.getDay()] ?? 'scales'
}

export function getDailyAgilityFluencySteps(keyCluster: string[], date = new Date()) {
  const pattern = getDailyPattern(date)
  const { name, work } = PATTERNS[pattern]

  return {
    patternName: name,
    steps: [
      `Quick touch check (2 min): 5 pp notes low → high on this piano. Feel the action.`,
      `Fluency — ${name} (10 min): ${work}. Keys: ${keyCluster}. Stop if tension builds.`,
      `Agility burst (5 min): chromatic double-3rds OR finger-independence (hold 4th, run 1-2-3-5). Pick one.`,
      `Log peak clean BPM for today's ${name.toLowerCase()} in Session Notes.`,
    ],
    tips: [
      'Same routine daily — pattern rotates by weekday (Mon scales, Tue arpeggios, Wed chromatic, Thu bebop).',
      '+2 BPM next time only after 3 clean passes at current tempo.',
    ],
  }
}
