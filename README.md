# Practice Assistant

Guided piano practice for concepts, repertoire, and vocabulary — implementing **Practice Method v2.0.0**.

## Quick Start

```bash
npm install
cp .env.example .env   # Optional: Supabase + OpenAI
npm run dev            # http://localhost:5173
```

## Production (minimum)

The app runs in **local mode** without any backend — practice data lives in your browser via Zustand persist.

```bash
npm run build          # outputs dist/
npm run preview        # test the production build locally
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, etc.). `vercel.json` is included for SPA routing.

## Production (recommended)

| Step | What |
|------|------|
| 1. Host | Connect repo to Vercel/Netlify, build command `npm run build`, output `dist` |
| 2. Env vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (see `.env.example`) |
| 3. Database | Create Supabase project → `supabase db push` for migrations |
| 4. Optional AI | `VITE_OPENAI_API_KEY` for AI coach (local fallback works without it) |
| 5. Desktop | `npm run tauri:build` (requires [Tauri prerequisites](https://tauri.app/start/prerequisites/)) |

Without Supabase, Settings shows **Local mode** — fully usable for solo practice on one device.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve production build locally |
| `npm run test:run` | Unit tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run tauri:dev` | Desktop dev (Tauri + Rust) |
| `npm run tauri:build` | Desktop installer |

## Architecture Docs

See [`docs/`](docs/) — including [Deployment Strategy](docs/DEPLOYMENT_STRATEGY.md) and [Tauri Packaging](docs/TAURI_PACKAGING.md).

## Tech Stack

React · TypeScript · Vite · Tailwind · Zustand · Supabase (optional) · Tone.js · Tauri (optional desktop)
