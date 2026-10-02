import React from 'react';
import { Anime, ViewState } from '../types';
import { Play } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
  onNavigate: (view: ViewState) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onNavigate }) => {
  return (
    <div
      onClick={() => onNavigate({ type: 'anime-details', animeId: anime.id })}
      className="group relative flex flex-col bg-neutral-950 border border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-white hover:shadow-[0_12px_30px_rgba(255,255,255,0.12)]"
    >
      {/* Poster with 2:3 aspect ratio */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
        <img
          src={anime.thumbnailUrl}
          alt={anime.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Quality Tag */}
        <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/20 tracking-wider">
          {anime.quality || 'HD'}
        </div>

        {/* Episode count tag */}
        <div className="absolute top-2.5 right-2.5 bg-black/85 backdrop-blur-md text-neutral-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-white/10 tabular-nums">
          {anime.episodes?.length || 0} Eps
        </div>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.6)] transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-black translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Info Block */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1 group-hover:text-white transition-colors">
            {anime.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="truncate">{anime.genre.split(',')[0]}</span>
            <span className="text-neutral-600">•</span>
            <span>{anime.audio || 'Sub | Dub'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
