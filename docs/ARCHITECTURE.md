# Piano Mastery OS — Application Architecture

## Overview

Piano Mastery OS is a desktop-first practice operating system for advanced pianists. It implements **Practice Method v2.0.0** as the cognitive/motor learning backbone, augmented by **Fluency Engine** (velocity/evenness), **Agility Engine** (repertoire-driven technique), **Posture Coach** (injury prevention), and an **AI Practice Engine** (session generation + recording feedback).

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tauri Shell (Desktop)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              React SPA (Vite + TypeScript)                 │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │   Pages     │  │  Components  │  │  Practice Tools │ │  │
│  │  │  (Routes)   │  │  (shadcn/ui) │  │  Panel (40%)    │ │  │
│  │  └──────┬──────┘  └──────┬───────┘  └────────┬────────┘ │  │
│  │         │                │                      │          │  │
│  │  ┌──────▼────────────────▼──────────────────────▼──────┐  │  │
│  │  │              Zustand Stores (Client State)           │  │  │
│  │  └──────┬──────────────────────────────────────────────┘  │  │
│  │         │                                                  │  │
│  │  ┌──────▼──────────────────────────────────────────────┐  │  │
│  │  │         TanStack Query (Server State / Cache)        │  │  │
│  │  └──────┬──────────────────────────────────────────────┘  │  │
│  └─────────┼────────────────────────────────────────────────┘  │
└────────────┼──────────────────────────────────────────────────┘
             │
    ┌────────▼────────┐     ┌──────────────┐
    │  Supabase       │     │  OpenAI API  │
    │  Auth + DB +    │     │  Coaching +  │
    │  Storage        │     │  Feedback    │
    └─────────────────┘     └──────────────┘
```

## Layer Responsibilities

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Presentation | React 19, Tailwind 4, shadcn/ui, Framer Motion | UI, routing, animations |
| Client State | Zustand (persisted) | Active concept, session progress, tools |
| Server State | TanStack Query | Supabase CRUD, AI mutations |
| Domain Logic | `src/features/*` | Practice Method, Fluency, Agility, Posture |
| API | `src/api/*` | OpenAI integration, Supabase wrappers |
| Persistence | Supabase PostgreSQL + Storage | Sessions, recordings, analytics |
| Desktop | Tauri 2 | Native window, filesystem, auto-update |
| Audio | Tone.js, Wavesurfer.js, MediaRecorder | Metronome, recording, waveform |
| Vision | MediaPipe Pose, TensorFlow.js | Posture analysis |

## Data Flow — Daily Practice Session

1. User opens **Today's Practice** → `initTodaySession(dayType)` builds 5 blocks from Practice Method v2
2. Optional: **AI Generate Plan** → `generateAIPracticePlan()` merges domain rules + OpenAI insights
3. User works blocks; **Practice Tools Panel** provides metronome, recording, timer (always visible)
4. Block completion → `completeBlock()` updates Zustand → sync to Supabase `practice_sessions`
5. Recordings → MediaRecorder → waveform peaks → Supabase Storage + `recordings` table
6. Sunday → Block 5 becomes mandatory **Recording Review** (20 min)

## Concept Lifecycle

```
Device Backlog (Future) → Next → Current (Active Concept)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              Block 1 Forge      Block 3 Lab         Block 4 Cold
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        ▼
                         Automaticity Criterion (5 tests × 3 days)
                                        │
                                        ▼
                              Retire → Maintenance (5 min, 3×/week)
                                        │
                                        ▼
                              Promote Next from Backlog
```

## Security

- Supabase Row Level Security on all tables (`auth.uid() = user_id`)
- Recordings stored in user-scoped Storage paths: `{user_id}/{recording_id}.webm`
- OpenAI API key client-side only for MVP; migrate to Edge Function for production
- Tauri CSP restricts connect-src to Supabase + OpenAI

## Scalability Considerations

- Code-split heavy deps: FullCalendar, Recharts, MediaPipe (dynamic import in Phase 2)
- Edge Functions for AI calls (rate limiting, prompt versioning)
- Realtime subscriptions for cross-device sync (tablet at piano + desktop review)
