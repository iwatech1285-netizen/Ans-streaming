import React from 'react';
import { ViewState } from '../types';
import { Play, Shield, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: ViewState) => void;
  onOpenGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenGuide }) => {
  return (
    <footer className="mt-auto bg-black border-t border-white/10 pt-12 pb-8 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
          
          {/* Brand & Disclaimer */}
          <div className="max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-3">
              <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-black">
                <Play className="w-3 h-3 fill-black translate-x-0.5" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Ans <span className="text-neutral-400">Anime</span>
              </span>
            </div>
            <p className="leading-relaxed text-neutral-400 text-xs">
              Ans Anime is a lightweight, responsive black & white streaming site with universal media embedding and direct video uploading. Streams are embedded via verified third-party hosts or local client storage with zero heavy server bloat.
            </p>
            <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-[11px] text-neutral-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ready for InfinityFree <code className="text-neutral-300">htdocs/</code> and static hosting.</span>
            </div>
          </div>

          {/* Navigation & Admin Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate({ type: 'home' });
                setTimeout(() => {
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Browse Catalog
            </button>
            <button
              onClick={onOpenGuide}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Media Embed Guide
            </button>
            {/* Admin Panel Link */}
            <button
              onClick={() => onNavigate({ type: 'admin' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-neutral-900/80 hover:bg-white hover:text-black text-white font-semibold transition-all shadow-[0_0_12px_rgba(255,255,255,0.08)]"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-600 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Ans Anime. Ultra-fast black & white cinema player.
          </div>
          <div className="flex items-center gap-4">
            <span>Vanilla HTML/JS & React SPA Compatible</span>
            <span>•</span>
            <span className="text-neutral-400">Zero External DB Dependencies</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
