# Feature Specifications

## F1: Practice Method v2.0.0 Engine

**Priority:** P0 (MVP)

| Capability | Status | Acceptance Criteria |
|------------|--------|---------------------|
| 5 daily blocks + Sunday review swap | ✅ | Review day replaces consolidation |
| Active Concept tracking | ✅ | Stage, pass days, key cluster |
| Device Backlog (current/next/future) | ✅ | Tier badges, promotion on retire |
| Monthly Tune Lab (3×4 weeks) | ✅ | Deployment points mapped |
| Automaticity Criterion display | ✅ | All 5 criteria visible |
| Identity/Expansion/Review day types | ✅ | Auto-detect from calendar |
| Failure Overload Rule | 🔲 Phase 2 | 3× fail → isolate 4-bar window |
| Hero Imitation Pass logging | 🔲 Phase 2 | Hero picker + session notes |

## F2: AI Practice Engine

**Priority:** P0

| Capability | Status | Acceptance Criteria |
|------------|--------|---------------------|
| Session generation from inputs | ✅ | Minute schedule + focus areas |
| OpenAI integration | ✅ | With local fallback |
| Recovery period recommendations | ✅ | After Forge and Lab blocks |
| Difficulty progression guidance | ✅ | Week-based phase rules |

## F3: Practice Tools Panel (40% persistent)

**Priority:** P0

| Tool | Library | Status |
|------|---------|--------|
| Metronome | Tone.js | ✅ |
| Recording | MediaRecorder API | ✅ |
| Waveform | Wavesurfer.js | ✅ |
| Tempo Trainer | Custom | ✅ |
| Session Timer | Custom | ✅ |
| Session Notes | Textarea + Zustand | ✅ |

## F4: Fluency Engine

**Priority:** P1

| Capability | Status |
|------------|--------|
| Exercise catalog (8 categories) | ✅ |
| 5-metric profile (velocity, evenness, etc.) | ✅ |
| Stagnation detection (2-week threshold) | ✅ |
| Auto-rotation recommendations | ✅ |
| BPM tracking per exercise | ✅ |
| AI rotation (OpenAI) | 🔲 Phase 2 |

## F5: Agility Engine

**Priority:** P1

| Capability | Status |
|------------|--------|
| Repertoire catalog | ✅ (3 pieces seeded) |
| Technical requirement extraction | ✅ |
| Supporting exercise generation | ✅ |
| Tempo/progress tracking | ✅ |
| User-added repertoire | 🔲 Phase 2 |

## F6: Posture Coach

**Priority:** P1

| Capability | Status |
|------------|--------|
| Webcam feed | ✅ |
| Pose analysis scoring | ✅ (simplified; MediaPipe full in P2) |
| Real-time warnings | ✅ |
| Daily score + metrics | ✅ |
| Video snapshots to Storage | 🔲 Phase 2 |
| Weekly trends chart | 🔲 Phase 2 |

## F7: Recording System

**Priority:** P1

| Capability | Status |
|------------|--------|
| In-session recording | ✅ |
| Waveform visualization | ✅ |
| Recording list UI | ✅ (seed data) |
| Supabase Storage upload | 🔲 Phase 2 |
| AI feedback on recordings | ✅ (API ready) |
| Attach to practice sessions | 🔲 Phase 2 |

## F8: Calendar

**Priority:** P1

| Capability | Status |
|------------|--------|
| Day/Week/Month views | ✅ (FullCalendar) |
| Practice events | ✅ (seed) |
| Goal/milestone events | 🔲 Phase 2 |
| Completion tracking | 🔲 Phase 2 |

## F9: Progress Analytics

**Priority:** P1

| Metric | Status |
|--------|--------|
| Practice consistency | ✅ (chart) |
| Tempo growth | ✅ (chart) |
| Concept mastery | 🔲 Phase 2 |
| Posture trends | 🔲 Phase 2 |
| Fluency composite | ✅ (dashboard) |

## F10: Authentication & Sync

**Priority:** P2

| Capability | Status |
|------------|--------|
| Supabase Auth | 🔲 Phase 2 |
| RLS policies | ✅ (schema ready) |
| Cross-device sync | 🔲 Phase 2 |
