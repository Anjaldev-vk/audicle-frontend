import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-10 bg-brand-bg border border-brand-border rounded-[2.5rem] text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-8">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-text-main mb-4 tracking-tight">Intelligence System Failure</h2>
          <p className="text-text-muted max-w-md mx-auto mb-10 text-sm font-medium leading-relaxed">
            A critical error occurred while processing this segment of the platform. Our neural core has been notified.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all"
            >
              <RefreshCw size={14} /> Reinitialize
            </button>
            <a 
              href="/dashboard"
              className="px-8 py-3 bg-brand-surface border border-brand-border text-text-main rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brand-highlight transition-all"
            >
              <Home size={14} /> Return Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
