-- مهام يسندها ولي الأمر لطفله: قصة أو درس، وتُعلَّم منجزة تلقائيًا
CREATE TABLE IF NOT EXISTS child_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id     UUID REFERENCES stories(id) ON DELETE CASCADE,
  lesson_id    UUID REFERENCES lessons(id) ON DELETE CASCADE,
  note         TEXT CHECK (char_length(note) <= 120),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CHECK ((story_id IS NULL) <> (lesson_id IS NULL))
);
CREATE INDEX IF NOT EXISTS child_assignments_child_idx ON child_assignments(child_id, completed_at);

ALTER TABLE child_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY child_assignments_parent ON child_assignments
  FOR ALL TO authenticated
  USING (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()));

GRANT SELECT, INSERT, DELETE ON child_assignments TO authenticated;

-- إكمال المهمة تلقائيًا عند قراءة القصة أو إكمال الدرس
CREATE OR REPLACE FUNCTION public.complete_assignments()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'story_reads' THEN
    UPDATE child_assignments SET completed_at = NOW()
      WHERE child_id = NEW.child_id AND story_id = NEW.story_id AND completed_at IS NULL;
  ELSIF NEW.status = 'completed' THEN
    UPDATE child_assignments SET completed_at = NOW()
      WHERE child_id = NEW.child_id AND lesson_id = NEW.lesson_id AND completed_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS complete_assignments_story ON story_reads;
CREATE TRIGGER complete_assignments_story AFTER INSERT ON story_reads
  FOR EACH ROW EXECUTE FUNCTION public.complete_assignments();

DROP TRIGGER IF EXISTS complete_assignments_lesson ON learning_progress;
CREATE TRIGGER complete_assignments_lesson AFTER INSERT OR UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.complete_assignments();

REVOKE EXECUTE ON FUNCTION public.complete_assignments() FROM PUBLIC, anon, authenticated;
