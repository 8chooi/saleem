-- Phase 3: Learning Engine
-- subjects → lessons → quiz_questions
-- learning_progress tracks per-child completion

-- ============================================================
-- subjects (العوالم السبعة)
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,          -- 'letters', 'numbers', ...
  name_ar     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  description_ar TEXT,
  emoji       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#2563EB',
  sort_order  INT  NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- lessons
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id    UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  title_ar      TEXT NOT NULL,
  title_en      TEXT,
  description_ar TEXT,
  content_ar    TEXT,                -- markdown/HTML محتوى الدرس
  age_group     TEXT NOT NULL CHECK (age_group IN ('3-5','6-8','9-12','all')),
  difficulty    INT  NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),  -- 1=سهل 2=متوسط 3=صعب
  duration_min  INT  NOT NULL DEFAULT 5,   -- الوقت المتوقع بالدقائق
  points        INT  NOT NULL DEFAULT 10,  -- نقاط الإتمام
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, slug)
);

-- ============================================================
-- quiz_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question_ar TEXT NOT NULL,
  options     JSONB NOT NULL,  -- ["خيار 1","خيار 2","خيار 3","خيار 4"]
  correct_idx INT  NOT NULL CHECK (correct_idx BETWEEN 0 AND 3),
  explanation_ar TEXT,
  sort_order  INT  NOT NULL DEFAULT 0
);

-- ============================================================
-- learning_progress (per child per lesson)
-- ============================================================
CREATE TABLE IF NOT EXISTS learning_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'not_started'
                 CHECK (status IN ('not_started','in_progress','completed')),
  score        INT  DEFAULT 0,         -- نتيجة الاختبار (0-100)
  attempts     INT  NOT NULL DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE (child_id, lesson_id)
);

-- ============================================================
-- child_points (رصيد النقاط الإجمالي)
-- ============================================================
CREATE TABLE IF NOT EXISTS child_points (
  child_id    UUID PRIMARY KEY REFERENCES child_profiles(id) ON DELETE CASCADE,
  total_points INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create points row when child is created
CREATE OR REPLACE FUNCTION handle_new_child()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO child_points (child_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_child_created
  AFTER INSERT ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_child();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE subjects          ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_points      ENABLE ROW LEVEL SECURITY;

-- subjects & lessons & quiz_questions: قراءة عامة (anon + authenticated)
CREATE POLICY subjects_read ON subjects
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY lessons_read ON lessons
  FOR SELECT TO anon, authenticated USING (is_active = TRUE);

CREATE POLICY quiz_read ON quiz_questions
  FOR SELECT TO anon, authenticated USING (TRUE);

-- learning_progress: الوالد يرى/يعدّل تقدم أطفاله فقط
CREATE POLICY progress_select ON learning_progress
  FOR SELECT TO authenticated
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY progress_insert ON learning_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY progress_update ON learning_progress
  FOR UPDATE TO authenticated
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY child_points_select ON child_points
  FOR SELECT TO authenticated
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY child_points_update ON child_points
  FOR UPDATE TO authenticated
  USING (
    child_id IN (
      SELECT id FROM child_profiles WHERE parent_id = auth.uid()
    )
  );
