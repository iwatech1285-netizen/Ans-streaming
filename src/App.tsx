import React, { useState, useEffect } from 'react';
import { ViewState, Anime } from './types';
import { 
  loadCatalog, 
  getAnimeList, 
  getLatestEpisodesFeed, 
  getWatchlist, 
  getAdminSession,
  logoutAdmin,
  initCatalogWithSupabase
} from './services/dataService';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroSpotlight } from './components/HeroSpotlight';
import { AnimeCard } from './components/AnimeCard';
import { AnimeDetails } from './components/AnimeDetails';
import { WatchPlayer } from './components/WatchPlayer';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { AdminEmbedGuideModal } from './components/AdminEmbedGuideModal';
import { AdsterraAds } from './components/AdsterraAds';
import { AdsterraBanner300x250 } from './components/AdsterraBanner300x250';
import { Play, Sparkles, Film, ArrowRight, Video } from 'lucide-react';

export default function App() {
  const [catalog, setCatalog] = useState<Anime[]>(() => loadCatalog());
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'home' });
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [watchlistTrigger, setWatchlistTrigger] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Initialize data & check URL params & subscribe to Supabase
  useEffect(() => {
    const data = loadCatalog();
    setCatalog(data);

    // Live Supabase Cloud Sync & Realtime changes
    const unsubscribe = initCatalogWithSupabase((fresh) => {
      setCatalog(fresh);
    });

    // Parse URL params for direct links
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const animeParam = params.get('animeId') || params.get('id');
    const epParam = params.get('ep') || params.get('epId');

    if (viewParam === 'admin') {
      const session = getAdminSession();
      setCurrentView(session ? { type: 'admin' } : { type: 'admin-login' });
    } else if (viewParam === 'watch' && animeParam && epParam) {
      setCurrentView({ type: 'watch', animeId: animeParam, episodeId: epParam });
    } else if (viewParam === 'details' && animeParam) {
      setCurrentView({ type: 'anime-details', animeId: animeParam });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Update URL params when view changes with strict Admin Auth Guard
  const handleNavigate = (view: ViewState) => {
    let targetView = view;
    // Strict Auth Guard: navigating to admin requires active session
    if (view.type === 'admin') {
      const session = getAdminSession();
      if (!session) {
        targetView = { type: 'admin-login' };
      }
    }

    setCurrentView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const url = new URL(window.location.href);
    if (targetView.type === 'home') {
      url.search = '';
    } else if (targetView.type === 'admin' || targetView.type === 'admin-login') {
      url.search = '?view=admin';
    } else if (targetView.type === 'anime-details') {
      url.search = `?view=details&animeId=${targetView.animeId}`;
    } else if (targetView.type === 'watch') {
      url.search = `?view=watch&animeId=${targetView.animeId}&ep=${targetView.episodeId}`;
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleDataRefresh = () => {
    setCatalog(loadCatalog());
    setWatchlistTrigger((prev) => prev + 1);
  };

  // Derive unique genres for filter tabs
  const allGenresSet = new Set<string>();
  catalog.forEach((a) => {
    if (a.genre) {
      a.genre.split(',').forEach((g) => {
        const clean = g.trim();
        if (clean) allGenresSet.add(clean);
      });
    }
  });
  const genreList = ['All', ...Array.from(allGenresSet)];

  const filteredAnime = getAnimeList(selectedGenre);
  const latestEpisodes = getLatestEpisodesFeed(8);
  const featuredAnime = catalog.length > 0 ? catalog[0] : null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-white selection:text-black">
      {/* Adsterra Popunder & Socialbar Monetization */}
      <AdsterraAds />
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onSearchSelect={(animeId) => handleNavigate({ type: 'anime-details', animeId })}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {currentView.type === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            
            {/* Spotlight Showcase Hero */}
            {featuredAnime && (
              <HeroSpotlight
                anime={featuredAnime}
                onNavigate={handleNavigate}
                onWatchlistChanged={handleDataRefresh}
              />
            )}

            {/* Latest Releases Stream Feed */}
            {latestEpisodes.length > 0 && selectedGenre === 'All' && (
              <section className="my-10">
                <div className="flex items-end justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-5 bg-white rounded-full"></span>
                    <h2 className="font-display font-bold text-lg sm:text-xl text-white">Latest Releases</h2>
                  </div>
                  <span className="text-xs text-neutral-400">Freshly uploaded stream episodes</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {latestEpisodes.map((item) => (
                    <div
                      key={item.episodeId}
                      onClick={() =>
                        handleNavigate({
                          type: 'watch',
                          animeId: item.animeId,
                          episodeId: item.episodeId,
                        })
                      }
                      className="group bg-neutral-950 border border-white/10 hover:border-white rounded-xl p-2.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(255,255,255,0.08)]"
                    >
                      <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-neutral-900 shrink-0 border border-white/10">
                        <img
                          src={item.animeThumb}
                          alt={item.animeTitle}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate group-hover:text-neutral-200">
                          {item.animeTitle}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-black text-white tabular-nums">
                            EP {item.episodeNumber}
                          </span>
                          <span className="text-[10px] text-neutral-500 truncate">
                            {item.episodeTitle || `Episode ${item.episodeNumber}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mt-1">
                          {item.videoType === 'upload' ? '📁 Local Video' : '⚡ HD Stream'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Adsterra 300x250 Sponsored Spotlight Banner */}
            <AdsterraBanner300x250 label="Sponsored Spotlight" className="my-6" />

            {/* Catalog Section */}
            <section id="catalog-section" className="my-10">
              <div className="flex items-end justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-5 bg-white rounded-full"></span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-white">Browse Anime Library</h2>
                </div>
                <span className="text-xs text-neutral-400">Discover popular titles across all genres</span>
              </div>

              {/* Segmented Genre Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
                {genreList.map((g) => {
                  const isActive = selectedGenre === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(g)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                          : 'bg-neutral-950 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {g === 'All' ? 'All Genres' : g}
                    </button>
                  );
                })}
              </div>

              {/* Main Anime Grid */}
              {filteredAnime.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 text-xs bg-neutral-950 rounded-2xl border border-white/10">
                  No anime found in this category.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5">
                  {filteredAnime.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} onNavigate={handleNavigate} />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

        {currentView.type === 'anime-details' && (
          <AnimeDetails
            animeId={currentView.animeId}
            onNavigate={handleNavigate}
            onWatchlistChanged={handleDataRefresh}
          />
        )}

        {currentView.type === 'watch' && (
          <WatchPlayer
            animeId={currentView.animeId}
            episodeId={currentView.episodeId}
            onNavigate={handleNavigate}
          />
        )}

        {currentView.type === 'admin' && (
          getAdminSession() ? (
            <AdminDashboard
              onNavigate={handleNavigate}
              onLogout={() => {
                logoutAdmin();
                handleNavigate({ type: 'home' });
              }}
            />
          ) : (
            <AdminLogin
              onNavigate={handleNavigate}
              onLoginSuccess={() => handleNavigate({ type: 'admin' })}
            />
          )
        )}

        {currentView.type === 'admin-login' && (
          <AdminLogin
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate({ type: 'admin' })}
          />
        )}
      </main>

      {/* Global Embed Guide Modal */}
      <AdminEmbedGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenEmbedModal={() => {
          setIsGuideOpen(false);
          handleNavigate({ type: 'admin' });
        }}
      />

      {/* Footer (Dedicated Admin Link Location) */}
      <Footer
        onNavigate={handleNavigate}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

    </div>
  );
}
