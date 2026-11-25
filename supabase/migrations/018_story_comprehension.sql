-- القراءة تُحتسب بفهم القصة: أسئلة لكل قصة، والتصحيح داخل قاعدة البيانات
-- quiz: [{ "q": "...", "options": ["...", "..."], "correct": 0 }]
ALTER TABLE stories ADD COLUMN IF NOT EXISTS quiz JSONB;
ALTER TABLE story_reads ADD COLUMN IF NOT EXISTS score INT;

CREATE OR REPLACE FUNCTION public.submit_story_quiz(p_child_id UUID, p_story_id UUID, p_answers INT[])
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  q JSONB;
  total INT;
  correct INT := 0;
  result INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM child_profiles WHERE id = p_child_id AND parent_id = auth.uid()) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;
  SELECT quiz INTO q FROM stories WHERE id = p_story_id AND is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'story not found';
  END IF;

  total := COALESCE(jsonb_array_length(q), 0);
  IF total = 0 THEN
    result := 100;
  ELSE
    FOR i IN 0 .. total - 1 LOOP
      IF p_answers[i + 1] IS NOT NULL AND p_answers[i + 1] = (q -> i ->> 'correct')::INT THEN
        correct := correct + 1;
      END IF;
    END LOOP;
    result := round(correct * 100.0 / total);
  END IF;

  IF result >= 60 THEN
    INSERT INTO story_reads (child_id, story_id, score) VALUES (p_child_id, p_story_id, result)
    ON CONFLICT (child_id, story_id) DO UPDATE SET score = GREATEST(story_reads.score, EXCLUDED.score);
  END IF;
  RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_story_quiz(UUID, UUID, INT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_story_quiz(UUID, UUID, INT[]) TO authenticated;

-- لا تسجيل قراءة مباشر من الموقع؛ فقط عبر التصحيح
REVOKE INSERT ON story_reads FROM authenticated;
DROP POLICY IF EXISTS story_reads_insert ON story_reads;
