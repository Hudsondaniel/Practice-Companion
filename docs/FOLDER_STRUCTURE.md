# Folder Structure

```
piano-mastery-os/
├── docs/                          # Architecture & planning deliverables
│   ├── ARCHITECTURE.md
│   ├── API_DESIGN.md
│   ├── COMPONENT_HIERARCHY.md
│   ├── AI_COACHING_WORKFLOW.md
│   ├── FEATURE_SPECIFICATIONS.md
│   ├── MVP_ROADMAP.md
│   ├── PRODUCTION_ROADMAP.md
│   ├── UI_WIREFRAMES.md
│   ├── TAURI_PACKAGING.md
│   ├── TESTING_STRATEGY.md
│   └── DEPLOYMENT_STRATEGY.md
├── e2e/                           # Playwright end-to-end tests
├── src-tauri/                     # Tauri desktop shell
├── supabase/
│   └── migrations/                # PostgreSQL schema
├── public/
├── src/
│   ├── api/                       # External service integrations
│   │   └── ai-coach.ts
│   ├── components/
│   │   ├── layout/                # AppShell, Sidebar
│   │   ├── practice-tools/        # Always-visible 40% panel
│   │   └── ui/                    # shadcn-style primitives
│   ├── features/                  # Domain logic (no UI)
│   │   ├── practice-method/
│   │   ├── fluency-engine/
│   │   ├── agility-engine/
│   │   └── posture-coach/
│   ├── hooks/                     # useRecorder, etc.
│   ├── lib/                       # supabase, utils
│   ├── pages/                     # Route-level views
│   ├── stores/                    # Zustand stores
│   ├── test/                      # Vitest setup
│   ├── types/                     # TypeScript domain types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Conventions

- **Pages** = route components, compose features + components
- **Features** = pure business logic, testable without React
- **Stores** = client-side state with optional persistence
- **API** = async integrations (Supabase, OpenAI)
- **Components/ui** = design system primitives only
