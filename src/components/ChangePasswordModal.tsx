import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { updateMasterAdminCredentials } from '../services/dataService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: (newEmail: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSuccess,
}) => {
  const [email, setEmail] = useState(currentEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const ok = await updateMasterAdminCredentials(email, newPassword || undefined);
      setLoading(false);
      if (ok) {
        onSuccess(email);
        onClose();
      } else {
        setErrorMsg('Failed to update credentials. Check database connection.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-neutral-950 border border-white/20 rounded-2xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] animate-modal">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Master Admin Security</h3>
              <p className="text-xs text-neutral-400">Update your email or master password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              New Master Password (Leave blank to keep current)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {newPassword && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={!!newPassword}
                  minLength={6}
                  className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Saving to Database...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
