import React from 'react';
import { X, ExternalLink, HardDrive, Youtube, Cloud, Film, CheckCircle } from 'lucide-react';

interface AdminEmbedGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmbedModal?: () => void;
}

export const AdminEmbedGuideModal: React.FC<AdminEmbedGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenEmbedModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-modal my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-white" />
            <h3 className="font-display font-bold text-base text-white">Where to Upload & How to Add Embed Links</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs text-neutral-300 leading-relaxed">
          
          {/* InfinityFree 10MB limit warning & why embedding is used */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/15 space-y-2">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span>Why Embed Links Instead of Uploading 500MB to InfinityFree?</span>
            </h4>
            <p className="text-neutral-300">
              Free web hosts like <strong>InfinityFree have a strict 10MB per-file upload limit</strong> and will suspend accounts that store heavy media files.
            </p>
            <p className="text-neutral-400">
              This is why all leading anime streaming portals operate via <strong>embed streaming links</strong>: your website stays ultra-fast, loads in milliseconds, and uses zero expensive server storage!
            </p>
          </div>

          {/* Step 1: Recommended Free Video Hosts */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
              Step 1: Choose Where to Host Your Video Files (All Free)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Host 1: Streamtape */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-neutral-400" />
                    Streamtape.com
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white text-black rounded">POPULAR</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Built specifically for video streaming. Upload your .mp4 file, copy the embed link (<code className="text-neutral-200">https://streamtape.com/e/XXXX</code>), and paste it into Ans Anime.
                </p>
              </div>

              {/* Host 2: Google Drive */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                    Google Drive (15 GB Free)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Upload your video to Google Drive &rarr; Set Share to "Anyone with the link" &rarr; Copy link. Ans Anime automatically converts <code className="text-neutral-200">/view</code> to <code className="text-neutral-200">/preview</code>!
                </p>
              </div>

              {/* Host 3: YouTube Unlisted */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-neutral-400" />
                    YouTube (Unlisted)
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-neutral-800 text-white rounded">FAST</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Upload video as <strong>Unlisted</strong> (hidden from public YouTube search). Paste the standard YouTube link or embed URL directly into Ans Anime.
                </p>
              </div>

              {/* Host 4: Mega & Direct MP4 */}
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-neutral-400" />
                    Mega.nz & Direct MP4
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Mega gives 20GB free storage. Or host files on Wasabi, Backblaze, BunnyCDN, or any CDN. Direct <code className="text-neutral-200">.mp4</code> links mount an ultra-crisp native HTML5 cinema player!
                </p>
              </div>

            </div>
          </div>

          {/* Step 2: How to Add */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Step 2: How to Add Your Embed Link in Ans Anime Admin Panel
            </h4>
            <ol className="list-decimal pl-5 space-y-1.5 text-neutral-300">
              <li>In the Admin Panel, click <strong>"Media Embedding"</strong> or <strong>"Episodes"</strong> on any anime row.</li>
              <li>Under Media Source Mode, select <strong>"Option 1: Paste Embed Link / &lt;iframe&gt;"</strong> or <strong>"Option 2: Upload Video File"</strong>.</li>
              <li>Paste your link (or complete <code className="text-white">&lt;iframe src="..."&gt;</code> code).</li>
              <li>Click <strong>"Preview"</strong> to verify that playback starts smoothly right in your window.</li>
              <li>Click <strong>"Save & Publish Episode"</strong> — it is immediately live for all viewers!</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-neutral-900/50">
          <span className="text-[11px] text-neutral-500">Universal video sanitizer active</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/15 text-neutral-300 hover:text-white text-xs font-semibold"
            >
              Close
            </button>
            {onOpenEmbedModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEmbedModal();
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Open Embed Manager</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
