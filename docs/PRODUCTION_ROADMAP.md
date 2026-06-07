# Production Roadmap (6–12 Months)

## Q1: MVP Launch

- Web app deployed to Vercel/Netlify
- Tauri desktop beta (Windows)
- Supabase production project with RLS
- 50 beta users (advanced pianists)

## Q2: Intelligence Layer

- OpenAI Edge Functions with prompt versioning
- Whisper integration for recording transcription
- Automated stagnation detection → push notifications (React Hot Toast + optional email)
- Spaced repetition for retired concepts (maintenance scheduling)
- Cross-session analytics dashboard (concept mastery timelines)

## Q3: Platform Expansion

- macOS + Linux Tauri builds
- Auto-update via Tauri updater
- Offline-first with sync queue (practice without internet)
- MIDI input for accuracy detection (optional hardware)
- Integration with ForScore / Newzik (repertoire import)

## Q4: Elite Features

- Multi-camera posture (side + front view)
- Comparative analysis vs. reference recordings (spectral)
- Ensemble/church context mode (hymn-specific deployment maps)
- Coach sharing (teacher views student sessions)
- Custom ecosystem templates (Barry Harris, Cory Henry packs)

## Technical Debt Paydown

| Item | Quarter |
|------|---------|
| Client-side OpenAI key → Edge Functions | Q2 |
| MediaPipe mock → full WASM pipeline | Q2 |
| Bundle splitting (FullCalendar, Recharts, TF.js) | Q2 |
| E2E test coverage >80% critical paths | Q3 |
| Accessibility audit (WCAG 2.1 AA) | Q3 |
| Performance: <3s cold start on Tauri | Q3 |

## Monetization Options (Future)

- Free tier: Practice Method engine, local-only
- Pro: AI coaching, cloud sync, analytics, posture coach
- Studio: Teacher dashboard, multi-student
