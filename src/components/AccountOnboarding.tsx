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
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile, UserRole, Campaign } from '../types';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';
import { saveCampaignToFirestore, checkCloudDbStatus, CloudDbStatus } from '../services/firebase';
import { themeService } from '../services/theme';
import { FlamingD20Logo } from './FlamingD20Logo';
import { UserAvatar, AVATAR_OPTIONS, COLOR_OPTIONS } from './UserAvatar';

interface AccountOnboardingProps {
  onUserReady: (user: UserProfile) => void;
}

export const AccountOnboarding: React.FC<AccountOnboardingProps> = ({ onUserReady }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'transfer'>('login');
  const [cloudStatus, setCloudStatus] = useState<CloudDbStatus | null>(null);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Mestre da Masmorra');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
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
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);

  const [deviceAccounts, setDeviceAccounts] = useState<UserProfile[]>(() => authService.getDeviceAccounts());
  const [isDark, setIsDark] = useState(() => themeService.isDark());

  useEffect(() => {
    const unsub = themeService.subscribe((dark) => {
      setIsDark(dark);
    });
    return () => unsub();
  }, []);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-zinc-700', width: 'w-0' };
    if (pwd.length < 4) return { label: 'Muito curta (mínimo 4 caracteres)', color: 'bg-rose-500', width: 'w-1/4' };
    if (pwd.length < 6) return { label: 'Fraca', color: 'bg-amber-500', width: 'w-2/4' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);
    if (pwd.length >= 8 && hasLetters && (hasNumbers || hasSymbols)) {
      return { label: 'Forte & Segura', color: 'bg-emerald-500', width: 'w-full' };
    }
    return { label: 'Média', color: 'bg-cyan-500', width: 'w-3/4' };
  };

  const handleRecheckCloud = async () => {
    setIsCheckingCloud(true);
    try {
      const status = await checkCloudDbStatus();
      setCloudStatus(status);
    } finally {
      setIsCheckingCloud(false);
    }
  };

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

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas digitadas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('Para proteger suas anotações e fichas, defina uma senha com pelo menos 4 caracteres.');
      return;
    }

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

      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-30">
        <button
          type="button"
          onClick={() => themeService.toggleTheme()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 shadow-md backdrop-blur-md transition-all cursor-pointer group text-xs select-none"
          title={isDark ? "Mudar para Modo Claro (Light)" : "Mudar para Modo Escuro (Dark)"}
          aria-label={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span className="text-zinc-300 font-medium">Modo Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-cyan-600 group-hover:-rotate-12 transition-transform" />
              <span className="text-zinc-700 font-medium">Modo Escuro</span>
            </>
          )}
        </button>
      </div>

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
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold block">
                    Ativação do Banco Firestore no Console
                  </strong>
                  <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                    O Google Cloud exige que o dono do projeto confirme a criação do banco uma única vez:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRecheckCloud}
                disabled={isCheckingCloud}
                className="shrink-0 p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="Verificar se o banco já foi criado"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingCloud ? 'animate-spin text-amber-400' : ''}`} />
                <span>{isCheckingCloud ? 'Verificando...' : 'Verificar Agora'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside text-[11px] text-amber-200/80 bg-zinc-950/50 p-2.5 rounded-lg border border-amber-500/20 space-y-1">
              <li>Clique no botão abaixo para abrir o console do Firebase.</li>
              <li>Clique em <strong>"Criar banco de dados"</strong> (escolha o local padrão e modo de teste).</li>
              <li>Volte aqui e clique em <strong>"Verificar Agora"</strong> acima.</li>
            </ol>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/20 text-[11px]">
              <a
                href={cloudStatus.consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Abrir Firebase Console (Criar Banco)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setActiveTab('transfer')}
                className="text-cyan-400 hover:text-cyan-300 underline font-medium cursor-pointer inline-flex items-center gap-1"
              >
                <span>Ou use o Código de Transferência</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher - Login First for New & Returning Devices */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800 mb-6">
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
            <span>Entrar na Conta</span>
          </button>
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

        {/* TAB 1: LOGIN FORM (Default for new & returning devices) */}
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

            {/* Quick Profile Select ONLY if accounts have previously logged into THIS device */}
            {deviceAccounts.length > 0 && (
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                <div className="text-[11px] font-semibold text-zinc-300 mb-2 flex items-center justify-between">
                  <span>Perfis salvos neste aparelho:</span>
                  <span className="text-[10px] text-zinc-500">Toque para selecionar</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {deviceAccounts.map((acc) => {
                    const isSelected = loginIdentifier.toLowerCase() === acc.username.toLowerCase();
                    return (
                      <div key={acc.id} className="inline-flex items-center group">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier(acc.username);
                            setLoginError(null);
                          }}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-l-lg border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200 shadow-xs'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <UserAvatar avatarId={acc.avatarId} color={acc.color} size="xs" />
                          <div className="text-left">
                            <div className="font-medium text-[11px] leading-tight">{acc.displayName}</div>
                            <div className="text-[9px] text-zinc-400 font-mono">@{acc.username}</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            authService.removeDeviceUser(acc.id);
                            setDeviceAccounts(authService.getDeviceAccounts());
                            if (loginIdentifier.toLowerCase() === acc.username.toLowerCase()) {
                              setLoginIdentifier('');
                            }
                          }}
                          title="Remover perfil da lista deste aparelho"
                          className="px-1.5 py-2 rounded-r-lg border-y border-r border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 text-[10px] transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Nome de Usuário / Login *
              </label>
              <input
                type="text"
                required
                placeholder="Seu usuário cadastrado (ex: mestre_valerius)"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                Senha de Acesso
              </label>
              <input
                type="password"
                placeholder="Sua senha de segurança"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Por segurança, contas protegidas por senha exigem autenticação em qualquer dispositivo.
              </p>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-[11px] text-cyan-200/90 flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Sessão Segura:</strong> Dispositivos novos nunca entram automaticamente na sua conta. Suas campanhas, fichas e anotações permanecem protegidas.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando credenciais e sincronizando...</span>
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

        {/* TAB 2: REGISTER FORM */}
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
                  placeholder="ex: Mestre Katsumi"
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

            {/* Password with Confirmation & Strength Indicator */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Senha de Proteção *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Confirmar Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita sua senha"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {regPassword && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Força da Senha:</span>
                  <span className="font-semibold text-zinc-300">{getPasswordStrength(regPassword).label}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getPasswordStrength(regPassword).color} ${
                      getPasswordStrength(regPassword).width
                    }`}
                  />
                </div>
              </div>
            )}

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


      </div>
    </div>
  );
};
