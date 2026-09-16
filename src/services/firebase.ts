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

// User-friendly error translator for Firebase Auth issues
export const formatFirebaseAuthError = (err: any): string => {
  if (!err) return 'Erro desconhecido na autenticação.';
  const code = err.code || '';
  const msg = err.message || '';

  if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
    return `O serviço de Autenticação ou o provedor Google ainda não foi ativado no Firebase Console do projeto "${FIREBASE_PROJECT_ID}". Ative em Authentication > Métodos de login (Sign-in method).`;
  }
  if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
    return `O método de login Google não está habilitado no Console do Firebase para o projeto "${FIREBASE_PROJECT_ID}".`;
  }
  if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
    return 'O domínio desta aplicação não está na lista de "Domínios autorizados" nas configurações do Firebase Authentication.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'A janela de autenticação foi fechada antes de concluir o login.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Solicitação de autenticação anterior cancelada.';
  }
  if (code === 'auth/popup-blocked') {
    return 'O navegador bloqueou a janela pop-up do Google. Por favor, permita pop-ups para este site.';
  }
  return msg || 'Falha ao autenticar com o Firebase.';
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
  isConfigurationError?: boolean;
}> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const res = await signInWithPopup(auth, provider);
    return { user: res.user, error: null };
  } catch (err: any) {
    const formatted = formatFirebaseAuthError(err);
    const isConfigErr =
      err?.code === 'auth/configuration-not-found' ||
      err?.code === 'auth/operation-not-allowed' ||
      err?.message?.includes('configuration-not-found');
    console.warn('Firebase autenticação aviso:', formatted);
    return { user: null, error: formatted, isConfigurationError: isConfigErr };
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
          type: data.type === 'NPC' ? 'NPC' : 'PJ',
          attributes: Array.isArray(data.attributes) ? data.attributes : [],
          resources: Array.isArray(data.resources) ? data.resources : [],
          notes: data.notes || '',
          avatarUrl: data.avatarUrl || undefined,
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

