import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  LogIn,
  Sparkles,
  Shield,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  AlertTriangle,
  ArrowLeftRight,
  Check,
} from 'lucide-react';
import { UserProfile, UserRole, Campaign } from '../types';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';
import { saveCampaignToFirestore, checkCloudDbStatus, CloudDbStatus } from '../services/firebase';
import { FlamingD20Logo } from './FlamingD20Logo';
import { UserAvatar, AVATAR_OPTIONS, COLOR_OPTIONS } from './UserAvatar';

interface AccountOnboardingProps {
  onUserReady: (user: UserProfile) => void;
}

export const AccountOnboarding: React.FC<AccountOnboardingProps> = ({ onUserReady }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'transfer'>('register');
  const [cloudStatus, setCloudStatus] = useState<CloudDbStatus | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Mestre da Masmorra');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('d20');
  const [regColor, setRegColor] = useState<UserProfile['color']>('cyan');
  const [regStarterCamp, setRegStarterCamp] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Transfer / Import State
  const [transferCode, setTransferCode] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoringDemo, setIsRestoringDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkCloudDbStatus().then((status) => {
      if (mounted) setCloudStatus(status);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const ROLES: UserRole[] = [
    'Mestre da Masmorra',
    'Narrador',
    'Guardião de Segredos',
    'Jogador',
    'Criador de Mundos',
  ];

  // Handler: Register New Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsSubmitting(true);

    try {
      const res = await authService.register({
        displayName: regName,
        username: regUsername,
        role: regRole,
        password: regPassword,
        avatarId: regAvatar,
        color: regColor,
      });

      if (res.success && res.user) {
        const userId = res.user.id;
        if (regStarterCamp) {
          const starterCamp: Campaign = {
            id: `camp_${userId}_init`,
            title: `Aventuras de ${res.user.displayName}`,
            system: 'D&D 5e',
            notes: `# Grimório de ${res.user.displayName}\n\n## ⚔️ Primeira Sessão\n- Registre aqui suas ideias de campanha, masmorras e segredos.\n- Use o Copiloto IA à direita para gerar NPCs, ganchos e regras.\n`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          storageService.saveUserCampaigns(userId, [starterCamp]);
          storageService.saveUserCharacters(userId, []);
          storageService.saveUserActiveCampaignId(userId, starterCamp.id);
          try {
            await saveCampaignToFirestore(starterCamp, userId);
          } catch {}
        } else {
          storageService.saveUserCampaigns(userId, []);
          storageService.saveUserCharacters(userId, []);
        }

        onUserReady(res.user);
      } else {
        setRegError(res.error || 'Erro ao criar conta.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Erro ao registrar conta na nuvem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Login Existing Account
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await authService.loginAsync(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onUserReady(res.user);
      } else {
        setLoginError(res.error || 'Falha ao autenticar.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Erro ao conectar à nuvem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Import Account via Transfer Code
  const handleImportTransferCode = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);
    setIsSubmitting(true);

    try {
      const res = storageService.importAccountTransferCode(transferCode);
      if (res.success && res.user) {
        setTransferSuccess(`Conta de "${res.user.displayName}" importada com sucesso!`);
        setTimeout(() => {
          onUserReady(res.user!);
        }, 500);
      } else {
        setTransferError(res.error || 'Código de transferência inválido.');
      }
    } catch (err: any) {
      setTransferError(err?.message || 'Erro ao processar código de transferência.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Restore Sample Accounts (Optional test convenience)
  const handleRestoreDemo = async () => {
    setIsRestoringDemo(true);
    try {
      const demoUsers = await authService.restoreSampleAccounts();
      if (demoUsers.length > 0) {
        onUserReady(demoUsers[0]);
      }
    } catch (err) {
      console.warn('Erro ao restaurar contas demo:', err);
    } finally {
      setIsRestoringDemo(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 relative overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative z-10 my-8">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <FlamingD20Logo size={52} showGlow={true} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-mono text-zinc-100 flex items-center justify-center gap-2">
            <span>Grimório</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              Copiloto RPG
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Caderno de anotações e inteligência artificial para Mestres e Narradores. Crie seu perfil para iniciar.
          </p>
        </div>

        {/* Cloud Status Notice (Explaining Cross-Device Synchronization) */}
        {cloudStatus && cloudStatus.status === 'not_created' && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-semibold block">
                  Sincronização em Nuvem (Multi-Dispositivo)
                </strong>
                <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                  O banco de dados <strong>Cloud Firestore</strong> ainda não foi criado no Firebase Console do projeto <code className="text-amber-300 font-mono px-1 py-0.5 bg-zinc-950/60 rounded border border-amber-500/20">{cloudStatus.projectId}</code>. Contas criadas antes da ativação ficam salvas apenas no navegador atual.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/20 text-[11px]">
              <a
                href={cloudStatus.consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1"
              >
                <span>Ativar Firestore no Console (1 clique)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-zinc-600">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('transfer')}
                className="text-amber-300 hover:text-amber-200 underline font-medium cursor-pointer inline-flex items-center gap-1"
              >
                <span>Transferir conta por Código</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Conta</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transferir</span>
          </button>
        </div>

        {/* TAB 1: REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            {regError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Seu Nome ou Título de Mestre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Mestre Valerius"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Login / Usuário (único) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: valerius_mestre"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Papel no RPG
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-zinc-900 text-zinc-100">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Senha (opcional)
                </label>
                <input
                  type="password"
                  placeholder="Deixe em branco se preferir"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-2">
                Escolha seu Emblema & Cor
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {AVATAR_OPTIONS.map((opt) => {
                  const isSelected = regAvatar === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRegAvatar(opt.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                          : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                      title={opt.label}
                    >
                      <UserAvatar avatarId={opt.id} color={regColor} size="sm" />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setRegColor(c.id)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      regColor === c.id ? 'scale-125 border-zinc-100 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    } ${c.bg.replace('/15', '')}`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regStarterCamp}
                  onChange={(e) => setRegStarterCamp(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-950 text-cyan-500 focus:ring-cyan-500/20"
                />
                <span>Criar primeira campanha introdutória com meu nome</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando conta e grimório...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Criar Meu Grimório & Iniciar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-rose-500/20 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('transfer')}
                    className="text-cyan-300 hover:text-cyan-200 underline font-medium cursor-pointer"
                  >
                    Transferir conta do outro dispositivo por Código
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Nome de Usuário / Login
              </label>
              <input
                type="text"
                required
                placeholder="Seu usuário cadastrado"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Ao ativar o Cloud Firestore, as contas criadas em qualquer dispositivo são baixadas automaticamente.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Senha (se cadastrada)
              </label>
              <input
                type="password"
                placeholder="Sua senha ou deixe vazio se não tiver"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando contas...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Entrar no Grimório</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: TRANSFER / IMPORT CODE */}
        {activeTab === 'transfer' && (
          <form onSubmit={handleImportTransferCode} className="space-y-4">
            {transferError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}
            {transferSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-1.5">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Como transferir sua conta entre aparelhos:</span>
              </div>
              <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1">
                <li>No computador ou celular onde a conta foi criada, abra o Grimório.</li>
                <li>Clique no avatar / ícone de usuário no canto superior direito.</li>
                <li>Clique em <strong>"Copiar Código da Conta"</strong>.</li>
                <li>Cole o código gerado no campo abaixo e clique em Importar!</li>
              </ol>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Código de Transferência da Conta
              </label>
              <textarea
                required
                rows={4}
                placeholder="Cole aqui o código de transferência gerado no outro dispositivo..."
                value={transferCode}
                onChange={(e) => setTransferCode(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !transferCode.trim()}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importando conta e campanhas...</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Importar Conta para este Navegador</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Demo / Sample Accounts Fallback */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
          <button
            type="button"
            onClick={handleRestoreDemo}
            disabled={isRestoringDemo}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3 h-3 ${isRestoringDemo ? 'animate-spin' : ''}`} />
            <span>Deseja testar com as contas de exemplo? (Mestre Valerius)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
