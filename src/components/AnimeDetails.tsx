import React, { useState, useEffect } from 'react';
import { Anime, Episode, ViewState } from '../types';
import { getAnimeById, getEpisodes, getWatchlist, toggleWatchlist } from '../services/dataService';
import { Play, Bookmark, ArrowLeft, Film, Layers } from 'lucide-react';
import { AdsterraBanner300x250 } from './AdsterraBanner300x250';

interface AnimeDetailsProps {
  animeId: string;
  onNavigate: (view: ViewState) => void;
  onWatchlistChanged: () => void;
}

export const AnimeDetails: React.FC<AnimeDetailsProps> = ({ animeId, onNavigate, onWatchlistChanged }) => {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    const a = getAnimeById(animeId);
    setAnime(a);
    if (a) {
      setEpisodes(getEpisodes(animeId));
    }
  }, [animeId]);

  if (!anime) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-white mb-2">Anime Not Found</h2>
        <p className="text-neutral-400 text-sm mb-4">The selected anime could not be found in the database.</p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-lg hover:bg-neutral-200"
        >
          Return Home
        </button>
      </div>
    );
  }

  const watchlist = getWatchlist();
  const isInWatchlist = watchlist.includes(anime.id);
  const firstEp = episodes.length > 0 ? episodes[0] : null;

  const handleToggleWatchlist = () => {
    toggleWatchlist(anime.id);
    onWatchlistChanged();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate({ type: 'home' })}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Catalog</span>
      </button>

      {/* Hero Header with Backdrop */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-neutral-950 p-6 sm:p-10 mb-8 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 brightness-50 opacity-40"
          style={{ backgroundImage: `url('${anime.bannerUrl || anime.thumbnailUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Poster */}
          <div className="w-48 sm:w-56 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-neutral-900">
            <img
              src={anime.thumbnailUrl}
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-semibold text-neutral-400 mb-3">
              <span className="uppercase text-[10px] text-white border border-white/30 px-2 py-0.5 rounded bg-white/5 font-bold">
                {anime.quality || '1080p HD'}
              </span>
              <span>•</span>
              <span className="text-neutral-300">{anime.genre}</span>
              <span>•</span>
              <span className="text-white font-bold tabular-nums">{episodes.length} Episodes</span>
              <span>•</span>
              <span>{anime.year}</span>
              <span>•</span>
              <span className="text-white/80">{anime.audio || 'Sub | Dub'}</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight mb-3">
              {anime.title}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 max-w-2xl font-normal">
              {anime.desc || 'No synopsis provided.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {firstEp ? (
                <button
                  onClick={() => onNavigate({ type: 'watch', animeId: anime.id, episodeId: firstEp.id })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm tracking-wide transition-all shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Watch Episode 1</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-500 text-xs font-semibold"
                >
                  No Episodes Available
                </button>
              )}

              <button
                onClick={handleToggleWatchlist}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isInWatchlist
                    ? 'bg-white/20 border-white text-white'
                    : 'bg-white/5 border-white/20 hover:border-white/40 text-neutral-300 hover:text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'fill-white' : ''}`} />
                <span>{isInWatchlist ? 'In Watchlist' : '+ Watchlist'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Episodes Section */}
      <section className="bg-neutral-950 border border-white/10 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-white" />
            <h2 className="font-display font-bold text-lg text-white">All Streaming Episodes</h2>
            <span className="text-xs text-neutral-400 font-semibold tabular-nums px-2 py-0.5 rounded-full bg-white/10">
              {episodes.length} Total
            </span>
          </div>
          <span className="text-xs text-neutral-400">Select an episode below to launch player</span>
        </div>

        {episodes.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No episodes uploaded yet for this anime. Check back soon or add one in the Admin Panel!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => onNavigate({ type: 'watch', animeId: anime.id, episodeId: ep.id })}
                className="group flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 hover:border-white bg-neutral-900 hover:bg-white text-white hover:text-black transition-all shadow hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                <span className="font-display font-bold text-sm tabular-nums">EP {ep.episodeNumber}</span>
                <span className="text-[10px] text-neutral-400 group-hover:text-black/70 truncate max-w-full mt-0.5">
                  {ep.title || `Episode ${ep.episodeNumber}`}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Adsterra 300x250 Banner Ad */}
      <AdsterraBanner300x250 label="Sponsored Recommendation" className="mt-8" />

    </div>
  );
};
