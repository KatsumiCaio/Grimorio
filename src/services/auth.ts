import { UserProfile, UserRole } from '../types';
import {
  saveUserToFirestore,
  deleteUserFromFirestore,
  fetchUsersFromFirestore,
  findUserInFirestore,
  subscribeToUsers,
} from './firebase';

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

let isCloudInitialized = false;
let unsubscribeCloudUsers: (() => void) | null = null;

export const authService = {
  // Initialize Cloud Sync across multiple PCs and devices
  initCloudSync(): () => void {
    if (isCloudInitialized && unsubscribeCloudUsers) {
      return unsubscribeCloudUsers;
    }
    isCloudInitialized = true;

    // 1. Initial fetch from Firestore and seed if necessary
    const syncInitial = async () => {
      try {
        const cloudUsers = await fetchUsersFromFirestore();
        if (cloudUsers.length > 0) {
          const localAccounts = this.getAccounts();
          const mergedMap = new Map<string, UserProfile>();

          // Add cloud accounts
          cloudUsers.forEach((u) => mergedMap.set(u.id, u));

          // Merge any local-only accounts to map and upload them
          for (const local of localAccounts) {
            if (!mergedMap.has(local.id)) {
              mergedMap.set(local.id, local);
              void saveUserToFirestore(local);
            }
          }

          const merged = Array.from(mergedMap.values());
          this.saveAccounts(merged);

          // If current user is in merged, ensure latest data is reflected
          const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
          if (currentId && mergedMap.has(currentId)) {
            notifyListeners(mergedMap.get(currentId)!);
          }
        } else {
          // Firestore users collection is empty: seed default accounts so any other PC will see them
          const currentLocal = this.getAccounts();
          for (const acc of currentLocal) {
            await saveUserToFirestore(acc);
          }
        }
      } catch (err) {
        console.warn('Sincronização inicial de contas na nuvem:', err);
      }
    };

    void syncInitial();

    // 2. Real-time subscription to cloud users
    unsubscribeCloudUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers.length > 0) {
        const localAccounts = this.getAccounts();
        const mergedMap = new Map<string, UserProfile>();

        // Add cloud accounts first (truth from cloud)
        cloudUsers.forEach((u) => mergedMap.set(u.id, u));

        // Preserve local accounts not yet synced
        localAccounts.forEach((l) => {
          if (!mergedMap.has(l.id)) {
            mergedMap.set(l.id, l);
          }
        });

        const merged = Array.from(mergedMap.values());
        this.saveAccounts(merged);

        const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
        if (currentId && mergedMap.has(currentId)) {
          notifyListeners(mergedMap.get(currentId)!);
        }
      }
    });

    return () => {
      if (unsubscribeCloudUsers) {
        unsubscribeCloudUsers();
        unsubscribeCloudUsers = null;
      }
      isCloudInitialized = false;
    };
  },

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

    // Persist login timestamp to cloud
    void saveUserToFirestore(target);

    notifyListeners(target);
    return target;
  },

  // Synchronous quick login check (for locally cached accounts)
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
        error: `Nenhuma conta encontrada localmente com "${usernameOrEmail}".`,
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

  // Asynchronous robust login (queries Firestore if not cached locally — crucial for multi-PC usage)
  async loginAsync(
    usernameOrEmail: string,
    password?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanLogin = usernameOrEmail.trim().toLowerCase();
    if (!cleanLogin) {
      return { success: false, error: 'Por favor, informe seu nome de usuário.' };
    }

    // 1. Try local cache first
    const accounts = this.getAccounts();
    let target = accounts.find(
      (a) => a.username.toLowerCase() === cleanLogin || a.displayName.toLowerCase() === cleanLogin
    );

    // 2. If not found locally, query Firestore in real time
    if (!target) {
      try {
        const cloudUser = await findUserInFirestore(cleanLogin);
        if (cloudUser) {
          target = cloudUser;
          // Merge into local cache
          const nextAccounts = [...accounts.filter((a) => a.id !== cloudUser.id), cloudUser];
          this.saveAccounts(nextAccounts);
        }
      } catch (err) {
        console.warn('Erro ao consultar usuário no Firestore:', err);
      }
    }

    if (!target) {
      return {
        success: false,
        error: `Nenhuma conta encontrada com o login "${usernameOrEmail}". Verifique se o nome de usuário está correto ou crie uma nova conta.`,
      };
    }

    // 3. Verify password
    if (target.passwordHash && target.passwordHash !== hashPassword('')) {
      const enteredHash = hashPassword(password || '');
      if (enteredHash !== target.passwordHash) {
        return { success: false, error: 'Senha incorreta. Verifique e tente novamente.' };
      }
    }

    // 4. Update lastLoginAt locally and in Firestore
    target.lastLoginAt = Date.now();
    const updatedAccounts = accounts.map((a) => (a.id === target!.id ? target! : a));
    if (!updatedAccounts.some((a) => a.id === target.id)) {
      updatedAccounts.push(target);
    }
    this.saveAccounts(updatedAccounts);

    try {
      localStorage.setItem(CURRENT_USER_ID_KEY, target.id);
    } catch {
      // ignore
    }

    // Sync last login to cloud
    void saveUserToFirestore(target);
    notifyListeners(target);

    return { success: true, user: target };
  },

  async register(data: {
    username: string;
    displayName: string;
    role?: UserRole;
    password?: string;
    avatarId?: string;
    color?: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo';
    bio?: string;
  }): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
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

    // Check local accounts
    const accounts = this.getAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        error: `O login "${cleanUsername}" já está em uso por outro mestre/jogador.`,
      };
    }

    // Check cloud Firestore for duplicate username
    try {
      const existingInCloud = await findUserInFirestore(cleanUsername);
      if (existingInCloud) {
        return {
          success: false,
          error: `O login "${cleanUsername}" já foi registrado na nuvem por outro mestre/jogador.`,
        };
      }
    } catch (err) {
      console.warn('Aviso ao checar usuário na nuvem:', err);
    }

    const newUser: UserProfile = {
      id: `usr_${cleanUsername}_${Date.now().toString(36)}`,
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

    // Save locally
    const updatedAccounts = [...accounts, newUser];
    this.saveAccounts(updatedAccounts);
    this.setCurrentUser(newUser.id);

    // Save to Firestore cloud immediately so any other PC can see it
    try {
      await saveUserToFirestore(newUser);
    } catch (err) {
      console.warn('Aviso: conta criada localmente, sincronização na nuvem pendente:', err);
    }

    return { success: true, user: newUser };
  },

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile> & { newPassword?: string }
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const accounts = this.getAccounts();
    const index = accounts.findIndex((a) => a.id === userId);
    if (index === -1) {
      return { success: false, error: 'Perfil não encontrado.' };
    }

    const target = { ...accounts[index] };

    // If username is being changed, ensure it's not taken
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase().replace(/\s+/g, '_');
      const conflictLocal = accounts.find((a) => a.id !== userId && a.username.toLowerCase() === cleanUsername);
      if (conflictLocal) {
        return { success: false, error: `O login "${cleanUsername}" já está em uso.` };
      }

      try {
        const cloudConflict = await findUserInFirestore(cleanUsername);
        if (cloudConflict && cloudConflict.id !== userId) {
          return { success: false, error: `O login "${cleanUsername}" já está em uso na nuvem.` };
        }
      } catch (err) {
        // ignore
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

    // Persist to Firestore cloud
    try {
      await saveUserToFirestore(target);
    } catch (err) {
      console.warn('Erro ao atualizar usuário na nuvem:', err);
    }

    // If updating currently logged in user, notify
    const current = this.getCurrentUser();
    if (current.id === userId) {
      notifyListeners(target);
    }

    return { success: true, user: target };
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    const accounts = this.getAccounts();
    if (accounts.length <= 1) {
      return {
        success: false,
        error: 'Você não pode excluir a única conta restante do Grimório.',
      };
    }

    const filtered = accounts.filter((a) => a.id !== userId);
    this.saveAccounts(filtered);

    // Delete from Firestore cloud
    try {
      await deleteUserFromFirestore(userId);
    } catch (err) {
      console.warn('Erro ao remover usuário da nuvem:', err);
    }

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
