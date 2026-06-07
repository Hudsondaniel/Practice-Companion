-- Piano Mastery OS — Initial Schema
-- Run via: supabase db push

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Active Concepts
CREATE TABLE IF NOT EXISTS active_concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  harmonic_context TEXT NOT NULL,
  keys TEXT[] DEFAULT '{}',
  source_recordings TEXT[] DEFAULT '{}',
  key_focus_cluster TEXT[] DEFAULT '{}',
  dual_task_phase INT DEFAULT 1 CHECK (dual_task_phase BETWEEN 1 AND 3),
  stage TEXT DEFAULT 'cognitive' CHECK (stage IN ('cognitive', 'associative', 'automatic')),
  consecutive_pass_days INT DEFAULT 0,
  ecosystem TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  retired_at TIMESTAMPTZ
);

ALTER TABLE active_concepts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own concepts" ON active_concepts FOR ALL USING (auth.uid() = user_id);

-- Device Backlog
CREATE TABLE IF NOT EXISTS device_backlog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  harmonic_context TEXT NOT NULL,
  keys TEXT[] DEFAULT '{}',
  tier TEXT DEFAULT 'future' CHECK (tier IN ('current', 'next', 'future')),
  source_recording TEXT,
  ecosystem TEXT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE device_backlog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own backlog" ON device_backlog FOR ALL USING (auth.uid() = user_id);

-- Monthly Tunes
CREATE TABLE IF NOT EXISTS monthly_tunes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tune_type TEXT NOT NULL CHECK (tune_type IN ('standard', 'hymn', 'virtuoso')),
  key TEXT NOT NULL,
  deployment_points JSONB DEFAULT '[]',
  month_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE monthly_tunes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tunes" ON monthly_tunes FOR ALL USING (auth.uid() = user_id);

-- Practice Sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_type TEXT NOT NULL CHECK (day_type IN ('identity', 'expansion', 'review')),
  total_minutes INT NOT NULL,
  blocks JSONB DEFAULT '[]',
  daily_log JSONB,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON practice_sessions FOR ALL USING (auth.uid() = user_id);

-- Recordings
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES practice_sessions(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  block_id TEXT,
  notes TEXT,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recordings" ON recordings FOR ALL USING (auth.uid() = user_id);

-- Fluency Sessions
CREATE TABLE IF NOT EXISTS fluency_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  date DATE NOT NULL,
  bpm INT NOT NULL,
  scores JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE fluency_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fluency sessions" ON fluency_sessions FOR ALL USING (auth.uid() = user_id);

-- Posture Snapshots
CREATE TABLE IF NOT EXISTS posture_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  metrics JSONB DEFAULT '{}',
  snapshot_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE posture_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own posture data" ON posture_snapshots FOR ALL USING (auth.uid() = user_id);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date DATE,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Repertoire
CREATE TABLE IF NOT EXISTS repertoire_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  composer TEXT NOT NULL,
  difficulty INT CHECK (difficulty BETWEEN 1 AND 10),
  status TEXT DEFAULT 'learning',
  technical_requirements TEXT[] DEFAULT '{}',
  current_tempo INT,
  target_tempo INT,
  progress_percent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE repertoire_pieces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own repertoire" ON repertoire_pieces FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes
CREATE INDEX idx_practice_sessions_user_date ON practice_sessions(user_id, date DESC);
CREATE INDEX idx_recordings_user_created ON recordings(user_id, created_at DESC);
CREATE INDEX idx_fluency_sessions_user_date ON fluency_sessions(user_id, date DESC);
CREATE INDEX idx_posture_snapshots_user_created ON posture_snapshots(user_id, created_at DESC);
