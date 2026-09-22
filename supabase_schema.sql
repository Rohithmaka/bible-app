-- SELA - HOLY BIBLE & SPIRITUAL GROWTH APP SUPABASE DATABASE MIGRATION SCRIPT
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
  is_reported BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
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
  email TEXT,
  age INT,
  location TEXT,
  spiritual_stage INT DEFAULT 5,
  spiritual_stage_title TEXT DEFAULT 'Growing Disciple',
  growth_goals JSONB,
  time_commitment TEXT,
  time_of_day TEXT,
  bookmarks JSONB,
  highlights JSONB,
  notes JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias table for profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  age INT,
  location TEXT,
  spiritual_stage INT DEFAULT 5,
  spiritual_stage_title TEXT DEFAULT 'Growing Disciple',
  growth_goals JSONB,
  time_commitment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Atomic Counter & Helper RPC Functions
CREATE OR REPLACE FUNCTION public.increment_prayer_count(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_prayers
  SET prayer_count = COALESCE(prayer_count, 0) + 1,
      updated_at = NOW()
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_standing_count(row_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_prayers
  SET standing_count = COALESCE(standing_count, 0) + 1,
      updated_at = NOW()
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_circle_member_count(circle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.prayer_circles
  SET member_count = COALESCE(member_count, 0) + 1
  WHERE id = circle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.find_prayer_circle_by_code(code_str TEXT)
RETURNS SETOF public.prayer_circles AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.prayer_circles
  WHERE UPPER(invite_code) = UPPER(code_str)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.report_prayer_burden(prayer_id UUID, reason_str TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.community_prayers
  SET is_reported = TRUE,
      report_reason = reason_str,
      updated_at = NOW()
  WHERE id = prayer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-provision user profile on new Supabase Auth sign-in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_id, display_name)
  VALUES (new.id, new.id::text, 'Believer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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

-- ========================================================
-- ENTERPRISE BIBLE ENGINE DATABASE SCHEMA
-- ========================================================

-- 9. Languages Table
CREATE TABLE IF NOT EXISTS public.languages (
  language_code VARCHAR(10) PRIMARY KEY,
  language_name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Translations Catalog Table
CREATE TABLE IF NOT EXISTS public.translations (
  translation_id VARCHAR(30) PRIMARY KEY,
  abbreviation VARCHAR(20) NOT NULL,
  full_name TEXT NOT NULL,
  language_code VARCHAR(10) REFERENCES public.languages(language_code),
  language_name TEXT NOT NULL,
  country_region TEXT,
  testament_support VARCHAR(10) DEFAULT 'BOTH', -- OT, NT, BOTH
  book_count INT DEFAULT 66,
  license_type VARCHAR(50) NOT NULL, -- Public Domain, CC BY-SA 4.0, Open License, Proprietary
  copyright_holder TEXT,
  copyright_notice TEXT,
  attribution_required BOOLEAN DEFAULT TRUE,
  source_url TEXT,
  license_url TEXT,
  version_year INT,
  downloadable BOOLEAN DEFAULT TRUE,
  offline_available BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  verified_license BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Translation Licensing Verification Table
CREATE TABLE IF NOT EXISTS public.translation_licenses (
  translation_id VARCHAR(30) PRIMARY KEY REFERENCES public.translations(translation_id),
  license_type TEXT NOT NULL,
  license_url TEXT,
  source_url TEXT,
  copyright_holder TEXT,
  attribution_text TEXT,
  commercial_use_allowed BOOLEAN DEFAULT TRUE,
  redistribution_allowed BOOLEAN DEFAULT TRUE,
  modification_allowed BOOLEAN DEFAULT FALSE,
  offline_storage_allowed BOOLEAN DEFAULT TRUE,
  derivative_allowed BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verification_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 12. Books Table
CREATE TABLE IF NOT EXISTS public.books (
  book_id VARCHAR(10) PRIMARY KEY,
  canonical_order INT NOT NULL,
  testament VARCHAR(2) NOT NULL, -- OT / NT
  name_english TEXT NOT NULL,
  name_localized JSONB DEFAULT '{}'::jsonb, -- e.g. {"te": "యోహాను", "hi": "यूहन्ना"}
  chapter_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id VARCHAR(10) REFERENCES public.books(book_id),
  chapter_number INT NOT NULL,
  verse_count INT NOT NULL,
  UNIQUE(book_id, chapter_number)
);

-- 14. Verses Table (Composite Primary Key)
CREATE TABLE IF NOT EXISTS public.verses (
  translation_id VARCHAR(30) REFERENCES public.translations(translation_id),
  book_id VARCHAR(10) REFERENCES public.books(book_id),
  chapter_number INT NOT NULL,
  verse_number INT NOT NULL,
  verse_text TEXT NOT NULL,
  clean_text TEXT, -- Normalized text for full-text search
  PRIMARY KEY (translation_id, book_id, chapter_number, verse_number)
);

-- 15. User Verse Bookmarks
CREATE TABLE IF NOT EXISTS public.verse_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  translation_id VARCHAR(30) NOT NULL,
  book_id VARCHAR(10) NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, translation_id, book_id, chapter, verse)
);

-- 16. User Verse Highlights
CREATE TABLE IF NOT EXISTS public.verse_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  translation_id VARCHAR(30) NOT NULL,
  book_id VARCHAR(10) NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  color VARCHAR(20) NOT NULL, -- gold, emerald, sky, purple, rose
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, translation_id, book_id, chapter, verse)
);

-- 17. User Verse Notes
CREATE TABLE IF NOT EXISTS public.verse_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  translation_id VARCHAR(30) NOT NULL,
  book_id VARCHAR(10) NOT NULL,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. User Reading History
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  book_id VARCHAR(10) NOT NULL,
  chapter INT NOT NULL,
  verse INT DEFAULT 1,
  opened_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Bible Tables
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verse_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public Read Access for Scripture Catalog and Verses
CREATE POLICY "Allow public read access to active languages" ON public.languages FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to active translations" ON public.translations FOR SELECT USING (active = true AND verified_license = true);
CREATE POLICY "Allow public read access to translation licenses" ON public.translation_licenses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Allow public read access to chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Allow public read access to verses" ON public.verses FOR SELECT USING (true);

-- User RLS Policies
CREATE POLICY "Users read own bookmarks" ON public.verse_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks" ON public.verse_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own highlights" ON public.verse_highlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own highlights" ON public.verse_highlights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own notes" ON public.verse_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own notes" ON public.verse_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own history" ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users record history" ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================================
-- 9. SPIRITUAL REMINDERS TABLE (CUSTOMIZABLE PRAYER & BIBLE)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'anonymous',
  type TEXT NOT NULL CHECK (type IN ('prayer', 'bible_reading', 'devotional', 'verse_of_day', 'custom')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  repeat_type TEXT NOT NULL CHECK (repeat_type IN ('daily', 'specific_days', 'weekdays', 'weekends', 'once')),
  selected_days JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  destination TEXT DEFAULT 'home',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_type ON public.reminders(user_id, type);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read reminders" ON public.reminders FOR SELECT USING (true);
CREATE POLICY "Allow insert reminders" ON public.reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update reminders" ON public.reminders FOR UPDATE USING (true);
CREATE POLICY "Allow delete reminders" ON public.reminders FOR DELETE USING (true);

-- ========================================================
-- 10. DAILY DEVOTIONS & USER COMPLETIONS SCHEMA
-- ========================================================

-- Daily Devotions Catalog Table
CREATE TABLE IF NOT EXISTS public.daily_devotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  title TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  verse_translation TEXT NOT NULL DEFAULT 'KJV',
  devotion TEXT NOT NULL,
  reflection_question TEXT NOT NULL,
  prayer TEXT NOT NULL,
  daily_action TEXT NOT NULL,
  book_id VARCHAR(10),
  chapter INT,
  verse INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_devotions_date ON public.daily_devotions(date);
ALTER TABLE public.daily_devotions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to daily devotions
CREATE POLICY "Allow public read daily_devotions"
  ON public.daily_devotions FOR SELECT
  USING (true);

-- User Daily Devotion Completions & Saved Table
CREATE TABLE IF NOT EXISTS public.user_daily_devotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  devotion_id UUID NOT NULL REFERENCES public.daily_devotions(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, devotion_id)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_devotions_user ON public.user_daily_devotions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_devotions_saved ON public.user_daily_devotions(user_id, saved);
ALTER TABLE public.user_daily_devotions ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users manage their own completion and bookmark records
CREATE POLICY "Users read own daily devotions"
  ON public.user_daily_devotions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own daily devotions"
  ON public.user_daily_devotions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily devotions"
  ON public.user_daily_devotions FOR UPDATE
  USING (auth.uid() = user_id);
