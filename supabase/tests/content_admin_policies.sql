-- اختبار صلاحيات إدارة المحتوى. كل شيء يُلغى في النهاية والنتيجة في رسالة الخطأ.
DO $$
DECLARE
  un uuid := gen_random_uuid(); ua uuid := gen_random_uuid();
  hid uuid; v int; ok boolean; res text := '';
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000000', un, 'authenticated', 'authenticated', 'qa-n-' || left(un::text, 8) || '@saleem.test', now(), '{}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', ua, 'authenticated', 'authenticated', 'qa-ad-' || left(ua::text, 8) || '@saleem.test', now(), '{}', '{}', now(), now());
  INSERT INTO admins (user_id) VALUES (ua);
  INSERT INTO stories (slug, title_ar, content_ar, age_group, is_active) VALUES ('qa-hidden', 'QA hidden', '<p>x</p>', 'all', false) RETURNING id INTO hid;

  -- مستخدم عادي
  PERFORM set_config('request.jwt.claims', json_build_object('sub', un, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  res := res || E'\n1 normal user is_admin false: ' || (NOT public.is_admin());
  SELECT count(*) INTO v FROM stories WHERE id = hid;
  res := res || E'\n2 normal user cannot see hidden story: ' || (v = 0);
  BEGIN INSERT INTO stories (slug, title_ar, content_ar, age_group) VALUES ('qa-n', 'x', '<p>x</p>', 'all'); ok := false;
  EXCEPTION WHEN others THEN ok := true; END;
  res := res || E'\n3 normal user cannot add story: ' || ok;
  UPDATE stories SET title_ar = 'hacked' WHERE is_active; GET DIAGNOSTICS v = ROW_COUNT;
  res := res || E'\n4 normal user cannot edit stories: ' || (v = 0);
  UPDATE lessons SET title_ar = 'hacked'; GET DIAGNOSTICS v = ROW_COUNT;
  res := res || E'\n5 normal user cannot edit lessons: ' || (v = 0);
  DELETE FROM quiz_questions; GET DIAGNOSTICS v = ROW_COUNT;
  res := res || E'\n6 normal user cannot delete questions: ' || (v = 0);
  BEGIN INSERT INTO admins (user_id) VALUES (un); ok := false;
  EXCEPTION WHEN others THEN ok := true; END;
  res := res || E'\n7 normal user cannot make self admin: ' || ok;

  -- مشرف
  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', json_build_object('sub', ua, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);
  res := res || E'\n8 admin is_admin true: ' || public.is_admin();
  SELECT count(*) INTO v FROM stories WHERE id = hid;
  res := res || E'\n9 admin sees hidden story: ' || (v = 1);
  BEGIN INSERT INTO stories (slug, title_ar, content_ar, age_group) VALUES ('qa-admin', 'x', '<p>x</p>', 'all'); ok := true;
  EXCEPTION WHEN others THEN ok := false; END;
  res := res || E'\n10 admin can add story: ' || ok;
  UPDATE stories SET is_active = true WHERE id = hid; GET DIAGNOSTICS v = ROW_COUNT;
  res := res || E'\n11 admin can publish story: ' || (v = 1);

  RAISE EXCEPTION 'QA RESULTS (rolled back):%', res;
END;
$$;
