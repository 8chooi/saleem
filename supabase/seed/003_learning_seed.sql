-- Seed: 7 عوالم + دروس أولية لكل عالم
-- شغّل بعد migration 002

-- ============================================================
-- subjects (العوالم السبعة)
-- ============================================================
INSERT INTO subjects (slug, name_ar, name_en, description_ar, emoji, color, sort_order) VALUES
  ('letters',    'الحروف',   'Letters',    'تعلّم الحروف العربية والقراءة والكتابة',    '🌙', '#7C3AED', 1),
  ('numbers',    'الأرقام',  'Numbers',    'الأرقام والحساب والرياضيات الممتعة',       '🔢', '#2563EB', 2),
  ('science',    'العلوم',   'Science',    'استكشف عالم الطبيعة والعلوم والاختراعات',  '🔭', '#059669', 3),
  ('languages',  'اللغات',   'Languages',  'تعلّم لغات جديدة واكتشف ثقافات العالم',    '🌍', '#D97706', 4),
  ('thinking',   'التفكير',  'Thinking',   'ألغاز ومهارات التفكير المنطقي والإبداعي',  '🧩', '#DC2626', 5),
  ('creativity', 'الإبداع',  'Creativity', 'فنون ورسم وموسيقى وتعبير إبداعي',         '🎨', '#EC4899', 6),
  ('knowledge',  'المعرفة',  'Knowledge',  'معلومات عامة وحقائق مثيرة عن العالم',     '🌟', '#F59E0B', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- عالم الحروف — 3 دروس
-- ============================================================
WITH s AS (SELECT id FROM subjects WHERE slug = 'letters')
INSERT INTO lessons (subject_id, slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order)
SELECT
  s.id, slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order
FROM s, (VALUES
  (
    'alef-baa',
    'الألف والباء',
    'نتعلم أول حرفين في اللغة العربية',
    '<h2>الألف ا</h2><p>الألف هو أول حرف في الأبجدية العربية. يُكتب هكذا: <strong>أ / ا</strong></p><p>أمثلة: أسد 🦁 — أرنب 🐰 — أشجار 🌲</p><h2>الباء ب</h2><p>الباء الحرف الثاني. يُكتب هكذا: <strong>بـ / ـب</strong></p><p>أمثلة: بطة 🦆 — بيت 🏠 — بالون 🎈</p>',
    '3-5', 1, 5, 10, 1
  ),
  (
    'taa-thaa',
    'التاء والثاء',
    'نتعرف على التاء والثاء',
    '<h2>التاء ت</h2><p>مثل: تفاحة 🍎 — تمر 🌴 — تِمساح 🐊</p><h2>الثاء ث</h2><p>مثل: ثعلب 🦊 — ثلج ❄️ — ثمرة 🍑</p>',
    '3-5', 1, 5, 10, 2
  ),
  (
    'reading-words',
    'قراءة كلمات بسيطة',
    'نجمع الحروف لنقرأ كلمات',
    '<h2>كيف نجمع الحروف؟</h2><p>الحروف مثل اللبنات — نجمعها لنبني كلمات!</p><p>ب + ا + ب = <strong>باب</strong> 🚪</p><p>ك + ت + ا + ب = <strong>كتاب</strong> 📚</p><p>ح + ل + ي + ب = <strong>حليب</strong> 🥛</p>',
    '6-8', 2, 8, 15, 3
  )
) AS v(slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- عالم الأرقام — 3 دروس
-- ============================================================
WITH s AS (SELECT id FROM subjects WHERE slug = 'numbers')
INSERT INTO lessons (subject_id, slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order)
SELECT
  s.id, slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order
FROM s, (VALUES
  (
    'counting-1-5',
    'العد من ١ إلى ٥',
    'نتعلم نعدّ من واحد لخمسة',
    '<h2>١ ٢ ٣ ٤ ٥</h2><p>🍎 واحدة — 🍎🍎 اثنتان — 🍎🍎🍎 ثلاث — 🍎🍎🍎🍎 أربع — 🍎🍎🍎🍎🍎 خمس</p>',
    '3-5', 1, 5, 10, 1
  ),
  (
    'counting-6-10',
    'العد من ٦ إلى ١٠',
    'نكمل العد حتى العشرة',
    '<h2>٦ ٧ ٨ ٩ ١٠</h2><p>⭐️⭐️⭐️⭐️⭐️⭐️ ستة — ⭐️×٧ سبعة — ⭐️×٨ ثمانية — ⭐️×٩ تسعة — ⭐️×١٠ عشرة</p>',
    '3-5', 1, 5, 10, 2
  ),
  (
    'addition-basics',
    'الجمع البسيط',
    'نتعلم نجمع أرقامين معاً',
    '<h2>الجمع مثل إضافة أشياء!</h2><p>٢ + ٣ = ٥</p><p>🍌🍌 موزتان + 🍌🍌🍌 ثلاث موزات = 🍌🍌🍌🍌🍌 خمس موزات</p><p>١ + ٤ = ٥</p><p>٣ + ٣ = ٦</p>',
    '6-8', 2, 8, 15, 3
  )
) AS v(slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- عالم العلوم — 2 دروس
-- ============================================================
WITH s AS (SELECT id FROM subjects WHERE slug = 'science')
INSERT INTO lessons (subject_id, slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order)
SELECT
  s.id, slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order
FROM s, (VALUES
  (
    'living-nonliving',
    'الكائنات الحية وغير الحية',
    'ما الفرق بين الحي وغير الحي؟',
    '<h2>الكائنات الحية 🌱</h2><p>تتنفس وتأكل وتنمو وتتكاثر.</p><p>أمثلة: إنسان 👤 — قطة 🐱 — شجرة 🌳</p><h2>الأشياء غير الحية 🪨</h2><p>لا تتنفس ولا تنمو من تلقاء نفسها.</p><p>أمثلة: حجر 🪨 — سيارة 🚗 — كتاب 📚</p>',
    '6-8', 1, 7, 10, 1
  ),
  (
    'water-cycle',
    'دورة الماء في الطبيعة',
    'كيف يتحرك الماء في الطبيعة؟',
    '<h2>دورة الماء 💧</h2><p>الماء يتبخر من البحر ☀️ → يتجمع في السحب ☁️ → يسقط مطراً 🌧️ → يعود للبحر 🌊</p><p>هذه الدورة لا تتوقف أبداً!</p>',
    '9-12', 2, 10, 15, 2
  )
) AS v(slug, title_ar, description_ar, content_ar, age_group, difficulty, duration_min, points, sort_order)
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- أسئلة اختبار — درس الألف والباء
-- ============================================================
WITH l AS (
  SELECT lessons.id FROM lessons
  JOIN subjects ON subjects.id = lessons.subject_id
  WHERE subjects.slug = 'letters' AND lessons.slug = 'alef-baa'
)
INSERT INTO quiz_questions (lesson_id, question_ar, options, correct_idx, explanation_ar, sort_order)
SELECT
  l.id, question_ar, options::jsonb, correct_idx, explanation_ar, sort_order
FROM l, (VALUES
  (
    'أيّ صورة تبدأ بحرف الألف؟',
    '["بطة 🦆","أسد 🦁","تفاحة 🍎","سمكة 🐟"]',
    1,
    'أسد تبدأ بحرف الألف!',
    1
  ),
  (
    'أيّ صورة تبدأ بحرف الباء؟',
    '["قطة 🐱","دجاجة 🐔","بيت 🏠","شمس ☀️"]',
    2,
    'بيت تبدأ بحرف الباء!',
    2
  ),
  (
    'ما الحرف الأول في الأبجدية العربية؟',
    '["باء","تاء","ألف","جيم"]',
    2,
    'الألف هو أول حرف في الأبجدية!',
    3
  )
) AS v(question_ar, options, correct_idx, explanation_ar, sort_order)
ON CONFLICT DO NOTHING;

-- أسئلة اختبار — درس العد ١-٥
WITH l AS (
  SELECT lessons.id FROM lessons
  JOIN subjects ON subjects.id = lessons.subject_id
  WHERE subjects.slug = 'numbers' AND lessons.slug = 'counting-1-5'
)
INSERT INTO quiz_questions (lesson_id, question_ar, options, correct_idx, explanation_ar, sort_order)
SELECT
  l.id, question_ar, options::jsonb, correct_idx, explanation_ar, sort_order
FROM l, (VALUES
  (
    'كم عدد النجوم؟ ⭐️⭐️⭐️',
    '["اثنان","ثلاثة","أربعة","واحد"]',
    1,
    'عددنا: ⭐️ واحدة، ⭐️⭐️ اثنتان، ⭐️⭐️⭐️ ثلاثة!',
    1
  ),
  (
    'ما الرقم الذي يأتي بعد ٣؟',
    '["٢","٥","٤","٦"]',
    2,
    '١ ٢ ٣ ٤ — الرقم الذي يأتي بعد ٣ هو ٤!',
    2
  )
) AS v(question_ar, options, correct_idx, explanation_ar, sort_order)
ON CONFLICT DO NOTHING;
