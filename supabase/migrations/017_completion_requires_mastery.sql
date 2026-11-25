-- الإنجاز يعكس تقدمًا حقيقيًا: لا يُسجَّل درس مكتملًا إلا بنتيجة 60% فأكثر
ALTER TABLE learning_progress DROP CONSTRAINT IF EXISTS learning_progress_completed_needs_mastery;
ALTER TABLE learning_progress
  ADD CONSTRAINT learning_progress_completed_needs_mastery
  CHECK (status <> 'completed' OR score >= 60) NOT VALID;
