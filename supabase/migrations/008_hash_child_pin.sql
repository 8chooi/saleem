-- الرقم السري للطفل يُحفظ مشفّراً بـ bcrypt بدل النص الصريح
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.hash_child_pin()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public, extensions AS $$
BEGIN
  IF NEW.pin_hash IS NOT NULL AND NEW.pin_hash NOT LIKE '$2%' THEN
    NEW.pin_hash := crypt(NEW.pin_hash, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hash_child_pin ON child_profiles;
CREATE TRIGGER hash_child_pin
  BEFORE INSERT OR UPDATE OF pin_hash ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.hash_child_pin();

-- تشفير الأرقام المحفوظة سابقاً كنص صريح
UPDATE child_profiles SET pin_hash = pin_hash
  WHERE pin_hash IS NOT NULL AND pin_hash NOT LIKE '$2%';
