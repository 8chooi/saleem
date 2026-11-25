-- سياسات قراءة عامة (USING true) أُضيفت للقاعدة يدويًا خارج ملفات الـ migrations،
-- وكانت تُظهر المحتوى المخفي (is_active = false) للجميع. سياسات *_read الأصلية تكفي للمحتوى الظاهر.
DROP POLICY IF EXISTS stories_public_read ON stories;
DROP POLICY IF EXISTS lessons_public_read ON lessons;
DROP POLICY IF EXISTS quiz_public_read ON quiz_questions;
DROP POLICY IF EXISTS subjects_public_read ON subjects;
