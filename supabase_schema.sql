-- ========================================================
-- ALTER / HOLY BIBLE APP SUPABASE DATABASE MIGRATION SCRIPT
-- Copy and run this script in your Supabase SQL Editor
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Community Prayers Table
CREATE TABLE IF NOT EXISTS public.community_prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL DEFAULT 'Believer',
  is_anonymous BOOLEAN DEFAULT FALSE,
  title TEXT NOT NULL,
  burden_text TEXT NOT NULL,
  category TEXT DEFAULT 'family',
  prayer_count INT DEFAULT 1,
  standing_count INT DEFAULT 0,
  support_count INT DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE,
  updates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Prayer Circles Table
CREATE TABLE IF NOT EXISTS public.prayer_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'family',
  invite_code TEXT UNIQUE NOT NULL,
  member_count INT DEFAULT 1,
  description TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create User Profiles & Sync Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE,
  display_name TEXT,
  growth_goals JSONB,
  time_commitment TEXT,
  time_of_day TEXT,
  bookmarks JSONB,
  highlights JSONB,
  notes JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Atomic Prayer Counter RPC Function
CREATE OR REPLACE FUNCTION public.increment_prayer_count(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_prayers
  SET prayer_count = prayer_count + 1,
      updated_at = NOW()
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.community_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Allow Read & Insert for All Users
CREATE POLICY "Allow public read access to community prayers"
  ON public.community_prayers FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to community prayers"
  ON public.community_prayers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to community prayers"
  ON public.community_prayers FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to prayer circles"
  ON public.prayer_circles FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to prayer circles"
  ON public.prayer_circles FOR INSERT WITH CHECK (true);

-- 8. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_prayers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_circles;
