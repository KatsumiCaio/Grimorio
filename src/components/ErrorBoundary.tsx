import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

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
    console.error('ErrorBoundary captured error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-zinc-100">Algo inesperado aconteceu</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                O aplicativo encontrou um erro temporário, mas suas campanhas e fichas estão salvas com segurança no armazenamento local.
              </p>
            </div>

            {this.state.error && (
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 font-mono text-left max-h-24 overflow-y-auto break-words">
                {this.state.error.message || 'Erro desconhecido'}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg text-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>
              <button
                type="button"
                onClick={this.handleHardReload}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
