import React, { useState, useEffect } from 'react';
import { Anime } from '../types';
import { addAnime, updateAnime, sanitizeEmbedUrl } from '../services/dataService';
import { storeVideoFile } from '../services/videoStorage';
import { X, Plus, Upload, Link, Check, Sparkles, Image, Video } from 'lucide-react';

interface AnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnime: Anime | null;
  onSaved: () => void;
}

const POPULAR_GENRES = [
  'Action',
  'Adventure',
  'Fantasy',
  'Isekai',
  'Shounen',
  'Supernatural',
  'Sci-Fi',
  'Cyberpunk',
  'Horror',
  'Romance',
  'Comedy',
  'Drama',
  'Mystery',
  'Slice of Life',
  'Sports',
];

export const AnimeModal: React.FC<AnimeModalProps> = ({
  isOpen,
  onClose,
  editingAnime,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [quality, setQuality] = useState('1080p HD');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Quick Start Episode 1
  const [initialEpUrl, setInitialEpUrl] = useState('');
  const [initialEpTitle, setInitialEpTitle] = useState('');
  const [initialVideoFile, setInitialVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (editingAnime) {
      setTitle(editingAnime.title || '');
      setDesc(editingAnime.desc || '');
      const genres = (editingAnime.genre || '')
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
      setSelectedGenres(genres);
      setThumbnailUrl(editingAnime.thumbnailUrl || '');
      setBannerUrl(editingAnime.bannerUrl || '');
      setQuality(editingAnime.quality || '1080p HD');
      setYear(editingAnime.year || new Date().getFullYear());
      setInitialEpUrl('');
      setInitialEpTitle('');
      setInitialVideoFile(null);
    } else {
      setTitle('');
      setDesc('');
      setSelectedGenres(['Action', 'Fantasy']);
      setThumbnailUrl('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80');
      setBannerUrl('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&auto=format&fit=crop&q=80');
      setQuality('1080p HD');
      setYear(new Date().getFullYear());
      setInitialEpUrl('');
      setInitialEpTitle('');
      setInitialVideoFile(null);
    }
  }, [editingAnime, isOpen]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const addCustomGenre = () => {
    if (!customGenre.trim()) return;
    const clean = customGenre.trim();
    if (!selectedGenres.includes(clean)) {
      setSelectedGenres([...selectedGenres, clean]);
    }
    setCustomGenre('');
  };

  const handleImageUpload = (file: File, type: 'thumb' | 'banner') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'thumb') setThumbnailUrl(result);
      if (type === 'banner') setBannerUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const genreString = selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Action, Anime';

    try {
      if (editingAnime) {
        updateAnime(editingAnime.id, {
          title: title.trim(),
          desc: desc.trim(),
          genre: genreString,
          thumbnailUrl,
          bannerUrl,
          quality,
          year,
        });
      } else {
        const episodes = [];
        if (initialVideoFile) {
          const epKey = `ep-upload-${Date.now()}`;
          const stored = await storeVideoFile(epKey, initialVideoFile);
          episodes.push({
            id: `ep-${Date.now()}`,
            episodeNumber: 1,
            title: initialEpTitle.trim() || 'Episode 1',
            embedUrl: stored.storageKey,
            videoType: 'upload' as const,
            videoFileName: initialVideoFile.name,
            videoFileSize: stored.sizeFormatted,
            serverName: 'Local Video Stream',
            createdAt: Date.now(),
          });
        } else if (initialEpUrl.trim()) {
          const cleanUrl = sanitizeEmbedUrl(initialEpUrl);
          episodes.push({
            id: `ep-${Date.now()}`,
            episodeNumber: 1,
            title: initialEpTitle.trim() || 'Episode 1',
            embedUrl: cleanUrl,
            serverName: 'Server 1 (Primary HD)',
            createdAt: Date.now(),
          });
        }

        addAnime({
          title: title.trim(),
          desc: desc.trim(),
          genre: genreString,
          thumbnailUrl,
          bannerUrl,
          quality,
          year,
          episodes,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      alert('Error saving anime: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-modal my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              {editingAnime ? `Edit "${editingAnime.title}"` : 'Add New Anime'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure titles, artwork, categories, and initial episode stream.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Anime Title <span className="text-white">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solo Leveling, Chainsaw Man"
              required
              className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Synopsis / Plot Description
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the story, setting, and main characters..."
              className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-white focus:outline-none resize-y"
            />
          </div>

          {/* Categories / Genre Manager */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Categories & Genres <span className="text-white">*</span>
            </label>

            {/* Custom Input */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomGenre();
                  }
                }}
                placeholder="Type custom genre and press + Add"
                className="flex-1 bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomGenre}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl border border-white/10"
              >
                + Add
              </button>
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-900/60 rounded-xl border border-white/10 min-h-[40px] items-center mb-2">
              {selectedGenres.length === 0 ? (
                <span className="text-[11px] text-neutral-500">No categories selected yet. Click presets below:</span>
              ) : (
                selectedGenres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 bg-white text-black text-xs font-bold px-2 py-0.5 rounded shadow"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className="hover:text-red-600 font-black text-xs"
                    >
                      &times;
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1">
              {POPULAR_GENRES.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 text-neutral-400 border-white/10 hover:border-white/40'
                    }`}
                  >
                    {isSelected ? `✓ ${g}` : `+ ${g}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Artwork: Thumbnail & Backdrop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-900/40 p-4 rounded-xl border border-white/10">
            {/* Poster Thumbnail */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Poster Thumbnail (2:3)</label>
              <input
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Poster URL..."
                className="w-full bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'thumb')}
                className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
              />
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Thumb Preview"
                  className="mt-2 w-14 h-20 object-cover rounded border border-white/20"
                />
              )}
            </div>

            {/* Backdrop Banner */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">Backdrop Banner (16:9)</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="Banner URL..."
                className="w-full bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white mb-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
              />
              {bannerUrl && (
                <img
                  src={bannerUrl}
                  alt="Banner Preview"
                  className="mt-2 w-32 h-16 object-cover rounded border border-white/20"
                />
              )}
            </div>
          </div>

          {/* Quick Start: Episode 1 Video Embed / Upload (Shown for new anime) */}
          {!editingAnime && (
            <div className="bg-black p-4 rounded-xl border border-white/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Video className="w-3.5 h-3.5" />
                  Quick Start Episode 1 Stream (Optional)
                </span>
                <span className="text-[10px] font-bold bg-white text-black px-1.5 py-0.2 rounded">
                  AUTO-CREATE EP 1
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Paste Embed URL or &lt;iframe&gt;
                  </label>
                  <input
                    type="text"
                    value={initialEpUrl}
                    onChange={(e) => setInitialEpUrl(e.target.value)}
                    placeholder="https://youtu.be/..., Streamtape, or Drive"
                    className="w-full bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                    Or Choose Local Video File (.mp4)
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setInitialVideoFile(e.target.files?.[0] || null)}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/40 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wide transition-all shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
            >
              {editingAnime ? 'Update Anime' : 'Create Anime'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
