export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  embedUrl: string;
  videoType?: 'embed' | 'direct' | 'upload';
  videoFileName?: string;
  videoFileSize?: string;
  serverName?: string;
  createdAt: number;
}

export interface Anime {
  id: string;
  title: string;
  desc: string;
  genre: string;
  thumbnailUrl: string;
  bannerUrl: string;
  year?: number;
  quality?: string;
  audio?: string;
  episodes: Episode[];
  createdAt: number;
  updatedAt?: number;
}

export interface AdminUser {
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface AdminSession {
  email: string;
  timestamp: number;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'anime-details'; animeId: string }
  | { type: 'watch'; animeId: string; episodeId: string }
  | { type: 'admin' }
  | { type: 'admin-login' };
