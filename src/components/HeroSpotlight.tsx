import React from 'react';
import { Anime, ViewState } from '../types';
import { Play, Bookmark, Info, Film } from 'lucide-react';
import { getWatchlist, toggleWatchlist } from '../services/dataService';

interface HeroSpotlightProps {
  anime: Anime;
  onNavigate: (view: ViewState) => void;
  onWatchlistChanged: () => void;
}

export const HeroSpotlight: React.FC<HeroSpotlightProps> = ({ anime, onNavigate, onWatchlistChanged }) => {
  const watchlist = getWatchlist();
  const isInWatchlist = watchlist.includes(anime.id);

  const firstEp = anime.episodes && anime.episodes.length > 0 ? anime.episodes[0] : null;

  const handleWatch = () => {
    if (firstEp) {
      onNavigate({ type: 'watch', animeId: anime.id, episodeId: firstEp.id });
    } else {
      onNavigate({ type: 'anime-details', animeId: anime.id });
    }
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist(anime.id);
    onWatchlistChanged();
  };

  return (
    <section className="relative my-6 rounded-2xl overflow-hidden border border-white/15 bg-neutral-950 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
      {/* Background Banner with Noir Gradient Scrim */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter grayscale contrast-125 brightness-75 scale-100 hover:scale-105"
        style={{ backgroundImage: `url('${anime.bannerUrl || anime.thumbnailUrl}')` }}
      />
      
      {/* High-Contrast Gradient Scrim: Bottom to Top & Left to Right */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-10 md:p-14 max-w-3xl flex flex-col justify-end min-h-[420px] sm:min-h-[480px]">
        
        {/* Unboxed Minimalist Metadata */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-neutral-400 mb-3">
          <span className="uppercase tracking-widest text-[10px] sm:text-xs text-white border border-white/30 px-2 py-0.5 rounded bg-white/5">
            Spotlight
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300">{anime.genre || 'Action, Fantasy'}</span>
          <span className="text-neutral-600">•</span>
          <span className="tabular-nums text-white font-bold">{anime.episodes?.length || 0} Episodes</span>
          <span className="text-neutral-600">•</span>
          <span className="text-white/90">1080p HD</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight mb-3 text-balance drop-shadow-md">
          {anime.title}
        </h1>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm md:text-base text-neutral-300 line-clamp-3 leading-relaxed mb-6 max-w-2xl font-normal">
          {anime.desc || 'Stream full HD episodes with zero buffering and seamless playback support.'}
        </p>

        {/* Action Buttons (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            onClick={handleWatch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Watch Episode 1</span>
          </button>

          <button
            onClick={handleToggleWatchlist}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all backdrop-blur-md ${
              isInWatchlist
                ? 'bg-white/20 border-white text-white'
                : 'bg-white/5 border-white/20 hover:border-white/40 text-neutral-300 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-white' : ''}`} />
            <span>{isInWatchlist ? 'In Watchlist' : '+ Watchlist'}</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'anime-details', animeId: anime.id })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 hover:border-white text-sm font-semibold text-neutral-300 hover:text-white transition-all bg-transparent"
          >
            <Info className="w-4 h-4" />
            <span>Details</span>
          </button>
        </div>

      </div>
    </section>
  );
};
