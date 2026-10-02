import React, { useState } from 'react';
import { 
  X, 
  HardDriveDownload, 
  Upload, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { exportCatalogJson, importCatalogJson, resetToDefaultCatalog } from '../services/dataService';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAnime: number;
  totalEpisodes: number;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  totalAnime,
  totalEpisodes,
  onDataRestored,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    exportCatalogJson();
    setStatusMsg({
      type: 'success',
      text: 'Database backup downloaded successfully to your device!',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setStatusMsg(null);
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setStatusMsg({ type: 'error', text: 'Please select a valid .json backup file.' });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setFileContent(text);
          setPreviewCount(parsed.length);
          setStatusMsg({
            type: 'success',
            text: `Valid backup detected: ${parsed.length} anime titles found.`,
          });
        } else {
          setStatusMsg({ type: 'error', text: 'Invalid format: backup must be an array of anime objects.' });
        }
      } catch {
        setStatusMsg({ type: 'error', text: 'Failed to parse JSON file. Ensure the file is not corrupted.' });
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!fileContent) return;
    try {
      importCatalogJson(fileContent);
      onDataRestored();
      setStatusMsg({
        type: 'success',
        text: `Database successfully restored! Loaded ${previewCount} anime titles.`,
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to restore database.' });
    }
  };

  const handleResetDefaults = () => {
    resetToDefaultCatalog();
    onDataRestored();
    setConfirmReset(false);
    setStatusMsg({ type: 'success', text: 'Database reset to default factory catalog!' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-950 border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-modal my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/50">
          <div>
            <div className="flex items-center gap-2">
              <HardDriveDownload className="w-4 h-4 text-white" />
              <h3 className="font-display font-bold text-base text-white">Database Backup & Restore Manager</h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Export your catalog safely or restore from a previously saved JSON backup file.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/40 text-red-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Section 1: Export / Download Backup */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <HardDriveDownload className="w-4 h-4 text-white" />
                  <span>Download Catalog Backup (.json)</span>
                </h4>
                <p className="text-xs text-neutral-400 mt-1">
                  Downloads a complete snapshot of all <strong className="text-white">{totalAnime} anime titles</strong> and <strong className="text-white">{totalEpisodes} episodes</strong> with all embed links.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all shadow-[0_4px_16px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Download Backup File Now (.json)</span>
            </button>
          </div>

          {/* Section 2: Restore / Import Backup */}
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-white/15 space-y-3">
            <div>
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-white" />
                <span>Restore Database from File (.json)</span>
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Upload a valid <code className="text-neutral-200">.json</code> backup file to restore your anime catalog and stream configurations.
              </p>
            </div>

            <div className="border border-dashed border-white/20 hover:border-white/40 rounded-xl p-4 text-center bg-black/40 transition-colors">
              <input
                type="file"
                id="restore-json-input"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="restore-json-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <FileText className="w-6 h-6 text-neutral-400" />
                <span className="text-xs font-bold text-white">
                  {selectedFile ? selectedFile.name : 'Click to Browse .json Backup File'}
                </span>
                <span className="text-[10px] text-neutral-500">
                  Select file exported from Ans Anime
                </span>
              </label>
            </div>

            {selectedFile && fileContent && (
              <button
                type="button"
                onClick={handleRestore}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Restore & Overwrite Catalog ({previewCount} titles)</span>
              </button>
            )}
          </div>

          {/* Section 3: Reset to Default Catalog */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-neutral-300 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Reset to Factory Default Catalog</span>
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Restores default anime titles (Solo Leveling, Demon Slayer, Jujutsu Kaisen, Cyberpunk).
                </p>
              </div>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-[11px] text-neutral-400 hover:text-white"
                >
                  Reset...
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 text-[11px] text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg"
                  >
                    Confirm Reset
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-white/10 bg-neutral-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/15 text-neutral-300 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
