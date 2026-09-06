import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('pos_') || k.startsWith('gbg_'));
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-200">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              The application encountered an unexpected state. You can reload or reset your active session.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-mono rounded-xl text-left overflow-auto max-h-32 border border-red-200 dark:border-red-800">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-4 bg-[#FF8A00] hover:bg-[#e67c00] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reset Workspace Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
