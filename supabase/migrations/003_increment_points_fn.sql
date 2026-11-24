-- دالة لزيادة نقاط الطفل بشكل آمن
CREATE OR REPLACE FUNCTION increment_child_points(p_child_id UUID, p_points INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO child_points (child_id, total_points, updated_at)
    VALUES (p_child_id, p_points, NOW())
  ON CONFLICT (child_id) DO UPDATE
    SET total_points = child_points.total_points + p_points,
        updated_at   = NOW();
END;
$$;
