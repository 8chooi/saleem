-- Phase 4: Stories & Library

CREATE TABLE IF NOT EXISTS stories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title_ar      TEXT NOT NULL,
  summary_ar    TEXT,
  content_ar    TEXT NOT NULL,
  cover_emoji   TEXT NOT NULL DEFAULT '📖',
  age_group     TEXT NOT NULL CHECK (age_group IN ('3-5','6-8','9-12','all')),
  subject_slug  TEXT,
  read_time_min INT NOT NULL DEFAULT 3,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_reads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id   UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, story_id)
);

-- RLS
ALTER TABLE stories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reads ENABLE ROW LEVEL SECURITY;

-- stories: قراءة عامة (anon + authenticated)
CREATE POLICY stories_read ON stories
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

-- story_reads: الوالد يرى/يعدّل قراءات أطفاله فقط
CREATE POLICY story_reads_select ON story_reads
  FOR SELECT TO authenticated
  USING (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));

CREATE POLICY story_reads_insert ON story_reads
  FOR INSERT TO authenticated
  WITH CHECK (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));
