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
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  writeBatch,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import { Campaign, CharacterSheet, ChatMessage } from '../types';
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

// Initialize Firestore targeting the user's project database
export const db: Firestore =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

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
      message: 'A janela de autenticação do Google não respondeu ou foi impedida pelas políticas de segurança do visualizador embutido (iframe). Abra o Grimório em uma nova aba para fazer login com o Google.',
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

  if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found') || code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
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
      message: 'A solicitação de login demorou muito para responder. Verifique sua conexão ou se janelas pop-up estão bloqueadas.',
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
    // If anonymous auth is not enabled in user's Firebase console, safely fallback to offline
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
            message: 'A janela de autenticação do Google não respondeu ou foi bloqueada pelo navegador no visualizador embutido (iframe).',
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
      structured.type === 'provider-disabled' ||
      structured.type === 'unauthorized-domain';
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

// Firestore Realtime Collections
export const subscribeToUserCampaigns = (
  userId: string,
  onUpdate: (campaigns: Campaign[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, 'campaigns'), where('userId', '==', userId));
  return onSnapshot(
    q,
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
      console.warn('Erro ao escutar campanhas no Firestore:', err);
      onError?.(err);
    }
  );
};

export const subscribeToUserCharacters = (
  userId: string,
  onUpdate: (characters: CharacterSheet[]) => void,
  onError?: (err: Error) => void
) => {
  const q = query(collection(db, 'characters'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CharacterSheet[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
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
      });
      items.sort((a, b) => b.updatedAt - a.updatedAt);
      onUpdate(items);
    },
    (err) => {
      console.warn('Erro ao escutar personagens no Firestore:', err);
      onError?.(err);
    }
  );
};

// Firestore Mutations
export const saveCampaignToFirestore = async (
  userId: string,
  campaign: Campaign
): Promise<void> => {
  const docRef = doc(db, 'campaigns', campaign.id);
  await setDoc(
    docRef,
    {
      ...campaign,
      userId,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
};

export const deleteCampaignFromFirestore = async (campaignId: string): Promise<void> => {
  const docRef = doc(db, 'campaigns', campaignId);
  await deleteDoc(docRef);
};

export const deleteAllCampaignsFromFirestore = async (userId: string): Promise<void> => {
  const q = query(collection(db, 'campaigns'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
};

export const saveCharacterToFirestore = async (
  userId: string,
  character: CharacterSheet
): Promise<void> => {
  const docRef = doc(db, 'characters', character.id);
  await setDoc(
    docRef,
    {
      ...character,
      userId,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
};

export const deleteCharacterFromFirestore = async (characterId: string): Promise<void> => {
  const docRef = doc(db, 'characters', characterId);
  await deleteDoc(docRef);
};

export const deleteAllCharactersFromFirestore = async (userId: string): Promise<void> => {
  const q = query(collection(db, 'characters'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletePromises);
};

// Check if user has data in Firestore, if empty, migrate initial local data
export const checkAndSeedCloudData = async (
  userId: string,
  initialCampaigns: Campaign[],
  initialCharacters: CharacterSheet[]
): Promise<boolean> => {
  try {
    const campaignsQuery = query(collection(db, 'campaigns'), where('userId', '==', userId));
    const snapshot = await getDocs(campaignsQuery);

    if (snapshot.empty && initialCampaigns.length > 0) {
      const batch = writeBatch(db);

      // Seed campaigns
      for (const camp of initialCampaigns) {
        const campRef = doc(db, 'campaigns', camp.id);
        batch.set(campRef, {
          ...camp,
          userId,
          updatedAt: Date.now(),
        });
      }

      // Seed characters
      for (const char of initialCharacters) {
        const charRef = doc(db, 'characters', char.id);
        batch.set(charRef, {
          ...char,
          userId,
          updatedAt: Date.now(),
        });
      }

      await batch.commit();
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Aviso ao sincronizar dados iniciais no Firestore:', e);
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
          role: data.role === 'assistant' ? 'assistant' : data.role === 'system' ? 'system' : 'user',
          content: data.content || '',
          timestamp: data.timestamp || Date.now(),
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`Erro ao escutar mensagens do chat da campanha ${campaignId}:`, err);
      onError?.(err);
    }
  );
};

export const saveCampaignChatMessage = async (
  userId: string,
  campaignId: string,
  message: ChatMessage,
  systemName?: string
): Promise<void> => {
  if (!campaignId || !message.id) return;
  // Ignore temporary streaming placeholder without content
  if (message.isStreaming && !message.content) return;

  const docRef = doc(db, 'campaigns', campaignId, 'messages', message.id);
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
};

export const clearCampaignChatInFirestore = async (campaignId: string): Promise<void> => {
  if (!campaignId) return;
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
    console.warn(`Erro ao limpar chat da campanha ${campaignId} no Firestore:`, err);
  }
};

