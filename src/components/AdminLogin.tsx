import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { checkAdminStatus, createFirstAdmin, loginAdmin } from '../services/dataService';
import { Play, Shield, Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onNavigate: (view: ViewState) => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [adminExists, setAdminExists] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if master admin exists
    const status = checkAdminStatus();
    setAdminExists(status.exists);
    if (status.email) {
      setEmail(status.email);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      loginAdmin(email, password);
      setLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect password or email.');
      setLoading(false);
    }
  };

  const handleRegisterFirstAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      createFirstAdmin(email, password);
      setAdminExists(true);
      setLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create administrator account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-950 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.95)] animate-modal">
        
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-black shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <Play className="w-4 h-4 fill-black translate-x-0.5" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Ans <span className="text-neutral-400">Anime</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-neutral-300 mt-1">
            <Shield className="w-3 h-3 text-white" />
            <span>Protected Admin Area</span>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-2 animate-modal">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CASE 1: ADMIN EXISTS -> STRICT PASSWORD LOGIN ONLY */}
        {adminExists ? (
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>Password Required</span>
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 bg-white/5 text-neutral-300">
                1 Admin Registered
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ansanime.com"
                    required
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your master password"
                    required
                    autoFocus
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(255,255,255,0.2)] disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Admin Panel</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center text-[11px] text-neutral-500">
              Access is restricted. Enter your master password to unlock the admin dashboard.
            </div>
          </div>
        ) : (
          /* CASE 2: NO ADMIN REGISTERED YET (FIRST VISIT SETUP) */
          <div>
            <div className="mb-4 pb-2 border-b border-white/10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black uppercase tracking-wider inline-block mb-1.5">
                First-Time Setup
              </span>
              <h2 className="text-base font-bold text-white">Create Master Admin Account</h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                No administrator exists yet. Create your permanent master administrator account and password now to secure the site.
              </p>
            </div>

            <form onSubmit={handleRegisterFirstAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Admin Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ansanime.com"
                    required
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Master Password * (Min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(255,255,255,0.2)] disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Master Admin...' : 'Create Admin & Set Password'}
              </button>
            </form>
          </div>
        )}

        {/* Back to public site button */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            onClick={() => onNavigate({ type: 'home' })}
            className="text-xs text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Site</span>
          </button>
        </div>

      </div>
    </div>
  );
};
