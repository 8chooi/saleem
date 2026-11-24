-- النقاط: لا يضيف ولي الأمر نقاطاً إلا لأطفاله
CREATE OR REPLACE FUNCTION public.increment_child_points(p_child_id UUID, p_points INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM child_profiles WHERE id = p_child_id AND parent_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  INSERT INTO child_points (child_id, total_points, updated_at)
    VALUES (p_child_id, GREATEST(p_points, 0), NOW())
  ON CONFLICT (child_id) DO UPDATE
    SET total_points = child_points.total_points + GREATEST(p_points, 0),
        updated_at   = NOW();
END;
$$;

-- منح الشارات حسب شروطها في جدول badges
CREATE OR REPLACE FUNCTION public.award_child_badges(p_child_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_lessons INT;
  v_stories INT;
  v_points  INT;
BEGIN
  SELECT count(DISTINCT lesson_id) INTO v_lessons
    FROM learning_progress WHERE child_id = p_child_id AND status = 'completed';
  SELECT count(*) INTO v_stories FROM story_reads WHERE child_id = p_child_id;
  SELECT COALESCE(total_points, 0) INTO v_points FROM child_points WHERE child_id = p_child_id;
  v_points := COALESCE(v_points, 0);

  INSERT INTO child_badges (child_id, badge_id)
  SELECT p_child_id, b.id
  FROM badges b
  WHERE b.is_active
    AND CASE b.slug
      WHEN 'first-step'    THEN v_lessons >= 1
      WHEN 'curious-mind'  THEN v_lessons >= 5
      WHEN 'star-reader'   THEN v_stories >= 3
      WHEN 'century-club'  THEN v_points >= 100
      WHEN 'champion'      THEN v_points >= 500
      WHEN 'letter-master' THEN public.subject_completed(p_child_id, 'letters')
      WHEN 'math-wizard'   THEN public.subject_completed(p_child_id, 'numbers')
      WHEN 'science-fan'   THEN public.subject_completed(p_child_id, 'science')
      ELSE FALSE
    END
  ON CONFLICT (child_id, badge_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.subject_completed(p_child_id UUID, p_subject_slug TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) > 0 AND count(*) = count(lp.id)
  FROM lessons l
  JOIN subjects s ON s.id = l.subject_id AND s.slug = p_subject_slug
  LEFT JOIN learning_progress lp
    ON lp.lesson_id = l.id AND lp.child_id = p_child_id AND lp.status = 'completed'
  WHERE l.is_active;
$$;

CREATE OR REPLACE FUNCTION public.award_badges_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_child_badges(NEW.child_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS award_badges_on_progress ON learning_progress;
CREATE TRIGGER award_badges_on_progress
  AFTER INSERT OR UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.award_badges_trigger();

DROP TRIGGER IF EXISTS award_badges_on_story ON story_reads;
CREATE TRIGGER award_badges_on_story
  AFTER INSERT ON story_reads
  FOR EACH ROW EXECUTE FUNCTION public.award_badges_trigger();

DROP TRIGGER IF EXISTS award_badges_on_points ON child_points;
CREATE TRIGGER award_badges_on_points
  AFTER INSERT OR UPDATE ON child_points
  FOR EACH ROW EXECUTE FUNCTION public.award_badges_trigger();

-- الشارات تُمنح من قاعدة البيانات فقط
REVOKE INSERT ON public.child_badges FROM authenticated;
DROP POLICY IF EXISTS child_badges_insert ON child_badges;

REVOKE EXECUTE ON FUNCTION public.award_child_badges(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.subject_completed(UUID, TEXT) FROM PUBLIC, anon, authenticated;

-- منح الشارات المستحقة للأطفال الحاليين
SELECT public.award_child_badges(id) FROM child_profiles;
