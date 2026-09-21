import React, { useState } from 'react';
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
} from 'lucide-react';
import { UserProfile, UserRole, Campaign } from '../types';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';
import { saveCampaignToFirestore } from '../services/firebase';
import { FlamingD20Logo } from './FlamingD20Logo';
import { UserAvatar, AVATAR_OPTIONS, COLOR_OPTIONS } from './UserAvatar';

interface AccountOnboardingProps {
  onUserReady: (user: UserProfile) => void;
}

export const AccountOnboarding: React.FC<AccountOnboardingProps> = ({ onUserReady }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

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

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoringDemo, setIsRestoringDemo] = useState(false);

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

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-zinc-950/80 p-1 border border-zinc-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Nova Conta</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Entrar com Login</span>
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
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
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
                Se você criou sua conta em outro computador, ela será baixada da nuvem automaticamente.
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
                  <span>Conectando à nuvem...</span>
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
