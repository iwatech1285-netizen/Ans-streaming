// ==========================================================================
// Ans Anime - Supabase Backend Integration
// Project: lsuwvqbikhuilfazamgt.supabase.co
// Real-time Database, Centralized Cloud Storage & Single-Admin Security
// ==========================================================================

import { createClient } from '@supabase/supabase-js';
import { Anime, Episode } from '../types';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://lsuwvqbikhuilfazamgt.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_whwZSa5CDB1iWpuuCXm5wg_EX3d10XU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface SupabaseHealth {
  connected: boolean;
  tablesReady: boolean;
  adminConfigured: boolean;
  error?: string;
}

/**
 * Checks if Supabase is reachable and if the required tables have been created via SQL.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  try {
    const { data: animeData, error: animeError } = await supabase
      .from('animes')
      .select('id')
      .limit(1);

    if (animeError) {
      // Table doesn't exist yet (SQL hasn't been executed in Supabase SQL editor)
      return {
        connected: true,
        tablesReady: false,
        adminConfigured: false,
        error: animeError.message,
      };
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('id', 'master_admin')
      .maybeSingle();

    return {
      connected: true,
      tablesReady: true,
      adminConfigured: !!adminData,
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesReady: false,
      adminConfigured: false,
      error: err.message || 'Network error connecting to Supabase',
    };
  }
}

/**
 * Fetches all animes and nested episodes from Supabase
 */
export async function fetchFullCatalogFromSupabase(): Promise<Anime[] | null> {
  try {
    const { data: animeRows, error: animeErr } = await supabase
      .from('animes')
      .select('*')
      .order('created_at', { ascending: false });

    if (animeErr || !animeRows) {
      return null;
    }

    const { data: epRows, error: epErr } = await supabase
      .from('episodes')
      .select('*')
      .order('episode_number', { ascending: true });

    const episodesMap = new Map<string, Episode[]>();
    if (epRows && !epErr) {
      for (const ep of epRows) {
        const item: Episode = {
          id: ep.id,
          episodeNumber: Number(ep.episode_number),
          title: ep.title,
          embedUrl: ep.embed_url,
          videoType: ep.video_type || 'embed',
          videoFileName: ep.video_file_name,
          videoFileSize: ep.video_file_size,
          serverName: ep.server_name,
          createdAt: Number(ep.created_at || Date.now()),
        };
        const list = episodesMap.get(ep.anime_id) || [];
        list.push(item);
        episodesMap.set(ep.anime_id, list);
      }
    }

    return animeRows.map((a) => ({
      id: a.id,
      title: a.title,
      desc: a.desc || '',
      genre: a.genre || '',
      thumbnailUrl: a.thumbnail_url || '',
      bannerUrl: a.banner_url || '',
      year: a.year ? Number(a.year) : undefined,
      quality: a.quality || '1080p HD',
      audio: a.audio || 'Sub | Dub',
      createdAt: Number(a.created_at || Date.now()),
      updatedAt: a.updated_at ? Number(a.updated_at) : undefined,
      episodes: episodesMap.get(a.id) || [],
    }));
  } catch (err) {
    console.warn('Supabase fetch failed:', err);
    return null;
  }
}

/**
 * Persists an anime into Supabase
 */
export async function upsertAnimeToSupabase(anime: Anime): Promise<boolean> {
  try {
    const { error } = await supabase.from('animes').upsert({
      id: anime.id,
      title: anime.title,
      desc: anime.desc,
      genre: anime.genre,
      thumbnail_url: anime.thumbnailUrl,
      banner_url: anime.bannerUrl,
      year: anime.year,
      quality: anime.quality,
      audio: anime.audio,
      created_at: anime.createdAt,
      updated_at: Date.now(),
    });

    if (error) {
      console.warn('Error saving anime to Supabase:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Deletes an anime from Supabase (cascades to episodes in postgres)
 */
export async function deleteAnimeFromSupabase(animeId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('animes').delete().eq('id', animeId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Persists an episode into Supabase
 */
export async function upsertEpisodeToSupabase(animeId: string, episode: Episode): Promise<boolean> {
  try {
    const { error } = await supabase.from('episodes').upsert({
      id: episode.id,
      anime_id: animeId,
      episode_number: episode.episodeNumber,
      title: episode.title,
      embed_url: episode.embedUrl,
      video_type: episode.videoType || 'embed',
      video_file_name: episode.videoFileName || null,
      video_file_size: episode.videoFileSize || null,
      server_name: episode.serverName || 'Server 1 (Primary HD)',
      created_at: episode.createdAt || Date.now(),
    });

    if (error) {
      console.warn('Error saving episode to Supabase:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes an episode from Supabase
 */
export async function deleteEpisodeFromSupabase(episodeId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('episodes').delete().eq('id', episodeId);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Bulk seeds an entire catalog to Supabase (used on initial connect)
 */
export async function seedCatalogToSupabase(catalog: Anime[]): Promise<boolean> {
  try {
    for (const anime of catalog) {
      await upsertAnimeToSupabase(anime);
      if (anime.episodes && anime.episodes.length > 0) {
        for (const ep of anime.episodes) {
          await upsertEpisodeToSupabase(anime.id, ep);
        }
      }
    }
    return true;
  } catch (err) {
    console.error('Failed seeding to Supabase:', err);
    return false;
  }
}
