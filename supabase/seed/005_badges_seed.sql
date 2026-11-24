-- Seed: الشارات

INSERT INTO badges (slug, name_ar, description_ar, emoji, category, points_required, sort_order) VALUES
('first-step',    'أول خطوة',      'أكمل أول درس في سَلِيم',           '🌱', 'milestone', 0,   1),
('curious-mind',  'عقل فضولي',     'أكمل ٥ دروس مختلفة',               '🔍', 'milestone', 50,  2),
('star-reader',   'نجم القراءة',   'اقرأ ٣ قصص',                       '⭐', 'general',   0,   3),
('letter-master', 'ماهر الحروف',   'أتقن عالم الحروف',                  '🌙', 'subject',   30,  4),
('math-wizard',   'ساحر الأرقام',  'أتقن عالم الأرقام',                 '🔢', 'subject',   30,  5),
('science-fan',   'عاشق العلوم',   'أكمل دروس العلوم',                  '🔭', 'subject',   30,  6),
('century-club',  'نادي المئة',    'احصل على ١٠٠ نقطة',                '💯', 'milestone', 100, 7),
('champion',      'البطل',         'احصل على ٥٠٠ نقطة',                '🏆', 'milestone', 500, 8)
ON CONFLICT (slug) DO NOTHING;
