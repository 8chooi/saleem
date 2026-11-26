-- Function to bulk-import StoryWeaver pages data
-- SECURITY DEFINER: bypasses RLS so anon key can call it
CREATE OR REPLACE FUNCTION import_sw_pages(data jsonb)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE updated int;
BEGIN
  WITH rows AS (
    UPDATE open_library t
    SET
      pages       = (item->>'pages')::jsonb,
      orientation = COALESCE(NULLIF(item->>'orientation',''), 'landscape'),
      audio_url   = NULLIF(item->>'audio_url', ''),
      vtt_url     = NULLIF(item->>'vtt_url', '')
    FROM jsonb_array_elements(data) AS item
    WHERE t.sw_id = (item->>'sw_id')::int
    RETURNING 1
  )
  SELECT COUNT(*) INTO updated FROM rows;
  RETURN updated;
END;
$$;

-- Allow anon + authenticated to call this function
GRANT EXECUTE ON FUNCTION import_sw_pages(jsonb) TO anon, authenticated;
