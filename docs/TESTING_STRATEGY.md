# Testing Strategy

## Pyramid

```
        ┌─────────┐
        │  E2E    │  Playwright — critical user journeys
        │  (10%)  │
        ├─────────┤
        │ Integr. │  API + store integration
        │  (20%)  │
        ├─────────┤
        │  Unit   │  Vitest — domain logic, generators
        │  (70%)  │
        └─────────┘
```

## Unit Tests (Vitest)

**Location:** `src/**/*.test.ts` adjacent to source

| Module | Tests |
|--------|-------|
| `session-generator` | Block count, review day swap, time scaling |
| `rotation` (fluency) | Stagnation detection, threshold |
| `analyzer` (agility) | Requirement extraction, exercise mapping |
| `pose-analyzer` | Score bounds, warning triggers |

**Run:** `npm run test:run`

## Component Tests (Vitest + Testing Library)

**Priority targets (Phase 2):**
- `Metronome` — BPM increment/decrement
- `TodaysPractice` — block completion flow
- `Dashboard` — renders active concept from store

## E2E Tests (Playwright)

**Location:** `e2e/`

| Test | Path |
|------|------|
| Dashboard loads | `/` |
| Practice tools always visible | `/practice` |
| Sidebar navigation | all routes |
| AI plan generation | `/practice` → click generate |
| Recording flow | start → stop → waveform appears |

**Run:** `npm run test:e2e` (starts dev server automatically)

## Manual QA Checklist (Pre-Release)

- [ ] 100-min session: all 5 blocks completable
- [ ] Sunday: consolidation → recording review swap
- [ ] Metronome audible through session
- [ ] Recording works with mic permission
- [ ] Sidebar collapse persists on reload
- [ ] Zustand persistence survives page refresh
- [ ] FullCalendar renders all views
- [ ] Posture Coach camera start/stop clean

## CI Pipeline

```yaml
# .github/workflows/ci.yml (Phase 2)
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
  e2e:
    runs-on: ubuntu-latest
    steps:
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Performance Testing

- Lighthouse CI on web build (target: >90 performance)
- Long session test: 2-hour timer without memory leak
- Recording: 30-min continuous capture stability
