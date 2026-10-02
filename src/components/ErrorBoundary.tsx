import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ans Anime Uncaught Exception:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('ans_anime_watchlist_v3');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-neutral-950 border border-white/20 rounded-2xl p-8 shadow-2xl space-y-5 animate-modal">
            <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-display font-bold text-lg text-white">Something went wrong</h2>
              <p className="text-xs text-neutral-400 mt-1">
                The application encountered an unexpected state. You can safely reload or reset your local session.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-neutral-900 border border-white/10 rounded-xl text-[11px] text-neutral-300 font-mono text-left break-all max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-neutral-900 border border-white/15 text-neutral-300 hover:text-white font-semibold text-xs rounded-xl hover:border-white/40 transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
