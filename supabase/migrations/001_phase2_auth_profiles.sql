-- ============================================================
-- Phase 2: Authentication & Profiles
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ----------------
-- Parent Profiles
-- ----------------
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ----------------
-- Child Profiles
-- ----------------
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  birth_year   SMALLINT NOT NULL CHECK (birth_year > 2010 AND birth_year <= EXTRACT(YEAR FROM NOW())::SMALLINT),
  age_group    TEXT NOT NULL CHECK (age_group IN ('3-5', '6-8', '9-12')),
  avatar_emoji TEXT NOT NULL DEFAULT '🧒',
  pin_hash     TEXT,          -- hashed PIN, nullable (optional)
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index: parent can quickly fetch their children
CREATE INDEX IF NOT EXISTS child_profiles_parent_id_idx ON public.child_profiles(parent_id);

-- ----------------
-- Auto-create parent_profile on signup
-- ----------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.parent_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------
-- updated_at auto-update
-- ----------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

-- Parent can read/update only their own profile
CREATE POLICY "parent_profiles_own" ON public.parent_profiles
  FOR ALL USING (auth.uid() = id);

-- Parent can read/write only their own children
CREATE POLICY "child_profiles_own_parent" ON public.child_profiles
  FOR ALL USING (auth.uid() = parent_id);
