import React, { useState } from 'react';
import { Anime, Episode } from '../types';
import { deleteEpisode, updateEpisode, addEpisode, sanitizeEmbedUrl, detectVideoType } from '../services/dataService';
import { storeVideoFile } from '../services/videoStorage';
import { 
  X, 
  Trash2, 
  Edit3, 
  Plus, 
  Play, 
  ExternalLink, 
  Upload, 
  Link, 
  CheckCircle, 
  HelpCircle,
  Video
} from 'lucide-react';

interface EpisodeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: Anime;
  onEpisodesUpdated: () => void;
  onOpenGuide: () => void;
  onOpenMediaEmbedModal: (animeId: string) => void;
}

export const EpisodeManagerModal: React.FC<EpisodeManagerModalProps> = ({
  isOpen,
  onClose,
  anime,
  onEpisodesUpdated,
  onOpenGuide,
  onOpenMediaEmbedModal,
}) => {
  const [editingEpisodeId, setEditingEpisodeId] = useState<string | null>(null);
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [serverName, setServerName] = useState('Server 1 (Primary HD)');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string>('');

  if (!isOpen) return null;

  const episodes = [...(anime.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber);

  const startEdit = (ep: Episode) => {
    setEditingEpisodeId(ep.id);
    setEpNumber(ep.episodeNumber);
    setEpTitle(ep.title);
    setEmbedUrl(ep.embedUrl);
    setServerName(ep.serverName || 'Server 1 (Primary HD)');
    setPreviewUrl(ep.embedUrl);
  };

  const cancelEdit = () => {
    setEditingEpisodeId(null);
    setEpNumber(episodes.length > 0 ? Math.max(...episodes.map((e) => e.episodeNumber)) + 1 : 1);
    setEpTitle('');
    setEmbedUrl('');
    setServerName('Server 1 (Primary HD)');
    setPreviewUrl('');
  };

  const handleSaveEpisode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!embedUrl.trim()) return;

    const cleaned = sanitizeEmbedUrl(embedUrl);
    const videoType = detectVideoType(cleaned);

    if (editingEpisodeId) {
      updateEpisode(anime.id, editingEpisodeId, {
        episodeNumber: epNumber,
        title: epTitle.trim() || `Episode ${epNumber}`,
        embedUrl: cleaned,
        videoType,
        serverName,
      });
    } else {
      addEpisode(anime.id, {
        episodeNumber: epNumber,
        title: epTitle.trim() || `Episode ${epNumber}`,
        embedUrl: cleaned,
        videoType,
        serverName,
      });
    }

    onEpisodesUpdated();
    cancelEdit();
  };

  const handleDelete = (epId: string) => {
    deleteEpisode(anime.id, epId);
    setDeleteConfirmId(null);
    onEpisodesUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-modal my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-white" />
              <h3 className="font-display font-bold text-base text-white">Manage Episodes & Video Streams</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Anime: <span className="text-white font-semibold">{anime.title}</span> ({episodes.length} episodes)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMediaEmbedModal(anime.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload / Embed New Video</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Existing Episodes List Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Existing Episodes in Library ({episodes.length})
            </h4>

            {episodes.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-white/15 text-center text-neutral-500 text-xs bg-black/40">
                No episodes uploaded yet. Use the form below or click "+ Upload / Embed New Video".
              </div>
            ) : (
              <div className="border border-white/10 rounded-xl overflow-hidden bg-black/50 divide-y divide-white/5 max-h-56 overflow-y-auto">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-neutral-900/50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-bold text-white tabular-nums px-2 py-1 bg-white/10 rounded shrink-0">
                        EP {ep.episodeNumber}
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-200 block truncate">
                          {ep.title || `Episode ${ep.episodeNumber}`}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate block max-w-sm">
                          {ep.videoType === 'upload' ? '📁 Local Upload' : ep.embedUrl}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => startEdit(ep)}
                        className="p-1.5 rounded-lg border border-white/10 hover:border-white text-neutral-300 hover:text-white transition-colors"
                        title="Edit Episode"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(ep.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Episode"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Box */}
          {deleteConfirmId && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between gap-4 text-xs">
              <span className="text-red-200 font-semibold">
                Are you sure you want to permanently delete this episode?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-neutral-300 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Quick Add / Edit Form */}
          <div className="bg-neutral-900/60 p-5 rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Link className="w-3.5 h-3.5" />
                <span>{editingEpisodeId ? 'Edit Episode Stream' : 'Quick Add Stream Link'}</span>
              </h4>
              {editingEpisodeId && (
                <button
                  onClick={cancelEdit}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                    EP Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={epNumber}
                    onChange={(e) => setEpNumber(parseInt(e.target.value) || 1)}
                    required
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-white focus:outline-none tabular-nums font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                    Episode Title
                  </label>
                  <input
                    type="text"
                    value={epTitle}
                    onChange={(e) => setEpTitle(e.target.value)}
                    placeholder="e.g. The Awakening"
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="e.g. Server 1 (Primary HD)"
                    className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                  Video Embed URL or &lt;iframe&gt; Tag *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={embedUrl}
                    onChange={(e) => {
                      setEmbedUrl(e.target.value);
                      const clean = sanitizeEmbedUrl(e.target.value);
                      if (clean) setPreviewUrl(clean);
                    }}
                    placeholder="Paste YouTube link, Google Drive, Streamtape, or <iframe> tag"
                    required
                    className="flex-1 bg-black border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (embedUrl) setPreviewUrl(sanitizeEmbedUrl(embedUrl));
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl border border-white/10 shrink-0"
                  >
                    Preview
                  </button>
                </div>
              </div>

              {/* In-form mini preview */}
              {previewUrl && (
                <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/20">
                  {detectVideoType(previewUrl) === 'direct' ? (
                    <video src={previewUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <iframe src={previewUrl} allowFullScreen className="w-full h-full border-0" />
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors"
                >
                  {editingEpisodeId ? 'Update Episode' : '+ Add Episode'}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
