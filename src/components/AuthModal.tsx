import React, { useState } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  LogIn,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Shield,
  Scroll,
  Layers,
  Trash2,
  Edit3,
  ArrowRight,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';
import { UserAvatar, AVATAR_OPTIONS, COLOR_OPTIONS } from './UserAvatar';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChanged: (user: UserProfile) => void;
  initialTab?: 'profiles' | 'login' | 'register' | 'edit';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
  initialTab = 'profiles',
}) => {
  const [activeTab, setActiveTab] = useState<'profiles' | 'login' | 'register' | 'edit'>(initialTab);

  // Switch / Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Mestre da Masmorra');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState('d20');
  const [regColor, setRegColor] = useState<UserProfile['color']>('cyan');
  const [regCustomAvatarUrl, setRegCustomAvatarUrl] = useState('');
  const [regStarterCamp, setRegStarterCamp] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  // Edit Profile state
  const [editName, setEditName] = useState(currentUser.displayName);
  const [editRole, setEditRole] = useState<UserRole>(currentUser.role);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatarId);
  const [editColor, setEditColor] = useState(currentUser.color);
  const [editCustomAvatarUrl, setEditCustomAvatarUrl] = useState(
    currentUser.avatarId.startsWith('http') || currentUser.avatarId.startsWith('data:') ? currentUser.avatarId : ''
  );
  const [editPassword, setEditPassword] = useState('');
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Quick switch password prompt state
  const [selectedQuickUser, setSelectedQuickUser] = useState<UserProfile | null>(null);
  const [quickPassword, setQuickPassword] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);

  if (!isOpen) return null;

  const accounts = authService.getAccounts();

  // Handler: Switch user directly
  const handleDirectSwitch = (account: UserProfile) => {
    if (account.id === currentUser.id) {
      onClose();
      return;
    }

    // Check if account has password protection
    if (account.passwordHash && account.passwordHash !== 'h_0_0') {
      setSelectedQuickUser(account);
      setQuickPassword('');
      setQuickError(null);
      return;
    }

    const switched = authService.setCurrentUser(account.id);
    if (switched) {
      onUserChanged(switched);
      onClose();
    }
  };

  // Handler: Confirm switch with password
  const handleConfirmQuickSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuickUser) return;

    const res = authService.login(selectedQuickUser.username, quickPassword);
    if (res.success && res.user) {
      onUserChanged(res.user);
      setSelectedQuickUser(null);
      setQuickPassword('');
      onClose();
    } else {
      setQuickError(res.error || 'Senha incorreta.');
    }
  };

  // Handler: Login submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = authService.login(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      onUserChanged(res.user);
      setLoginIdentifier('');
      setLoginPassword('');
      onClose();
    } else {
      setLoginError(res.error || 'Falha ao autenticar.');
    }
  };

  // Handler: Register submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const finalAvatar = regCustomAvatarUrl.trim() || regAvatar;

    const res = authService.register({
      displayName: regName,
      username: regUsername,
      role: regRole,
      password: regPassword,
      avatarId: finalAvatar,
      color: regColor,
    });

    if (res.success && res.user) {
      // If user wants empty start or custom starter campaign
      if (!regStarterCamp) {
        storageService.saveUserCampaigns(res.user.id, []);
        storageService.saveUserCharacters(res.user.id, []);
      } else {
        // Create initial starter adventure with user's name
        const starter: any = [
          {
            id: `camp_${res.user.id}_init`,
            title: `Aventuras de ${res.user.displayName}`,
            system: 'D&D 5e',
            notes: `# Grimório de ${res.user.displayName}\n\n## ⚔️ Primeira Sessão\n- Registre aqui as ideias para a próxima aventura.\n- Use o Copiloto IA à direita para sugerir NPCs, masmorras e reviravoltas.\n`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
        storageService.saveUserCampaigns(res.user.id, starter);
        storageService.saveUserCharacters(res.user.id, []);
      }

      onUserChanged(res.user);
      onClose();
    } else {
      setRegError(res.error || 'Erro ao criar conta.');
    }
  };

  // Handler: Save edited profile
  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    const finalAvatar = editCustomAvatarUrl.trim() || editAvatar;

    const res = authService.updateProfile(currentUser.id, {
      displayName: editName,
      role: editRole,
      avatarId: finalAvatar,
      color: editColor,
      bio: editBio,
      ...(editPassword ? { newPassword: editPassword } : {}),
    });

    if (res.success && res.user) {
      setEditSuccess('Perfil atualizado com sucesso!');
      onUserChanged(res.user);
      setTimeout(() => setEditSuccess(null), 2500);
    } else {
      setEditError(res.error || 'Erro ao atualizar perfil.');
    }
  };

  // Handler: Delete account
  const handleDeleteAccount = (account: UserProfile) => {
    if (confirm(`Tem certeza que deseja excluir a conta de "${account.displayName}" e todas as suas campanhas e fichas?`)) {
      storageService.clearUserCampaigns(account.id);
      storageService.clearUserCharacters(account.id);
      const res = authService.deleteAccount(account.id);
      if (res.success) {
        const next = authService.getCurrentUser();
        onUserChanged(next);
      }
    }
  };

  const ROLES: UserRole[] = [
    'Mestre da Masmorra',
    'Narrador',
    'Guardião de Segredos',
    'Jogador',
    'Criador de Mundos',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <UserAvatar
              avatarId={currentUser.avatarId}
              color={currentUser.color}
              size="sm"
              showGlow={true}
            />
            <div>
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <span>Perfis & Contas de Mestre</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Cada login possui suas próprias campanhas, fichas e anotações isoladas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 border-b border-zinc-800 bg-zinc-950/40 gap-2 overflow-x-auto select-none">
          <button
            onClick={() => {
              setActiveTab('profiles');
              setSelectedQuickUser(null);
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Alternar Usuários ({accounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'register'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Nova Conta</span>
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'login'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar com Login</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('edit');
              setEditName(currentUser.displayName);
              setEditRole(currentUser.role);
              setEditAvatar(currentUser.avatarId);
              setEditColor(currentUser.color);
              setEditBio(currentUser.bio || '');
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'edit'
                ? 'border-cyan-400 text-cyan-300 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Meu Perfil</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: PROFILES LIST & QUICK SWITCH */}
          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Selecione a conta para acessar o seu Grimório
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo Mestre</span>
                </button>
              </div>

              {/* Quick Switch Password Modal Form */}
              {selectedQuickUser && (
                <form
                  onSubmit={handleConfirmQuickSwitch}
                  className="p-4 rounded-xl bg-zinc-950 border border-cyan-500/40 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        avatarId={selectedQuickUser.avatarId}
                        color={selectedQuickUser.color}
                        size="sm"
                      />
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">
                          Entrar como {selectedQuickUser.displayName}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          Esta conta possui senha de proteção configurada.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedQuickUser(null)}
                      className="text-zinc-500 hover:text-zinc-300 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {quickError && (
                    <div className="p-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{quickError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300">Digite a senha de acesso:</label>
                    <input
                      type="password"
                      autoFocus
                      value={quickPassword}
                      onChange={(e) => setQuickPassword(e.target.value)}
                      placeholder="Senha do usuário..."
                      className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedQuickUser(null)}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Acessar Campanhas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* Accounts Cards Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {accounts.map((acc) => {
                  const isCurrent = acc.id === currentUser.id;
                  const userCamps = storageService.getUserCampaigns(acc.id);
                  const userChars = storageService.getUserCharacters(acc.id);

                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleDirectSwitch(acc)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'bg-zinc-800/80 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                          : 'bg-zinc-950/60 hover:bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          avatarId={acc.avatarId}
                          color={acc.color}
                          size="md"
                          showGlow={isCurrent}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-zinc-100 truncate">
                              {acc.displayName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                              @{acc.username}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                            <span className="text-cyan-400/90 font-medium">{acc.role}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Scroll className="w-3 h-3 text-zinc-500" />
                              <strong className="text-zinc-300 font-mono">{userCamps.length}</strong>{' '}
                              campanha{userCamps.length !== 1 ? 's' : ''}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-400 font-mono">
                              {userChars.length} ficha{userChars.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Ativo</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 group-hover:bg-cyan-500 group-hover:text-zinc-950 text-zinc-300 text-xs font-medium transition-all flex items-center gap-1.5"
                          >
                            <span>Entrar</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}

                        {accounts.length > 1 && !isCurrent && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAccount(acc);
                            }}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Excluir esta conta de usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Cada usuário do Grimório tem o seu próprio espaço seguro de campanhas, notas e fichas.
                  Ao alternar de conta, o aplicativo carrega instantaneamente as histórias daquele mestre.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-semibold text-zinc-100">Criar Novo Perfil de Mestre ou Jogador</h3>
                <p className="text-xs text-zinc-400">
                  Esta conta terá suas próprias campanhas, isoladas de outros usuários deste dispositivo.
                </p>
              </div>

              {regError && (
                <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Nome de Exibição *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mestre André, Katsumi, Elminster"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Nome de Usuário / Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: andre_mestre, katsumi"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Papel RPG Principal</label>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRegRole(role)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                        regRole === role
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Senha de Acesso (Opcional)</span>
                  <span className="text-[10px] text-zinc-500">Deixe em branco para acesso rápido sem senha</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Defina uma senha ou PIN..."
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Avatar Icon Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Escolha o Avatar do Perfil</label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setRegAvatar(av.id);
                        setRegCustomAvatarUrl('');
                      }}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        regAvatar === av.id && !regCustomAvatarUrl
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/30 shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                      title={av.label}
                    >
                      <UserAvatar avatarId={av.id} color={regColor} size="sm" />
                      <span className="text-[9px] text-zinc-400 truncate w-full text-center">
                        {av.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Tom de Cor do Perfil</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRegColor(c.id)}
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${c.bg} ${c.border} ${
                        regColor === c.id ? 'ring-2 ring-white/60 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {regColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starter Campaign Toggle */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-zinc-200">
                    Criar campanha introdutória inicial
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Gera automaticamente uma primeira campanha de exemplo para este perfil.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={regStarterCamp}
                  onChange={(e) => setRegStarterCamp(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('profiles')}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Conta & Abrir Grimório</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: LOGIN WITH USERNAME & PASSWORD */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-zinc-100">Acessar Conta Existente</h3>
                <p className="text-xs text-zinc-400">
                  Entre com seu nome de usuário para carregar suas campanhas.
                </p>
              </div>

              {loginError && (
                <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Usuário ou Nome de Mestre</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: mestre, narradora, ou seu nome de usuário"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Senha (se configurada)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar no Grimório</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
                >
                  Não tem uma conta? Crie um novo perfil de Mestre agora
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: EDIT CURRENT USER PROFILE */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEditProfile} className="space-y-4">
              <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Editar Perfil: {currentUser.displayName}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">@{currentUser.username}</p>
                </div>
                <UserAvatar
                  avatarId={editCustomAvatarUrl || editAvatar}
                  color={editColor}
                  size="md"
                />
              </div>

              {editSuccess && (
                <div className="p-3 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{editSuccess}</span>
                </div>
              )}
              {editError && (
                <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Nome de Exibição</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Papel / Título</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bio / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Biografia / Estilo de Mestrado</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Descreva seu estilo de RPG ou campanhas favoritas..."
                  className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Ícone de Avatar</label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setEditAvatar(av.id);
                        setEditCustomAvatarUrl('');
                      }}
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        editAvatar === av.id && !editCustomAvatarUrl
                          ? 'bg-cyan-500/20 border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                      title={av.label}
                    >
                      <UserAvatar avatarId={av.id} color={editColor} size="sm" />
                      <span className="text-[9px] text-zinc-400 truncate w-full text-center">
                        {av.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Tom de Cor</label>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditColor(c.id)}
                      className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${c.bg} ${c.border} ${
                        editColor === c.id ? 'ring-2 ring-white/60 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {editColor === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nova senha..."
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('profiles')}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
