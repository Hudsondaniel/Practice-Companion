# Piano Mastery OS

Elite practice operating system for advanced pianists — implementing **Practice Method v2.0.0** with Fluency Engine, Agility Engine, AI coaching, and Posture Coach.

## Quick Start

```bash
npm install
cp .env.example .env   # Add Supabase + OpenAI keys (optional)
npm run dev            # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Vitest single run |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run tauri:dev` | Desktop dev (requires Tauri CLI + Rust) |

## Architecture Docs

See [`docs/`](docs/) for full deliverables:

- [Architecture](docs/ARCHITECTURE.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [Component Hierarchy](docs/COMPONENT_HIERARCHY.md)
- [Feature Specifications](docs/FEATURE_SPECIFICATIONS.md)
- [API Design](docs/API_DESIGN.md)
- [AI Coaching Workflow](docs/AI_COACHING_WORKFLOW.md)
- [MVP Roadmap](docs/MVP_ROADMAP.md)
- [Production Roadmap](docs/PRODUCTION_ROADMAP.md)
- [UI Wireframes](docs/UI_WIREFRAMES.md)
- [Tauri Packaging](docs/TAURI_PACKAGING.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Deployment Strategy](docs/DEPLOYMENT_STRATEGY.md)

## Database

```bash
supabase db push   # Applies supabase/migrations/001_initial_schema.sql
```

## Tech Stack

React · TypeScript · Vite · Tailwind · shadcn/ui · Zustand · TanStack Query · Supabase · OpenAI · Tone.js · Wavesurfer.js · MediaPipe · FullCalendar · Recharts · Framer Motion · Tauri
