-- اختبار صلاحيات مخزن التسجيلات. كل شيء يُلغى في النهاية (RAISE يُرجع المعاملة) والنتيجة تظهر في رسالة الخطأ.
DO $$
DECLARE
  ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid();
  ca uuid; cb uuid; sid uuid; v int; res text := '';
  ok boolean;
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000000', ua, 'authenticated', 'authenticated', 'qa-ra-' || left(ua::text, 8) || '@saleem.test', now(), '{}', '{}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', ub, 'authenticated', 'authenticated', 'qa-rb-' || left(ub::text, 8) || '@saleem.test', now(), '{}', '{}', now(), now());
  INSERT INTO child_profiles (parent_id, name, birth_year, age_group) VALUES (ua, 'QA rec A', 2019, '6-8') RETURNING id INTO ca;
  INSERT INTO child_profiles (parent_id, name, birth_year, age_group) VALUES (ub, 'QA rec B', 2019, '6-8') RETURNING id INTO cb;
  SELECT id INTO sid FROM stories WHERE is_active LIMIT 1;
  INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('recordings', ub || '/' || cb || '/b.webm', ub);

  PERFORM set_config('request.jwt.claims', json_build_object('sub', ua, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  BEGIN INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('recordings', ua || '/' || ca || '/a.webm', ua); ok := true;
  EXCEPTION WHEN others THEN ok := false; END;
  res := res || E'\n1 A uploads to own child folder: ' || ok;

  BEGIN INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('recordings', ua || '/' || cb || '/x.webm', ua); ok := false;
  EXCEPTION WHEN others THEN ok := true; END;
  res := res || E'\n2 A blocked from B child folder under own id: ' || ok;

  BEGIN INSERT INTO storage.objects (bucket_id, name, owner) VALUES ('recordings', ub || '/' || cb || '/y.webm', ua); ok := false;
  EXCEPTION WHEN others THEN ok := true; END;
  res := res || E'\n3 A blocked from B folder: ' || ok;

  SELECT count(*) INTO v FROM storage.objects WHERE bucket_id = 'recordings' AND name LIKE ub || '/%';
  res := res || E'\n4 A cannot list B recordings: ' || (v = 0);

  BEGIN INSERT INTO story_recordings (child_id, story_id, path, duration_sec) VALUES (ca, sid, ua || '/' || ca || '/a.webm', 30); ok := true;
  EXCEPTION WHEN others THEN ok := false; END;
  res := res || E'\n5 A saves own recording row: ' || ok;

  BEGIN INSERT INTO story_recordings (child_id, story_id, path, duration_sec) VALUES (ca, sid, ub || '/' || cb || '/b.webm', 30); ok := false;
  EXCEPTION WHEN others THEN ok := true; END;
  res := res || E'\n6 A blocked from saving a row pointing at B file: ' || ok;

  BEGIN INSERT INTO story_recordings (child_id, story_id, path, duration_sec) VALUES (cb, sid, ua || '/' || cb || '/z.webm', 30); ok := false;
  EXCEPTION WHEN others THEN ok := true; END;
  res := res || E'\n7 A blocked from saving a row for B child: ' || ok;

  SELECT count(*) INTO v FROM story_recordings;
  res := res || E'\n8 A sees only own recording rows: ' || (v = 1);

  RAISE EXCEPTION 'QA RESULTS (rolled back):%', res;
END;
$$;
