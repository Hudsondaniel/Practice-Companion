# Deployment Strategy

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:5173 | Local dev + Tauri dev |
| Staging | staging.pianomastery.app | QA, beta testers |
| Production | app.pianomastery.app | Live users |

## Web Deployment (Vercel recommended)

```bash
# Build
npm run build

# Output: dist/
# SPA fallback: all routes → index.html
```

### Environment Variables (Vercel Dashboard)

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_OPENAI_API_KEY=        # Leave empty — use Edge Functions in prod
```

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

## Supabase Deployment

```bash
# Install CLI
npm install -g supabase

# Link project
supabase link --project-ref YOUR_REF

# Push migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy generate-practice-plan
supabase functions deploy analyze-recording
```

### Storage Buckets

- `recordings` — private, RLS per user folder
- `posture-snapshots` — private, optional

## Desktop Distribution

| Channel | Method |
|---------|--------|
| Beta | GitHub Releases (unsigned) |
| Production | Signed installers + Tauri updater |
| Mac App Store | Future (sandboxing limits MediaRecorder) |

## Monitoring (Production)

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking (React + Tauri) |
| Supabase Dashboard | DB metrics, auth logs |
| Vercel Analytics | Web vitals |
| PostHog (optional) | Feature usage, funnel |

## Rollback Plan

1. **Web:** Vercel instant rollback to previous deployment
2. **Database:** Supabase point-in-time recovery (Pro plan)
3. **Desktop:** Tauri updater rollback version pin

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] OpenAI key in Edge Functions only (production)
- [ ] CORS restricted to app domains
- [ ] Storage policies prevent cross-user access
- [ ] CSP headers on web deployment
- [ ] Dependency audit in CI (`npm audit`)

## Release Cadence

- **Web:** Continuous deployment from `main`
- **Desktop:** Bi-weekly signed releases
- **Schema:** Migrations reviewed in PR, applied to staging first
