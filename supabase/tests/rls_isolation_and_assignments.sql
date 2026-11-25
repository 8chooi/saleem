-- اختبار عزل البيانات بين وليَّي أمر + المهام. يُنشئ حسابين مؤقتين ويحذفهما في النهاية.
CREATE TEMP TABLE qa3 (n int, step text, ok boolean, detail text);
GRANT ALL ON qa3 TO authenticated;
DO $$
DECLARE
  ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid();
  ca uuid; cb uuid; v int; sid uuid; lid uuid; t timestamptz;
BEGIN
  INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
    ('00000000-0000-0000-0000-000000000000', ua, 'authenticated', 'authenticated', 'qa-a-' || left(ua::text, 8) || '@saleem.test', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"QA A"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', ub, 'authenticated', 'authenticated', 'qa-b-' || left(ub::text, 8) || '@saleem.test', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"QA B"}', now(), now());
  INSERT INTO child_profiles (parent_id, name, birth_year, age_group) VALUES (ua, 'QA child A', 2019, '6-8') RETURNING id INTO ca;
  INSERT INTO child_profiles (parent_id, name, birth_year, age_group) VALUES (ub, 'QA child B', 2018, '6-8') RETURNING id INTO cb;
  SELECT id INTO sid FROM stories WHERE is_active ORDER BY sort_order LIMIT 1;
  SELECT id INTO lid FROM lessons WHERE is_active ORDER BY sort_order LIMIT 1;
  INSERT INTO story_reads (child_id, story_id) VALUES (cb, sid);

  -- العمل بصلاحيات وليّ الأمر A
  PERFORM set_config('request.jwt.claims', json_build_object('sub', ua, 'role', 'authenticated')::text, true);
  PERFORM set_config('role', 'authenticated', true);

  SELECT count(*) INTO v FROM child_profiles WHERE id = cb;
  INSERT INTO qa3 VALUES (1, 'A cannot see B''s child', v = 0, v::text);
  SELECT count(*) INTO v FROM story_reads WHERE child_id = cb;
  INSERT INTO qa3 VALUES (2, 'A cannot see B''s reading log', v = 0, v::text);
  SELECT count(*) INTO v FROM child_profiles;
  INSERT INTO qa3 VALUES (3, 'A sees only own children', v = 1, v::text);

  BEGIN
    INSERT INTO learning_progress (child_id, lesson_id, status) VALUES (cb, lid, 'completed');
    INSERT INTO qa3 VALUES (4, 'A cannot write progress for B''s child', false, 'allowed');
  EXCEPTION WHEN others THEN INSERT INTO qa3 VALUES (4, 'A cannot write progress for B''s child', true, SQLERRM); END;
  BEGIN
    INSERT INTO child_assignments (child_id, story_id) VALUES (cb, sid);
    INSERT INTO qa3 VALUES (5, 'A cannot assign tasks to B''s child', false, 'allowed');
  EXCEPTION WHEN others THEN INSERT INTO qa3 VALUES (5, 'A cannot assign tasks to B''s child', true, SQLERRM); END;
  BEGIN
    UPDATE child_profiles SET name = 'hacked' WHERE id = cb;
    GET DIAGNOSTICS v = ROW_COUNT;
    INSERT INTO qa3 VALUES (6, 'A cannot rename B''s child', v = 0, v || ' rows');
  EXCEPTION WHEN others THEN INSERT INTO qa3 VALUES (6, 'A cannot rename B''s child', true, SQLERRM); END;
  BEGIN
    PERFORM increment_child_points(cb, 50);
    INSERT INTO qa3 VALUES (7, 'A cannot add points to B''s child', false, 'allowed');
  EXCEPTION WHEN others THEN INSERT INTO qa3 VALUES (7, 'A cannot add points to B''s child', true, SQLERRM); END;

  -- المهام
  INSERT INTO child_assignments (child_id, story_id, note) VALUES (ca, sid, 'اقرأها قبل النوم');
  INSERT INTO child_assignments (child_id, lesson_id) VALUES (ca, lid);
  SELECT count(*) INTO v FROM child_assignments WHERE child_id = ca AND completed_at IS NULL;
  INSERT INTO qa3 VALUES (8, 'A assigns 2 tasks to own child', v = 2, v::text);
  INSERT INTO story_reads (child_id, story_id) VALUES (ca, sid);
  SELECT completed_at INTO t FROM child_assignments WHERE child_id = ca AND story_id = sid;
  INSERT INTO qa3 VALUES (9, 'story task auto-completed on read', t IS NOT NULL, NULL);
  INSERT INTO learning_progress (child_id, lesson_id, status) VALUES (ca, lid, 'in_progress');
  SELECT completed_at INTO t FROM child_assignments WHERE child_id = ca AND lesson_id = lid;
  INSERT INTO qa3 VALUES (10, 'lesson task stays open while in progress', t IS NULL, NULL);
  UPDATE learning_progress SET status = 'completed', completed_at = now() WHERE child_id = ca AND lesson_id = lid;
  SELECT completed_at INTO t FROM child_assignments WHERE child_id = ca AND lesson_id = lid;
  INSERT INTO qa3 VALUES (11, 'lesson task auto-completed on finish', t IS NOT NULL, NULL);

  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', '', true);
  SELECT count(*) INTO v FROM child_profiles WHERE id = cb AND name = 'QA child B';
  INSERT INTO qa3 VALUES (12, 'B''s child unchanged', v = 1, NULL);
  DELETE FROM auth.users WHERE id IN (ua, ub);
  SELECT count(*) INTO v FROM child_profiles WHERE parent_id IN (ua, ub);
  INSERT INTO qa3 VALUES (13, 'test accounts and data deleted', v = 0, NULL);
END;
$$;
SELECT n, step, ok, detail FROM qa3 ORDER BY n;
