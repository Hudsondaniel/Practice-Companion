import type { StepPedagogy } from '@/types/practice-method'
import type { VocabularyStepTemplate, WeekModule } from '@/features/vocabulary-lab/types'

function pedagogy(p: StepPedagogy): StepPedagogy {
  return p
}

function standardArc(
  hear: Omit<VocabularyStepTemplate, 'kind' | 'durationSeconds'> & { durationSeconds?: number },
  sing: Omit<VocabularyStepTemplate, 'kind' | 'durationSeconds'> & { durationSeconds?: number },
  call: Omit<VocabularyStepTemplate, 'kind' | 'durationSeconds'> & { durationSeconds?: number },
  motif: Omit<VocabularyStepTemplate, 'kind' | 'durationSeconds'> & { durationSeconds?: number },
  deploy: Omit<VocabularyStepTemplate, 'kind' | 'durationSeconds'> & { durationSeconds?: number },
  integrate: Omit<VocabularyStepTemplate, 'kind' | 'durationSeconds'> & { durationSeconds?: number },
): VocabularyStepTemplate[] {
  const STANDARD_DURATIONS = [240, 240, 300, 300, 300, 120] as const
  const kinds: VocabularyStepTemplate['kind'][] = [
    'hear',
    'sing',
    'call-response',
    'motif',
    'deploy',
    'integrate',
  ]
  const items = [hear, sing, call, motif, deploy, integrate]
  return items.map((item, i) => ({
    kind: kinds[i]!,
    summary: item.summary,
    detail: item.detail,
    example: item.example,
    durationSeconds: item.durationSeconds ?? STANDARD_DURATIONS[i]!,
    pedagogy: item.pedagogy,
  }))
}

export const LEVEL_1_WEEKS: WeekModule[] = [
  {
    week: 1,
    pillar: 'pentatonic',
    title: 'Minor pentatonic as melodic identity',
    objective: 'Hear and speak minor pentatonic as a melodic dialect — not a scale shape',
    integrationThread: 'Foundation week — no prior integration',
    isFusionWeek: false,
    heroRefs: 'Cory Henry, Anomalie',
    steps: standardArc(
      {
        summary: 'Sound immersion — minor pentatonic color',
        detail:
          'Play a minor pentatonic line from Cory Henry or Anomalie on a i–IV–i loop in {home}. Do not analyze — only notice interval shape, space, and repetition.',
        pedagogy: pedagogy({
          why: 'Your ear must own the sound before your hands manufacture it',
          skill: 'Auditory template for minor pentatonic character',
          masters: 'Cory Henry (gospel shout peaks); Anomalie (sparse hooks)',
          listenFor: 'Which notes repeat? Where is the rest?',
          measure: 'You can hum the contour after one listen without guessing notes',
        }),
      },
      {
        summary: 'Sing the sound — minor pentatonic cell',
        detail:
          'On one minor chord in {home}, sing a 3-note minor pent cell (1–b3–4 or 1–4–5). Repeat 6× with one changing variable: louder, softer, or longer notes.',
        pedagogy: pedagogy({
          why: 'Singing installs pitch before motor habit',
          skill: 'Intervallic audiation and phrasing intention',
          masters: 'Gospel shout leaders; Brecker singing lines before playing',
          listenFor: 'Does it sound like speech or like an exercise?',
          measure: 'Cell feels natural sung in time with a metronome at 60',
        }),
      },
      {
        summary: 'Call & response — sing then answer',
        detail:
          'Sing a 2-bar “question” using only minor pent tones. Answer on piano with the same rhythm, different register. Trade 4 times in {home}.',
        pedagogy: pedagogy({
          why: 'Dialogue is how improvisers think in real time',
          skill: 'Call-and-response phrasing',
          masters: 'Molina (fire + precision); Henry (repetition with insistence)',
          listenFor: 'Does the answer feel like a reply, not a new idea?',
          measure: '4 clean exchanges without losing rhythmic placement',
        }),
      },
      {
        summary: 'Motif extraction — 2-bar minor pent cell',
        detail:
          'Compose one 2-bar minor pent motif in {home}. Mutate rhythm 3 ways: straight quarters, swing 8ths, syncopated accent on beat 4. Do not add notes.',
        pedagogy: pedagogy({
          why: 'Vocabulary lives in cells, not scale runs',
          skill: 'Motif development through rhythm alone',
          masters: 'Anomalie (loop-based development); Henry (rhythmic insistence)',
          listenFor: 'Is the cell still recognizable after each mutation?',
          measure: '3 rhythmic variants without losing identity',
        }),
      },
      {
        summary: 'Harmonic deployment — minor pent on i',
        detail:
          'On a 4-bar minor loop in {keys}, place your motif on beats 1 and 3 only. Leave bar 2 empty. Depth over density.',
        pedagogy: pedagogy({
          why: 'Language must survive real harmonic time',
          skill: 'Placement and space on a static minor color',
          masters: 'Gospel minor pent chants; fusion ballad hooks',
          listenFor: 'Does silence make the next entrance stronger?',
          measure: 'Motif lands on time 4/4 times without filling every bar',
        }),
      },
      {
        summary: 'Tri-sound touch — minor pent only',
        detail:
          'One bar minor pent statement in {home}. Rest one bar. Repeat with exaggerated dynamics (pp then mf). Save blues and altered for later weeks.',
        pedagogy: pedagogy({
          why: 'Integration starts with confident single-color statements',
          skill: 'Character and dynamics as vocabulary',
          masters: 'Anomalie (space); Henry (dynamic shout)',
          listenFor: 'Does one bar feel complete, not unfinished?',
          measure: 'A listener could name “minor pentatonic” without you saying it',
        }),
      },
    ),
  },
  {
    week: 2,
    pillar: 'pentatonic',
    title: 'Major pentatonic + pair switching',
    objective: 'Switch major/minor pentatonic pairs without losing melodic thread',
    integrationThread: 'Week 1 minor cell returns in bar 4 of each phrase',
    isFusionWeek: false,
    heroRefs: 'Cory Henry, gospel IV moves',
    steps: standardArc(
      {
        summary: 'Hear major pentatonic on IV',
        detail:
          'Listen to major pentatonic color on IV in gospel or fusion (Henry on church tunes). Loop I–IV in {home}. Hum the major pent lift on IV.',
        pedagogy: pedagogy({
          why: 'Major pent is a different dialect from minor — ear first',
          skill: 'Hearing major pent harmonic function',
          masters: 'Cory Henry (IV shout); modern gospel keyboardists',
          listenFor: 'Brightness vs minor pent — where does the lift happen?',
          measure: 'You predict the IV entrance by ear on the loop',
        }),
      },
      {
        summary: 'Sing major/minor pair',
        detail:
          'Sing minor pent on i (2 bars), major pent on IV (2 bars) in {home}. No piano yet. Keep the same rhythmic cell across both.',
        pedagogy: pedagogy({
          why: 'Pair switching is core gospel-fusion vocabulary',
          skill: 'Timbre and interval shift without losing rhythm',
          masters: 'Gospel cadence language; Anomalie major hooks',
          listenFor: 'Does rhythm connect the two colors?',
          measure: 'Clean sung pair 3× without pitch drift',
        }),
      },
      {
        summary: 'Call & response across colors',
        detail:
          'Sing minor pent question → play major pent answer on IV. Reverse. 4 trades in {keys}.',
        pedagogy: pedagogy({
          why: 'Improvisation is dialogue between harmonic colors',
          skill: 'Major/minor pent call-and-response',
          masters: 'Henry (IV peaks); Molina (pair switching)',
          listenFor: 'Does IV feel like a response to i?',
          measure: '4 pairs with clear harmonic destination',
        }),
      },
      {
        summary: 'Motif — week 1 cell in bar 4',
        detail:
          'Take your week 1 minor pent cell. Place it in bar 4 of a 4-bar phrase. Bars 1–3: major pent setup in {home}.',
        pedagogy: pedagogy({
          why: 'Spiral curriculum — old cells return in new contexts',
          skill: 'Motif recall + major/minor framing',
          masters: 'Compositional improv (Potter); gospel phrase design',
          listenFor: 'Does bar 4 feel like payoff?',
          measure: 'Week 1 cell recognizable inside major frame',
        }),
      },
      {
        summary: 'Deploy on I–IV–I',
        detail:
          'Improvise 8 bars: major pent on IV, minor pent on i. Use only two motifs total. Keys: {keys}.',
        pedagogy: pedagogy({
          why: 'Deployment beats pattern memorization',
          skill: 'Harmonic routing with pentatonic pairs',
          masters: 'Gospel service playing; Cory Henry shout architecture',
          listenFor: 'Are you selecting notes or running shapes?',
          measure: '8 bars with max 2 motifs, clear I vs IV color',
        }),
      },
      {
        summary: 'Tri-sound touch — pentatonic only',
        detail:
          'Bar 1: minor pent. Bar 2: major pent. Bar 3: rest. Bar 4: week 1 cell. {home}.',
        pedagogy: pedagogy({
          why: 'Short form trains memory and pacing',
          skill: 'Micro-structure integration',
          masters: 'Anomalie (loop architecture)',
          listenFor: 'Does the phrase feel like one sentence?',
          measure: 'Complete 4-bar arc without filler notes',
        }),
      },
    ),
  },
  {
    week: 3,
    pillar: 'pentatonic',
    title: 'Pentatonic over changes',
    objective: 'Select pentatonic notes over ii–V–I — no running the scale',
    integrationThread: 'Weeks 1–2 cells appear at chord changes',
    isFusionWeek: false,
    heroRefs: 'Chris Potter, Anomalie',
    steps: standardArc(
      {
        summary: 'Hear pentatonic selection on ii–V–I',
        detail:
          'Listen to Potter or Anomalie on ii–V–I in {home}. Mark where they rest vs play. Do not name scales — mark moments of arrival.',
        pedagogy: pedagogy({
          why: 'Advanced players select, not traverse',
          skill: 'Hearing placement over harmonic rhythm',
          masters: 'Chris Potter (line economy); Anomalie (hook placement)',
          listenFor: 'Chord change = new sentence or continuation?',
          measure: 'You can point to 3 arrival moments per chorus',
        }),
      },
      {
        summary: 'Sing pentatonic targets on ii–V–I',
        detail:
          'Sing one target tone per bar on ii–V–I in {home}: bar 1 chord tone, bar 2 tension, bar 3 resolution. Pentatonic subset only.',
        pedagogy: pedagogy({
          why: 'Singing harmonic targets prevents note spam',
          skill: 'Voice-leading by ear with pentatonic subset',
          masters: 'Potter guide-tone melody; gospel resolution sings',
          listenFor: 'Does each bar have one clear pitch goal?',
          measure: '3-bar sung chain matches harmony 4/4 times',
        }),
      },
      {
        summary: 'Call & response on changes',
        detail:
          'Play 2-bar ii–V on piano. Sing pent response. Trade 4× in {keys}. Keep responses to 4 notes max.',
        pedagogy: pedagogy({
          why: 'Constraint builds language',
          skill: 'Short pent phrases over moving harmony',
          masters: 'Brecker (density control); Potter (fewer notes, more meaning)',
          listenFor: 'Do phrases end or wander?',
          measure: 'Each response ≤4 notes, lands on strong beat',
        }),
      },
      {
        summary: 'Motif at chord changes',
        detail:
          'Use week 1 cell at bar 3 of ii–V–I. Use week 2 major cell on IV if reharmonized. Mutate rhythm only.',
        pedagogy: pedagogy({
          why: 'Motifs anchor you when harmony moves',
          skill: 'Motif placement at cadence points',
          masters: 'Motivic jazz (Coltrane); gospel turnarounds',
          listenFor: 'Does motif appear because of harmony, not habit?',
          measure: 'Cell hits bar 3 of V–I 3× cleanly',
        }),
      },
      {
        summary: 'Deploy on {tune} or ii–V–I',
        detail:
          '8 bars pentatonic improvisation on ii–V–I or one section of {tune}. Max 6 notes per bar. {keys}.',
        pedagogy: pedagogy({
          why: 'Repertoire is the test lab',
          skill: 'Pentatonic deployment on real form',
          masters: 'Working jazz musicians on standards',
          listenFor: 'Silence as part of the line',
          measure: '8 bars without scalar running; clear cadences',
        }),
      },
      {
        summary: 'Tri-sound touch — pentatonic thread',
        detail:
          '4 bars: minor pent (i) → major pent (IV) → rest → cell at ii–V arrival. {home}.',
        pedagogy: pedagogy({
          why: 'Rehearses full pentatonic toolkit in miniature',
          skill: 'Integrated pentatonic narrative',
          masters: 'Henry; Anomalie',
          listenFor: 'One story across 4 bars?',
          measure: 'Listener hears harmonic intent without chords explained',
        }),
      },
    ),
  },
  {
    week: 4,
    pillar: 'pentatonic',
    title: 'Fusion solo — pentatonic architecture',
    objective: 'Build a full pentatonic solo with blues accent and one outside passing tone',
    integrationThread: 'Tri-sound preview: pent + blues inflection + single altered passing tone',
    isFusionWeek: true,
    heroRefs: 'Cory Henry, Michael Brecker',
    steps: standardArc(
      {
        summary: 'Hear pentatonic solo architecture',
        detail:
          'Study one Henry or Brecker chorus: identify A section (statement), B (tension), return. Map pentatonic skeleton only.',
        pedagogy: pedagogy({
          why: 'Form awareness separates pros from noodlers',
          skill: 'Macro solo architecture',
          masters: 'Brecker (drama); Henry (gospel arc)',
          listenFor: 'Where is the peak? Where is the release?',
          measure: 'Sketch A–B–A in 8 bars without playing',
        }),
      },
      {
        summary: 'Sing your solo arc',
        detail:
          'Sing 8-bar arc in {home}: simple pent statement → repeat with blues inflection on one note → return. No piano.',
        pedagogy: pedagogy({
          why: 'Composing by ear precedes fluent improvisation',
          skill: 'Melodic form singing',
          masters: 'Singing improvisers (Brecker, Potter)',
          listenFor: 'Does bar 5–6 feel like development, not new material?',
          measure: '8-bar sung arc with one clear peak',
        }),
      },
      {
        summary: 'Call & response — full chorus sketch',
        detail:
          'Record 4-bar “mentor” phrase from a hero clip. Answer with your pent arc. Trade 2×.',
        pedagogy: pedagogy({
          why: 'Hero dialogue accelerates personal dialect',
          skill: 'Transcription-level response without copying notes',
          masters: 'Your Language Acquisition hero of the week',
          listenFor: 'Rhythmic DNA shared, pitches yours',
          measure: '2 responses feel related but not plagiarized',
        }),
      },
      {
        summary: 'Motif fusion — pent + blues inflection',
        detail:
          'One 2-bar pent motif. Add blues inflection on beat 4 only. One passing altered tone allowed on bar 2. Mutate 3×.',
        pedagogy: pedagogy({
          why: 'Fusion week previews next sound families',
          skill: 'Controlled blues/altered color inside pent frame',
          masters: 'Brecker blues gravity; Henry shout',
          listenFor: 'Do extra colors sound intentional?',
          measure: '3 variants — blues inflection audible each time',
        }),
      },
      {
        summary: 'Deploy — full pentatonic solo',
        detail:
          '12-bar solo on {tune} or blues in {keys}. Form: A pent statement, B development, A return. Record it.',
        pedagogy: pedagogy({
          why: 'Performance consolidates the month of pentatonic work',
          skill: 'Extended pentatonic improvisation',
          masters: 'Your composite of Henry + Anomalie + Potter',
          listenFor: 'Scalar running = stop and sing the next phrase',
          measure: '12 bars with identifiable form; record for review',
        }),
      },
      {
        summary: 'Tri-sound preview',
        detail:
          'Bar 1 pent. Bar 2 blues inflection. Bar 3 one outside passing tone returning home. Bar 4 gospel resolution. {home}.',
        pedagogy: pedagogy({
          why: 'Prepares ears for blues and altered weeks',
          skill: 'Micro tri-sound integration',
          masters: 'Fusion gospel-jazz crossover',
          listenFor: 'Three colors, one sentence',
          measure: 'Rate motif clarity 1–5 in Session Notes',
        }),
      },
    ),
  },
  // Weeks 5-8: Blues
  {
    week: 5,
    pillar: 'blues',
    title: 'Blues as melodic tension',
    objective: 'Use blues notes as gravity toward chord tones — not a blues scale exercise',
    integrationThread: 'Pentatonic frame + blues accent on beat 4',
    isFusionWeek: false,
    heroRefs: 'Michael Brecker, Jesus Molina',
    steps: standardArc(
      {
        summary: 'Hear blues gravity',
        detail:
          'Listen to Brecker or Molina blues lines on a dominant in {home}. Mark b3, b5, b7 — notice they pull somewhere.',
        pedagogy: pedagogy({
          why: 'Blues is direction, not a scale bag',
          skill: 'Hearing blue-note resolution',
          masters: 'Brecker; Molina gospel-blues',
          listenFor: 'Does the blue note bend toward a chord tone?',
          measure: 'Hum 2 blues gestures after one chorus',
        }),
      },
      {
        summary: 'Sing blues approach tones',
        detail:
          'On V7 in {home}, sing b3 resolving to 3, b7 to 1. 4 slow reps. Then sing b5 as passing only.',
        pedagogy: pedagogy({
          why: 'Singing installs pull and release',
          skill: 'Blues inflection audiation',
          masters: 'Vocal blues tradition; Brecker singing',
          listenFor: 'Pull vs sit — does tension resolve?',
          measure: '4 clean sung resolutions',
        }),
      },
      {
        summary: 'Call & response — blues questions',
        detail:
          'Sing 1-bar blues “question” (ends on b7 or b3). Play 1-bar “answer” landing on chord tone. 4× in {keys}.',
        pedagogy: pedagogy({
          why: 'Blues is conversational',
          skill: 'Question-answer phrasing',
          masters: 'Molina; traditional call-and-response',
          listenFor: 'Question hangs; answer lands',
          measure: '4 Q&A pairs with clear tension/release',
        }),
      },
      {
        summary: 'Motif — blues accent on beat 4',
        detail:
          'Take a pentatonic motif from weeks 1–3. Add blues inflection on beat 4 only. 3 rhythmic mutations.',
        pedagogy: pedagogy({
          why: 'Vocabulary lives in cells, not scales',
          skill: 'Motif development + blues accent',
          masters: 'Brecker blues gravity; Molina gospel-blues accent',
          listenFor: 'Does the blue note pull or sit?',
          measure: 'Cell survives 3 rhythmic mutations with blues accent',
        }),
      },
      {
        summary: 'Deploy blues on dominant',
        detail:
          '8 bars on V7 → I in {keys}. Pent skeleton + blues accents. No blues scale runs.',
        pedagogy: pedagogy({
          why: 'Dominant is the blues home court',
          skill: 'Blues language on V7',
          masters: 'Brecker; Potter dominant language',
          listenFor: 'Every blue note goes somewhere',
          measure: '8 bars, zero mechanical blues scale runs',
        }),
      },
      {
        summary: 'Tri-sound — pent frame + blues',
        detail:
          'Bar 1–2 pent in {home}. Bar 3 blues inflection toward V. Bar 4 resolve. Pent returns.',
        pedagogy: pedagogy({
          why: 'Integration daily',
          skill: 'Pentatonic + blues layering',
          masters: 'Gospel-jazz blues inflection',
          listenFor: 'Blues sounds like spice, not new scale',
          measure: '4-bar arc with one unmistakable blues moment',
        }),
      },
    ),
  },
  {
    week: 6,
    pillar: 'blues',
    title: 'Blues phrasing — time, articulation, space',
    objective: 'Develop blues time feel and articulation like speech',
    integrationThread: 'Call/response with hero clip from Language Acquisition',
    isFusionWeek: false,
    heroRefs: 'Jesus Molina, Cory Henry',
    steps: standardArc(
      {
        summary: 'Hear blues time',
        detail:
          'Listen to Molina or Henry: notice behind-the-beat placement and articulation. Clap their rhythm without pitches.',
        pedagogy: pedagogy({
          why: 'Blues lives in time before notes',
          skill: 'Rhythmic transcription',
          masters: 'Molina; Henry; church blues feel',
          listenFor: 'Where do they lay back? Where attack?',
          measure: 'Clap 4-bar hero rhythm accurately',
        }),
      },
      {
        summary: 'Sing with blues articulation',
        detail:
          'Sing a 2-bar blues phrase in {home} with exaggerated lay-back on beat 4. Whisper the next bar.',
        pedagogy: pedagogy({
          why: 'Articulation is half the vocabulary',
          skill: 'Blues time singing',
          masters: 'Vocal blues; gospel moan',
          listenFor: 'Speech-like phrasing?',
          measure: '2 bars feel conversational, not metronomic',
        }),
      },
      {
        summary: 'Call & response with hero clip',
        detail:
          'Loop a hero phrase from your transcriptions. Respond with blues phrasing only — rhythm first, 4 notes max.',
        pedagogy: pedagogy({
          why: 'Connects Language Acquisition to Vocabulary Lab',
          skill: 'Hero dialogue with blues phrasing',
          masters: 'Your active transcription hero',
          listenFor: 'Rhythmic DNA shared with hero',
          measure: '4 responses without copying pitches',
        }),
      },
      {
        summary: 'Motif — rhythmic blues variation',
        detail:
          'One blues motif. Vary articulation: staccato, legato, accent pattern. Same 4 notes throughout.',
        pedagogy: pedagogy({
          why: 'Pros develop motifs through feel variables',
          skill: 'Articulation-based motif development',
          masters: 'Molina fire; Henry dynamics',
          listenFor: 'Same notes, different character each time?',
          measure: '3 articulation variants recognizable as same motif',
        }),
      },
      {
        summary: 'Deploy — blues feel on {tune}',
        detail:
          'One chorus section of {tune} in {keys}. Blues phrasing priority over note choice. Space counts.',
        pedagogy: pedagogy({
          why: 'Feel must survive repertoire',
          skill: 'Blues time in real tune',
          masters: 'Working gig musicians',
          listenFor: 'Would this feel good on a bandstand?',
          measure: 'One chorus with intentional space every 2 bars',
        }),
      },
      {
        summary: 'Tri-sound — blues speech',
        detail:
          'Pent bar → blues spoken phrase → rest → pent return. {home}.',
        pedagogy: pedagogy({
          why: 'Daily integration',
          skill: 'Blues as speech inside pent frame',
          masters: 'Gospel-blues continuum',
          listenFor: 'Blues bar sounds like talking',
          measure: 'Blues bar identifiable without scale reference',
        }),
      },
    ),
  },
  {
    week: 7,
    pillar: 'blues',
    title: 'Blues as harmonic implication',
    objective: 'Play the blues without playing the blues scale',
    integrationThread: 'Pentatonic skeleton + blues inflection only',
    isFusionWeek: false,
    heroRefs: 'Chris Potter, Michael Brecker',
    steps: standardArc(
      {
        summary: 'Hear implied blues',
        detail:
          'Find Potter/Brecker lines that sound bluesy but use few blue notes. Count actual blue notes per chorus.',
        pedagogy: pedagogy({
          why: 'Masters imply more than they state',
          skill: 'Hearing implied blues color',
          masters: 'Potter economy; Brecker implication',
          listenFor: 'Blues feel with minimal blue notes?',
          measure: 'Count ≤3 blue notes per 8 bars in hero chorus',
        }),
      },
      {
        summary: 'Sing implied blues',
        detail:
          'Sing pentatonic melody in {home}. Add blues inflection to one note per phrase only.',
        pedagogy: pedagogy({
          why: 'Constraint builds taste',
          skill: 'Minimal blues inflection',
          masters: 'Less-is-more jazz phrasing',
          listenFor: 'One spice note per phrase',
          measure: '4 phrases, exactly one inflection each',
        }),
      },
      {
        summary: 'Call & response — implication',
        detail:
          'Partner phrase: all pent. Your response: one blue note only. Trade 4×.',
        pedagogy: pedagogy({
          why: 'Trains precision of blues color',
          skill: 'Selective blues deployment',
          masters: 'Potter; modern fusion restraint',
          listenFor: 'Does one note change the color enough?',
          measure: '4 responses, one blue note each, all resolve',
        }),
      },
      {
        summary: 'Motif — pent skeleton, blues joint',
        detail:
          '2-bar pent motif. Blues inflection only on the connector note between bars.',
        pedagogy: pedagogy({
          why: 'Joints between ideas carry blues',
          skill: 'Structural blues placement',
          masters: 'Compositional blues use',
          listenFor: 'Blues on the glue, not every note',
          measure: 'Motif clear; blues only on bar connection',
        }),
      },
      {
        summary: 'Deploy — no blues scale allowed',
        detail:
          '8 bars on ii–V–I in {keys}. Pentatonic + max 2 blue notes per 4 bars. No blues scale runs.',
        pedagogy: pedagogy({
          why: 'Forces real language over pattern',
          skill: 'Implied blues improvisation',
          masters: 'Advanced jazz restraint',
          listenFor: 'Blues presence without blues scale shape',
          measure: '8 bars — zero consecutive blues scale fragments',
        }),
      },
      {
        summary: 'Tri-sound — implied blues',
        detail:
          'Pent → pent with one blue connector → rest → pent. {home}.',
        pedagogy: pedagogy({
          why: 'Integration',
          skill: 'Minimal blues in pent narrative',
          masters: 'Potter; Anomalie',
          listenFor: 'Blues implied, not announced',
          measure: 'Listener says “bluesy” — you used ≤2 blue notes',
        }),
      },
    ),
  },
  {
    week: 8,
    pillar: 'blues',
    title: 'Fusion solo — pentatonic + blues dialogue',
    objective: '12-bar solo with pent/blues dialogue; one altered approach tone',
    integrationThread: 'Introduce one altered passing tone on peak bar',
    isFusionWeek: true,
    heroRefs: 'Brecker, Molina, Henry',
    steps: standardArc(
      {
        summary: 'Hear pent/blues dialogue',
        detail:
          'Map one Brecker chorus: pent sections vs blues sections. Note one outside moment.',
        pedagogy: pedagogy({
          why: 'Fusion week demands architectural hearing',
          skill: 'Color dialogue mapping',
          masters: 'Brecker; Molina',
          listenFor: 'When does color switch — harmony or choice?',
          measure: 'Written map: pent bars vs blues bars',
        }),
      },
      {
        summary: 'Sing pent/blues dialogue',
        detail:
          'Sing 8 bars alternating pent and blues every 2 bars in {home}.',
        pedagogy: pedagogy({
          why: 'Singing the dialogue installs form',
          skill: 'Alternating color singing',
          masters: 'Gospel-jazz soloists',
          listenFor: 'Distinct characters every 2 bars',
          measure: '8 bars — listener can tell pent from blues by ear',
        }),
      },
      {
        summary: 'Call & response — dual color',
        detail:
          'Hero clip call (pent). Blues answer. Reverse. 2 cycles in {keys}.',
        pedagogy: pedagogy({
          why: 'Dialogue between colors is the skill',
          skill: 'Cross-color call-and-response',
          masters: 'Your heroes + your voice',
          listenFor: 'Answers change color, not just notes',
          measure: '2 full cycles with clear color contrast',
        }),
      },
      {
        summary: 'Motif — peak with altered approach',
        detail:
          'Build 2-bar blues motif. On peak repetition, add ONE altered approach tone resolving to pent.',
        pedagogy: pedagogy({
          why: 'Preview altered week inside fusion frame',
          skill: 'Single outside color with return',
          masters: 'Brecker peak lines; Henry shout-to-outside',
          listenFor: 'Outside note pulls home immediately',
          measure: '1 altered tone per peak — must resolve',
        }),
      },
      {
        summary: 'Deploy — 12-bar fusion solo',
        detail:
          '12 bars on {tune} or blues in {keys}. A pent, B blues, peak with one altered tone, return. Record.',
        pedagogy: pedagogy({
          why: 'Capstone of blues block',
          skill: 'Extended pent/blues solo',
          masters: 'Composite of month 2 work',
          listenFor: 'Three colors audible in one solo',
          measure: 'Record; rate motif clarity 1–5',
        }),
      },
      {
        summary: 'Tri-sound preview',
        detail:
          'Pent bar → blues bar → altered peak → gospel resolution. {home}.',
        pedagogy: pedagogy({
          why: 'Prepares full tri-sound capstone',
          skill: 'Micro A–B–C–A form',
          masters: 'Fusion gospel arc',
          listenFor: 'Return feels like home',
          measure: '4 bars — all three families touched',
        }),
      },
    ),
  },
  // Weeks 9-12: Altered
  {
    week: 9,
    pillar: 'altered',
    title: 'Melodic minor sound',
    objective: 'Hear melodic minor as color — not mode theory',
    integrationThread: 'Pent and blues in outer sections frame altered moment',
    isFusionWeek: false,
    heroRefs: 'Tigran Hamasyan, Anomalie',
    steps: standardArc(
      {
        summary: 'Hear melodic minor color',
        detail:
          'Listen to Tigran or fusion ballad V7→I in {home}. Hum the outside moment — ignore mode names.',
        pedagogy: pedagogy({
          why: 'Sound first, theory never drives the ear',
          skill: 'Melodic minor color recognition',
          masters: 'Tigran; Anomalie outside moments',
          listenFor: 'Brightness/tension vs pentatonic home',
          measure: 'Hum outside moment after 2 listens',
        }),
      },
      {
        summary: 'Sing melodic minor skeleton',
        detail:
          'On V7 in {home}, sing 3rd to 9th skeleton (4 notes max). Resolve to I. 4 reps slow.',
        pedagogy: pedagogy({
          why: 'Small cells beat scale runs',
          skill: 'Altered dominant singing',
          masters: 'Potter V7 language; Tigran color',
          listenFor: 'Tension → release audible in singing',
          measure: '4 clean V7→I sung gestures',
        }),
      },
      {
        summary: 'Call & response — outside/inside',
        detail:
          'Play inside pent 2 bars. Sing outside response 1 bar. Resolve. 3× in {keys}.',
        pedagogy: pedagogy({
          why: 'Outside only means something with inside frame',
          skill: 'Inside/outside dialogue',
          masters: 'Brecker; Potter',
          listenFor: 'Outside answers inside — not random',
          measure: '3 outside responses that resolve',
        }),
      },
      {
        summary: 'Motif — melodic minor cell',
        detail:
          '2-bar outside cell on V7. Mandatory resolve bar. Mutate rhythm 3 ways.',
        pedagogy: pedagogy({
          why: 'Outside must be a motif, not an accident',
          skill: 'Altered motif with return',
          masters: 'Tigran rhythmic displacement',
          listenFor: 'Outside cell recognizable after mutation',
          measure: '3 rhythmic variants + resolve each time',
        }),
      },
      {
        summary: 'Deploy — framed outside moment',
        detail:
          '8 bars on {tune}: bars 1–2 pent, 3–4 blues, 5–6 outside on V, 7–8 home.',
        pedagogy: pedagogy({
          why: 'Frame teaches when to use outside',
          skill: 'Framed altered deployment',
          masters: 'Fusion form players',
          listenFor: 'Outside bar 5–6 earned by setup',
          measure: '8-bar arc with clear outside section',
        }),
      },
      {
        summary: 'Tri-sound — outside frame',
        detail:
          'Pent → blues → melodic minor flash → pent return. {home}.',
        pedagogy: pedagogy({
          why: 'Daily tri-sound',
          skill: 'Three-family micro solo',
          masters: 'Henry→Potter arc miniature',
          listenFor: 'Outside flash < 1 bar',
          measure: 'Return to pent within 2 bars of outside',
        }),
      },
    ),
  },
  {
    week: 10,
    pillar: 'altered',
    title: 'Altered dominant as color on V7',
    objective: 'Side-slip into and out of key on dominant chords',
    integrationThread: 'Side-slip one bar on V7 in monthly tune',
    isFusionWeek: false,
    heroRefs: 'Chris Potter, Michael Brecker',
    steps: standardArc(
      {
        summary: 'Hear side-slip',
        detail:
          'Find Potter/Brecker moment: key slips one half-step and returns on V7. Mark slip and return timestamps.',
        pedagogy: pedagogy({
          why: 'Side-slip is a move, not a scale',
          skill: 'Hearing side-slip motion',
          masters: 'Potter; Brecker',
          listenFor: 'Moment of slip vs moment of return',
          measure: 'Identify slip/return in hero clip',
        }),
      },
      {
        summary: 'Sing side-slip',
        detail:
          'Sing in {home}. Slide entire phrase up ½ step for bar 2. Return bar 3. 3 reps.',
        pedagogy: pedagogy({
          why: 'Body learns slip as gesture',
          skill: 'Side-slip audiation',
          masters: 'Modern jazz side-slipping',
          listenFor: 'Whole phrase moves — not one wrong note',
          measure: '3 slip-return cycles sung cleanly',
        }),
      },
      {
        summary: 'Call & response — slip',
        detail:
          'Inside call 2 bars. Side-slip answer 1 bar. Return. 4× in {keys}.',
        pedagogy: pedagogy({
          why: 'Dialogue includes harmonic motion',
          skill: 'Side-slip call-and-response',
          masters: 'Potter modern language',
          listenFor: 'Slip feels like intentional travel',
          measure: '4 slips that return on time',
        }),
      },
      {
        summary: 'Motif — slip cell',
        detail:
          '2-bar motif. Version A: in key. Version B: same motif up ½ step. Version C: return.',
        pedagogy: pedagogy({
          why: 'Motif unity through side-slip',
          skill: 'Transposition by side-slip',
          masters: 'Tigran; Potter',
          listenFor: 'Same motif DNA in all three versions',
          measure: '3 versions — motif recognizable',
        }),
      },
      {
        summary: 'Deploy on V7 in {tune}',
        detail:
          'At each V7 in {tune} section, side-slip one bar then resolve. {keys}. Max 2 slips per chorus.',
        pedagogy: pedagogy({
          why: 'Tunes teach deployment points',
          skill: 'Side-slip on real dominants',
          masters: 'Gig-ready fusion players',
          listenFor: 'Slip at V7, not everywhere',
          measure: '2 slips per chorus, both resolve',
        }),
      },
      {
        summary: 'Tri-sound + slip',
        detail:
          'Pent → blues → side-slip peak → resolution. {home}.',
        pedagogy: pedagogy({
          why: 'Integration',
          skill: 'Slip as peak device',
          masters: 'Fusion peak architecture',
          listenFor: 'Slip is the climax',
          measure: '4-bar arc with slip as bar 3 peak',
        }),
      },
    ),
  },
  {
    week: 11,
    pillar: 'altered',
    title: 'Outside motion + return',
    objective: 'Henry shout → Potter outside → gospel resolution',
    integrationThread: 'Full narrative arc in 8 bars',
    isFusionWeek: false,
    heroRefs: 'Cory Henry, Chris Potter, Tigran',
    steps: standardArc(
      {
        summary: 'Hear outside narrative',
        detail:
          'Study Henry shout → Potter outside → gospel resolve in one performance. Draw 3-box map.',
        pedagogy: pedagogy({
          why: 'Narrative is how audiences experience fusion',
          skill: 'Outside narrative mapping',
          masters: 'Henry; Potter; gospel resolve',
          listenFor: 'Emotional arc: statement → tension → home',
          measure: '3-box map matches hero performance',
        }),
      },
      {
        summary: 'Sing the narrative',
        detail:
          'Sing 8 bars: pent shout → outside tension → blues inflection → home in {home}.',
        pedagogy: pedagogy({
          why: 'Singing the arc installs drama',
          skill: 'Narrative singing',
          masters: 'Gospel-fusion storytellers',
          listenFor: 'Peak in bar 5–6?',
          measure: '8-bar sung arc with clear peak',
        }),
      },
      {
        summary: 'Call & response — narrative',
        detail:
          'Hero clip = call. Your 4-bar answer completes the narrative (outside → home). 2×.',
        pedagogy: pedagogy({
          why: 'Storytelling in dialogue',
          skill: 'Narrative response',
          masters: 'Your transcription heroes',
          listenFor: 'Answer completes the story',
          measure: '2 narratives with resolution',
        }),
      },
      {
        summary: 'Motif — outside with mandatory return',
        detail:
          'Outside 2-bar cell MUST include note that resolves to chord tone of I. Mutate 3×.',
        pedagogy: pedagogy({
          why: 'Outside without return is noise',
          skill: 'Outside motif with resolution',
          masters: 'Brecker; Potter',
          listenFor: 'Last note of cell pulls home',
          measure: '3 variants — all resolve',
        }),
      },
      {
        summary: 'Deploy — fusion gospel arc',
        detail:
          '8 bars on {tune} in {keys}: A pent, B blues, C outside peak, A gospel resolve.',
        pedagogy: pedagogy({
          why: 'Week 11 consolidates all three families',
          skill: 'Full narrative deployment',
          masters: 'Composite Henry/Potter/Tigran',
          listenFor: 'Would a congregation feel the resolve?',
          measure: '8 bars — identifiable A–B–C–A',
        }),
      },
      {
        summary: 'Tri-sound — full arc',
        detail:
          'Henry shout → Potter outside → blues inflection → pent home. {home}. 4 bars.',
        pedagogy: pedagogy({
          why: 'Daily integration at peak complexity',
          skill: 'Tri-sound narrative',
          masters: 'Fusion gospel-jazz',
          listenFor: 'Four characters, one story',
          measure: 'Complete 4-bar story without filler',
        }),
      },
    ),
  },
  {
    week: 12,
    pillar: 'altered',
    title: 'Capstone — tri-sound solo',
    objective: 'Record a gig-ready solo using all three sound families on one form',
    integrationThread: 'Full tri-sound integration — record and self-review',
    isFusionWeek: true,
    heroRefs: 'All references — your personal dialect',
    steps: standardArc(
      {
        summary: 'Hear your target sound',
        detail:
          'Listen to one hero from each family (pent, blues, altered). Write one sentence: what is YOUR version of each?',
        pedagogy: pedagogy({
          why: 'Capstone week defines personal dialect',
          skill: 'Aesthetic self-definition',
          masters: 'Henry; Brecker; Potter; Tigran; Anomalie; Molina',
          listenFor: 'What do you want to steal vs avoid?',
          measure: '3 sentences written — one per family',
        }),
      },
      {
        summary: 'Sing your tri-sound solo',
        detail:
          'Sing 16-bar solo arc on {tune} form in {home} before touching piano.',
        pedagogy: pedagogy({
          why: 'The best solos are sung first',
          skill: 'Full-form melodic composition',
          masters: 'Singing improvisers',
          listenFor: 'Form clear without piano?',
          measure: '16-bar sung solo with peak and return',
        }),
      },
      {
        summary: 'Call & response — capstone',
        detail:
          'Record yourself: 4-bar pent call. Respond blues. 4-bar outside call. Respond home.',
        pedagogy: pedagogy({
          why: 'Self-dialogue reveals your voice',
          skill: 'Self call-and-response',
          masters: 'Your emerging dialect',
          listenFor: 'Sounds like you, not exercises',
          measure: '4 exchanges recorded',
        }),
      },
      {
        summary: 'Motif — signature cells',
        detail:
          'Finalize one 2-bar cell per family. Name them. Chain: pent → blues → altered → pent.',
        pedagogy: pedagogy({
          why: 'Signature cells = personal language',
          skill: 'Cell cataloging',
          masters: 'Compositional improvisers',
          listenFor: 'Cells feel like yours',
          measure: '3 named cells chained in 8 bars',
        }),
      },
      {
        summary: 'Deploy — record capstone solo',
        detail:
          'Full chorus on {tune} in {keys}. Tri-sound integration required. Hit record. Gig-ready review after.',
        pedagogy: pedagogy({
          why: '12-week cycle completes with performance',
          skill: 'Capstone improvisation',
          masters: 'Your composite voice',
          listenFor: 'Would you keep this on a gig?',
          measure: 'Recording saved; motif clarity rated 1–5',
        }),
      },
      {
        summary: 'Tri-sound — final statement',
        detail:
          '4 bars: each family one bar, bar 4 gospel resolution. {home}. Then stop.',
        pedagogy: pedagogy({
          why: 'Close the cycle with intention',
          skill: 'Final tri-sound integration',
          masters: 'The player you are becoming',
          listenFor: 'Three colors, one voice',
          measure: 'Rate overall cycle clarity 1–5 in Session Notes',
        }),
      },
    ),
  },
]

export function getLevel1Week(week: number): WeekModule {
  const mod = LEVEL_1_WEEKS.find((w) => w.week === week)
  if (!mod) return LEVEL_1_WEEKS[0]!
  return mod
}
