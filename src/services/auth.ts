import { UserProfile, UserRole } from '../types';

const ACCOUNTS_STORAGE_KEY = 'grimorio_accounts_v2';
const CURRENT_USER_ID_KEY = 'grimorio_current_user_id_v2';

// Simple deterministic hash for local client profile protection
export function hashPassword(plain: string): string {
  if (!plain) return '';
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    const char = plain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}_${plain.length}`;
}

export const DEFAULT_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr_mestre',
    username: 'mestre',
    displayName: 'Mestre Valerius',
    role: 'Mestre da Masmorra',
    avatarId: 'd20',
    color: 'cyan',
    bio: 'Guardião dos Tomos Antigos e campanhas medievais de D&D e Tormenta.',
    createdAt: Date.now() - 86400000 * 15,
    lastLoginAt: Date.now(),
    passwordHash: hashPassword('1234'),
  },
  {
    id: 'usr_narradora',
    username: 'narradora',
    displayName: 'Narradora Lyra',
    role: 'Narrador',
    avatarId: 'wizard',
    color: 'purple',
    bio: 'Narradora de investigações de mistério, Call of Cthulhu e Sci-Fi.',
    createdAt: Date.now() - 86400000 * 5,
    lastLoginAt: Date.now() - 86400000 * 1,
    passwordHash: hashPassword('1234'),
  },
];

type AuthChangeListener = (user: UserProfile | null) => void;
const listeners = new Set<AuthChangeListener>();

function notifyListeners(user: UserProfile | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error('Error in auth change listener:', e);
    }
  });
}

export const authService = {
  getAccounts(): UserProfile[] {
    try {
      const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!data) {
        this.saveAccounts(DEFAULT_ACCOUNTS);
        return DEFAULT_ACCOUNTS;
      }
      const parsed: UserProfile[] = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveAccounts(DEFAULT_ACCOUNTS);
        return DEFAULT_ACCOUNTS;
      }
      return parsed;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  saveAccounts(accounts: UserProfile[]): void {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Falha ao salvar contas no LocalStorage:', e);
    }
  },

  getCurrentUser(): UserProfile {
    const accounts = this.getAccounts();
    try {
      const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
      if (currentId) {
        const found = accounts.find((a) => a.id === currentId);
        if (found) return found;
      }
    } catch {
      // fallback to first account
    }

    // Default to first account
    const defaultUser = accounts[0] || DEFAULT_ACCOUNTS[0];
    try {
      localStorage.setItem(CURRENT_USER_ID_KEY, defaultUser.id);
    } catch {
      // ignore
    }
    return defaultUser;
  },

  setCurrentUser(userId: string): UserProfile | null {
    const accounts = this.getAccounts();
    const target = accounts.find((a) => a.id === userId);
    if (!target) return null;

    target.lastLoginAt = Date.now();
    this.saveAccounts(accounts);
    try {
      localStorage.setItem(CURRENT_USER_ID_KEY, target.id);
    } catch {
      // ignore
    }

    notifyListeners(target);
    return target;
  },

  login(
    usernameOrEmail: string,
    password?: string
  ): { success: boolean; user?: UserProfile; error?: string } {
    const cleanLogin = usernameOrEmail.trim().toLowerCase();
    if (!cleanLogin) {
      return { success: false, error: 'Por favor, informe seu usuário ou e-mail.' };
    }

    const accounts = this.getAccounts();
    const user = accounts.find(
      (a) => a.username.toLowerCase() === cleanLogin || a.displayName.toLowerCase() === cleanLogin
    );

    if (!user) {
      return {
        success: false,
        error: `Nenhuma conta encontrada com o login "${usernameOrEmail}".`,
      };
    }

    if (user.passwordHash && user.passwordHash !== hashPassword('')) {
      const enteredHash = hashPassword(password || '');
      if (enteredHash !== user.passwordHash) {
        return { success: false, error: 'Senha incorreta. Tente novamente.' };
      }
    }

    const loggedIn = this.setCurrentUser(user.id);
    return { success: true, user: loggedIn || user };
  },

  register(data: {
    username: string;
    displayName: string;
    role?: UserRole;
    password?: string;
    avatarId?: string;
    color?: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo';
    bio?: string;
  }): { success: boolean; user?: UserProfile; error?: string } {
    const cleanUsername = data.username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanDisplayName = data.displayName.trim();

    if (!cleanDisplayName) {
      return { success: false, error: 'O nome do mestre/jogador é obrigatório.' };
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      return {
        success: false,
        error: 'O nome de usuário deve ter pelo menos 3 caracteres (sem espaços).',
      };
    }

    const accounts = this.getAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        error: `O login "${cleanUsername}" já está em uso por outro mestre/jogador.`,
      };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      username: cleanUsername,
      displayName: cleanDisplayName,
      role: data.role || 'Mestre da Masmorra',
      avatarId: data.avatarId || 'd20',
      color: data.color || 'cyan',
      bio: data.bio || `Grimório de ${cleanDisplayName}`,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      passwordHash: hashPassword(data.password || ''),
    };

    const updatedAccounts = [...accounts, newUser];
    this.saveAccounts(updatedAccounts);
    this.setCurrentUser(newUser.id);

    return { success: true, user: newUser };
  },

  updateProfile(
    userId: string,
    updates: Partial<UserProfile> & { newPassword?: string }
  ): { success: boolean; user?: UserProfile; error?: string } {
    const accounts = this.getAccounts();
    const index = accounts.findIndex((a) => a.id === userId);
    if (index === -1) {
      return { success: false, error: 'Perfil não encontrado.' };
    }

    const target = accounts[index];

    // If username is being changed, ensure it's not taken
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase().replace(/\s+/g, '_');
      const conflict = accounts.find((a) => a.id !== userId && a.username.toLowerCase() === cleanUsername);
      if (conflict) {
        return { success: false, error: `O login "${cleanUsername}" já está em uso.` };
      }
      target.username = cleanUsername;
    }

    if (updates.displayName?.trim()) {
      target.displayName = updates.displayName.trim();
    }
    if (updates.role) target.role = updates.role;
    if (updates.avatarId) target.avatarId = updates.avatarId;
    if (updates.color) target.color = updates.color;
    if (updates.bio !== undefined) target.bio = updates.bio;

    if (updates.newPassword !== undefined) {
      target.passwordHash = hashPassword(updates.newPassword);
    }

    accounts[index] = target;
    this.saveAccounts(accounts);

    // If updating currently logged in user, notify
    const current = this.getCurrentUser();
    if (current.id === userId) {
      notifyListeners(target);
    }

    return { success: true, user: target };
  },

  deleteAccount(userId: string): { success: boolean; error?: string } {
    const accounts = this.getAccounts();
    if (accounts.length <= 1) {
      return {
        success: false,
        error: 'Você não pode excluir a única conta restante do Grimório.',
      };
    }

    const filtered = accounts.filter((a) => a.id !== userId);
    this.saveAccounts(filtered);

    // If deleted user was active, switch to first available
    const current = this.getCurrentUser();
    if (current.id === userId) {
      this.setCurrentUser(filtered[0].id);
    }

    return { success: true };
  },

  onAuthChange(listener: AuthChangeListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
