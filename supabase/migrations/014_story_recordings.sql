-- تسجيلات صوت الطفل وهو يقرأ: مخزن خاص، لا يسمعها إلا ولي أمره
-- مسار الملف: <parent_id>/<child_id>/<story_id>-<timestamp>.webm
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recordings', 'recordings', false, 3145728, ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS recordings_parent_select ON storage.objects;
DROP POLICY IF EXISTS recordings_parent_insert ON storage.objects;
DROP POLICY IF EXISTS recordings_parent_delete ON storage.objects;

CREATE POLICY recordings_parent_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY recordings_parent_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] IN (SELECT id::text FROM public.child_profiles WHERE parent_id = auth.uid())
  );

CREATE POLICY recordings_parent_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE TABLE IF NOT EXISTS story_recordings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  story_id     UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  path         TEXT NOT NULL UNIQUE,
  duration_sec INT CHECK (duration_sec BETWEEN 1 AND 180),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS story_recordings_child_idx ON story_recordings(child_id, created_at DESC);

ALTER TABLE story_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY story_recordings_parent ON story_recordings
  FOR ALL TO authenticated
  USING (child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid()))
  WITH CHECK (
    child_id IN (SELECT id FROM child_profiles WHERE parent_id = auth.uid())
    AND split_part(path, '/', 1) = auth.uid()::text
    AND split_part(path, '/', 2) = child_id::text
  );

GRANT SELECT, INSERT, DELETE ON story_recordings TO authenticated;
