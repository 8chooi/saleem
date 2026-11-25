-- إدارة المحتوى: المشرفون فقط يضيفون ويعدّلون القصص والدروس والأسئلة
-- لا توجد صلاحية إدراج في admins من الموقع؛ يُضاف المشرف من محرر SQL فقط
CREATE TABLE IF NOT EXISTS admins (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY admins_self_read ON admins FOR SELECT TO authenticated USING (user_id = auth.uid());
GRANT SELECT ON admins TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- المشرف يرى المحتوى المخفي أيضًا
CREATE POLICY stories_admin_all ON stories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY lessons_admin_all ON lessons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY quiz_admin_all ON quiz_questions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT INSERT, UPDATE, DELETE ON stories, lessons, quiz_questions TO authenticated;
