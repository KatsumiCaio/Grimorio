import { UserProfile, UserRole } from '../types';
import {
  saveUserToFirestore,
  deleteUserFromFirestore,
  fetchUsersFromFirestore,
  findUserInFirestore,
  subscribeToUsers,
  checkCloudDbStatus,
} from './firebase';

const ACCOUNTS_STORAGE_KEY = 'grimorio_accounts_v4';
const CURRENT_USER_ID_KEY = 'grimorio_current_user_id_v4';
const ACCOUNTS_CLEARED_FLAG = 'grimorio_accounts_explicitly_cleared_v4';
const DEVICE_SESSION_KEY = 'grimorio_device_session_v5';
const DEVICE_KNOWN_USERS_KEY = 'grimorio_device_known_users_v5';
const STRICT_DEVICE_PRIVACY_FLAG = 'grimorio_strict_device_privacy_v5';

// Simple deterministic hash for legacy profile verification
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

// Cryptographic salted SHA-256 hash for secure user credentials
export async function hashPasswordCrypto(plain: string): Promise<string> {
  if (!plain) return '';
  try {
    const salt = 'grimorio_rpg_salt_v4:';
    const data = new TextEncoder().encode(salt + plain);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `s256_${hex}`;
  } catch {
    return hashPassword(plain);
  }
}

// Asynchronously verify entered password against stored hash (supports SHA-256 & legacy)
export async function verifyPasswordAsync(plain: string, storedHash?: string): Promise<boolean> {
  if (!storedHash || storedHash === 'h_0_0' || storedHash === hashPassword('')) {
    return true; // No password protection set
  }
  if (!plain) return false;

  if (storedHash.startsWith('s256_')) {
    const computed = await hashPasswordCrypto(plain);
    return computed === storedHash;
  }

  // Legacy format support
  return hashPassword(plain) === storedHash;
}

// Synchronous check for UI fast path (if legacy or no password)
export function verifyPasswordSync(plain: string, storedHash?: string): boolean {
  if (!storedHash || storedHash === 'h_0_0' || storedHash === hashPassword('')) {
    return true;
  }
  if (!plain) return false;
  if (storedHash.startsWith('h_')) {
    return hashPassword(plain) === storedHash;
  }
  return false;
}

// Mestre Katsumi is the sole preserved primary master profile
export const DEFAULT_ACCOUNTS: UserProfile[] = [
  {
    id: 'usr_katsumicaio_mubikoqw',
    username: 'katsumicaio',
    displayName: 'Mestre Katsumi',
    role: 'Mestre da Masmorra',
    avatarId: 'd20',
    color: 'cyan',
    bio: 'Grimório de Mestre Katsumi',
    createdAt: 1790011406408,
    lastLoginAt: Date.now(),
    passwordHash: 'h_ox4dl5_6',
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

// One-time startup cleanup: Enforce strict device privacy and wipe any erroneous auto-logins
function runStrictDevicePrivacyCleanup(): void {
  if (typeof window === 'undefined') return;
  try {
    const isCleaned = localStorage.getItem(STRICT_DEVICE_PRIVACY_FLAG);
    if (isCleaned === 'true') return;

    // Purge unwanted legacy sample and deleted user caches
    const deletedIds = ['usr_teste_muee5q01', 'usr_mestre', 'usr_narradora'];
    for (const dId of deletedIds) {
      try {
        localStorage.removeItem(`grimorio_user_${dId}_campaigns`);
        localStorage.removeItem(`grimorio_user_${dId}_characters`);
        localStorage.removeItem(`grimorio_user_${dId}_active_camp`);
      } catch {}
    }

    // Purge legacy storage keys and old auto-login session keys
    try {
      localStorage.removeItem('grimorio_accounts_v3');
      localStorage.removeItem('grimorio_current_user_id_v3');
      localStorage.removeItem('grimorio_device_session_v4');
      localStorage.removeItem('grimorio_device_known_users_v2');
      localStorage.removeItem('grimorio_purge_non_katsumi_done_v2');
      // CRITICAL: Remove active session and reset device known users so that
      // other devices that were erroneously auto-logged in are forced to the login screen!
      localStorage.removeItem(CURRENT_USER_ID_KEY);
      localStorage.removeItem(DEVICE_SESSION_KEY);
    } catch {}

    // On fresh startup or after privacy reset:
    // NO DEVICE IS EVER AUTOMATICALLY LOGGED IN!
    // The device known users list starts completely empty so no other accounts are visible at login.
    localStorage.setItem(DEVICE_KNOWN_USERS_KEY, JSON.stringify([]));

    localStorage.setItem(STRICT_DEVICE_PRIVACY_FLAG, 'true');
  } catch (err) {
    console.warn('Erro na aplicação de privacidade estrita do dispositivo:', err);
  }
}

// Execute device privacy cleanup
runStrictDevicePrivacyCleanup();

export const authService = {
  // Device-level known users tracker:
  // Only accounts that have explicitly authenticated or registered ON THIS DEVICE
  // will ever appear on this device's login screen.
  getDeviceKnownUserIds(): string[] {
    try {
      const data = localStorage.getItem(DEVICE_KNOWN_USERS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  recordDeviceUser(userId: string): void {
    if (!userId) return;
    try {
      const current = this.getDeviceKnownUserIds();
      if (!current.includes(userId)) {
        current.push(userId);
        localStorage.setItem(DEVICE_KNOWN_USERS_KEY, JSON.stringify(current));
      }
    } catch {}
  },

  removeDeviceUser(userId: string): void {
    if (!userId) return;
    try {
      const filtered = this.getDeviceKnownUserIds().filter((id) => id !== userId);
      localStorage.setItem(DEVICE_KNOWN_USERS_KEY, JSON.stringify(filtered));

      const accounts = this.getAccounts().filter((a) => a.id !== userId);
      this.saveAccounts(accounts);

      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.logout();
      }
    } catch {}
  },

  // Returns only accounts that have logged in at least once ON THIS DEVICE.
  // Unknown users created on other devices will NEVER appear in this list.
  getDeviceAccounts(): UserProfile[] {
    const knownSet = new Set(this.getDeviceKnownUserIds());
    if (knownSet.size === 0) return [];
    const accounts = this.getAccounts();
    return accounts.filter((a) => knownSet.has(a.id));
  },

  // Initialize Cloud Sync across multiple PCs and devices
  initCloudSync(): () => void {
    if (isCloudInitialized && unsubscribeCloudUsers) {
      return unsubscribeCloudUsers;
    }
    isCloudInitialized = true;

    const applyMergedUsers = (cloudUsers: UserProfile[]) => {
      if (!cloudUsers || cloudUsers.length === 0) return;

      // DEVICE PRIVACY ENFORCEMENT:
      // We ONLY update profiles of accounts that are already registered on THIS device.
      // Unknown cloud accounts (other players/masters who haven't logged in on this machine)
      // are NEVER added to this device's local account list or login screen!
      const knownIds = new Set(this.getDeviceKnownUserIds());
      const localAccounts = this.getAccounts();

      const cloudMap = new Map<string, UserProfile>();
      for (const cu of cloudUsers) {
        cloudMap.set(cu.id, cu);
        cloudMap.set(cu.username.toLowerCase(), cu);
      }

      const updatedAccounts: UserProfile[] = [];
      for (const local of localAccounts) {
        const cloudMatch = cloudMap.get(local.id) || cloudMap.get(local.username.toLowerCase());
        if (cloudMatch) {
          updatedAccounts.push({
            ...local,
            ...cloudMatch,
            passwordHash: cloudMatch.passwordHash || local.passwordHash,
          });
        } else if (knownIds.has(local.id)) {
          updatedAccounts.push(local);
        }
      }

      this.saveAccounts(updatedAccounts);

      // If active authenticated session on this device exists, update listeners with latest cloud data
      const activeUser = this.getCurrentUser();
      if (activeUser) {
        const activeMatch = updatedAccounts.find((a) => a.id === activeUser.id);
        if (activeMatch) {
          notifyListeners(activeMatch);
        }
      }
    };

    // 1. Initial fetch from Firestore
    const syncInitial = async () => {
      try {
        const cloudUsers = await fetchUsersFromFirestore();
        applyMergedUsers(cloudUsers);
      } catch (err) {
        console.warn('Sincronização inicial de contas na nuvem:', err);
      }
    };

    void syncInitial();

    // 2. Real-time subscription to cloud users
    unsubscribeCloudUsers = subscribeToUsers((cloudUsers) => {
      applyMergedUsers(cloudUsers);
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
        return [];
      }
      const parsed: UserProfile[] = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  },

  saveAccounts(accounts: UserProfile[]): void {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Falha ao salvar contas no LocalStorage:', e);
    }
  },

  // Returns currently authenticated user on THIS device, or null if on login screen
  getCurrentUser(): UserProfile | null {
    try {
      const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
      if (!currentId) {
        return null;
      }

      // Strict device session verification: must have explicit device session token
      const sessionToken = localStorage.getItem(DEVICE_SESSION_KEY);
      if (!sessionToken || !sessionToken.startsWith(`sess_${currentId}_`)) {
        // Unauthenticated or invalid session — clean up and force login
        localStorage.removeItem(CURRENT_USER_ID_KEY);
        localStorage.removeItem(DEVICE_SESSION_KEY);
        return null;
      }

      const accounts = this.getAccounts();
      let found = accounts.find((a) => a.id === currentId);
      if (!found) {
        // Fallback check DEFAULT_ACCOUNTS
        found = DEFAULT_ACCOUNTS.find((a) => a.id === currentId);
      }
      return found || null;
    } catch {
      return null;
    }
  },

  setCurrentUser(userId: string | null): UserProfile | null {
    if (!userId) {
      try {
        localStorage.removeItem(CURRENT_USER_ID_KEY);
        localStorage.removeItem(DEVICE_SESSION_KEY);
      } catch {}
      notifyListeners(null);
      return null;
    }

    let accounts = this.getAccounts();
    let target = accounts.find((a) => a.id === userId);
    if (!target) {
      target = DEFAULT_ACCOUNTS.find((a) => a.id === userId);
      if (target) {
        accounts = [...accounts, target];
        this.saveAccounts(accounts);
      } else {
        return null;
      }
    }

    target.lastLoginAt = Date.now();
    this.saveAccounts(accounts);
    this.recordDeviceUser(target.id);
    try {
      localStorage.setItem(CURRENT_USER_ID_KEY, target.id);
      localStorage.setItem(DEVICE_SESSION_KEY, `sess_${target.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`);
    } catch {
      // ignore
    }

    // Persist login timestamp to cloud
    void saveUserToFirestore(target);

    notifyListeners(target);
    return target;
  },

  // Explicit device logout: clear device session and send to login screen
  logout(): void {
    this.setCurrentUser(null);
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

    if (user.passwordHash && user.passwordHash !== 'h_0_0' && user.passwordHash !== hashPassword('')) {
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

    // 3. Fallback to DEFAULT_ACCOUNTS if Firestore is unreachable
    if (!target) {
      const defMatch = DEFAULT_ACCOUNTS.find(
        (a) => a.username.toLowerCase() === cleanLogin || a.displayName.toLowerCase() === cleanLogin
      );
      if (defMatch) {
        target = { ...defMatch };
      }
    }

    if (!target) {
      const dbStatus = await checkCloudDbStatus();
      if (dbStatus.status === 'not_created') {
        return {
          success: false,
          error: `A conta "${usernameOrEmail}" não existe na memória deste navegador. O banco de dados Cloud Firestore ainda não foi ativado no Firebase Console do projeto "${dbStatus.projectId}". Você pode ativar o Firestore no Firebase Console ou transferir sua conta diretamente usando um Código de Transferência.`,
        };
      }
      if (dbStatus.status === 'offline') {
        return {
          success: false,
          error: `A conta "${usernameOrEmail}" não foi encontrada neste navegador e o servidor em nuvem (Firestore) está inacessível no momento. Use o Código de Transferência para migrar sua conta.`,
        };
      }
      return {
        success: false,
        error: `Nenhuma conta encontrada com o login "${usernameOrEmail}". Verifique se o nome de usuário está correto ou crie uma nova conta.`,
      };
    }

    // 3. Verify password securely
    if (target.passwordHash && target.passwordHash !== 'h_0_0' && target.passwordHash !== hashPassword('')) {
      if (!password) {
        return {
          success: false,
          error: 'Esta conta possui senha de proteção. Digite sua senha para entrar.',
        };
      }
      const isMatch = await verifyPasswordAsync(password, target.passwordHash);
      if (!isMatch) {
        return { success: false, error: 'Senha incorreta. Verifique e tente novamente.' };
      }
      // Upgrade legacy password hash to SHA-256 for better security
      if (!target.passwordHash.startsWith('s256_')) {
        target.passwordHash = await hashPasswordCrypto(password);
      }
    }

    // 4. Update lastLoginAt locally and in Firestore
    target.lastLoginAt = Date.now();
    const updatedAccounts = accounts.map((a) => (a.id === target!.id ? target! : a));
    if (!updatedAccounts.some((a) => a.id === target.id)) {
      updatedAccounts.push(target);
    }
    this.saveAccounts(updatedAccounts);
    this.recordDeviceUser(target.id);

    this.setCurrentUser(target.id);
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

    const cleanPassword = (data.password || '').trim();
    if (!cleanPassword || cleanPassword.length < 4) {
      return {
        success: false,
        error: 'Para a segurança e privacidade da sua conta, defina uma senha com no mínimo 4 caracteres.',
      };
    }

    // Check local accounts
    const accounts = this.getAccounts();
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return {
        success: false,
        error: `O login "${cleanUsername}" já está em uso neste aparelho.`,
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

    const secureHash = await hashPasswordCrypto(cleanPassword);

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
      passwordHash: secureHash,
    };

    // Save locally
    const updatedAccounts = [...accounts, newUser];
    this.saveAccounts(updatedAccounts);
    this.recordDeviceUser(newUser.id);
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
      const cleanPwd = updates.newPassword.trim();
      if (cleanPwd && cleanPwd.length < 4) {
        return { success: false, error: 'A nova senha deve ter pelo menos 4 caracteres.' };
      }
      target.passwordHash = cleanPwd ? await hashPasswordCrypto(cleanPwd) : '';
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
    if (current && current.id === userId) {
      notifyListeners(target);
    }

    return { success: true, user: target };
  },

  async deleteAccount(userId: string): Promise<{ success: boolean; error?: string }> {
    const accounts = this.getAccounts();
    const filtered = accounts.filter((a) => a.id !== userId);
    this.saveAccounts(filtered);
    this.removeDeviceUser(userId);

    // Delete from Firestore cloud
    try {
      await deleteUserFromFirestore(userId);
    } catch (err) {
      console.warn('Erro ao remover usuário da nuvem:', err);
    }

    if (filtered.length === 0) {
      try {
        localStorage.removeItem(CURRENT_USER_ID_KEY);
        localStorage.setItem(ACCOUNTS_CLEARED_FLAG, 'true');
      } catch {}
      notifyListeners(null);
    } else {
      const current = this.getCurrentUser();
      if (!current || current.id === userId) {
        this.setCurrentUser(filtered[0].id);
      }
    }

    return { success: true };
  },

  async clearAllAccounts(): Promise<{ success: boolean; count: number }> {
    const accounts = this.getAccounts();
    const count = accounts.length;

    for (const acc of accounts) {
      try {
        await deleteUserFromFirestore(acc.id);
      } catch (err) {
        console.warn('Erro ao excluir usuário da nuvem:', err);
      }
    }

    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify([]));
      localStorage.setItem(DEVICE_KNOWN_USERS_KEY, JSON.stringify([]));
      localStorage.removeItem(CURRENT_USER_ID_KEY);
      localStorage.setItem(ACCOUNTS_CLEARED_FLAG, 'true');
    } catch {}

    notifyListeners(null);
    return { success: true, count };
  },

  async restoreSampleAccounts(): Promise<UserProfile[]> {
    try {
      localStorage.removeItem(ACCOUNTS_CLEARED_FLAG);
    } catch {}

    this.saveAccounts(DEFAULT_ACCOUNTS);
    this.recordDeviceUser(DEFAULT_ACCOUNTS[0].id);
    for (const acc of DEFAULT_ACCOUNTS) {
      try {
        await saveUserToFirestore(acc);
      } catch (e) {
        console.warn('Erro ao restaurar conta na nuvem:', e);
      }
    }
    this.setCurrentUser(DEFAULT_ACCOUNTS[0].id);
    return DEFAULT_ACCOUNTS;
  },

  onAuthChange(listener: AuthChangeListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
