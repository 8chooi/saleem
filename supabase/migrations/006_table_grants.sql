-- Supabase لم يعد يمنح anon/authenticated صلاحيات تلقائية على الجداول الجديدة.
-- بدون GRANT ترفض قاعدة البيانات الاستعلام قبل الوصول لسياسات RLS.
-- الصلاحيات هنا مطابقة للسياسات الموجودة فقط، و RLS يظل يحدد الصفوف المسموحة.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- محتوى عام للقراءة
GRANT SELECT ON public.subjects, public.lessons, public.quiz_questions, public.stories
  TO anon, authenticated;
GRANT SELECT ON public.badges TO authenticated;

-- بيانات ولي الأمر وأطفاله
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_profiles, public.child_profiles
  TO authenticated;

-- التقدم والنقاط والألعاب
GRANT SELECT, INSERT, UPDATE ON public.learning_progress TO authenticated;
GRANT SELECT, UPDATE ON public.child_points TO authenticated;
GRANT SELECT, INSERT ON public.story_reads, public.child_badges, public.game_sessions
  TO authenticated;

GRANT EXECUTE ON FUNCTION public.increment_child_points(UUID, INT) TO authenticated;
