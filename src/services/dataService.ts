// ==========================================================================
// Ans Anime - Data & Media Service Layer
// Integrated with Supabase Cloud Backend (Project: lsuwvqbikhuilfazamgt)
// Real-time synchronization, Single-Admin Database Security & Offline Cache
// ==========================================================================

import { Anime, Episode, AdminUser, AdminSession } from '../types';
import { deleteStoredVideo } from './videoStorage';
import { 
  supabase, 
  fetchFullCatalogFromSupabase, 
  upsertAnimeToSupabase, 
  deleteAnimeFromSupabase, 
  upsertEpisodeToSupabase, 
  deleteEpisodeFromSupabase,
  seedCatalogToSupabase
} from './supabaseClient';

const STORAGE_CATALOG_KEY = 'ans_anime_catalog_v3';
const STORAGE_ADMIN_KEY = 'ans_anime_master_admin_v3';
const STORAGE_SESSION_KEY = 'ans_anime_admin_active_session_v4';
const STORAGE_WATCHLIST_KEY = 'ans_anime_watchlist_v3';

// ==========================================
// Universal URL Sanitizer & Media Detection
// ==========================================
export function sanitizeEmbedUrl(input: string): string {
  if (!input) return '';
  let url = String(input).trim();

  // 1. If user pasted a full <iframe ... src="..." ...> tag, extract the src!
  const iframeMatch = url.match(/src\s*=\s*["']?([^"'\s>]+)/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1];
  }

  // Remove surrounding quotes if any
  url = url.replace(/^["']|["']$/g, '').trim();

  // Handle protocol-relative URLs (e.g. //example.com/embed)
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  // 2. YouTube standard URL, short, or shorts -> convert to embed URL
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([^?&"'>\s]+)/i);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }

  // 3. Google Drive view -> preview
  if (url.includes('drive.google.com/file/d/') && url.endsWith('/view')) {
    return url.replace(/\/view$/, '/preview');
  }

  // 4. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch && vimeoMatch[1] && !url.includes('player.vimeo.com')) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
}

export function detectVideoType(url: string): 'upload' | 'direct' | 'embed' {
  if (!url) return 'embed';
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('local-video://') || clean.startsWith('blob:') || clean.startsWith('data:video/')) {
    return 'upload';
  }
  if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mkv') || clean.includes('.mp4?') || clean.includes('.webm?')) {
    return 'direct';
  }
  return 'embed';
}

// Initial high-fidelity default catalog with working embed video streams
function getDefaultCatalog(): Anime[] {
  return [
    {
      id: 'solo-leveling',
      title: 'Solo Leveling: Arise',
      desc: "In a world where hunters must conquer dungeons to survive, Sung Jinwoo is mockingly known as the 'Weakest Hunter of All Mankind.' Betrayed and left for dead in a catastrophic double dungeon, Jinwoo awakens to find a mysterious quest interface only he can see—granting him the unprecedented ability to level up infinitely as the Shadow Monarch.",
      genre: 'Action, Fantasy, Supernatural',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
      year: 2024,
      quality: '1080p HD',
      audio: 'Sub | Dub',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      episodes: [
        {
          id: 'sl-ep-1',
          episodeNumber: 1,
          title: "I'm Used to It",
          embedUrl: 'https://www.youtube.com/embed/oVb6H9PqFEE?autoplay=0&rel=0',
          videoType: 'embed',
          serverName: 'Server 1 (Primary HD)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
        },
        {
          id: 'sl-ep-2',
          episodeNumber: 2,
          title: 'If I Had One More Chance',
          embedUrl: 'https://www.youtube.com/embed/oVb6H9PqFEE?autoplay=0&rel=0',
          videoType: 'embed',
          serverName: 'Server 1 (Primary HD)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        },
        {
          id: 'sl-ep-3',
          episodeNumber: 3,
          title: "It's Like a Quest",
          embedUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          videoType: 'direct',
          serverName: 'Server 2 (Direct MP4)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
        },
      ],
    },
    {
      id: 'demon-slayer',
      title: 'Demon Slayer: Kimetsu no Yaiba',
      desc: "Tanjiro Kamado's quiet mountain life is shattered when his family is slaughtered by demons, and his sister Nezuko is transformed into one. Armed with unyielding resolve and water breathing swordsmanship, Tanjiro joins the Demon Slayer Corps to avenge his family and cure his sister.",
      genre: 'Action, Adventure, Shounen',
      thumbnailUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
      year: 2024,
      quality: '1080p HD',
      audio: 'Sub | Dub',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      episodes: [
        {
          id: 'ds-ep-1',
          episodeNumber: 1,
          title: 'Cruelty',
          embedUrl: 'https://www.youtube.com/embed/Q4gTv388i24?autoplay=0&rel=0',
          videoType: 'embed',
          serverName: 'Server 1 (Primary HD)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        },
        {
          id: 'ds-ep-2',
          episodeNumber: 2,
          title: 'Trainer Sakonji Urokodaki',
          embedUrl: 'https://www.youtube.com/embed/Q4gTv388i24?autoplay=0&rel=0',
          videoType: 'embed',
          serverName: 'Server 1 (Primary HD)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        },
      ],
    },
    {
      id: 'jujutsu-kaisen',
      title: 'Jujutsu Kaisen: Shibuya Incident',
      desc: 'High schooler Yuji Itadori swallows a rotten talisman—the finger of King of Curses Ryomen Sukuna—becoming immersed in the deadly underground world of Jujutsu Sorcery alongside Satoru Gojo.',
      genre: 'Action, Dark Fantasy, Supernatural',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1400&auto=format&fit=crop&q=80',
      year: 2023,
      quality: '1080p HD',
      audio: 'Sub | Dub',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
      episodes: [
        {
          id: 'jjk-ep-1',
          episodeNumber: 1,
          title: 'Ryomen Sukuna',
          embedUrl: 'https://www.youtube.com/embed/oVb6H9PqFEE?autoplay=0&rel=0',
          videoType: 'embed',
          serverName: 'Server 1 (Primary HD)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        },
      ],
    },
    {
      id: 'cyberpunk-edgerunners',
      title: 'Cyberpunk: Edgerunners',
      desc: 'In Night City, a dystopian metropolis obsessed with cybernetic modification and corporate greed, street kid David Martinez loses everything and becomes an outlaw mercenary.',
      genre: 'Action, Sci-Fi, Cyberpunk',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&auto=format&fit=crop&q=80',
      year: 2023,
      quality: '1080p HD',
      audio: 'Sub | Dub',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
      episodes: [
        {
          id: 'cp-ep-1',
          episodeNumber: 1,
          title: 'Let You Down',
          embedUrl: 'https://www.youtube.com/embed/oVb6H9PqFEE?autoplay=0&rel=0',
          videoType: 'embed',
          serverName: 'Server 1 (Primary HD)',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
        },
      ],
    },
  ];
}

// ==========================================
// Catalog Load / Save & Supabase Sync
// ==========================================
export function loadCatalog(): Anime[] {
  try {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading catalog from storage, using defaults:', e);
  }
  const defaults = getDefaultCatalog();
  saveCatalog(defaults);
  return defaults;
}

export function saveCatalog(catalog: Anime[]): void {
  try {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
  } catch (err) {
    console.error('Failed to save catalog to localStorage:', err);
  }
}

/**
 * Initializes Supabase real-time connection and fetches latest catalog from cloud.
 * Calls onCatalogUpdated whenever Supabase changes (real-time).
 */
export function initCatalogWithSupabase(onCatalogUpdated: (catalog: Anime[]) => void): () => void {
  let isMounted = true;

  // 1. Asynchronously fetch from Supabase
  fetchFullCatalogFromSupabase().then(async (cloudCatalog) => {
    if (!isMounted) return;
    if (cloudCatalog && cloudCatalog.length > 0) {
      saveCatalog(cloudCatalog);
      onCatalogUpdated(cloudCatalog);
    } else if (cloudCatalog && cloudCatalog.length === 0) {
      // Cloud database exists but is empty -> automatically seed initial anime catalog
      const current = loadCatalog();
      await seedCatalogToSupabase(current);
    }
  }).catch((err) => {
    console.warn('Supabase initial fetch skipped (using local cache):', err);
  });

  // 2. Real-time Subscription for live updates across all devices
  try {
    const channel = supabase
      .channel('ans-anime-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animes' }, async () => {
        const fresh = await fetchFullCatalogFromSupabase();
        if (fresh && isMounted) {
          saveCatalog(fresh);
          onCatalogUpdated(fresh);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'episodes' }, async () => {
        const fresh = await fetchFullCatalogFromSupabase();
        if (fresh && isMounted) {
          saveCatalog(fresh);
          onCatalogUpdated(fresh);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {
      isMounted = false;
    };
  }
}

// ==========================================
// Anime CRUD (Local + Supabase Cloud Sync)
// ==========================================
export function getAnimeList(genreFilter: string = 'All', searchQuery: string = ''): Anime[] {
  let list = loadCatalog();
  if (genreFilter && genreFilter !== 'All') {
    const gLower = genreFilter.toLowerCase();
    list = list.filter((a) => a.genre && a.genre.toLowerCase().includes(gLower));
  }
  if (searchQuery && searchQuery.trim()) {
    const sLower = searchQuery.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(sLower) ||
        (a.genre && a.genre.toLowerCase().includes(sLower)) ||
        (a.desc && a.desc.toLowerCase().includes(sLower))
    );
  }
  return list;
}

export function getAnimeById(animeId: string): Anime | null {
  if (!animeId) return null;
  const list = loadCatalog();
  const targetId = String(animeId).trim().toLowerCase();
  return list.find((a) => String(a.id).trim().toLowerCase() === targetId) || null;
}

export function addAnime(animeData: Partial<Anime>): Anime {
  const title = (animeData.title || '').trim();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = slug ? `${slug}-${Date.now().toString().slice(-4)}` : `anime-${Date.now()}`;

  const newAnime: Anime = {
    id,
    title,
    desc: (animeData.desc || '').trim(),
    genre: (animeData.genre || 'Action, Anime').trim(),
    thumbnailUrl:
      (animeData.thumbnailUrl || '').trim() ||
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    bannerUrl:
      (animeData.bannerUrl || '').trim() ||
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80',
    year: animeData.year || new Date().getFullYear(),
    quality: animeData.quality || '1080p HD',
    audio: animeData.audio || 'Sub | Dub',
    createdAt: Date.now(),
    episodes: animeData.episodes || [],
  };

  const list = loadCatalog();
  list.unshift(newAnime);
  saveCatalog(list);

  // Sync to Supabase cloud in background
  upsertAnimeToSupabase(newAnime).catch(() => {});

  return newAnime;
}

export function updateAnime(animeId: string, updates: Partial<Anime>): Anime {
  const targetId = String(animeId).trim();
  const list = loadCatalog();
  const idx = list.findIndex((a) => String(a.id).trim() === targetId);
  if (idx === -1) {
    throw new Error(`Anime not found with ID: ${animeId}`);
  }

  list[idx] = {
    ...list[idx],
    ...updates,
    updatedAt: Date.now(),
  };
  saveCatalog(list);

  // Sync update to Supabase cloud
  upsertAnimeToSupabase(list[idx]).catch(() => {});

  return list[idx];
}

export function deleteAnime(animeId: string): boolean {
  const targetId = String(animeId).trim();
  let list = loadCatalog();
  const toDelete = list.find((a) => String(a.id).trim() === targetId);

  // Clean up any uploaded videos associated with episodes
  if (toDelete && toDelete.episodes) {
    toDelete.episodes.forEach((ep) => {
      if (ep.embedUrl && ep.embedUrl.startsWith('local-video://')) {
        deleteStoredVideo(ep.embedUrl).catch(() => {});
      }
    });
  }

  list = list.filter((a) => String(a.id).trim() !== targetId);
  saveCatalog(list);

  // Delete from Supabase cloud
  deleteAnimeFromSupabase(targetId).catch(() => {});

  return true;
}

// ==========================================
// Episodes CRUD (Local + Supabase Cloud Sync)
// ==========================================
export function getEpisodes(animeId: string): Episode[] {
  const anime = getAnimeById(animeId);
  if (!anime || !anime.episodes) return [];
  return [...anime.episodes].sort((a, b) => Number(a.episodeNumber) - Number(b.episodeNumber));
}

export function getEpisodeById(animeId: string, episodeId: string): Episode | null {
  const episodes = getEpisodes(animeId);
  const targetEpId = String(episodeId).trim();
  return episodes.find((e) => String(e.id).trim() === targetEpId) || null;
}

export function addEpisode(animeId: string, episodeData: Partial<Episode>): Episode {
  const targetAnimeId = String(animeId).trim();
  const list = loadCatalog();
  const animeIdx = list.findIndex((a) => String(a.id).trim() === targetAnimeId);
  if (animeIdx === -1) {
    throw new Error(`Anime not found with ID: ${targetAnimeId}`);
  }

  const cleanUrl = episodeData.embedUrl ? sanitizeEmbedUrl(episodeData.embedUrl) : '';
  const epNum = Number(episodeData.episodeNumber) || (list[animeIdx].episodes.length + 1);
  const detectedType = episodeData.videoType || detectVideoType(cleanUrl);

  const newEp: Episode = {
    id: `ep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    episodeNumber: epNum,
    title: episodeData.title ? episodeData.title.trim() : `Episode ${epNum}`,
    embedUrl: cleanUrl,
    videoType: detectedType,
    videoFileName: episodeData.videoFileName,
    videoFileSize: episodeData.videoFileSize,
    serverName: episodeData.serverName || (detectedType === 'upload' ? 'Local Video Stream' : 'Server 1 (Primary HD)'),
    createdAt: Date.now(),
  };

  if (!list[animeIdx].episodes) list[animeIdx].episodes = [];
  list[animeIdx].episodes.push(newEp);
  saveCatalog(list);

  // Sync to Supabase cloud in background
  upsertEpisodeToSupabase(targetAnimeId, newEp).catch(() => {});

  return newEp;
}

export function updateEpisode(animeId: string, episodeId: string, updates: Partial<Episode>): Episode {
  const targetAnimeId = String(animeId).trim();
  const targetEpId = String(episodeId).trim();
  const list = loadCatalog();
  const animeIdx = list.findIndex((a) => String(a.id).trim() === targetAnimeId);
  if (animeIdx === -1) {
    throw new Error(`Anime not found with ID: ${targetAnimeId}`);
  }

  const epIdx = list[animeIdx].episodes.findIndex((e) => String(e.id).trim() === targetEpId);
  if (epIdx === -1) {
    throw new Error(`Episode not found with ID: ${targetEpId}`);
  }

  const currentEp = list[animeIdx].episodes[epIdx];
  const cleanUrl = updates.embedUrl ? sanitizeEmbedUrl(updates.embedUrl) : currentEp.embedUrl;
  const detectedType = updates.videoType || (updates.embedUrl ? detectVideoType(cleanUrl) : currentEp.videoType);

  const updatedEp: Episode = {
    ...currentEp,
    ...updates,
    embedUrl: cleanUrl,
    videoType: detectedType,
  };

  list[animeIdx].episodes[epIdx] = updatedEp;
  saveCatalog(list);

  // Sync update to Supabase
  upsertEpisodeToSupabase(targetAnimeId, updatedEp).catch(() => {});

  return updatedEp;
}

export function deleteEpisode(animeId: string, episodeId: string): boolean {
  const targetAnimeId = String(animeId).trim();
  const targetEpId = String(episodeId).trim();
  const list = loadCatalog();
  const animeIdx = list.findIndex((a) => String(a.id).trim() === targetAnimeId);
  if (animeIdx === -1) return false;

  const toDelete = list[animeIdx].episodes.find((e) => String(e.id).trim() === targetEpId);
  if (toDelete && toDelete.embedUrl && toDelete.embedUrl.startsWith('local-video://')) {
    deleteStoredVideo(toDelete.embedUrl).catch(() => {});
  }

  list[animeIdx].episodes = list[animeIdx].episodes.filter((e) => String(e.id).trim() !== targetEpId);
  saveCatalog(list);

  // Delete from Supabase
  deleteEpisodeFromSupabase(targetEpId).catch(() => {});

  return true;
}

export interface LatestEpisodeFeedItem {
  animeId: string;
  animeTitle: string;
  animeThumb: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  videoType: 'embed' | 'direct' | 'upload';
  createdAt: number;
}

export function getLatestEpisodesFeed(limitCount: number = 8): LatestEpisodeFeedItem[] {
  const animes = loadCatalog();
  const items: LatestEpisodeFeedItem[] = [];

  for (const a of animes) {
    if (a.episodes && a.episodes.length > 0) {
      const sorted = [...a.episodes].sort((x, y) => Number(y.episodeNumber) - Number(x.episodeNumber));
      const latest = sorted[0];
      items.push({
        animeId: a.id,
        animeTitle: a.title,
        animeThumb: a.thumbnailUrl,
        episodeId: latest.id,
        episodeNumber: latest.episodeNumber,
        episodeTitle: latest.title,
        videoType: latest.videoType || 'embed',
        createdAt: latest.createdAt || a.createdAt,
      });
    }
  }

  return items.sort((a, b) => b.createdAt - a.createdAt).slice(0, limitCount);
}

// =========================================================================
// Master Admin Security (Single Admin Enforced in Supabase & PostgreSQL)
// =========================================================================

export const MASTER_ADMIN_EMAIL = 'anasnew1285@gmail.com';
export const MASTER_ADMIN_PASSWORD_HASH = 'ZS5WaFUyK2tQNGNVZWFx'; // btoa('e.VhU2+kP4cUeaq')

/**
 * Checks if master admin exists in local cache (sync check for instant UI)
 */
export function checkAdminStatus(): { exists: boolean; email?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return { exists: true, email: parsed.email };
      }
    }
  } catch {
    // fallback
  }
  return { exists: true, email: MASTER_ADMIN_EMAIL };
}

/**
 * Checks Supabase PostgreSQL admin_users table asynchronously.
 * Automatically synchronizes between Supabase cloud and device localStorage.
 */
export async function checkAdminStatusFromSupabase(): Promise<{ exists: boolean; email?: string }> {
  try {
    // 1. Query Supabase cloud database
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('id', 'master_admin')
      .maybeSingle();

    if (!error && data && data.email) {
      // Cloud database has master admin -> sync to this device
      localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify({ 
        email: data.email, 
        passwordHash: data.password_hash,
        createdAt: Date.now() 
      }));
      return { exists: true, email: data.email };
    }

    // 2. If Supabase is empty, check if this device created an admin in localStorage
    const localRaw = localStorage.getItem(STORAGE_ADMIN_KEY);
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw);
        if (parsed && parsed.email && parsed.passwordHash) {
          // Push this phone's existing admin credentials up to Supabase!
          await supabase.from('admin_users').upsert({
            id: 'master_admin',
            email: parsed.email.trim().toLowerCase(),
            password_hash: parsed.passwordHash,
            created_at: parsed.createdAt || Date.now(),
          });
          return { exists: true, email: parsed.email };
        }
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('Supabase admin check error:', err);
  }
  return checkAdminStatus();
}

/**
 * Creates the single master admin.
 * Enforced at PostgreSQL level: primary key 'master_admin' guarantees that
 * ONLY ONE master admin can EVER exist in the entire database.
 */
export async function createFirstAdmin(email: string, password: string): Promise<AdminUser> {
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = btoa(password);

  // 1. Check Supabase first
  try {
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('id', 'master_admin')
      .maybeSingle();

    if (existing && existing.email) {
      // Keep local in sync
      localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify({ email: existing.email, createdAt: Date.now() }));
      throw new Error('Registration is permanently locked. A master administrator account already exists.');
    }

    // Insert with fixed primary key 'master_admin'
    const { error: insertErr } = await supabase.from('admin_users').upsert({
      id: 'master_admin',
      email: cleanEmail,
      password_hash: passwordHash,
      created_at: Date.now(),
    });

    if (insertErr) {
      if (insertErr.code === '23505' || insertErr.message.includes('unique') || insertErr.message.includes('duplicate')) {
        throw new Error('Registration is locked. A master admin account already exists.');
      }
      console.warn('Supabase insert warning:', insertErr.message);
    }
  } catch (err: any) {
    if (err.message && err.message.includes('locked')) {
      throw err;
    }
    console.warn('Supabase admin check fallback:', err);
  }

  // 2. Save to device local backup
  const newAdmin: AdminUser = {
    email: cleanEmail,
    passwordHash,
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify(newAdmin));
  setAdminSession({ email: cleanEmail, timestamp: Date.now() });
  return newAdmin;
}

/**
 * Updates master admin credentials in Supabase and local cache.
 */
export async function updateMasterAdminCredentials(newEmail: string, newPassword?: string): Promise<boolean> {
  const cleanEmail = newEmail.trim().toLowerCase();
  const updates: any = {
    email: cleanEmail,
    created_at: Date.now(),
  };
  if (newPassword && newPassword.length >= 6) {
    updates.password_hash = btoa(newPassword);
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', 'master_admin');

    if (!error) {
      const current = localStorage.getItem(STORAGE_ADMIN_KEY);
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify({
        ...parsed,
        email: cleanEmail,
        ...(newPassword ? { passwordHash: btoa(newPassword) } : {}),
      }));
      setAdminSession({ email: cleanEmail, timestamp: Date.now() });
      return true;
    }
  } catch (err) {
    console.warn('Failed updating credentials in Supabase:', err);
  }
  return false;
}

/**
 * Authenticates admin credentials against Supabase cloud database
 */
export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const cleanEmail = email.trim().toLowerCase();
  const passwordHash = btoa(password);

  let authenticated = false;
  let resolvedEmail = cleanEmail;

  // 1. Check against Supabase cloud database
  try {
    const { data: adminRow, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash')
      .eq('id', 'master_admin')
      .maybeSingle();

    if (!error && adminRow) {
      resolvedEmail = adminRow.email;
      const passMatches = adminRow.password_hash === passwordHash;
      // Allow login if password matches and (email matches or email was prefilled)
      const emailMatches = !cleanEmail || adminRow.email.toLowerCase() === cleanEmail;

      if (passMatches && emailMatches) {
        authenticated = true;
        // Keep device local storage synchronized with cloud
        localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify({ 
          email: adminRow.email, 
          passwordHash: adminRow.password_hash, 
          createdAt: Date.now() 
        }));
      } else {
        throw new Error('Invalid master password or administrator email.');
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid')) {
      throw err;
    }
    console.warn('Supabase auth fallback:', err);
  }

  // 2. If Supabase table was unreachable, check device storage
  if (!authenticated) {
    const raw = localStorage.getItem(STORAGE_ADMIN_KEY);
    if (!raw) {
      throw new Error('No administrator account exists yet. Create the master admin account first.');
    }
    const admin: AdminUser = JSON.parse(raw);
    resolvedEmail = admin.email;
    const passMatches = admin.passwordHash === passwordHash;
    const emailMatches = !cleanEmail || admin.email === cleanEmail;

    if (!passMatches || !emailMatches) {
      throw new Error('Invalid email or password.');
    }
  }

  const session: AdminSession = { email: resolvedEmail, timestamp: Date.now() };
  setAdminSession(session);
  return session;
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    // 4-hour session expiration
    if (Date.now() - session.timestamp > 4 * 60 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    }
    // Clean up legacy keys
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem('ans_anime_admin_session_v3');
    localStorage.removeItem('ans_anime_admin_session_v2');
  } catch {
    // ignore
  }
}

export function logoutAdmin(): void {
  setAdminSession(null);
}

// ==========================================
// Watchlist Management
// ==========================================
export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleWatchlist(animeId: string): boolean {
  let list = getWatchlist();
  const exists = list.includes(animeId);
  if (exists) {
    list = list.filter((id) => id !== animeId);
  } else {
    list.push(animeId);
  }
  localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(list));
  return !exists;
}

// ==========================================
// Backup & Export JSON
// ==========================================
export function exportCatalogJson(): void {
  const data = loadCatalog();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ans-anime-catalog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importCatalogJson(jsonString: string): Anime[] {
  const parsed = JSON.parse(jsonString);
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid catalog format. Must be an array of anime objects.');
  }
  saveCatalog(parsed);
  // Also push imported catalog to Supabase in background
  seedCatalogToSupabase(parsed).catch(() => {});
  return parsed;
}

export function resetToDefaultCatalog(): Anime[] {
  const defaults = getDefaultCatalog();
  saveCatalog(defaults);
  seedCatalogToSupabase(defaults).catch(() => {});
  return defaults;
}
