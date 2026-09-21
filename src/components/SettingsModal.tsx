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
import { AppSettings, UserProfile } from '../types';
import { storageService } from '../services/storage';
import { FlamingD20Logo } from './FlamingD20Logo';
import { UserAvatar } from './UserAvatar';
import {
  FIRESTORE_DATABASE_ID,
  FIREBASE_PROJECT_ID,
  isQuotaExceeded,
  resetQuotaExceeded,
} from '../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onDataImported: () => void;
  currentUser?: UserProfile;
  onOpenAuthModal?: () => void;
  onSyncCloud?: () => Promise<void>;
  isSyncing?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataImported,
  currentUser,
  onOpenAuthModal,
  onSyncCloud,
  isSyncing = false,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [copiedFaviconNotice, setCopiedFaviconNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    try {
      setSyncErrorMessage(null);
      setSyncSuccessMessage(null);
      if (onSyncCloud) {
        await onSyncCloud();
        setSyncSuccessMessage('Sincronização com Firebase Firestore concluída com sucesso!');
        setTimeout(() => setSyncSuccessMessage(null), 3500);
      }
    } catch (e: any) {
      setSyncErrorMessage(e?.message || 'Erro ao sincronizar com nuvem.');
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
          {/* User Account & Cloud Sync Section */}
          <div className="space-y-3 bg-zinc-950/70 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Cloud className="w-4 h-4 text-cyan-500" />
                <span>Perfil de Acesso & Sincronização</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conectado
              </span>
            </div>

            {/* Active User Card */}
            {currentUser && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    avatarId={currentUser.avatarId}
                    color={currentUser.color}
                    size="md"
                    showGlow={true}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100">
                        {currentUser.displayName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
                        @{currentUser.username}
                      </span>
                    </div>
                    <div className="text-xs text-cyan-400/90 font-medium mt-0.5">
                      {currentUser.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal?.();
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Alternar Contas
                  </button>
                </div>
              </div>
            )}

            {/* Firestore Cloud Details */}
            <div className="bg-zinc-900/50 border border-zinc-850 rounded-xl p-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="text-zinc-300 font-medium flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Armazenamento Local & Nuvem Firestore</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Campanhas e fichas isoladas e seguras para cada usuário.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Nuvem'}</span>
                </button>
              </div>

              {syncSuccessMessage && (
                <div className="p-2 rounded-lg text-xs bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{syncSuccessMessage}</span>
                </div>
              )}
              {syncErrorMessage && (
                <div className="p-2 rounded-lg text-xs bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{syncErrorMessage}</span>
                </div>
              )}

              {isQuotaExceeded() && (
                <div className="p-3 rounded-lg text-xs bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cota Diária Gratuita do Firestore Atingida</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    O limite de 20.000 gravações diárias da cota Spark gratuita foi atingido hoje. Seus dados estão 100% salvos e seguros no armazenamento local do navegador. A cota gratuita é reiniciada automaticamente à meia-noite pelo Google Cloud.
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-100 underline"
                    >
                      <span>Abrir Console do Firebase</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        resetQuotaExceeded();
                        handleManualSync();
                      }}
                      className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 hover:bg-amber-800 border border-amber-700/50 text-amber-200"
                    >
                      Testar Novamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>Inteligência Artificial (Gemini)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Modelo Gemini
              </label>
              <select
                value={
                  formData.model === 'gemini-2.5-flash' || formData.model === 'gemini-2.5-flash-lite'
                    ? 'gemini-3.1-flash-lite'
                    : formData.model || 'gemini-3.1-flash-lite'
                }
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/60"
              >
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Recomendado - Ultra Rápido & Estável)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (Equilibrado & Raciocínio)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Avançado)</option>
                <option value="gemini-flash-latest">gemini-flash-latest (Versão Mais Recente)</option>
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Utiliza a SDK oficial @google/genai com suporte a streaming de tokens.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-cyan-500" />
                  Chave de API Gemini (Opcional)
                </span>
                <span className="text-[10px] text-zinc-500">Padrão: Injetada pelo ambiente</span>
              </label>
              <input
                type="password"
                placeholder="Deixe em branco para usar a chave do servidor AI Studio"
                value={formData.customApiKey}
                onChange={(e) => setFormData({ ...formData, customApiKey: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60 font-mono"
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
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
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
                    <Download className="w-4 h-4 text-cyan-500" />
                    <span>Exportar Backup JSON</span>
                  </>
                )}
              </button>

              <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium text-zinc-200 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-500" />
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
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-semibold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>
  );
};
