import React, { useState } from 'react';
import { Anime, ViewState } from '../types';
import { 
  loadCatalog, 
  deleteAnime, 
  getAdminSession, 
  logoutAdmin, 
  exportCatalogJson,
  resetToDefaultCatalog
} from '../services/dataService';
import { 
  Plus, 
  Film, 
  Upload, 
  Link, 
  HardDriveDownload, 
  Sparkles, 
  LogOut, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Tv, 
  Search, 
  CheckCircle,
  HelpCircle,
  Layers,
  Video,
  Database
} from 'lucide-react';
import { MediaEmbedModal } from './MediaEmbedModal';
import { AnimeModal } from './AnimeModal';
import { EpisodeManagerModal } from './EpisodeManagerModal';
import { AdminEmbedGuideModal } from './AdminEmbedGuideModal';
import { BackupModal } from './BackupModal';
import { SupabaseSqlModal } from './SupabaseSqlModal';

interface AdminDashboardProps {
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const [catalog, setCatalog] = useState<Anime[]>(loadCatalog());
  const [searchFilter, setSearchFilter] = useState('');
  const [adminSession] = useState(getAdminSession());

  // Modal States
  const [isMediaEmbedOpen, setIsMediaEmbedOpen] = useState(false);
  const [targetEmbedAnimeId, setTargetEmbedAnimeId] = useState<string | undefined>(undefined);

  const [isAnimeModalOpen, setIsAnimeModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);

  const [managingEpisodesAnime, setManagingEpisodesAnime] = useState<Anime | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  const [deleteConfirmAnime, setDeleteConfirmAnime] = useState<Anime | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    const fresh = loadCatalog();
    setCatalog(fresh);
    if (managingEpisodesAnime) {
      const updated = fresh.find((a) => a.id === managingEpisodesAnime.id);
      setManagingEpisodesAnime(updated || null);
    }
  };

  const handleOpenEmbedForAnime = (animeId: string) => {
    setTargetEmbedAnimeId(animeId);
    setIsMediaEmbedOpen(true);
  };

  const handleSignOut = () => {
    logoutAdmin();
    onLogout();
  };

  const handleDeleteAnime = (animeId: string) => {
    deleteAnime(animeId);
    setDeleteConfirmAnime(null);
    reloadData();
    showToast('Anime deleted from database.');
  };

  // Calculate statistics
  const totalAnime = catalog.length;
  const totalEpisodes = catalog.reduce((acc, a) => acc + (a.episodes?.length || 0), 0);
  const totalUploads = catalog.reduce(
    (acc, a) => acc + (a.episodes?.filter((e) => e.videoType === 'upload').length || 0),
    0
  );
  const totalEmbeds = totalEpisodes - totalUploads;

  const filteredCatalog = catalog.filter(
    (a) =>
      a.title.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      a.genre.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      
      {/* Admin Top Bar */}
      <div className="bg-neutral-950 border-b border-white/10 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="flex items-center gap-2 group"
              title="Return to public site"
            >
              <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-black">
                <Tv className="w-3.5 h-3.5 fill-black" />
              </div>
              <span className="font-display font-bold text-base text-white">
                Ans <span className="text-neutral-400">Anime</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-neutral-300">
                ADMIN
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Supabase Cloud (lsuwvqbikhuilfazamgt)</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-white font-medium truncate max-w-[180px]">
                {adminSession?.email || 'Master Admin'}
              </span>
            </div>

            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Public Site
            </button>

            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-white/20 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs text-white animate-modal">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Metric 1 */}
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-black text-2xl text-white tabular-nums">{totalAnime}</div>
              <div className="text-xs text-neutral-400 mt-0.5">Anime in Catalog</div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-black text-2xl text-white tabular-nums">{totalEpisodes}</div>
              <div className="text-xs text-neutral-400 mt-0.5">Total Episodes Available</div>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Link className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-black text-2xl text-white tabular-nums">{totalEmbeds}</div>
              <div className="text-xs text-neutral-400 mt-0.5">Embedded Streams</div>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-neutral-950 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-black text-2xl text-white tabular-nums">{totalUploads}</div>
              <div className="text-xs text-neutral-400 mt-0.5">Local Video Uploads</div>
            </div>
          </div>

        </div>

        {/* Action Bar (Highlighted for Media Embedding & Content Management) */}
        <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <span>Catalog & Media Embedding Management</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Easily upload video files, paste third-party embed links, and manage anime titles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Primary Action Button: Media Embedding & Video Manager */}
            <button
              onClick={() => {
                setTargetEmbedAnimeId(undefined);
                setIsMediaEmbedOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wide transition-all shadow-[0_4px_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Media Embedding & Video Manager</span>
            </button>

            {/* Add New Anime */}
            <button
              onClick={() => {
                setEditingAnime(null);
                setIsAnimeModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Anime</span>
            </button>

            {/* Embed Guide */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Where to upload video files and how to embed"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Embed Guide</span>
            </button>

            {/* Backup & Restore */}
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-white/15 hover:border-white text-white bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              title="Download or restore database backup (.json)"
            >
              <HardDriveDownload className="w-4 h-4 text-emerald-400" />
              <span>Database Backup & Restore</span>
            </button>

            {/* Supabase SQL Schema & Integration */}
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500 text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/60 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              title="View & copy Supabase SQL schema"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase SQL</span>
            </button>
          </div>
        </div>

        {/* Table Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search library..."
              className="w-full bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
            />
          </div>
          <span className="text-xs text-neutral-500 font-semibold tabular-nums">
            Showing {filteredCatalog.length} of {totalAnime} titles
          </span>
        </div>

        {/* Main Anime Table */}
        <div className="bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/80 border-b border-white/10 text-neutral-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4 w-16">Poster</th>
                  <th className="py-3.5 px-4">Title & Description</th>
                  <th className="py-3.5 px-4">Genre / Tags</th>
                  <th className="py-3.5 px-4">Episodes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCatalog.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-neutral-500">
                      No anime found in database. Click "+ Add New Anime" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredCatalog.map((anime) => {
                    const epCount = anime.episodes?.length || 0;
                    return (
                      <tr key={anime.id} className="hover:bg-neutral-900/40 transition-colors">
                        
                        {/* Poster Thumbnail */}
                        <td className="py-3 px-4">
                          <img
                            src={anime.thumbnailUrl}
                            alt={anime.title}
                            className="w-10 h-14 object-cover rounded border border-white/10 shrink-0"
                          />
                        </td>

                        {/* Title & Synopsis */}
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-bold text-white text-sm leading-tight">{anime.title}</div>
                          <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5 font-normal">
                            {anime.desc || 'No synopsis provided.'}
                          </div>
                        </td>

                        {/* Genre / Tags */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {anime.genre.split(',').map((g) => (
                              <span
                                key={g}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-neutral-300"
                              >
                                {g.trim()}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Episode Count */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-white tabular-nums text-sm">
                            {epCount}{' '}
                            <span className="text-neutral-500 font-normal text-xs">episodes</span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            
                            {/* Quick Embed / Upload Video */}
                            <button
                              onClick={() => handleOpenEmbedForAnime(anime.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white text-neutral-300 hover:text-black font-semibold text-xs transition-all flex items-center gap-1"
                              title="Embed a new video stream into this anime"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Embed Video</span>
                            </button>

                            {/* Manage Episodes */}
                            <button
                              onClick={() => setManagingEpisodesAnime(anime)}
                              className="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white text-neutral-300 hover:text-white font-semibold text-xs transition-colors"
                              title="View and edit all episode links"
                            >
                              Episodes ({epCount})
                            </button>

                            {/* Edit Anime */}
                            <button
                              onClick={() => {
                                setEditingAnime(anime);
                                setIsAnimeModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-white/10 hover:border-white text-neutral-300 hover:text-white transition-colors"
                              title="Edit Anime Info"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Anime */}
                            <button
                              onClick={() => setDeleteConfirmAnime(anime)}
                              className="p-1.5 rounded-lg border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Anime"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Delete Anime Confirmation Modal */}
      {deleteConfirmAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-neutral-950 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-modal">
            <h3 className="font-display font-bold text-base text-white">Delete Anime</h3>
            <p className="text-xs text-neutral-300">
              Are you sure you want to permanently delete <strong className="text-white">"{deleteConfirmAnime.title}"</strong> and all its streaming episodes?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmAnime(null)}
                className="px-4 py-2 rounded-xl border border-white/20 text-neutral-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAnime(deleteConfirmAnime.id)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Embedding & Video Manager Modal */}
      <MediaEmbedModal
        isOpen={isMediaEmbedOpen}
        onClose={() => setIsMediaEmbedOpen(false)}
        preselectedAnimeId={targetEmbedAnimeId}
        onEpisodeAdded={(animeId, newEp) => {
          reloadData();
          showToast(`Episode ${newEp.episodeNumber} added to library!`);
        }}
        onOpenGuide={() => {
          setIsMediaEmbedOpen(false);
          setIsGuideModalOpen(true);
        }}
      />

      {/* Add / Edit Anime Modal */}
      <AnimeModal
        isOpen={isAnimeModalOpen}
        onClose={() => setIsAnimeModalOpen(false)}
        editingAnime={editingAnime}
        onSaved={() => {
          reloadData();
          showToast(editingAnime ? 'Anime updated!' : 'New anime created!');
        }}
      />

      {/* Episode Manager Modal */}
      {managingEpisodesAnime && (
        <EpisodeManagerModal
          isOpen={!!managingEpisodesAnime}
          onClose={() => setManagingEpisodesAnime(null)}
          anime={managingEpisodesAnime}
          onEpisodesUpdated={() => {
            reloadData();
            showToast('Episodes updated.');
          }}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenMediaEmbedModal={(animeId) => {
            setTargetEmbedAnimeId(animeId);
            setIsMediaEmbedOpen(true);
          }}
        />
      )}

      {/* Embed Guide Modal */}
      <AdminEmbedGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenEmbedModal={() => {
          setIsGuideModalOpen(false);
          setIsMediaEmbedOpen(true);
        }}
      />

      {/* Database Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        totalAnime={totalAnime}
        totalEpisodes={totalEpisodes}
        onDataRestored={() => {
          reloadData();
          showToast('Database updated successfully!');
        }}
      />

      {/* Supabase SQL Schema Modal */}
      <SupabaseSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

    </div>
  );
};
