import React, { Component, ErrorInfo, ReactNode } from 'react';
import { observability } from '../lib/observability';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Send to Observability Hub
    observability.captureException(error, {
      tags: { source: 'React.ErrorBoundary' },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-6 text-zinc-100">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-zinc-100">Ops! Algo inesperado aconteceu</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ocorreu uma interrupção na renderização da interface. Seus dados continuam salvos com segurança localmente e na nuvem.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar Grimório</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
