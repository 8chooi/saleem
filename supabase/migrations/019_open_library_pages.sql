-- إضافة بيانات الصفحات والصوت لجدول المكتبة المفتوحة
-- pages: [{img, text, type}]  orientation: landscape|portrait
ALTER TABLE open_library
  ADD COLUMN IF NOT EXISTS pages       JSONB,
  ADD COLUMN IF NOT EXISTS orientation TEXT NOT NULL DEFAULT 'landscape',
  ADD COLUMN IF NOT EXISTS audio_url   TEXT,
  ADD COLUMN IF NOT EXISTS vtt_url     TEXT;

-- أدمن فقط يقدر يعدّل الصفحات
CREATE POLICY open_library_admin_update ON open_library
  FOR UPDATE TO authenticated
  USING (public.is_admin());
