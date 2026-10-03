-- ============================================================================
-- Ans Anime - Complete Supabase PostgreSQL Schema & Security Rules
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> Click "+ New query" -> Paste this code -> Click "Run"
-- ============================================================================

-- 1. Create Anime Catalog Table
CREATE TABLE IF NOT EXISTS public.animes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  "desc" TEXT DEFAULT '',
  genre TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  year INTEGER DEFAULT 2024,
  quality TEXT DEFAULT '1080p HD',
  audio TEXT DEFAULT 'Sub | Dub',
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- 2. Create Episodes Table (Cascades deletion with anime)
CREATE TABLE IF NOT EXISTS public.episodes (
  id TEXT PRIMARY KEY,
  anime_id TEXT NOT NULL REFERENCES public.animes(id) ON DELETE CASCADE,
  episode_number NUMERIC NOT NULL,
  title TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'embed',
  video_file_name TEXT,
  video_file_size TEXT,
  server_name TEXT DEFAULT 'Server 1 (Primary HD)',
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- 3. Create Admin Users Table (Strictly enforces exactly 1 master admin)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY DEFAULT 'master_admin',
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Indexing for high-speed queries & episode sorting
CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON public.episodes(anime_id);
CREATE INDEX IF NOT EXISTS idx_episodes_number ON public.episodes(anime_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_animes_created_at ON public.animes(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if any to avoid duplicates on re-run
DROP POLICY IF EXISTS "Allow public read on animes" ON public.animes;
DROP POLICY IF EXISTS "Allow public write on animes" ON public.animes;
DROP POLICY IF EXISTS "Allow public read on episodes" ON public.episodes;
DROP POLICY IF EXISTS "Allow public write on episodes" ON public.episodes;
DROP POLICY IF EXISTS "Allow read on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow insert on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow update on admin_users" ON public.admin_users;

-- 6. RLS Policies for Animes
-- Anyone can view the anime catalog
CREATE POLICY "Allow public read on animes" 
  ON public.animes FOR SELECT 
  USING (true);

-- Allow inserting, updating, and deleting animes
CREATE POLICY "Allow public write on animes" 
  ON public.animes FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 7. RLS Policies for Episodes
-- Anyone can view episodes
CREATE POLICY "Allow public read on episodes" 
  ON public.episodes FOR SELECT 
  USING (true);

-- Allow inserting, updating, and deleting episodes
CREATE POLICY "Allow public write on episodes" 
  ON public.episodes FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 8. RLS Policies for Admin Users
-- Anyone can read admin status to verify if master admin is registered
CREATE POLICY "Allow read on admin_users" 
  ON public.admin_users FOR SELECT 
  USING (true);

-- Allow initial master admin creation (Primary key 'master_admin' guarantees max 1 row)
CREATE POLICY "Allow insert on admin_users" 
  ON public.admin_users FOR INSERT 
  WITH CHECK (id = 'master_admin');

-- Allow admin password update
CREATE POLICY "Allow update on admin_users" 
  ON public.admin_users FOR UPDATE 
  USING (id = 'master_admin')
  WITH CHECK (id = 'master_admin');

-- 9. Enable Realtime Replication for instant live updates across all devices
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.animes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.episodes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
