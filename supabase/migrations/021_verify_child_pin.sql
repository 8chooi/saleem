-- Migration 021: verify_child_pin RPC
-- الطفل يدخل PIN من شاشة /kids ويتحقق منه

-- ضمان وجود امتداد pgcrypto
create extension if not exists pgcrypto;

-- الدالة: تقارن PIN المُدخَل بالـ hash المحفوظ
create or replace function verify_child_pin(p_child_id uuid, p_pin text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
begin
  select pin_hash into v_hash
  from child_profiles
  where id = p_child_id;

  if v_hash is null then
    -- لا يوجد PIN مضبوط → اسمح بالدخول مباشرة
    return true;
  end if;

  -- crypt يقارن الـ plain-text بالـ hash
  return v_hash = crypt(p_pin, v_hash);
end;
$$;

-- الصلاحيات: أي مستخدم مسجّل يستطيع استدعاء الدالة
grant execute on function verify_child_pin(uuid, text) to authenticated, anon;
