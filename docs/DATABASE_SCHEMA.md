# Database Schema

Full SQL migration: [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)

## Entity Relationship

```
profiles (1) ──┬── (N) active_concepts
               ├── (N) device_backlog
               ├── (N) monthly_tunes
               ├── (N) practice_sessions ── (N) recordings
               ├── (N) fluency_sessions
               ├── (N) posture_snapshots
               ├── (N) goals
               └── (N) repertoire_pieces
```

## Tables

### profiles
Extends `auth.users`. Created on signup via trigger.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | FK → auth.users |
| email | TEXT | |
| display_name | TEXT | Optional |

### active_concepts
One active concept per user (enforced in app layer; retired concepts have `retired_at` set).

| Column | Type | Notes |
|--------|------|-------|
| stage | TEXT | cognitive \| associative \| automatic |
| consecutive_pass_days | INT | 0–3+ for retirement |
| dual_task_phase | INT | 1, 2, or 3 |
| key_focus_cluster | TEXT[] | e.g. `{C,Db,D}` |

### device_backlog
Pipeline: current → next → future

| Column | Type | Notes |
|--------|------|-------|
| tier | TEXT | current \| next \| future |
| sort_order | INT | Manual ordering within tier |

### monthly_tunes
Locked for 4 weeks per `month_year` (e.g. `2026-06`).

| Column | Type | Notes |
|--------|------|-------|
| deployment_points | JSONB | `[{barRange, chordFunction}]` |
| tune_type | TEXT | standard \| hymn \| virtuoso |

### practice_sessions
Daily 100-min session record.

| Column | Type | Notes |
|--------|------|-------|
| blocks | JSONB | `[{blockId, plannedMinutes, actualMinutes, completed}]` |
| daily_log | JSONB | `{conceptStage, tomorrowFocus}` |
| day_type | TEXT | identity \| expansion \| review |

### recordings
Audio files in Storage bucket `recordings/{user_id}/{id}.webm`.

### fluency_sessions
Per-exercise BPM and 5-metric scores.

| Column | Type | Notes |
|--------|------|-------|
| scores | JSONB | `{velocity, evenness, articulation, accuracy, relaxation}` |

### posture_snapshots
Periodic posture scores from Posture Coach.

### goals
User-defined targets with optional `target_date`.

### repertoire_pieces
Virtuoso repertoire with technical requirements array.

## Row Level Security

All tables: `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE.

Storage `recordings` bucket: folder name must match `auth.uid()`.

## Indexes

- `practice_sessions(user_id, date DESC)` — dashboard queries
- `recordings(user_id, created_at DESC)` — recording list
- `fluency_sessions(user_id, date DESC)` — analytics
- `posture_snapshots(user_id, created_at DESC)` — trends
