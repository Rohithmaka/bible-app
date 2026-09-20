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

