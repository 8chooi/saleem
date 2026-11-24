-- المكتبة المفتوحة: قصص عربية من StoryWeaver (Pratham Books) برخصة CC BY 4.0
-- نحفظ البيانات ونسب المؤلفين، والقراءة والتحميل من صفحة القصة الأصلية
CREATE TABLE IF NOT EXISTS open_library (
  sw_id       INT PRIMARY KEY,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  level       SMALLINT,
  credits     TEXT[] NOT NULL DEFAULT '{}',   -- بالترتيب: التأليف، الرسم، الترجمة
  cover_path  TEXT,                           -- illustration_crops/<id>/<hash>.jpg
  source      TEXT NOT NULL DEFAULT 'StoryWeaver',
  license     TEXT NOT NULL DEFAULT 'CC BY 4.0',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE open_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY open_library_read ON open_library FOR SELECT TO anon, authenticated USING (TRUE);
GRANT SELECT ON open_library TO anon, authenticated;
