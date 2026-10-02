import React, { useState, useEffect } from 'react';
import { Anime, Episode } from '../types';
import { loadCatalog, addEpisode, sanitizeEmbedUrl, detectVideoType } from '../services/dataService';
import { storeVideoFile } from '../services/videoStorage';
import { 
  X, 
  Link, 
  Upload, 
  Play, 
  Sparkles, 
  CheckCircle, 
  HelpCircle, 
  Layers, 
  Film,
  AlertCircle
} from 'lucide-react';

interface MediaEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAnimeId?: string;
  onEpisodeAdded: (animeId: string, episode: Episode) => void;
  onOpenGuide: () => void;
}

export const MediaEmbedModal: React.FC<MediaEmbedModalProps> = ({
  isOpen,
  onClose,
  preselectedAnimeId,
  onEpisodeAdded,
  onOpenGuide,
}) => {
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string>('');
  
  // Media Input Mode: 'embed' (link/iframe) vs 'upload' (direct video file)
  const [activeTab, setActiveTab] = useState<'embed' | 'upload'>('embed');

  // Embed Mode Inputs
  const [rawEmbedInput, setRawEmbedInput] = useState('');
  
  // Upload Mode Inputs
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Common Episode Metadata
  const [epNumber, setEpNumber] = useState<number>(1);
  const [epTitle, setEpTitle] = useState('');
  const [serverName, setServerName] = useState('Server 1 (Primary HD)');

  // Live Preview State
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewType, setPreviewType] = useState<'embed' | 'direct' | 'upload'>('embed');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load catalog anime options
  useEffect(() => {
    if (isOpen) {
      const catalog = loadCatalog();
      setAllAnime(catalog);
      const initialId = preselectedAnimeId || (catalog.length > 0 ? catalog[0].id : '');
      setSelectedAnimeId(initialId);

      // Auto-compute next episode number
      if (initialId) {
        const found = catalog.find((a) => a.id === initialId);
        if (found && found.episodes && found.episodes.length > 0) {
          const maxNum = Math.max(...found.episodes.map((e) => Number(e.episodeNumber) || 0));
          setEpNumber(maxNum + 1);
        } else {
          setEpNumber(1);
        }
      }

      setFeedbackMsg(null);
      setPreviewUrl('');
    }
  }, [isOpen, preselectedAnimeId]);

  // When selected anime changes, recalculate ep number
  const handleAnimeChange = (animeId: string) => {
    setSelectedAnimeId(animeId);
    const found = allAnime.find((a) => a.id === animeId);
    if (found && found.episodes && found.episodes.length > 0) {
      const maxNum = Math.max(...found.episodes.map((e) => Number(e.episodeNumber) || 0));
      setEpNumber(maxNum + 1);
    } else {
      setEpNumber(1);
    }
  };

  // Auto clean paste on embed input
  const handleEmbedChange = (val: string) => {
    setRawEmbedInput(val);
    const cleaned = sanitizeEmbedUrl(val);
    if (cleaned && cleaned !== val && val.includes('<iframe')) {
      setRawEmbedInput(cleaned);
    }
  };

  // Quick Samples
  const loadSample = (url: string, title: string, server: string) => {
    setRawEmbedInput(url);
    if (!epTitle) setEpTitle(title);
    setServerName(server);
    setPreviewUrl(url);
    setPreviewType(detectVideoType(url));
    setFeedbackMsg({ type: 'success', text: `Loaded sample stream: ${title}` });
  };

  // Preview Embed or Video
  const handleTestPreview = () => {
    if (activeTab === 'embed') {
      if (!rawEmbedInput.trim()) {
        setFeedbackMsg({ type: 'error', text: 'Please enter a video embed link or <iframe> code first.' });
        return;
      }
      const clean = sanitizeEmbedUrl(rawEmbedInput);
      setPreviewUrl(clean);
      setPreviewType(detectVideoType(clean));
      setFeedbackMsg({ type: 'success', text: 'Live preview active below!' });
    } else {
      if (!uploadedFile) {
        setFeedbackMsg({ type: 'error', text: 'Please select a local video file (.mp4, .webm) first.' });
        return;
      }
      const objectUrl = URL.createObjectURL(uploadedFile);
      setPreviewUrl(objectUrl);
      setPreviewType('upload');
      setFeedbackMsg({ type: 'success', text: `Previewing local file: ${uploadedFile.name}` });
    }
  };

  // File Upload Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadProgress(`${file.name} (${sizeMB} MB)`);
      if (!epTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
        setEpTitle(cleanName);
      }
      const objUrl = URL.createObjectURL(file);
      setPreviewUrl(objUrl);
      setPreviewType('upload');
      setServerName('Local Video Stream');
    }
  };

  // Submit / Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimeId) {
      setFeedbackMsg({ type: 'error', text: 'Please select an anime title to add this episode to.' });
      return;
    }

    if (activeTab === 'embed' && !rawEmbedInput.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter an embed link, video URL, or iframe tag.' });
      return;
    }

    if (activeTab === 'upload' && !uploadedFile) {
      setFeedbackMsg({ type: 'error', text: 'Please choose a video file (.mp4, .webm) to upload.' });
      return;
    }

    setIsUploading(true);
    try {
      let finalEmbedUrl = '';
      let videoFileName = '';
      let videoFileSize = '';
      let videoType: 'embed' | 'direct' | 'upload' = 'embed';

      if (activeTab === 'upload' && uploadedFile) {
        const epKey = `ep-upload-${Date.now()}`;
        const stored = await storeVideoFile(epKey, uploadedFile);
        finalEmbedUrl = stored.storageKey;
        videoFileName = uploadedFile.name;
        videoFileSize = stored.sizeFormatted;
        videoType = 'upload';
      } else {
        finalEmbedUrl = sanitizeEmbedUrl(rawEmbedInput);
        videoType = detectVideoType(finalEmbedUrl);
      }

      const newEp = addEpisode(selectedAnimeId, {
        episodeNumber: epNumber,
        title: epTitle.trim() || `Episode ${epNumber}`,
        embedUrl: finalEmbedUrl,
        videoType,
        videoFileName,
        videoFileSize,
        serverName: serverName.trim() || 'Server 1 (Primary HD)',
      });

      onEpisodeAdded(selectedAnimeId, newEp);
      setFeedbackMsg({ type: 'success', text: `Episode ${epNumber} successfully saved and published!` });

      setTimeout(() => {
        setIsUploading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsUploading(false);
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to save episode.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden animate-modal my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-white" />
              <h3 className="font-display font-bold text-base text-white">Media Embedding & Video Manager</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Upload video files or paste third-party embed links for instant stream playback.
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
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Feedback banner */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/40 text-red-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* 1. Target Anime Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
              Select Target Anime <span className="text-white">*</span>
            </label>
            <select
              value={selectedAnimeId}
              onChange={(e) => handleAnimeChange(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
            >
              {allAnime.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.episodes?.length || 0} existing episodes)
                </option>
              ))}
            </select>
          </div>

          {/* 2. Mode Tabs: Embed Link vs Upload Video */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wider">
              Choose Media Source Mode
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('embed');
                  setPreviewUrl('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'embed'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Option 1: Paste Embed Link / &lt;iframe&gt;</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('upload');
                  setPreviewUrl('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Option 2: Upload Video File (.mp4/.webm)</span>
              </button>
            </div>
          </div>

          {/* TAB 1 CONTENT: EMBED LINK */}
          {activeTab === 'embed' && (
            <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white">
                  Video Embed URL, YouTube Link, or &lt;iframe&gt; Snippet
                </label>
                <button
                  type="button"
                  onClick={onOpenGuide}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
                >
                  <HelpCircle className="w-3 h-3" />
                  Where can I upload for free?
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={rawEmbedInput}
                  onChange={(e) => handleEmbedChange(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=..., Google Drive link, Streamtape, or <iframe src='...'>"
                  className="flex-1 bg-neutral-900 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestPreview}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-xl border border-white/10 transition-colors shrink-0"
                >
                  Preview
                </button>
              </div>

              <p className="text-[11px] text-neutral-400 leading-normal">
                Ans Anime automatically sanitizes YouTube, Google Drive (<code className="text-neutral-300">/view</code> to <code className="text-neutral-300">/preview</code>), Streamtape, DoodStream, Mega, and raw <code className="text-neutral-300">&lt;iframe src="..."&gt;</code> embed tags.
              </p>

              {/* Instant 1-Click Test Samples */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  Try 1-Click Tested Sample Streams:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      loadSample(
                        'https://www.youtube.com/embed/oVb6H9PqFEE?autoplay=0&rel=0',
                        'Solo Leveling HD Official Stream',
                        'Server 1 (Primary HD)'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-[11px] text-neutral-300 hover:text-white"
                  >
                    Trailer 1 (Solo Leveling)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      loadSample(
                        'https://www.youtube.com/embed/Q4gTv388i24?autoplay=0&rel=0',
                        'Demon Slayer Swordsmith Arc',
                        'Server 1 (Primary HD)'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-[11px] text-neutral-300 hover:text-white"
                  >
                    Trailer 2 (Demon Slayer)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      loadSample(
                        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        'Direct Full HD MP4 Stream',
                        'Server 2 (Direct MP4)'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-[11px] text-neutral-300 hover:text-white"
                  >
                    Direct MP4 Stream
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: DIRECT VIDEO UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3 bg-black/60 p-4 rounded-xl border border-white/10">
              <label className="block text-xs font-semibold text-white">
                Upload Local Video File (.mp4, .webm, .mkv, .mov)
              </label>

              <div className="border-2 border-dashed border-white/20 hover:border-white/50 rounded-xl p-6 text-center bg-neutral-900/50 transition-colors">
                <input
                  type="file"
                  id="direct-video-upload-input"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="direct-video-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-neutral-400" />
                  <span className="text-xs font-bold text-white">
                    {uploadedFile ? uploadedFile.name : 'Click to Browse or Drag Video File Here'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Supports high quality MP4, WebM, and MKV video files. Stored securely in browser IndexedDB.
                  </span>
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between text-xs text-neutral-300 bg-neutral-900 px-3 py-2 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold">{uploadedFile.name}</span>
                    <span className="text-neutral-500">({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestPreview}
                    className="text-white hover:underline font-semibold"
                  >
                    Play Preview
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Episode Meta Details (EP #, Title, Server) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                Episode # <span className="text-white">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={epNumber}
                onChange={(e) => setEpNumber(parseInt(e.target.value) || 1)}
                required
                className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-white focus:outline-none tabular-nums font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                Episode Title
              </label>
              <input
                type="text"
                value={epTitle}
                onChange={(e) => setEpTitle(e.target.value)}
                placeholder="e.g. The Awakening"
                className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1 uppercase tracking-wider">
                Server Label
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="e.g. Server 1 (Primary HD)"
                className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* 4. Live Interactive Preview Area */}
          {previewUrl && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Live Stream Playback Test
                </span>
                <span className="text-neutral-500 text-[11px]">
                  Mode: <strong className="text-neutral-300">{previewType.toUpperCase()}</strong>
                </span>
              </div>

              <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/20 shadow-inner">
                {previewType === 'direct' || previewType === 'upload' ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  >
                    Your browser does not support HTML5 video preview.
                  </video>
                ) : (
                  <iframe
                    src={previewUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0 bg-black"
                  />
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/40 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wide transition-all shadow-[0_4px_16px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving Episode...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Save & Publish Episode</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
