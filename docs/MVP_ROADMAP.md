# MVP Roadmap (8 Weeks)

## Phase 1: Foundation (Weeks 1–2) ✅

- [x] Vite + React + TypeScript + Tailwind + shadcn/ui scaffold
- [x] App shell: collapsible sidebar + 60/40 layout
- [x] Practice Tools Panel (metronome, recording, waveform, timer)
- [x] Practice Method v2 domain types and session generator
- [x] Zustand stores with persistence
- [x] All 11 route pages (functional UI)
- [x] Supabase schema migration
- [x] Unit tests for session generator
- [x] Build pipeline verified

## Phase 2: Core Practice Loop (Weeks 3–4)

- [ ] Supabase Auth (email + magic link)
- [ ] Sync practice sessions, concepts, backlog to DB
- [ ] Recording upload to Supabase Storage
- [ ] Block timer with sub-block guidance (1a, 1b, etc.)
- [ ] Failure Overload Rule UI flow
- [ ] Daily log persistence
- [ ] Sunday Recording Review workflow with timecode markers

## Phase 3: Engines (Weeks 5–6)

- [ ] Fluency session logging + BPM history charts
- [ ] AI-powered exercise rotation
- [ ] User repertoire CRUD + Agility exercise scheduling
- [ ] Full MediaPipe Pose integration
- [ ] Posture snapshot storage + weekly trends

## Phase 4: Polish & Desktop (Weeks 7–8)

- [ ] Tauri desktop packaging (Windows + macOS)
- [ ] Code splitting for bundle size
- [ ] OpenAI Edge Functions (secure API keys)
- [ ] Playwright E2E suite in CI
- [ ] Onboarding flow + sample data seed
- [ ] Performance profiling (4–8 hour session stability)

## MVP Success Metrics

| Metric | Target |
|--------|--------|
| Daily session completion rate | >70% of active users |
| Block-level tracking accuracy | 100% of 5 blocks |
| Recording → review cycle | Weekly on review day |
| Concept retirement tracking | Pass days counted correctly |
| App crash rate | <0.1% per session hour |
