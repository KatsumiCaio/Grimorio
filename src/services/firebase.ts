import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  getDocFromServer,
  writeBatch,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import { Campaign, CharacterSheet, ChatMessage, UserProfile } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Configuration constants
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId || 'grimoriorpg-f0f90';
export const FIRESTORE_DATABASE_ID =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : '(default)';
export const FIREBASE_CONSOLE_AUTH_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;
export const FIREBASE_CONSOLE_AUTH_SETTINGS_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore targeting the user's project database with robust long-polling auto-detection
export const db: Firestore = (() => {
  const customDbId =
    firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? firebaseConfig.firestoreDatabaseId
      : undefined;

  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
      },
      customDbId
    );
  } catch (_e) {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
})();

// Error Handling Specification conforming to Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isPermissionError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return (
    code === 'permission-denied' ||
    msg.toLowerCase().includes('missing or insufficient permissions') ||
    msg.toLowerCase().includes('insufficient permissions')
  );
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function handleOperationError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  if (isPermissionError(error)) {
    handleFirestoreError(error, operationType, path);
  } else {
    console.warn(`Operação no Firestore (${operationType} em ${path}) em modo offline/desconectado.`);
  }
}

export interface CloudDbStatus {
  status: 'online' | 'not_created' | 'offline';
  projectId: string;
  databaseId: string;
  message: string;
  consoleUrl: string;
}

// Fast diagnostic to check if Cloud Firestore exists in Google Cloud / Firebase console
export async function checkCloudDbStatus(): Promise<CloudDbStatus> {
  const projectId = FIREBASE_PROJECT_ID;
  const databaseId = FIRESTORE_DATABASE_ID;
  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore`;

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/test?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (res.status === 200 || res.status === 403 || res.status === 400) {
      return {
        status: 'online',
        projectId,
        databaseId,
        message: 'Banco de dados Cloud Firestore ativo e sincronizando.',
        consoleUrl,
      };
    }
    if (res.status === 404) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error?.message || '';
      if (msg.toLowerCase().includes('does not exist')) {
        return {
          status: 'not_created',
          projectId,
          databaseId,
          message: `O banco de dados Firestore ainda não foi criado no console do projeto "${projectId}".`,
          consoleUrl,
        };
      }
      // If 404 is just "document not found", the database actually exists!
      return {
        status: 'online',
        projectId,
        databaseId,
        message: 'Banco de dados Cloud Firestore ativo.',
        consoleUrl,
      };
    }
    return {
      status: 'offline',
      projectId,
      databaseId,
      message: 'Cloud Firestore temporariamente offline ou inacessível.',
      consoleUrl,
    };
  } catch (_e) {
    return {
      status: 'offline',
      projectId,
      databaseId,
      message: 'Não foi possível conectar ao Cloud Firestore.',
      consoleUrl,
    };
  }
}

// Test connection to Firestore on boot (as required by Firebase skill)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const status = await checkCloudDbStatus();
    return status.status === 'online';
  } catch (error) {
    return false;
  }
}

export interface FirebaseSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  user: User | null;
}

export interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  type: 'iframe' | 'unauthorized-domain' | 'provider-disabled' | 'popup-blocked' | 'user-cancelled' | 'generic';
  domain?: string;
  consoleUrl?: string;
}

// Check if running inside an iframe (such as AI Studio preview)
export const isInsideIframe = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// User-friendly error parser for Firebase Auth issues
export const parseFirebaseAuthError = (err: any): AuthErrorInfo => {
  if (!err) {
    return {
      code: 'unknown',
      title: 'Erro de Autenticação',
      message: 'Erro desconhecido na autenticação.',
      type: 'generic',
    };
  }

  const code = err.code || '';
  const msg = err.message || '';
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/iframe-timeout') {
    return {
      code,
      title: 'Bloqueio de Pop-up no Visualizador (iFrame)',
      message:
        'A janela de autenticação do Google não respondeu ou foi impedida pelas políticas de segurança do visualizador embutido (iframe). Abra o Grimório em uma nova aba para fazer login com o Google.',
      type: 'iframe',
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      code,
      title: 'Pop-up Bloqueado pelo Navegador',
      message: isInsideIframe()
        ? 'O navegador bloqueou a janela pop-up do Google porque o Grimório está sendo exibido dentro de um iframe. Abra em uma nova aba para conectar com o Google.'
        : 'O navegador bloqueou a janela pop-up do Google. Por favor, permita pop-ups para este site e tente novamente.',
      type: 'popup-blocked',
    };
  }

  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    return {
      code: 'auth/unauthorized-domain',
      title: 'Domínio Não Autorizado no Firebase',
      message: `O domínio atual ("${currentDomain}") precisa ser adicionado à lista de "Domínios autorizados" nas configurações do Firebase Authentication para permitir o login Google.`,
      type: 'unauthorized-domain',
      domain: currentDomain,
      consoleUrl: FIREBASE_CONSOLE_AUTH_SETTINGS_URL,
    };
  }

  if (
    code === 'auth/configuration-not-found' ||
    msg.includes('configuration-not-found') ||
    code === 'auth/operation-not-allowed' ||
    msg.includes('operation-not-allowed')
  ) {
    return {
      code: code || 'auth/operation-not-allowed',
      title: 'Provedor Google Não Habilitado no Firebase',
      message: `O método de login com o Google precisa ser ativado no Firebase Console do projeto "${FIREBASE_PROJECT_ID}". Acesse Authentication > Sign-in method e habilite o provedor Google.`,
      type: 'provider-disabled',
      consoleUrl: FIREBASE_CONSOLE_AUTH_URL,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      code,
      title: 'Login Cancelado',
      message: 'A janela de autenticação do Google foi fechada antes de concluir o login.',
      type: 'user-cancelled',
    };
  }

  if (code === 'auth/cancelled-popup-request') {
    return {
      code,
      title: 'Solicitação Cancelada',
      message: 'Uma solicitação de autenticação anterior foi cancelada para iniciar uma nova.',
      type: 'user-cancelled',
    };
  }

  if (code === 'auth/timeout') {
    return {
      code,
      title: 'Tempo Limite Excedido',
      message:
        'A solicitação de login demorou muito para responder. Verifique sua conexão ou se janelas pop-up estão bloqueadas.',
      type: 'generic',
    };
  }

  return {
    code,
    title: 'Falha na Autenticação',
    message: msg || 'Falha ao autenticar com o Firebase.',
    type: 'generic',
  };
};

export const formatFirebaseAuthError = (err: any): string => {
  return parseFirebaseAuthError(err).message;
};

// Authentication Helpers
export const signInAnonymousUser = async (): Promise<User | null> => {
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err: any) {
    console.warn('Firebase login anônimo não configurado (modo offline local ativo):', err?.code || err?.message);
    return null;
  }
};

export const signInWithGoogleAccount = async (): Promise<{
  user: User | null;
  error: string | null;
  authError?: AuthErrorInfo;
  isConfigurationError?: boolean;
}> => {
  const inIframe = isInsideIframe();

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Set a safety timeout race so clicking never hangs indefinitely (e.g. inside sandboxed iframes)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        if (inIframe) {
          reject({
            code: 'auth/iframe-timeout',
            message:
              'A janela de autenticação do Google não respondeu ou foi bloqueada pelo navegador no visualizador embutido (iframe).',
          });
        } else {
          reject({
            code: 'auth/timeout',
            message: 'A solicitação de autenticação demorou para responder.',
          });
        }
      }, 16000);
    });

    const res = await Promise.race([signInWithPopup(auth, provider), timeoutPromise]);
    return { user: res.user, error: null };
  } catch (err: any) {
    const structured = parseFirebaseAuthError(err);
    const isConfigErr =
      structured.type === 'provider-disabled' || structured.type === 'unauthorized-domain';
    console.warn('Firebase autenticação aviso:', structured.message);
    return {
      user: null,
      error: structured.message,
      authError: structured,
      isConfigurationError: isConfigErr,
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err: any) {
    console.warn('Firebase signOut aviso:', err?.message || err);
  }
};

export const onAuthStatusChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore Universal Realtime Campaigns (Accessible equally across all versions)
export const subscribeToCampaigns = (
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (err: Error) => void
) => {
  const campaignsCol = collection(db, 'campaigns');
  return onSnapshot(
    campaignsCol,
    (snapshot) => {
      const items: Campaign[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || 'Campanha sem título',
          system: data.system || 'D&D 5e',
          notes: data.notes || '',
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        });
      });
      // Sort newest updated first
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      onUpdate(items);
    },
    (err) => {
      console.warn('Sincronização de campanhas em segundo plano:', err?.message || err);
      if (isPermissionError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'campaigns');
        } catch (e: any) {
          onError?.(e);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
};

// ==========================================
// Cloud User Profiles (Cross-Device Sync)
// ==========================================

export const saveUserToFirestore = async (user: UserProfile): Promise<void> => {
  if (!user || !user.id) return;
  const path = `users/${user.id}`;
  const docRef = doc(db, 'users', user.id);
  try {
    await setDoc(
      docRef,
      {
        id: user.id,
        username: user.username.trim().toLowerCase(),
        displayName: user.displayName.trim(),
        role: user.role || 'Mestre da Masmorra',
        avatarId: user.avatarId || 'd20',
        color: user.color || 'cyan',
        bio: user.bio || '',
        passwordHash: user.passwordHash || '',
        createdAt: user.createdAt || Date.now(),
        lastLoginAt: user.lastLoginAt || Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    handleOperationError(error, OperationType.WRITE, path);
  }
};

export const deleteUserFromFirestore = async (userId: string): Promise<void> => {
  if (!userId) return;
  const path = `users/${userId}`;
  const docRef = doc(db, 'users', userId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleOperationError(error, OperationType.DELETE, path);
  }
};

export const fetchUsersFromFirestore = async (): Promise<UserProfile[]> => {
  const path = 'users';
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.id && data.username) {
        users.push({
          id: data.id,
          username: data.username,
          displayName: data.displayName || data.username,
          role: data.role || 'Mestre da Masmorra',
          avatarId: data.avatarId || 'd20',
          color: data.color || 'cyan',
          bio: data.bio || '',
          passwordHash: data.passwordHash || '',
          createdAt: Number(data.createdAt) || Date.now(),
          lastLoginAt: Number(data.lastLoginAt) || Date.now(),
        });
      }
    });
    return users;
  } catch (error) {
    handleOperationError(error, OperationType.LIST, path);
    return [];
  }
};

export const findUserInFirestore = async (
  usernameOrLogin: string
): Promise<UserProfile | null> => {
  if (!usernameOrLogin) return null;
  const clean = usernameOrLogin.trim().toLowerCase();
  const path = 'users';
  try {
    // 1. Try direct document reference if identifier matches id
    const directDoc = await getDocFromServer(doc(db, 'users', clean)).catch(() => null);
    if (directDoc && directDoc.exists()) {
      const data = directDoc.data();
      return {
        id: data.id || directDoc.id,
        username: data.username,
        displayName: data.displayName || data.username,
        role: data.role || 'Mestre da Masmorra',
        avatarId: data.avatarId || 'd20',
        color: data.color || 'cyan',
        bio: data.bio || '',
        passwordHash: data.passwordHash || '',
        createdAt: Number(data.createdAt) || Date.now(),
        lastLoginAt: Number(data.lastLoginAt) || Date.now(),
      };
    }

    // 2. Fetch all users from Firestore to find by username or displayName
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    let matched: UserProfile | null = null;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        data &&
        (data.username?.toLowerCase() === clean ||
          data.displayName?.toLowerCase() === clean ||
          docSnap.id.toLowerCase() === clean)
      ) {
        matched = {
          id: data.id || docSnap.id,
          username: data.username,
          displayName: data.displayName || data.username,
          role: data.role || 'Mestre da Masmorra',
          avatarId: data.avatarId || 'd20',
          color: data.color || 'cyan',
          bio: data.bio || '',
          passwordHash: data.passwordHash || '',
          createdAt: Number(data.createdAt) || Date.now(),
          lastLoginAt: Number(data.lastLoginAt) || Date.now(),
        };
      }
    });
    return matched;
  } catch (error) {
    handleOperationError(error, OperationType.GET, path);
    return null;
  }
};

export const subscribeToUsers = (
  onUpdate: (users: UserProfile[]) => void,
  onError?: (err: Error) => void
) => {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snapshot) => {
      const items: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id && data.username) {
          items.push({
            id: data.id,
            username: data.username,
            displayName: data.displayName || data.username,
            role: data.role || 'Mestre da Masmorra',
            avatarId: data.avatarId || 'd20',
            color: data.color || 'cyan',
            bio: data.bio || '',
            passwordHash: data.passwordHash || '',
            createdAt: Number(data.createdAt) || Date.now(),
            lastLoginAt: Number(data.lastLoginAt) || Date.now(),
          });
        }
      });
      items.sort((a, b) => (b.lastLoginAt || 0) - (a.lastLoginAt || 0));
      onUpdate(items);
    },
    (err) => {
      console.warn('Sincronização de usuários em segundo plano:', err?.message || err);
      if (isPermissionError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'users');
        } catch (e: any) {
          onError?.(e);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
};

// Firestore Realtime Campaigns filtered for specific User Account
export const subscribeToUserCampaigns = (
  userId: string,
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (err: Error) => void
) => {
  const campaignsCol = collection(db, 'campaigns');
  return onSnapshot(
    campaignsCol,
    (snapshot) => {
      const items: Campaign[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docUserId = data.userId || 'usr_mestre';
        if (!userId || docUserId === userId || (userId === 'usr_mestre' && docUserId === 'shared')) {
          items.push({
            id: docSnap.id,
            title: data.title || 'Campanha sem título',
            system: data.system || 'D&D 5e',
            notes: data.notes || '',
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          });
        }
      });
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      onUpdate(items);
    },
    (err) => {
      console.warn('Sincronização de campanhas do usuário em segundo plano:', err?.message || err);
      if (isPermissionError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'campaigns');
        } catch (e: any) {
          onError?.(e);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
};

// Firestore Realtime Characters filtered for specific User Account
export const subscribeToUserCharacters = (
  userId: string,
  onUpdate: (characters: CharacterSheet[]) => void,
  onError?: (err: Error) => void
) => {
  const charsCol = collection(db, 'characters');
  return onSnapshot(
    charsCol,
    (snapshot) => {
      const items: CharacterSheet[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docUserId = data.userId || 'usr_mestre';
        if (!userId || docUserId === userId || (userId === 'usr_mestre' && docUserId === 'shared')) {
          items.push({
            id: docSnap.id,
            campaignId: data.campaignId || '',
            name: data.name || 'Personagem',
            role: data.role || 'Aventureiro',
            type: data.type === 'NPC' ? 'NPC' : data.type === 'Monstro' ? 'Monstro' : 'PJ',
            attributes: Array.isArray(data.attributes) ? data.attributes : [],
            resources: Array.isArray(data.resources) ? data.resources : [],
            notes: data.notes || '',
            avatarUrl: data.avatarUrl || undefined,
            challengeRating: data.challengeRating || undefined,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          });
        }
      });
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      onUpdate(items);
    },
    (err) => {
      console.warn('Sincronização de personagens do usuário em segundo plano:', err?.message || err);
      if (isPermissionError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, 'characters');
        } catch (e: any) {
          onError?.(e);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
};

// Firestore Mutations
export const saveCampaignToFirestore = async (
  arg1: string | Campaign,
  arg2?: Campaign | string
): Promise<void> => {
  const campaign: Campaign =
    typeof arg1 === 'object' ? arg1 : (arg2 as Campaign);
  const userId: string =
    typeof arg1 === 'string'
      ? arg1
      : typeof arg2 === 'string'
      ? arg2
      : auth.currentUser?.uid || 'shared';

  if (!campaign || !campaign.id) return;

  const path = `campaigns/${campaign.id}`;
  const docRef = doc(db, 'campaigns', campaign.id);
  try {
    await setDoc(
      docRef,
      {
        id: campaign.id,
        title: campaign.title || 'Campanha sem título',
        system: campaign.system || 'D&D 5e',
        notes: campaign.notes || '',
        createdAt: campaign.createdAt || Date.now(),
        updatedAt: Date.now(),
        userId,
      },
      { merge: true }
    );
  } catch (error) {
    handleOperationError(error, OperationType.WRITE, path);
  }
};

export const deleteCampaignFromFirestore = async (campaignId: string): Promise<void> => {
  const path = `campaigns/${campaignId}`;
  const docRef = doc(db, 'campaigns', campaignId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleOperationError(error, OperationType.DELETE, path);
  }
};

export const deleteAllCampaignsFromFirestore = async (_userId?: string): Promise<void> => {
  const path = 'campaigns';
  try {
    const snapshot = await getDocs(collection(db, path));
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleOperationError(error, OperationType.DELETE, path);
  }
};

export const saveCharacterToFirestore = async (
  arg1: string | CharacterSheet,
  arg2?: CharacterSheet | string
): Promise<void> => {
  const character: CharacterSheet =
    typeof arg1 === 'object' ? arg1 : (arg2 as CharacterSheet);
  const userId: string =
    typeof arg1 === 'string'
      ? arg1
      : typeof arg2 === 'string'
      ? arg2
      : auth.currentUser?.uid || 'shared';

  if (!character || !character.id) return;

  const path = `characters/${character.id}`;
  const docRef = doc(db, 'characters', character.id);
  try {
    await setDoc(
      docRef,
      {
        id: character.id,
        campaignId: character.campaignId || '',
        name: character.name || 'Personagem',
        role: character.role || 'Aventureiro',
        type: character.type || 'PJ',
        attributes: Array.isArray(character.attributes) ? character.attributes : [],
        resources: Array.isArray(character.resources) ? character.resources : [],
        notes: character.notes || '',
        avatarUrl: character.avatarUrl || null,
        challengeRating: character.challengeRating || null,
        createdAt: character.createdAt || Date.now(),
        updatedAt: Date.now(),
        userId,
      },
      { merge: true }
    );
  } catch (error) {
    handleOperationError(error, OperationType.WRITE, path);
  }
};

export const deleteCharacterFromFirestore = async (characterId: string): Promise<void> => {
  const path = `characters/${characterId}`;
  const docRef = doc(db, 'characters', characterId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleOperationError(error, OperationType.DELETE, path);
  }
};

export const deleteAllCharactersFromFirestore = async (_userId?: string): Promise<void> => {
  const path = 'characters';
  try {
    const snapshot = await getDocs(collection(db, path));
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleOperationError(error, OperationType.DELETE, path);
  }
};

// Check if database has data in Firestore, if empty, seed initial local data
export const checkAndSeedCloudData = async (
  arg1: string | Campaign[],
  arg2?: Campaign[] | CharacterSheet[],
  arg3?: CharacterSheet[]
): Promise<boolean> => {
  let initialCampaigns: Campaign[] = [];
  let initialCharacters: CharacterSheet[] = [];
  let effectiveUserId = auth.currentUser?.uid || 'shared';

  if (typeof arg1 === 'string') {
    effectiveUserId = arg1;
    initialCampaigns = Array.isArray(arg2) ? (arg2 as Campaign[]) : [];
    initialCharacters = Array.isArray(arg3) ? (arg3 as CharacterSheet[]) : [];
  } else if (Array.isArray(arg1)) {
    initialCampaigns = arg1;
    initialCharacters = Array.isArray(arg2) ? (arg2 as CharacterSheet[]) : [];
  }

  try {
    const campaignsCol = collection(db, 'campaigns');
    const snapshot = await getDocs(campaignsCol);

    if (snapshot.empty && initialCampaigns.length > 0) {
      const batch = writeBatch(db);

      // Seed campaigns
      for (const camp of initialCampaigns) {
        const campRef = doc(db, 'campaigns', camp.id);
        batch.set(campRef, {
          id: camp.id,
          title: camp.title,
          system: camp.system,
          notes: camp.notes,
          createdAt: camp.createdAt || Date.now(),
          updatedAt: Date.now(),
          userId: effectiveUserId,
        });
      }

      // Seed characters
      for (const char of initialCharacters) {
        const charRef = doc(db, 'characters', char.id);
        batch.set(charRef, {
          id: char.id,
          campaignId: char.campaignId || '',
          name: char.name,
          role: char.role,
          type: char.type,
          attributes: char.attributes || [],
          resources: char.resources || [],
          notes: char.notes || '',
          avatarUrl: char.avatarUrl || null,
          challengeRating: char.challengeRating || null,
          createdAt: char.createdAt || Date.now(),
          updatedAt: Date.now(),
          userId: effectiveUserId,
        });
      }

      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Aviso ao verificar dados iniciais no Firestore:', e);
    return false;
  }
};

// Firestore Realtime Campaign Chat Messages
export const subscribeToCampaignChat = (
  campaignId: string,
  onUpdate: (messages: ChatMessage[]) => void,
  onError?: (err: Error) => void
) => {
  if (!campaignId) return () => {};
  const path = `campaigns/${campaignId}/messages`;
  const messagesCol = collection(db, 'campaigns', campaignId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'), limit(200));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          role:
            data.role === 'assistant'
              ? 'assistant'
              : data.role === 'system'
              ? 'system'
              : 'user',
          content: data.content || '',
          timestamp: data.timestamp || Date.now(),
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`Sincronização de chat da campanha ${campaignId} em segundo plano:`, err?.message || err);
      if (isPermissionError(err)) {
        try {
          handleFirestoreError(err, OperationType.LIST, path);
        } catch (e: any) {
          onError?.(e);
        }
      } else {
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }
  );
};

export const saveCampaignChatMessage = async (
  arg1: string,
  arg2: string | ChatMessage,
  arg3?: ChatMessage | string,
  arg4?: string
): Promise<void> => {
  let campaignId = '';
  let message: ChatMessage | null = null;
  let userId = auth.currentUser?.uid || 'shared';
  let systemName = '';

  if (typeof arg2 === 'object') {
    // Called as (campaignId, message, userId?, systemName?)
    campaignId = arg1;
    message = arg2 as ChatMessage;
    if (typeof arg3 === 'string') userId = arg3;
    if (typeof arg4 === 'string') systemName = arg4;
  } else if (typeof arg2 === 'string' && typeof arg3 === 'object') {
    // Called as (userId, campaignId, message, systemName?)
    userId = arg1;
    campaignId = arg2;
    message = arg3 as ChatMessage;
    if (typeof arg4 === 'string') systemName = arg4;
  }

  if (!campaignId || !message || !message.id) return;
  if (message.isStreaming && !message.content) return;

  const path = `campaigns/${campaignId}/messages/${message.id}`;
  const docRef = doc(db, 'campaigns', campaignId, 'messages', message.id);
  try {
    await setDoc(
      docRef,
      {
        id: message.id,
        campaignId,
        userId,
        role: message.role,
        content: message.content,
        system: systemName || '',
        timestamp: message.timestamp || Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    handleOperationError(error, OperationType.WRITE, path);
  }
};

export const clearCampaignChatInFirestore = async (campaignId: string): Promise<void> => {
  if (!campaignId) return;
  const path = `campaigns/${campaignId}/messages`;
  try {
    const messagesCol = collection(db, 'campaigns', campaignId, 'messages');
    const snapshot = await getDocs(messagesCol);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    handleOperationError(err, OperationType.DELETE, path);
  }
};


