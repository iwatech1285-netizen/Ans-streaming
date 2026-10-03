import React, { useState, useEffect, useRef } from 'react';
import { Anime, Episode, ViewState } from '../types';
import { getAnimeById, getEpisodes } from '../services/dataService';
import { getVideoObjectUrl } from '../services/videoStorage';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Share2, 
  ExternalLink, 
  Tv, 
  Search, 
  AlertCircle, 
  Check, 
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import { AdsterraBanner300x250 } from './AdsterraBanner300x250';

interface WatchPlayerProps {
  animeId: string;
  episodeId: string;
  onNavigate: (view: ViewState) => void;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({ animeId, episodeId, onNavigate }) => {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>('');
  const [isBlobLoading, setIsBlobLoading] = useState(false);
  const [activeServer, setActiveServer] = useState<'primary' | 'backup'>('primary');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [episodeFilter, setEpisodeFilter] = useState('');
  const [iframeErrorTimeout, setIframeErrorTimeout] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Load Anime & Episode
  useEffect(() => {
    const a = getAnimeById(animeId);
    setAnime(a);
    if (a) {
      const eps = getEpisodes(animeId);
      setEpisodes(eps);
      const ep = eps.find((e) => e.id === episodeId) || (eps.length > 0 ? eps[0] : null);
      setCurrentEpisode(ep);
    }
  }, [animeId, episodeId]);

  // Resolve Video URL (handles local-video:// from IndexedDB)
  useEffect(() => {
    let isMounted = true;
    async function resolveSource() {
      if (!currentEpisode) return;
      const rawUrl = currentEpisode.embedUrl || '';

      if (rawUrl.startsWith('local-video://')) {
        setIsBlobLoading(true);
        const objUrl = await getVideoObjectUrl(rawUrl);
        if (isMounted) {
          setResolvedVideoUrl(objUrl || '');
          setIsBlobLoading(false);
        }
      } else {
        setResolvedVideoUrl(rawUrl);
      }
    }
    resolveSource();
    return () => {
      isMounted = false;
    };
  }, [currentEpisode]);

  // Fallback timer for iframe
  useEffect(() => {
    setIframeErrorTimeout(false);
    const timer = setTimeout(() => {
      setIframeErrorTimeout(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [resolvedVideoUrl]);

  // Theater Mode effect
  useEffect(() => {
    if (isTheaterMode) {
      document.body.classList.add('theater-mode-active');
    } else {
      document.body.classList.remove('theater-mode-active');
    }
    return () => {
      document.body.classList.remove('theater-mode-active');
    };
  }, [isTheaterMode]);

  // Navigation helpers
  const currentIndex = episodes.findIndex((e) => e.id === currentEpisode?.id);
  const prevEp = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEp = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  const goToEpisode = (ep: Episode) => {
    onNavigate({ type: 'watch', animeId, episodeId: ep.id });
  };

  // Keyboard shortcuts (N: Next, P: Prev, T: Theater)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) return;

      if (e.key === 't' || e.key === 'T') {
        setIsTheaterMode((prev) => !prev);
      } else if ((e.key === 'n' || e.key === 'N') && nextEp) {
        goToEpisode(nextEp);
      } else if ((e.key === 'p' || e.key === 'P') && prevEp) {
        goToEpisode(prevEp);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextEp, prevEp]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2500);
    } catch {
      // fallback
    }
  };

  if (!anime || !currentEpisode) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-bold text-white mb-2">Episode Not Found</h2>
        <p className="text-neutral-400 text-sm mb-4">The selected anime or episode is not available.</p>
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className="px-4 py-2 bg-white text-black font-semibold text-sm rounded-lg hover:bg-neutral-200"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isDirectVideo =
    currentEpisode.videoType === 'direct' ||
    currentEpisode.videoType === 'upload' ||
    resolvedVideoUrl.endsWith('.mp4') ||
    resolvedVideoUrl.endsWith('.webm') ||
    resolvedVideoUrl.startsWith('blob:');

  const filteredEpisodes = episodes.filter(
    (ep) =>
      ep.episodeNumber.toString().includes(episodeFilter.trim()) ||
      ep.title.toLowerCase().includes(episodeFilter.trim().toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 mb-4 flex-wrap">
        <button onClick={() => onNavigate({ type: 'home' })} className="hover:text-white">
          Home
        </button>
        <span className="text-neutral-600">&gt;</span>
        <button
          onClick={() => onNavigate({ type: 'anime-details', animeId: anime.id })}
          className="hover:text-white truncate max-w-[200px]"
        >
          {anime.title}
        </button>
        <span className="text-neutral-600">&gt;</span>
        <span className="text-white font-semibold">Episode {currentEpisode.episodeNumber}</span>
      </nav>

      {/* Main Grid: Player + Episode List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Player & Controls (Span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Universal Player Container */}
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            
            {isBlobLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-neutral-950">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-white">Loading local video stream...</p>
                <p className="text-xs text-neutral-500 mt-1">Reading video blob from browser storage</p>
              </div>
            ) : isDirectVideo && resolvedVideoUrl ? (
              /* HTML5 Video Player for Direct MP4/WebM & Local Uploads */
              <video
                ref={videoRef}
                key={resolvedVideoUrl}
                src={resolvedVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              >
                Your browser does not support HTML5 video playback.
              </video>
            ) : resolvedVideoUrl ? (
              /* Universal Iframe Player for Embedded Streams */
              <iframe
                key={resolvedVideoUrl}
                src={resolvedVideoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 bg-black"
                title={`${anime.title} - Episode ${currentEpisode.episodeNumber}`}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-neutral-950 text-neutral-400">
                <AlertCircle className="w-8 h-8 text-neutral-500 mb-2" />
                <p className="text-sm font-semibold text-white">No video stream URL configured</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Add an embed link or upload a video file for this episode in the Admin Panel.
                </p>
              </div>
            )}

            {/* Cross-origin fallback notice if third-party iframe host blocks embedded playback */}
            {!isDirectVideo && iframeErrorTimeout && (
              <div className="absolute bottom-3 left-3 right-3 bg-neutral-900/90 border border-white/15 backdrop-blur-md p-3 rounded-xl flex items-center justify-between gap-3 text-xs z-30">
                <div className="flex items-center gap-2 text-neutral-300">
                  <AlertCircle className="w-4 h-4 text-white shrink-0" />
                  <span className="truncate">Black screen or blocked by host? Try opening directly:</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={resolvedVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-white text-black font-semibold rounded text-[11px] hover:bg-neutral-200 transition-colors"
                  >
                    Open in Tab
                  </a>
                  <button
                    onClick={() => setIframeErrorTimeout(false)}
                    className="text-neutral-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Player Control Bar (Black & White Cinema) */}
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider px-2 py-0.5 bg-white/10 rounded">
                  {currentEpisode.videoType === 'upload' ? 'Local Upload' : currentEpisode.videoType === 'direct' ? 'Direct MP4' : 'Embedded Stream'}
                </span>
                <span>•</span>
                <span>{currentEpisode.serverName || 'Primary Server'}</span>
              </div>
              <h1 className="font-display font-bold text-base sm:text-lg text-white">
                {anime.title} — EP {currentEpisode.episodeNumber}: {currentEpisode.title}
              </h1>
            </div>

            {/* Navigation & Utilities */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              <button
                onClick={() => prevEp && goToEpisode(prevEp)}
                disabled={!prevEp}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 bg-neutral-900"
                title="Previous Episode (Key: P)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => nextEp && goToEpisode(nextEp)}
                disabled={!nextEp}
                className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white text-xs font-semibold text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1 bg-neutral-900"
                title="Next Episode (Key: N)"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsTheaterMode(!isTheaterMode)}
                className={`p-2 rounded-lg border text-xs transition-all ${
                  isTheaterMode
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-900 border-white/10 hover:border-white text-neutral-300 hover:text-white'
                }`}
                title="Toggle Theater Dim Mode (Key: T)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-white/10 hover:border-white bg-neutral-900 text-neutral-300 hover:text-white text-xs transition-all relative"
                title="Copy Stream Link"
              >
                {showCopiedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              </button>

              <a
                href={resolvedVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg border border-white/10 hover:border-white bg-neutral-900 text-neutral-300 hover:text-white text-xs transition-all"
                title="Popout Stream"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Anime Details Mini Card */}
          <div className="theater-dim-target bg-neutral-950 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
            <img
              src={anime.thumbnailUrl}
              alt={anime.title}
              className="w-16 h-24 object-cover rounded-lg border border-white/15 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <span>{anime.genre}</span>
                <span>•</span>
                <span>{anime.year}</span>
                <span>•</span>
                <span className="text-white font-bold">{episodes.length} Episodes</span>
              </div>
              <h2 className="font-display font-bold text-base text-white">{anime.title}</h2>
              <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                {anime.desc || 'No synopsis provided.'}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Episode Playlist (Span 1) */}
        <div className="theater-dim-target flex flex-col gap-4">
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-white" />
                <h3 className="font-display font-bold text-sm text-white">Episode Playlist</h3>
              </div>
              <span className="text-xs text-neutral-500 tabular-nums font-semibold">
                {episodes.length} Total
              </span>
            </div>

            {/* Filter by episode # */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={episodeFilter}
                onChange={(e) => setEpisodeFilter(e.target.value)}
                placeholder="Filter episode..."
                className="w-full bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder-neutral-500 pl-8 pr-3 py-1.5 focus:border-white focus:outline-none"
              />
            </div>

            {/* Scrollable Episode Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredEpisodes.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-neutral-500 text-xs">
                  No episodes match filter
                </div>
              ) : (
                filteredEpisodes.map((ep) => {
                  const isActive = ep.id === currentEpisode.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => goToEpisode(ep)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                        isActive
                          ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] font-bold'
                          : 'bg-neutral-900 border-white/10 hover:border-white/40 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold tabular-nums">EP {ep.episodeNumber}</span>
                      <span
                        className={`text-[10px] truncate max-w-full px-1 ${
                          isActive ? 'text-black/80' : 'text-neutral-500'
                        }`}
                      >
                        {ep.title || `Episode ${ep.episodeNumber}`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Adsterra 300x250 Banner Ad */}
          <AdsterraBanner300x250 label="Sponsored Partner" />
        </div>

      </div>
    </div>
  );
};
