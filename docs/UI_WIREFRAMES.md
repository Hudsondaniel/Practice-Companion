# UI Wireframes (ASCII)

## Main Layout

```
┌──────────┬────────────────────────────────────┬─────────────────────┐
│ SIDEBAR  │         MAIN WORKSPACE (60%)       │  PRACTICE TOOLS(40%)│
│          │                                    │                     │
│ Dashboard│  ┌──────────────────────────────┐  │  ┌───────────────┐  │
│ Practice │  │  Page Content                │  │  │ Session Timer │  │
│ Library  │  │  (Dashboard, Today's         │  │  │   01:23:45    │  │
│ Exercis. │  │   Practice, etc.)            │  │  ├───────────────┤  │
│ Reperto. │  │                              │  │  │  Metronome    │  │
│ Transcr. │  │                              │  │  │   [120 BPM]   │  │
│ Record.  │  │                              │  │  ├───────────────┤  │
│ Calendar │  │                              │  │  │ Tempo Trainer │  │
│ Analytics│  │                              │  │  ├───────────────┤  │
│ Posture  │  │                              │  │  │ ● Record      │  │
│ Settings │  │                              │  │  │ ▁▂▃▅▇ Waveform│  │
│          │  └──────────────────────────────┘  │  ├───────────────┤  │
│ [◀ collapse]                                   │  │ Session Notes │  │
└──────────┴────────────────────────────────────┴─────────────────────┘
```

## Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard                                                       │
│  Practice Method v2.0.0 — your command center                   │
├────────────┬────────────┬────────────┬──────────────────────────┤
│ Streak     │ Weekly Hrs │ Posture    │ Fluency Score            │
│ 12 days    │ 11h 30m    │ 82         │ 78                       │
├────────────────────────────┬────────────────────────────────────┤
│ ACTIVE CONCEPT             │ CURRENT FOCUS                      │
│ Peterson enclosure into 3rd│ Technical: Oscar ii–V patterns     │
│ [associative] C, Db, D     │ Repertoire: Pathétique mvt 1       │
│ ████░░ 1/3 pass days       │ Dual-Task: Phase 1                 │
├────────────────────────────┴────────────────────────────────────┤
│  [Weekly Hours Chart ────────────────────────────]                │
│  [Upcoming Goals ─────────────────────────────────]               │
└─────────────────────────────────────────────────────────────────┘
```

## Today's Practice

```
┌─────────────────────────────────────────────────────────────────┐
│  Today's Practice                          [Identity Day]        │
│  ████████░░░░░░░░  2/5 blocks          [AI Generate Plan]       │
├─────────────────────────────────────────────────────────────────┤
│  ○ Block 1: Concept Forge (20 min)                    [Complete]│
│    1a Core Key Identity · 1b Light Transposition                │
├─────────────────────────────────────────────────────────────────┤
│  ● Block 2: Transcription Integration (20 min)        [Complete]│
├─────────────────────────────────────────────────────────────────┤
│  ○ Block 3: Standards / Hymns Lab (30 min)                      │
├─────────────────────────────────────────────────────────────────┤
│  AUTOMATICITY CRITERION (5 tests × 3 consecutive days)          │
│  [Cold Deploy] [Dual-Task] [Singing] [Spontaneous] [Sound]      │
└─────────────────────────────────────────────────────────────────┘
```

## Posture Coach

```
┌──────────────────────────┬──────────────────────────────────────┐
│  ┌────────────────────┐  │  POSTURE SCORE: 82                   │
│  │                    │  │  ████████████████░░░░                │
│  │   Webcam Feed      │  │  ⚠ Elbows too low                    │
│  │   (live overlay)   │  │  • Raise bench height                │
│  └────────────────────┘  │                                      │
│  [Start Camera]          │  Bench: 85  Wrist: 90  Back: 78      │
└──────────────────────────┴──────────────────────────────────────┘
```

## Design Tokens

- **Background:** `#0a0a0f` (deep black)
- **Primary:** `#c9a227` (gold — piano/concert aesthetic)
- **Card:** `#12121a`
- **Font Display:** Playfair Display (headings)
- **Font Body:** Inter (UI)
