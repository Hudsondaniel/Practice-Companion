# Component Hierarchy

```
App
└── BrowserRouter
    └── AppShell
        ├── Sidebar
        │   └── NavLink[] (11 routes)
        ├── Main Workspace (60%)
        │   └── Outlet → Page Components
        │       ├── Dashboard
        │       │   ├── StatCard[]
        │       │   ├── ActiveConceptCard
        │       │   ├── FocusCard
        │       │   ├── ScoreCard[]
        │       │   ├── WeeklyHoursChart (Recharts)
        │       │   └── GoalsList
        │       ├── TodaysPractice
        │       │   ├── SessionProgress
        │       │   ├── AIPlanCard
        │       │   ├── BlockCard[]
        │       │   └── AutomaticityCriteria
        │       ├── PracticeLibrary
        │       │   ├── BlockReference[]
        │       │   ├── DeviceBacklogList
        │       │   └── MonthlyTuneCards[]
        │       ├── Exercises (Fluency Engine)
        │       ├── Repertoire (Agility Engine)
        │       ├── Transcriptions
        │       ├── Recordings
        │       ├── CalendarPage (FullCalendar)
        │       ├── Analytics (Recharts)
        │       ├── PostureCoach
        │       │   ├── VideoFeed
        │       │   ├── PostureScore
        │       │   └── MetricsGrid
        │       └── Settings
        └── PracticeToolsPanel (40%, always visible)
            ├── SessionTimer
            ├── Metronome (Tone.js)
            ├── TempoTrainer
            ├── RecordingControls (MediaRecorder)
            ├── WaveformDisplay (Wavesurfer.js)
            └── SessionNotes
```

## Shared UI Primitives (shadcn/ui pattern)

- Button, Card, Badge, Progress, Input, Textarea, ScrollArea

## State Connections

| Component | Store / Query |
|-----------|--------------|
| Dashboard | usePracticeStore, useFluencyStore |
| TodaysPractice | usePracticeStore, useMutation(ai-coach) |
| PracticeToolsPanel | useSessionToolsStore |
| Exercises | useFluencyStore |
| PostureCoach | local state + pose-analyzer |
