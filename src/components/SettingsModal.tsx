import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  Key,
  Cpu,
  ShieldCheck,
  Check,
  Cloud,
  LogIn,
  LogOut,
  RefreshCw,
  Database,
  AlertTriangle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storage';
import { FIRESTORE_DATABASE_ID, FIREBASE_PROJECT_ID, FIREBASE_CONSOLE_AUTH_URL } from '../services/firebase';
import type { User } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onDataImported: () => void;
  user?: User | null;
  onSignInGoogle?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onSyncCloud?: () => Promise<void>;
  isSyncing?: boolean;
  authNotice?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataImported,
  user,
  onSignInGoogle,
  onSignOut,
  onSyncCloud,
  isSyncing = false,
  authNotice = null,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authNotice) {
      setAuthError(authNotice);
    }
  }, [authNotice]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    try {
      setAuthError(null);
      if (onSignInGoogle) {
        await onSignInGoogle();
      }
    } catch (e: any) {
      setAuthError(e?.message || 'Falha na autenticação com Google.');
    }
  };

  const handleLogout = async () => {
    try {
      setAuthError(null);
      if (onSignOut) {
        await onSignOut();
      }
    } catch (e: any) {
      setAuthError(e?.message || 'Falha ao desconectar.');
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncSuccessMessage(null);
      if (onSyncCloud) {
        await onSyncCloud();
        setSyncSuccessMessage('Sincronização com Firebase concluída com sucesso!');
        setTimeout(() => setSyncSuccessMessage(null), 3500);
      }
    } catch (e: any) {
      setAuthError(e?.message || 'Erro ao sincronizar com nuvem.');
    }
  };

  const handleExport = () => {
    const jsonStr = storageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grimorio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importBackup(content);
      if (success) {
        setImportStatus('Backup importado com sucesso!');
        onDataImported();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Erro ao ler arquivo de backup. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-100">Configurações & Nuvem</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Firebase Cloud Firestore Section */}
          <div className="space-y-3 bg-zinc-950/70 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Cloud className="w-4 h-4 text-amber-500" />
                <span>Nuvem Firebase Firestore</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ativo
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Suas anotações, fichas de RPG e campanhas são sincronizadas automaticamente em tempo real no banco de dados Firestore.
            </p>

            {/* Account status & Login with Google */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user && !user.isAnonymous && user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Foto de perfil"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-amber-500/50"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
                      <Database className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium text-zinc-200">
                      {user && !user.isAnonymous
                        ? user.displayName || user.email || 'Conta Google'
                        : 'Sessão Anônima (Offline & Cloud Sync)'}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      UID: {user ? `${user.uid.slice(0, 10)}...` : 'Conectando...'}
                    </div>
                  </div>
                </div>

                {user && !user.isAnonymous ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sair</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar com Google</span>
                  </button>
                )}
              </div>

              {/* Sync actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800/80 text-[11px]">
                <div className="space-y-0.5">
                  <div className="text-zinc-400">
                    Banco Firestore:{' '}
                    <code className="text-amber-400 font-mono text-[10px] bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                      {FIRESTORE_DATABASE_ID}
                    </code>
                  </div>
                  <div className="text-zinc-500 text-[10px]">
                    Projeto:{' '}
                    <span className="text-zinc-400 font-mono">{FIREBASE_PROJECT_ID}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                </button>
              </div>
            </div>

            {syncSuccessMessage && (
              <div className="p-2 rounded-lg text-xs bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}

            {authError && (
              <div className="p-3.5 rounded-xl text-xs bg-amber-950/30 border border-amber-500/30 text-zinc-300 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-amber-300 text-xs">
                      Ativação do Provedor Google no Firebase
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {authError}
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 text-[11px] space-y-1 text-zinc-400">
                  <div className="font-medium text-zinc-300">Como resolver em 1 minuto:</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-zinc-400">
                    <li>Acesse o <strong className="text-zinc-300">Firebase Console &gt; Authentication</strong>.</li>
                    <li>Vá na aba <strong className="text-zinc-300">Sign-in method</strong> (Métodos de login).</li>
                    <li>Habilite o provedor <strong className="text-amber-400">Google</strong> e clique em Salvar.</li>
                  </ol>
                  <div className="pt-1.5 flex items-center justify-between">
                    <a
                      href={FIREBASE_CONSOLE_AUTH_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
                    >
                      <span>Abrir Métodos de Login no Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] text-emerald-400">Modo offline ativo sem perda de dados</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Inteligência Artificial (Gemini)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Modelo Gemini
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recomendado - Ultrarrápido & Contextual)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Raciocínio Expandido)</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Utiliza a SDK oficial @google/genai com suporte a streaming de tokens.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-amber-500" />
                  Chave de API Gemini (Opcional)
                </span>
                <span className="text-[10px] text-zinc-500">Padrão: Injetada pelo ambiente</span>
              </label>
              <input
                type="password"
                placeholder="Deixe em branco para usar a chave do servidor AI Studio"
                value={formData.customApiKey}
                onChange={(e) => setFormData({ ...formData, customApiKey: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 font-mono"
              />
              <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  O Grimório executa as chamadas com segurança no servidor, sem expor credenciais no cliente.
                </span>
              </div>
            </div>
          </div>

          {/* Backup Manual */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Download className="w-3.5 h-3.5" />
              <span>Backup Local & Portabilidade JSON</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você também pode baixar um arquivo JSON de backup ou restaurar suas campanhas a qualquer momento.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
              >
                {copiedBackup ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Exportado!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>Exportar Backup JSON</span>
                  </>
                )}
              </button>

              <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-amber-500" />
                <span>Restaurar Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs ${
                  importStatus.includes('sucesso')
                    ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
                }`}
              >
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 border-t border-zinc-800 bg-zinc-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
