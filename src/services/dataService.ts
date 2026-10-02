// ==========================================================================
// Ans Anime - Data & Media Service Layer
// Persistent Local & Browser Storage, URL Sanitization, Media Detection
// ==========================================================================

import { Anime, Episode, AdminUser, AdminSession } from '../types';
import { deleteStoredVideo } from './videoStorage';

const STORAGE_CATALOG_KEY = 'ans_anime_catalog_v3';
const STORAGE_ADMIN_KEY = 'ans_anime_master_admin_v3';
const STORAGE_SESSION_KEY = 'ans_anime_admin_session_v3';
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
// Catalog Load / Save
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

// ==========================================
// Anime CRUD
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
  return true;
}

// ==========================================
// Episodes CRUD
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

  const current = list[animeIdx].episodes[epIdx];
  const cleanUrl = updates.embedUrl ? sanitizeEmbedUrl(updates.embedUrl) : current.embedUrl;
  const detectedType = updates.videoType || detectVideoType(cleanUrl);

  list[animeIdx].episodes[epIdx] = {
    ...current,
    ...updates,
    embedUrl: cleanUrl,
    videoType: detectedType,
  };
  saveCatalog(list);
  return list[animeIdx].episodes[epIdx];
}

export function deleteEpisode(animeId: string, episodeId: string): boolean {
  const targetAnimeId = String(animeId).trim();
  const targetEpId = String(episodeId).trim();
  const list = loadCatalog();
  const animeIdx = list.findIndex((a) => String(a.id).trim() === targetAnimeId);
  if (animeIdx !== -1 && list[animeIdx].episodes) {
    const epToDelete = list[animeIdx].episodes.find((e) => String(e.id).trim() === targetEpId);
    if (epToDelete && epToDelete.embedUrl && epToDelete.embedUrl.startsWith('local-video://')) {
      deleteStoredVideo(epToDelete.embedUrl).catch(() => {});
    }
    list[animeIdx].episodes = list[animeIdx].episodes.filter((e) => String(e.id).trim() !== targetEpId);
    saveCatalog(list);
  }
  return true;
}

// ==========================================
// Homepage Latest Releases Feed
// ==========================================
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

// ==========================================
// Master Admin Security (Single Admin Enforced)
// ==========================================
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
  return { exists: false };
}

export function createFirstAdmin(email: string, password: string): AdminUser {
  const status = checkAdminStatus();
  if (status.exists) {
    throw new Error('Registration is locked. One master admin already exists.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const newAdmin: AdminUser = {
    email: cleanEmail,
    passwordHash: btoa(password),
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify(newAdmin));
  setAdminSession({ email: cleanEmail, timestamp: Date.now() });
  return newAdmin;
}

export function resetAdminCredentials(email: string, newPassword: string): AdminUser {
  const cleanEmail = email.trim().toLowerCase();
  const newAdmin: AdminUser = {
    email: cleanEmail,
    passwordHash: btoa(newPassword),
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_ADMIN_KEY, JSON.stringify(newAdmin));
  setAdminSession({ email: cleanEmail, timestamp: Date.now() });
  return newAdmin;
}

export function loginAdmin(email: string, password: string): AdminSession {
  const raw = localStorage.getItem(STORAGE_ADMIN_KEY);
  if (!raw) {
    throw new Error('No administrator account exists yet. Create the master admin account first.');
  }
  const admin: AdminUser = JSON.parse(raw);
  const cleanEmail = email.trim().toLowerCase();

  if (admin.email !== cleanEmail || admin.passwordHash !== btoa(password)) {
    throw new Error('Invalid email or password.');
  }

  const session: AdminSession = { email: cleanEmail, timestamp: Date.now() };
  setAdminSession(session);
  return session;
}

export function getAdminSession(): AdminSession | null {
  try {
    // Session is stored in sessionStorage so closing or opening site always requires password!
    const raw = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    // 2-hour session expiration
    if (Date.now() - session.timestamp > 2 * 60 * 60 * 1000) {
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
    // Also remove from localStorage if any legacy key exists
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
  return parsed;
}

export function resetToDefaultCatalog(): Anime[] {
  const defaults = getDefaultCatalog();
  saveCatalog(defaults);
  return defaults;
}
