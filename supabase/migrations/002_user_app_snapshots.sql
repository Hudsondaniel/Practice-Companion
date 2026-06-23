-- Practice Assistant — per-user app state sync (JSON snapshot)

CREATE TABLE IF NOT EXISTS user_app_snapshots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_app_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own snapshot"
  ON user_app_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own snapshot"
  ON user_app_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own snapshot"
  ON user_app_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profile + empty snapshot on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO NOTHING;

  -- Empty snapshot written by signup trigger before first real save.
  INSERT INTO public.user_app_snapshots (user_id, snapshot)
  VALUES (NEW.id, '{"version":1}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
