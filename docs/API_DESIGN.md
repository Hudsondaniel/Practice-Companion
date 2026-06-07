# API Design

## Client API Layer (`src/api/`)

### AI Coach (`ai-coach.ts`)

| Function | Input | Output | Fallback |
|----------|-------|--------|----------|
| `generateAIPracticePlan` | `AICoachInput` | `AICoachOutput` | Local session generator + static insights |
| `generateRecordingFeedback` | transcript/notes | string | Static review checklist |

### Planned Supabase API (`src/api/practice.ts` — Phase 2)

```typescript
// Sessions
GET    /practice_sessions?date=eq.{date}
POST   /practice_sessions
PATCH  /practice_sessions/:id

// Concepts
GET    /active_concepts?retired_at=is.null
POST   /active_concepts
PATCH  /active_concepts/:id  // stage, pass_days, retire

// Backlog
GET    /device_backlog?order=sort_order
POST   /device_backlog
PATCH  /device_backlog/:id    // tier promotion

// Recordings
POST   /storage/v1/object/recordings/{user_id}/{id}.webm
POST   /recordings
GET    /recordings?order=created_at.desc

// Fluency
POST   /fluency_sessions
GET    /fluency_sessions?date=gte.{start}

// Posture
POST   /posture_snapshots
GET    /posture_snapshots?order=created_at.desc&limit=30
```

## Supabase Edge Functions (Production)

### `generate-practice-plan`

```
POST /functions/v1/generate-practice-plan
Authorization: Bearer {supabase_jwt}

Body: AICoachInput
Response: AICoachOutput
```

- Validates user subscription/tier
- Calls OpenAI with versioned system prompt
- Logs prompt hash for reproducibility
- Rate limit: 10 req/hour/user

### `analyze-recording`

```
POST /functions/v1/analyze-recording
Body: { recording_id: string, context: string }
```

- Fetches audio from Storage
- Optional: Whisper transcription → GPT musicality feedback
- Stores result in `recordings.ai_feedback`

## Realtime Subscriptions

```typescript
supabase.channel('practice')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'practice_sessions',
    filter: `user_id=eq.${userId}`,
  }, handler)
```

## Error Handling

| Code | Client Action |
|------|---------------|
| 401 | Redirect to auth |
| 403 | Toast: permission denied |
| 429 | Toast: rate limited, use local fallback |
| 5xx | Retry with exponential backoff (TanStack Query) |
