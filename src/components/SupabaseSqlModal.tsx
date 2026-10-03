import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, ShieldCheck, Terminal } from 'lucide-react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_CODE = `-- ============================================================================
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
DROP POLICY IF EXISTS "Allow delete on admin_users" ON public.admin_users;

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

-- Allow delete on admin_users
CREATE POLICY "Allow delete on admin_users" 
  ON public.admin_users FOR DELETE 
  USING (id = 'master_admin');

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
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_users;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col animate-modal">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Supabase PostgreSQL Schema</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                  Project: lsuwvqbikhuilfazamgt
                </span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Run this SQL script in your Supabase SQL Editor to enable database persistence & single-admin security.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Simple Setup Steps */}
        <div className="my-4 p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 text-xs space-y-2 shrink-0">
          <div className="flex items-center gap-2 font-bold text-white">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>How to execute in 30 seconds:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px] leading-relaxed">
            <li>
              Open your{' '}
              <a
                href="https://supabase.com/dashboard/project/lsuwvqbikhuilfazamgt/sql/new"
                target="_blank"
                rel="noreferrer"
                className="text-white underline underline-offset-2 hover:text-emerald-300 inline-flex items-center gap-1 font-semibold"
              >
                Supabase SQL Editor <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>Click <strong>Copy SQL Code</strong> below and paste it into the editor.</li>
            <li>Click the green <strong>Run</strong> button in Supabase &rarr; your database is live!</li>
          </ol>
        </div>

        {/* SQL Code Preview Container */}
        <div className="relative flex-1 min-h-[220px] bg-black/90 border border-white/10 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900 border-b border-white/10 text-xs shrink-0">
            <span className="font-mono text-neutral-400 text-[11px]">supabase_schema.sql</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-white hover:bg-neutral-200 text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 text-[11px] font-mono text-neutral-300 overflow-y-auto flex-1 select-all leading-relaxed">
            {SUPABASE_SQL_CODE}
          </pre>
        </div>

        {/* Single Admin Protection Notice */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Single Admin enforced via PostgreSQL Primary Key</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
