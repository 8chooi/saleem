-- مستويات القراءة وصفحات القصة المصوّرة
-- level: 1 مبتدئ، 2 متوسط، 3 متقدم، 4 متمكن
-- pages: [{ "text": "...", "scene": { "bg": "meadow", "items": [{ "e": "🐰", "x": 30, "y": 70, "size": 64, "anim": "bounce" }] } }]
ALTER TABLE stories ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS pages JSONB;

UPDATE stories SET level = CASE age_group WHEN '3-5' THEN 1 WHEN '6-8' THEN 2 WHEN '9-12' THEN 3 ELSE 1 END
  WHERE pages IS NULL;
