import React, { useState, useEffect, useRef } from 'react';
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
  Copy,
  Globe,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Trash2,
} from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storage';
import { FlamingD20Logo } from './FlamingD20Logo';
import {
  FIRESTORE_DATABASE_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_CONSOLE_AUTH_URL,
  FIREBASE_CONSOLE_AUTH_SETTINGS_URL,
  isInsideIframe,
  AuthErrorInfo,
} from '../services/firebase';
import type { User } from 'firebase/auth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onDataImported: () => void;
  user?: User | null;
  onSignInGoogle?: () => Promise<void>;
  isLoggingIn?: boolean;
  onSignOut?: () => Promise<void>;
  onSyncCloud?: () => Promise<void>;
  isSyncing?: boolean;
  authNotice?: string | null;
  authErrorInfo?: AuthErrorInfo | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataImported,
  user,
  onSignInGoogle,
  isLoggingIn = false,
  onSignOut,
  onSyncCloud,
  isSyncing = false,
  authNotice = null,
  authErrorInfo = null,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const inIframe = isInsideIframe();

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [copiedFaviconNotice, setCopiedFaviconNotice] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP ou SVG).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setLogoUploadError('A imagem deve ter no máximo 3MB.');
      return;
    }

    setLogoUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, customLogoUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setFormData((prev) => ({ ...prev, customLogoUrl: '' }));
    setLogoUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFavicon = () => {
    const a = document.createElement('a');
    a.href = formData.customLogoUrl || '/favicon.svg';
    a.download = formData.customLogoUrl?.startsWith('data:image/png') ? 'icon.png' : 'favicon.svg';
    a.click();
    setCopiedFaviconNotice(true);
    setTimeout(() => setCopiedFaviconNotice(false), 2500);
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

            {/* If in iframe, show tip */}
            {inIframe && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
                <div className="flex items-start sm:items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
                  <span>
                    O Grimório está no visualizador embutido (iframe). Caso a janela do Google não abra, abra em nova aba:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="self-start sm:self-auto px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium whitespace-nowrap cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span>Abrir em Nova Aba</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

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
                    disabled={isLoggingIn}
                    onClick={handleGoogleAuth}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isLoggingIn ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Entrar com Google</span>
                      </>
                    )}
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

            {(authError || authErrorInfo) && (
              <div className="p-3.5 rounded-xl text-xs bg-amber-950/30 border border-amber-500/30 text-zinc-300 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 w-full">
                    <div className="font-semibold text-amber-300 text-xs">
                      {authErrorInfo?.title || 'Diagnóstico de Conexão com Google'}
                    </div>
                    <p className="text-[11px] text-zinc-300 leading-relaxed">
                      {authError || authErrorInfo?.message}
                    </p>
                  </div>
                </div>

                {/* Specific actions depending on error type */}
                {authErrorInfo?.type === 'iframe' || authErrorInfo?.type === 'popup-blocked' || inIframe ? (
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 text-[11px] space-y-2">
                    <div className="font-medium text-amber-300 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Solução Recomendada: Abrir em Nova Aba</span>
                    </div>
                    <p className="text-zinc-400 leading-relaxed">
                      Por segurança, navegadores (Chrome, Brave, Edge, Safari) bloqueiam janelas de login do Google dentro de iframes embutidos. Ao abrir em uma nova aba, o login funciona imediatamente.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-semibold text-xs hover:bg-amber-400 transition-colors cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Grimório em Nova Aba</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {authErrorInfo?.type === 'unauthorized-domain' && (
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 text-[11px] space-y-2">
                    <div className="font-medium text-zinc-200">Como autorizar este domínio no Firebase:</div>
                    <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1.5 rounded border border-zinc-800">
                      <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono text-[10px] text-amber-400 flex-1 truncate">
                        {currentHostname}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(currentHostname);
                          setCopiedDomain(true);
                          setTimeout(() => setCopiedDomain(false), 2000);
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedDomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px]">
                      <li>Abra as configurações do Firebase Authentication pelo botão abaixo.</li>
                      <li>Vá na aba <strong className="text-zinc-300">Settings &gt; Authorized domains</strong>.</li>
                      <li>Clique em <strong className="text-zinc-300">Add domain</strong> e cole o domínio acima.</li>
                    </ol>
                    <div className="pt-1">
                      <a
                        href={FIREBASE_CONSOLE_AUTH_SETTINGS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                      >
                        <span>Abrir Domínios Autorizados no Firebase</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {authErrorInfo?.type === 'provider-disabled' && (
                  <div className="bg-zinc-900/90 p-3 rounded-lg border border-zinc-800 text-[11px] space-y-2">
                    <div className="font-medium text-zinc-200">Como habilitar o login Google no Firebase:</div>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px]">
                      <li>Acesse o Firebase Console do projeto <strong className="text-zinc-200">{FIREBASE_PROJECT_ID}</strong>.</li>
                      <li>Vá em <strong className="text-zinc-300">Authentication &gt; Sign-in method</strong>.</li>
                      <li>Ative o provedor <strong className="text-amber-400">Google</strong> e salve.</li>
                    </ol>
                    <div className="pt-1">
                      <a
                        href={FIREBASE_CONSOLE_AUTH_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                      >
                        <span>Abrir Métodos de Login no Firebase</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                  <span className="text-emerald-400 font-medium">✓ Suas campanhas e fichas estão salvas e intactas localmente</span>
                  <button
                    type="button"
                    onClick={() => setAuthError(null)}
                    className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                  >
                    Dispensar aviso
                  </button>
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
                value={formData.model === 'gemini-2.5-flash' ? 'gemini-3.6-flash' : formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value="gemini-3.6-flash">gemini-3.6-flash (Recomendado - Rápido & Fluido)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Raciocínio Avançado)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Leve & Baixa Latência)</option>
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

          {/* Visual Identity & App Icon (Site, Vercel & Grimório) */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ícone & Identidade Visual (Site, Vercel & Grimório)</span>
              </div>
              {formData.customLogoUrl && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Voltar ao ícone padrão do D20 em Chamas Azuis"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Defina a imagem de identidade do seu projeto. Ela é exibida no cabeçalho do Grimório, no favicon da aba do navegador e no pacote exportável para o Vercel.
            </p>

            {/* Live Previews Row */}
            <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-around gap-4">
              {/* Preview 1: Header Logo */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-mono">No Cabeçalho</span>
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center">
                  <FlamingD20Logo
                    size={36}
                    showGlow={true}
                    customLogoUrl={formData.customLogoUrl}
                  />
                </div>
              </div>

              {/* Preview 2: Browser Tab Favicon */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-mono">Favicon da Aba</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg bg-zinc-900 border border-zinc-800/90 text-[11px] text-zinc-300 shadow-inner max-w-[140px]">
                  <FlamingD20Logo
                    size={16}
                    showGlow={false}
                    customLogoUrl={formData.customLogoUrl}
                  />
                  <span className="truncate text-[10px]">Grimório RPG</span>
                </div>
              </div>

              {/* Preview 3: Vercel / PWA App Icon */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-mono">Ícone Vercel / PWA</span>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center overflow-hidden">
                  <FlamingD20Logo
                    size={44}
                    showGlow={true}
                    customLogoUrl={formData.customLogoUrl}
                  />
                </div>
              </div>
            </div>

            {/* Upload Button & URL Input */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-xs font-semibold text-cyan-300 transition-colors cursor-pointer text-center">
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span>Fazer Upload de Imagem (PNG, JPG, SVG)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDownloadFavicon}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 rounded-lg text-xs text-zinc-200 transition-colors cursor-pointer"
                  title="Baixar arquivo de ícone para usar na raiz do seu projeto Vercel"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{copiedFaviconNotice ? 'Baixado!' : 'Baixar p/ Vercel'}</span>
                </button>
              </div>

              {/* Direct URL input */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Ou insira a URL direta da imagem:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://exemplo.com/icone.png ou data:image/..."
                    value={formData.customLogoUrl || ''}
                    onChange={(e) => {
                      setLogoUploadError(null);
                      setFormData({ ...formData, customLogoUrl: e.target.value.trim() });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60 font-mono"
                  />
                </div>
              </div>

              {/* Diagnostic helper if user pasted a blob: URL */}
              {formData.customLogoUrl?.startsWith('blob:') && (
                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Link Temporário do Gemini Detectado (`blob:`)</span>
                  </div>
                  <p className="text-[11px] text-cyan-200/90 leading-relaxed">
                    Navegadores protegem links <code>blob:</code> com isolamento de memória entre abas, o que impede que outros sites carreguem a imagem diretamente pelo link.
                  </p>
                  <div className="text-[11px] bg-zinc-950/60 p-2 rounded border border-cyan-500/20 space-y-1 text-zinc-300">
                    <div className="font-medium text-cyan-300">Como aplicar sua imagem em 2 cliques:</div>
                    <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                      <li>Na conversa com o Gemini, clique na imagem com o botão direito e selecione <strong>"Salvar imagem como..."</strong></li>
                      <li>Clique no botão azul <strong>"Fazer Upload de Imagem"</strong> acima e selecione o arquivo que salvou!</li>
                    </ol>
                  </div>
                </div>
              )}

              {logoUploadError && (
                <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {logoUploadError}
                </div>
              )}
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
