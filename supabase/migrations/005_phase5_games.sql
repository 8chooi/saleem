-- Phase 5: Games & Badges

CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name_ar     TEXT NOT NULL,
  description_ar TEXT,
  emoji       TEXT NOT NULL DEFAULT '🏅',
  category    TEXT NOT NULL DEFAULT 'general', -- general, subject, streak, milestone
  points_required INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS child_badges (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id   UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, badge_id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  game_type   TEXT NOT NULL,  -- 'matching', 'fill_blank', 'ordering'
  subject_slug TEXT,
  score       INT NOT NULL DEFAULT 0,
  max_score   INT NOT NULL DEFAULT 100,
  duration_sec INT,
  played_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE badges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_badges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY badges_read ON badges
  FOR SELECT TO authenticated USING (is_active = TRUE);

CREATE POLICY child_badges_select ON child_badges
  FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));

CREATE POLICY child_badges_insert ON child_badges
  FOR INSERT TO authenticated
  WITH CHECK (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));

CREATE POLICY game_sessions_select ON game_sessions
  FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));

CREATE POLICY game_sessions_insert ON game_sessions
  FOR INSERT TO authenticated
  WITH CHECK (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));
