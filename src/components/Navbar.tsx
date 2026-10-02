import React, { useState, useEffect, useRef } from 'react';
import { Anime, ViewState } from '../types';
import { getAnimeList, getWatchlist, getAdminSession } from '../services/dataService';
import { Search, Play, X, Shield, Bookmark, Tv, Compass } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onSearchSelect?: (animeId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onSearchSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const adminSession = getAdminSession();
  const watchlistCount = getWatchlist().length;

  // Handle Search Input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }
    const matches = getAnimeList('All', searchQuery).slice(0, 6);
    setSearchResults(matches);
    setIsDropdownOpen(true);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global hotkey: '/' focuses search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''))) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Zone 1: Wordmark Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              </div>
              <div className="leading-tight">
                <span className="font-display font-black text-xl tracking-tight text-white">
                  Ans <span className="text-neutral-400 group-hover:text-white transition-colors">Anime</span>
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-400">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`hover:text-white transition-colors flex items-center gap-1.5 ${
                currentView.type === 'home' ? 'text-white' : ''
              }`}
            >
              <Tv className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setTimeout(() => {
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              Browse Catalog
            </button>
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setTimeout(() => {
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-white transition-colors flex items-center gap-1.5 relative"
            >
              <Bookmark className="w-4 h-4" />
              Watchlist
              {watchlistCount > 0 && (
                <span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Search Bar with Dropdown & Admin Access */}
          <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md justify-end">
            <div ref={searchContainerRef} className="relative w-full">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsDropdownOpen(true)}
                  placeholder="Search anime... (Press '/' to focus)"
                  className="w-full bg-neutral-900/90 text-white placeholder-neutral-500 text-xs sm:text-sm pl-9 pr-8 py-2 rounded-full border border-white/10 focus:border-white focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-2.5 text-neutral-400 hover:text-white text-xs"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Search Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-950 border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-modal">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400">
                      No anime found matching <span className="text-white font-medium">"{searchQuery}"</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {searchResults.map((anime) => (
                        <div
                          key={anime.id}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                            if (onSearchSelect) {
                              onSearchSelect(anime.id);
                            } else {
                              onNavigate({ type: 'anime-details', animeId: anime.id });
                            }
                          }}
                          className="flex items-center gap-3 p-2.5 hover:bg-neutral-900 cursor-pointer transition-colors"
                        >
                          <img
                            src={anime.thumbnailUrl}
                            alt={anime.title}
                            className="w-10 h-14 object-cover rounded border border-white/10 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white truncate">{anime.title}</h4>
                            <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span className="truncate">{anime.genre.split(',')[0]}</span>
                              <span className="text-neutral-600">•</span>
                              <span className="text-white/80">{anime.episodes?.length || 0} Eps</span>
                              <span className="text-neutral-600">•</span>
                              <span className="text-[10px] px-1 py-0.2 bg-white/10 text-white rounded">HD</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Admin Portal Quick Button */}
            <button
              onClick={() => onNavigate({ type: 'admin' })}
              title={adminSession ? `Admin Active (${adminSession.email})` : 'Admin Portal (Password Required)'}
              className="p-2 rounded-full border border-white/10 hover:border-white text-neutral-400 hover:text-white transition-all bg-neutral-900 shrink-0"
            >
              <Shield className={`w-4 h-4 ${adminSession ? 'text-white' : ''}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
