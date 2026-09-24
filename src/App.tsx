import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ExternalLink, X, RefreshCw } from 'lucide-react';
import { Campaign, CharacterSheet, MainTab, AppSettings, BestiaryMonster, UserProfile, CampaignSharedItem, CampaignMember } from './types';
import { storageService } from './services/storage';
import { authService } from './services/auth';
import { Header } from './components/Header';
import { CampaignCopilotView } from './components/CampaignCopilotView';
import { CharacterSheetsView } from './components/CharacterSheetsView';
import { BestiaryView } from './components/BestiaryView';
import { SettingsModal } from './components/SettingsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { CampaignMenuModal } from './components/CampaignMenuModal';
import { CampaignTableModal } from './components/CampaignTableModal';
import { PlayerPortalView } from './components/PlayerPortalView';
import { AuthModal } from './components/AuthModal';
import { AccountOnboarding } from './components/AccountOnboarding';
import { BottomNav } from './components/BottomNav';
import {
  subscribeToUserCampaigns,
  subscribeToUserCharacters,
  saveCampaignToFirestore,
  deleteCampaignFromFirestore,
  deleteAllCampaignsFromFirestore,
  saveCharacterToFirestore,
  deleteCharacterFromFirestore,
  deleteAllCharactersFromFirestore,
  checkAndSeedCloudData,
  testFirestoreConnection,
  subscribeToQuotaStatus,
  isQuotaExceeded,
  resetQuotaExceeded,
  joinCampaignByInviteCode,
  savePlayerCampaignNotes,
  addSharedItemToCampaign,
  removeSharedItemFromCampaign,
  toggleCharacterSharedWithPlayers,
} from './services/firebase';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const u = authService.getCurrentUser();
    return u ? storageService.getUserCampaigns(u.id) : [];
  });
  const [characters, setCharacters] = useState<CharacterSheet[]>(() => {
    const u = authService.getCurrentUser();
    return u ? storageService.getUserCharacters(u.id) : [];
  });
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    const u = authService.getCurrentUser();
    return u ? storageService.getUserActiveCampaignId(u.id) : '';
  });
  const [currentTab, setCurrentTab] = useState<MainTab>('campaign');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCampaignMenuOpen, setIsCampaignMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>(undefined);
  const [isFullScreenNotes, setIsFullScreenNotes] = useState(false);
  const [quotaBannerDismissed, setQuotaBannerDismissed] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Cloud Sync Status
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error' | 'quota'>(() =>
    isQuotaExceeded() ? 'quota' : 'synced'
  );
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [isRetryingConnection, setIsRetryingConnection] = useState(false);

  // Retry/reconnect after quota check
  const handleRetryConnect = useCallback(async () => {
    setIsRetryingConnection(true);
    try {
      await resetQuotaExceeded();
      setSyncStatus('syncing');
      const isOnline = await testFirestoreConnection();
      if (isOnline) {
        setSyncStatus('synced');
      } else {
        setSyncStatus(isQuotaExceeded() ? 'quota' : 'offline');
      }
    } catch {
      setSyncStatus(isQuotaExceeded() ? 'quota' : 'offline');
    } finally {
      setIsRetryingConnection(false);
    }
  }, []);

  // Subscribe to quota exhaustion state
  useEffect(() => {
    const unsub = subscribeToQuotaStatus((exceeded) => {
      if (exceeded) {
        setSyncStatus('quota');
      }
    });
    return () => unsub();
  }, []);

  // Handle switching or updating user accounts
  const handleUserChanged = useCallback((newUser: UserProfile | null) => {
    setCurrentUser(newUser);
    if (newUser) {
      const userCamps = storageService.getUserCampaigns(newUser.id);
      const userChars = storageService.getUserCharacters(newUser.id);
      const userActiveId = storageService.getUserActiveCampaignId(newUser.id);

      setCampaigns(userCamps);
      setCharacters(userChars);
      setActiveCampaignId(userActiveId);

      const firstChar = userChars.find((c) => c.campaignId === userActiveId);
      setSelectedCharacterId(firstChar?.id);
    } else {
      setCampaigns([]);
      setCharacters([]);
      setActiveCampaignId('');
      setSelectedCharacterId(undefined);
    }
  }, []);

  // Sync active campaign changes to user storage
  const handleSelectCampaign = useCallback(
    (id: string) => {
      setActiveCampaignId(id);
      if (currentUser) {
        storageService.saveUserActiveCampaignId(currentUser.id, id);
      }
    },
    [currentUser]
  );

  // Logout current device session
  const handleLogout = useCallback(() => {
    authService.logout();
    handleUserChanged(null);
  }, [handleUserChanged]);

  // Initialize Cloud Sync for all User Accounts
  useEffect(() => {
    const unsubCloudAuth = authService.initCloudSync();
    const unsubAuthChange = authService.onAuthChange((user) => {
      if (user) {
        if (!currentUser || user.id !== currentUser.id) {
          handleUserChanged(user);
        } else {
          setCurrentUser(user);
        }
      } else {
        handleUserChanged(null);
      }
    });

    return () => {
      unsubCloudAuth();
      unsubAuthChange();
    };
  }, [currentUser, handleUserChanged]);

  // Initialize Realtime Database Subscriptions for the Active User
  useEffect(() => {
    if (!currentUser) return;

    let unsubCampaigns: (() => void) | null = null;
    let unsubCharacters: (() => void) | null = null;
    const userId = currentUser.id;

    // 1. Verify Firestore connectivity & seed initial data if remote database is empty
    const initCloud = async () => {
      if (isQuotaExceeded()) {
        setSyncStatus('quota');
        return;
      }
      setSyncStatus('syncing');
      try {
        const isOnline = await testFirestoreConnection();
        if (isOnline) {
          const localCamps = storageService.getUserCampaigns(userId);
          const localChars = storageService.getUserCharacters(userId);
          await checkAndSeedCloudData(userId, localCamps, localChars);
          setSyncStatus(isQuotaExceeded() ? 'quota' : 'synced');
        } else {
          setSyncStatus(isQuotaExceeded() ? 'quota' : 'offline');
        }
      } catch (err) {
        console.warn('Verificação inicial do Firestore:', err);
        setSyncStatus(isQuotaExceeded() ? 'quota' : 'offline');
      }
    };

    void initCloud();

    // 2. Realtime listener for user-specific campaigns
    unsubCampaigns = subscribeToUserCampaigns(
      userId,
      (cloudCampaigns) => {
        if (cloudCampaigns.length > 0) {
          setCampaigns(cloudCampaigns);
          storageService.saveUserCampaigns(userId, cloudCampaigns);
          setActiveCampaignId((prev) => {
            if (prev && cloudCampaigns.some((c) => c.id === prev)) return prev;
            const newActive = cloudCampaigns[0]?.id || '';
            storageService.saveUserActiveCampaignId(userId, newActive);
            return newActive;
          });
        } else {
          // If no cloud campaigns exist yet for this user profile, load local cache or initialize local starter
          const localCamps = storageService.getUserCampaigns(userId);
          if (localCamps.length > 0) {
            setCampaigns(localCamps);
          } else {
            const starterCamp: Campaign = {
              id: `camp_${userId}_init`,
              title: `Aventuras de ${currentUser.displayName}`,
              system: 'D&D 5e',
              notes: `# Grimório de ${currentUser.displayName}\n\n## ⚔️ Primeira Sessão\n- Registre aqui suas ideias para a próxima aventura.\n- Use o Copiloto IA à direita para gerar NPCs, encontros e regras.\n`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setCampaigns([starterCamp]);
            setActiveCampaignId(starterCamp.id);
            storageService.saveUserCampaigns(userId, [starterCamp]);
            storageService.saveUserActiveCampaignId(userId, starterCamp.id);
          }
        }
        setSyncStatus((prev) => (prev === 'quota' || isQuotaExceeded() ? 'quota' : 'synced'));
      },
      (err) => {
        console.warn('Erro na sincronização de campanhas:', err);
        setSyncStatus(isQuotaExceeded() ? 'quota' : 'offline');
      }
    );

    // 3. Realtime listener for user-specific characters and campaigns mastered by user
    const initialCampIds = storageService.getUserCampaigns(userId).map((c) => c.id);
    unsubCharacters = subscribeToUserCharacters(
      userId,
      (cloudCharacters) => {
        if (cloudCharacters.length > 0) {
          setCharacters(cloudCharacters);
          storageService.saveUserCharacters(userId, cloudCharacters);
        }
        setSyncStatus((prev) => (prev === 'quota' || isQuotaExceeded() ? 'quota' : 'synced'));
      },
      (err) => {
        console.warn('Erro na sincronização de fichas:', err);
        setSyncStatus(isQuotaExceeded() ? 'quota' : 'offline');
      },
      initialCampIds
    );

    return () => {
      if (unsubCampaigns) unsubCampaigns();
      if (unsubCharacters) unsubCharacters();
    };
  }, [currentUser?.id, currentUser?.displayName]);

  // Manual Full Cloud Sync Handler
  const handleManualSyncCloud = useCallback(async () => {
    if (!currentUser) return;
    setIsSyncingManual(true);
    setSyncStatus('syncing');
    try {
      const userId = currentUser.id;
      for (const camp of campaigns) {
        await saveCampaignToFirestore(camp, userId);
      }
      for (const char of characters) {
        await saveCharacterToFirestore(char, userId);
      }
      setSyncStatus('synced');
    } catch (e) {
      console.warn('Erro na sincronização manual:', e);
      setSyncStatus('offline');
      throw e;
    } finally {
      setIsSyncingManual(false);
    }
  }, [currentUser, campaigns, characters]);

  // Toggle full screen notes with optional browser Fullscreen API integration
  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreenNotes((prev) => {
      const next = !prev;
      if (next) {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  // Global keyboard shortcuts (Ctrl+K for search, Esc / F11 for Full Screen Notes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isFullScreenNotes) {
        setIsFullScreenNotes(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'F11' && currentTab === 'campaign') {
        e.preventDefault();
        handleToggleFullScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreenNotes, currentTab, handleToggleFullScreen]);

  // Sync with browser native fullscreen exit
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement && isFullScreenNotes) {
        setIsFullScreenNotes(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [isFullScreenNotes]);

  // Quick navigation handlers from Global Search
  const handleNavigateToCampaign = useCallback(
    (campaignId: string) => {
      handleSelectCampaign(campaignId);
      setCurrentTab('campaign');
    },
    [handleSelectCampaign]
  );

  const handleNavigateToCharacter = useCallback(
    (campaignId: string, charId: string) => {
      handleSelectCampaign(campaignId);
      setSelectedCharacterId(charId);
      setCurrentTab('characters');
    },
    [handleSelectCampaign]
  );

  // Sync state with storage and Firestore whenever campaigns change
  const handleUpdateCampaign = useCallback(
    (updated: Partial<Campaign>) => {
      if (!currentUser) return;
      setCampaigns((prev) => {
        let updatedCamp: Campaign | null = null;
        const next = prev.map((c) => {
          if (c.id === activeCampaignId) {
            updatedCamp = { ...c, ...updated, updatedAt: Date.now() };
            return updatedCamp;
          }
          return c;
        });
        storageService.saveUserCampaigns(currentUser.id, next);

        // Persist to Firestore
        if (updatedCamp) {
          saveCampaignToFirestore(updatedCamp, currentUser.id).catch((err) => {
            console.warn('Erro ao sincronizar campanha no Firestore:', err);
          });
        }

        return next;
      });
    },
    [activeCampaignId, currentUser]
  );

  const handleCreateCampaign = useCallback(
    (title: string, system: string) => {
      if (!currentUser) return;
      const initialChapter = {
        id: `chap-${Date.now()}-1`,
        title: 'Capítulo 1: Começo da Aventura',
        sessionDate: 'Sessão 01',
        order: 0,
        content: `# ${title}\n\n## 📝 Rascunhos da Sessão\n- Escreva aqui ganchos, cenas e acontecimentos da aventura.\n`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const newCamp: Campaign = {
        id: `camp-${Date.now()}`,
        title,
        system: system || 'D&D 5e',
        notes: initialChapter.content,
        chapters: [initialChapter],
        activeChapterId: initialChapter.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setCampaigns((prev) => {
        const next = [newCamp, ...prev];
        storageService.saveUserCampaigns(currentUser.id, next);
        return next;
      });
      handleSelectCampaign(newCamp.id);

      // Persist to Firestore
      saveCampaignToFirestore(newCamp, currentUser.id).catch((err) => {
        console.warn('Erro ao salvar nova campanha no Firestore:', err);
      });
    },
    [currentUser, handleSelectCampaign]
  );

  const handleUpdateCampaignById = useCallback(
    (id: string, updated: Partial<Campaign>) => {
      if (!currentUser) return;
      setCampaigns((prev) => {
        const next = prev.map((c) => {
          if (c.id === id) {
            return { ...c, ...updated, updatedAt: Date.now() };
          }
          return c;
        });
        storageService.saveUserCampaigns(currentUser.id, next);

        const found = next.find((c) => c.id === id);
        if (found) {
          saveCampaignToFirestore(found, currentUser.id).catch((err) => {
            console.warn('Erro ao atualizar campanha no Firestore:', err);
          });
        }
        return next;
      });
    },
    [currentUser]
  );

  const handleDeleteCampaign = useCallback(
    (idToDelete: string) => {
      if (!currentUser) return;
      setCampaigns((prev) => {
        const next = prev.filter((c) => c.id !== idToDelete);
        storageService.saveUserCampaigns(currentUser.id, next);
        if (activeCampaignId === idToDelete) {
          const nextActive = next[0]?.id || '';
          handleSelectCampaign(nextActive);
        }
        return next;
      });

      // Delete from Firestore
      deleteCampaignFromFirestore(idToDelete).catch((err) => {
        console.warn('Erro ao excluir campanha no Firestore:', err);
      });
    },
    [activeCampaignId, currentUser, handleSelectCampaign]
  );

  const handleDeleteAllCampaigns = useCallback(
    async (options?: { deleteCharacters?: boolean }) => {
      if (!currentUser) return;
      setCampaigns([]);
      storageService.clearUserCampaigns(currentUser.id);
      handleSelectCampaign('');

      if (options?.deleteCharacters) {
        setCharacters([]);
        storageService.saveUserCharacters(currentUser.id, []);
        setSelectedCharacterId(undefined);
      }

      // Delete from Firestore
      try {
        await deleteAllCampaignsFromFirestore(currentUser.id);
        if (options?.deleteCharacters) {
          await deleteAllCharactersFromFirestore(currentUser.id);
        }
      } catch (err) {
        console.warn('Erro ao excluir todas as campanhas no Firestore:', err);
      }
    },
    [currentUser, handleSelectCampaign]
  );

  // Character handlers
  const handleCreateCharacter = useCallback(
    (charData: Omit<CharacterSheet, 'createdAt' | 'updatedAt'> & { id?: string }) => {
      if (!currentUser) return {} as CharacterSheet;

      const targetCamp =
        campaigns.find((c) => c.id === charData.campaignId) ||
        campaigns.find((c) => c.id === activeCampaignId) ||
        campaigns[0];
      const masterId = charData.masterId || targetCamp?.masterId || targetCamp?.userId;

      const newChar: CharacterSheet = {
        ...charData,
        id: charData.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: charData.userId || currentUser.id,
        masterId: masterId || undefined,
        creatorName: charData.creatorName || currentUser.displayName,
        system: charData.system || targetCamp?.system,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setCharacters((prev) => {
        const next = [...prev.filter((c) => c.id !== newChar.id), newChar];
        storageService.saveUserCharacters(currentUser.id, next);
        if (masterId && masterId !== currentUser.id) {
          storageService.saveCharacterForMaster(masterId, newChar);
        }
        if (newChar.campaignId) {
          storageService.saveCampaignCharacter(newChar.campaignId, newChar);
        }
        return next;
      });

      // Link character to player member in the campaign if member exists
      if (targetCamp && targetCamp.members) {
        const myMember = targetCamp.members.find((m) => m.userId === currentUser.id);
        if (myMember && myMember.characterId !== newChar.id) {
          const updatedMembers = targetCamp.members.map((m) =>
            m.userId === currentUser.id ? { ...m, characterId: newChar.id } : m
          );
          handleUpdateCampaignById(targetCamp.id, { members: updatedMembers });
        }
      }

      // Persist to Firestore
      saveCharacterToFirestore(newChar, currentUser.id).catch((err) => {
        console.warn('Erro ao salvar ficha no Firestore:', err);
      });

      return newChar;
    },
    [currentUser, campaigns, activeCampaignId, handleUpdateCampaignById]
  );

  const handleUpdateCharacter = useCallback(
    (id: string, updated: Partial<CharacterSheet>) => {
      if (!currentUser) return;
      setCharacters((prev) => {
        let updatedChar: CharacterSheet | null = null;
        const next = prev.map((c) => {
          if (c.id === id) {
            updatedChar = { ...c, ...updated, updatedAt: Date.now() };
            return updatedChar;
          }
          return c;
        });
        storageService.saveUserCharacters(currentUser.id, next);

        // Persist to Firestore and sync caches
        if (updatedChar) {
          const charToSync: CharacterSheet = updatedChar;
          if (charToSync.masterId && charToSync.masterId !== currentUser.id) {
            storageService.saveCharacterForMaster(charToSync.masterId, charToSync);
          }
          if (charToSync.campaignId) {
            storageService.saveCampaignCharacter(charToSync.campaignId, charToSync);
          }
          saveCharacterToFirestore(charToSync, currentUser.id).catch((err) => {
            console.warn('Erro ao atualizar ficha no Firestore:', err);
          });
        }

        return next;
      });
    },
    [currentUser]
  );

  const handleDeleteCharacter = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setCharacters((prev) => {
        const next = prev.filter((c) => c.id !== id);
        storageService.saveUserCharacters(currentUser.id, next);
        return next;
      });

      // Delete from Firestore
      deleteCharacterFromFirestore(id).catch((err) => {
        console.warn('Erro ao excluir ficha no Firestore:', err);
      });
    },
    [currentUser]
  );

  // Settings handlers
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  }, []);

  // Update dynamic favicon whenever customLogoUrl changes
  useEffect(() => {
    const favicon = document.getElementById('app-favicon') as HTMLLinkElement | null;
    if (favicon) {
      favicon.href = settings.customLogoUrl || '/favicon.svg';
    }
  }, [settings.customLogoUrl]);

  const handleDataImported = useCallback(() => {
    if (!currentUser) return;
    const freshCampaigns = storageService.getUserCampaigns(currentUser.id);
    const freshCharacters = storageService.getUserCharacters(currentUser.id);
    const freshSettings = storageService.getSettings();
    setCampaigns(freshCampaigns);
    setCharacters(freshCharacters);
    setSettings(freshSettings);
    if (freshCampaigns.length > 0) {
      handleSelectCampaign(freshCampaigns[0].id);
    }
    // Sync imported data to Firestore
    for (const camp of freshCampaigns) {
      saveCampaignToFirestore(camp, currentUser.id);
    }
    for (const char of freshCharacters) {
      saveCharacterToFirestore(char, currentUser.id);
    }
  }, [currentUser, handleSelectCampaign]);

  const currentCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const activeCampaignCharacterCount = characters.filter((c) => c.campaignId === activeCampaignId).length;

  const isMaster = Boolean(
    currentCampaign &&
    currentUser &&
    (currentCampaign.userId === currentUser.id ||
     currentCampaign.masterId === currentUser.id ||
     currentCampaign.members?.find((m) => m.userId === currentUser.id)?.role === 'master' ||
     (!currentCampaign.userId && !currentCampaign.masterId))
  );

  // Collaboration handlers: Join campaign by code
  const handleJoinCampaignByCode = useCallback(
    async (code: string) => {
      if (!currentUser) return { success: false, error: 'Usuário não conectado.' };
      try {
        const res = await joinCampaignByInviteCode(code, currentUser);
        if (res.success && res.campaign) {
          setCampaigns((prev) => {
            const exists = prev.some((c) => c.id === res.campaign!.id);
            const next = exists
              ? prev.map((c) => (c.id === res.campaign!.id ? res.campaign! : c))
              : [res.campaign!, ...prev];
            storageService.saveUserCampaigns(currentUser.id, next);
            return next;
          });
          handleSelectCampaign(res.campaign.id);
          return { success: true };
        }
        return { success: false, error: res.error || 'Código inválido ou campanha não encontrada.' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Falha ao conectar à campanha.' };
      }
    },
    [currentUser, handleSelectCampaign]
  );

  // Player notes saver
  const handleSavePlayerNotes = useCallback(
    async (notes: string) => {
      if (!currentUser || !currentCampaign) return;
      try {
        const currentMembers = currentCampaign.members || [];
        const memberIndex = currentMembers.findIndex((m) => m.userId === currentUser.id);
        const updatedMember: CampaignMember =
          memberIndex >= 0
            ? { ...currentMembers[memberIndex], notes }
            : {
                userId: currentUser.id,
                displayName: currentUser.displayName,
                role: 'player',
                joinedAt: Date.now(),
                notes,
              };

        const nextMembers =
          memberIndex >= 0
            ? currentMembers.map((m, idx) => (idx === memberIndex ? updatedMember : m))
            : [...currentMembers, updatedMember];

        const updatedCamp: Campaign = {
          ...currentCampaign,
          members: nextMembers,
          updatedAt: Date.now(),
        };

        setCampaigns((prev) => {
          const next = prev.map((c) => (c.id === currentCampaign.id ? updatedCamp : c));
          storageService.saveUserCampaigns(currentUser.id, next);
          return next;
        });

        // Dedicated local storage cache for player notes
        storageService.savePlayerCampaignNotes(currentCampaign.id, currentUser.id, notes);

        // Sync to Master's local cache if Master is a different user
        const masterId = currentCampaign.masterId || currentCampaign.userId;
        if (masterId && masterId !== currentUser.id) {
          storageService.saveCampaignMemberForMaster(masterId, currentCampaign.id, updatedMember);
        }

        // Persist to Cloud Firestore: both targeted helper and full campaign
        await savePlayerCampaignNotes(currentCampaign.id, currentUser.id, notes, currentUser.displayName);
        saveCampaignToFirestore(updatedCamp, currentCampaign.userId || currentUser.id).catch((e) =>
          console.warn('Erro ao sincronizar campanha com anotações no Firestore:', e)
        );
      } catch (err) {
        console.warn('Erro ao salvar anotações do jogador:', err);
      }
    },
    [currentUser, currentCampaign]
  );

  // Add shared item (photo, map, handout)
  const handleAddSharedItem = useCallback(
    async (item: CampaignSharedItem) => {
      if (!currentCampaign || !currentUser) return;
      try {
        const currentShared = currentCampaign.sharedItems || [];
        const nextShared = [item, ...currentShared.filter((i) => i.id !== item.id)];
        const updatedCamp: Campaign = {
          ...currentCampaign,
          sharedItems: nextShared,
          updatedAt: Date.now(),
        };

        setCampaigns((prev) => {
          const next = prev.map((c) => (c.id === currentCampaign.id ? updatedCamp : c));
          storageService.saveUserCampaigns(currentUser.id, next);
          return next;
        });

        // Dedicated local cache for campaign shared items
        storageService.saveCampaignSharedItems(currentCampaign.id, nextShared);

        // Also update Master's campaign cache if different user
        const masterId = currentCampaign.masterId || currentCampaign.userId;
        if (masterId && masterId !== currentUser.id) {
          const masterCamps = storageService.getUserCampaigns(masterId);
          const updatedMasterCamps = masterCamps.map((c) => (c.id === currentCampaign.id ? updatedCamp : c));
          storageService.saveUserCampaigns(masterId, updatedMasterCamps);
        }

        // Persist to Firestore: both specific helper and full campaign document
        await addSharedItemToCampaign(currentCampaign.id, item);
        saveCampaignToFirestore(updatedCamp, currentCampaign.userId || currentUser.id).catch((e) =>
          console.warn('Erro ao sincronizar mural compartilhado no Firestore:', e)
        );
      } catch (err) {
        console.warn('Erro ao adicionar item compartilhado:', err);
      }
    },
    [currentCampaign, currentUser]
  );

  // Remove shared item
  const handleRemoveSharedItem = useCallback(
    async (itemId: string) => {
      if (!currentCampaign || !currentUser) return;
      try {
        const nextShared = (currentCampaign.sharedItems || []).filter((i) => i.id !== itemId);
        const updatedCamp: Campaign = {
          ...currentCampaign,
          sharedItems: nextShared,
          updatedAt: Date.now(),
        };

        setCampaigns((prev) => {
          const next = prev.map((c) => (c.id === currentCampaign.id ? updatedCamp : c));
          storageService.saveUserCampaigns(currentUser.id, next);
          return next;
        });

        storageService.saveCampaignSharedItems(currentCampaign.id, nextShared);

        const masterId = currentCampaign.masterId || currentCampaign.userId;
        if (masterId && masterId !== currentUser.id) {
          const masterCamps = storageService.getUserCampaigns(masterId);
          const updatedMasterCamps = masterCamps.map((c) => (c.id === currentCampaign.id ? updatedCamp : c));
          storageService.saveUserCampaigns(masterId, updatedMasterCamps);
        }

        await removeSharedItemFromCampaign(currentCampaign.id, itemId);
        saveCampaignToFirestore(updatedCamp, currentCampaign.userId || currentUser.id).catch((e) =>
          console.warn('Erro ao sincronizar remoção do mural no Firestore:', e)
        );
      } catch (err) {
        console.warn('Erro ao remover item compartilhado:', err);
      }
    },
    [currentCampaign, currentUser]
  );

  // Toggle character shared with players
  const handleToggleCharacterShared = useCallback(
    async (charId: string, shared: boolean) => {
      try {
        await toggleCharacterSharedWithPlayers(charId, shared);
        setCharacters((prev) => {
          const next = prev.map((c) => (c.id === charId ? { ...c, sharedWithPlayers: shared } : c));
          if (currentUser) storageService.saveUserCharacters(currentUser.id, next);
          return next;
        });
      } catch (err) {
        console.warn('Erro ao alternar compartilhamento de ficha:', err);
      }
    },
    [currentUser]
  );

  const handleTabChange = useCallback(
    (tab: MainTab) => {
      if (tab !== 'campaign' && isFullScreenNotes) {
        setIsFullScreenNotes(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      setCurrentTab(tab);
    },
    [isFullScreenNotes]
  );

  if (!currentUser) {
    return <AccountOnboarding onUserReady={(user) => handleUserChanged(user)} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header Navigation */}
      {!isFullScreenNotes && (
        <Header
          currentTab={currentTab}
          onTabChange={handleTabChange}
          characterCount={activeCampaignCharacterCount}
          activeCampaign={currentCampaign}
          campaignsCount={campaigns.length}
          onOpenCampaignMenu={() => setIsCampaignMenuOpen(true)}
          onOpenTableModal={() => setIsTableModalOpen(true)}
          isMaster={isMaster}
          syncStatus={syncStatus}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          customLogoUrl={settings.customLogoUrl}
        />
      )}

      {/* Quota limit notification banner */}
      {syncStatus === 'quota' && !quotaBannerDismissed && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-3 shadow-md z-20 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Cota Diária Gratuita do Firestore Atingida</span>
            </div>
            <span className="text-amber-200/90 text-[11px] sm:text-xs">
              O limite de 20.000 gravações/dia do plano Spark gratuito foi atingido. <strong>Seus dados estão 100% salvos e protegidos localmente no navegador</strong>. A cota será redefinida automaticamente à meia-noite pelo Google Cloud.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRetryConnect}
              disabled={isRetryingConnection}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-[11px] font-medium transition-colors border border-amber-500/50 cursor-pointer disabled:opacity-50"
              title="Testar se a cota do Firestore já foi restabelecida"
            >
              <RefreshCw className={`w-3 h-3 ${isRetryingConnection ? 'animate-spin' : ''}`} />
              <span>{isRetryingConnection ? 'Testando...' : 'Tentar Reconectar'}</span>
            </button>
            <a
              href="https://console.firebase.google.com/project/grimoriorpg-f0f90/firestore/databases/ai-studio-grimrio-8779fd65-3555-4c47-9ad8-07470a6512c4/data?openUpgradeDialog=true"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-900/70 hover:bg-amber-800 text-amber-200 text-[11px] font-medium transition-colors border border-amber-700/60"
            >
              <span>Ver no Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setQuotaBannerDismissed(true)}
              className="p-1 text-amber-400 hover:text-amber-100 hover:bg-amber-900/60 rounded transition-colors cursor-pointer"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Body */}
      <main className={`flex-1 flex overflow-hidden ${!isFullScreenNotes ? 'pb-14 md:pb-0' : ''}`}>
        {currentTab === 'campaign' ? (
          isMaster ? (
            <CampaignCopilotView
              campaigns={campaigns}
              activeCampaignId={activeCampaignId}
              onSelectCampaign={handleSelectCampaign}
              onCreateCampaign={handleCreateCampaign}
              onUpdateCampaign={handleUpdateCampaign}
              onDeleteCampaign={handleDeleteCampaign}
              onOpenCampaignMenu={() => setIsCampaignMenuOpen(true)}
              onOpenTableModal={() => setIsTableModalOpen(true)}
              characters={characters}
              onCreateCharacter={handleCreateCharacter}
              onUpdateCharacter={(updated) => handleUpdateCharacter(updated.id, updated)}
              onOpenBestiaryTab={() => setCurrentTab('bestiary')}
              model={settings.model}
              customApiKey={settings.customApiKey}
              isFullScreen={isFullScreenNotes}
              onToggleFullScreen={handleToggleFullScreen}
              userId={currentUser.id}
            />
          ) : (
            <PlayerPortalView
              campaign={currentCampaign}
              currentUser={currentUser}
              characters={characters}
              onCreateCharacter={handleCreateCharacter}
              onUpdateCharacter={(updated) => handleUpdateCharacter(updated.id, updated)}
              onSavePlayerNotes={handleSavePlayerNotes}
              onOpenTableModal={() => setIsTableModalOpen(true)}
              onOpenCampaignMenu={() => setIsCampaignMenuOpen(true)}
            />
          )
        ) : currentTab === 'bestiary' ? (
          <BestiaryView
            activeCampaign={currentCampaign}
            onAddMonsterToCampaign={(monster: BestiaryMonster, insertInText?: boolean) => {
              const targetCampaignId = activeCampaignId || currentCampaign?.id || '';
              const newChar: CharacterSheet = {
                id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                campaignId: targetCampaignId,
                name: monster.name,
                role: monster.role,
                type: monster.type || 'Monstro',
                challengeRating: monster.challenge,
                avatarUrl: monster.avatarUrl,
                attributes: [...monster.attributes],
                resources: [...monster.resources],
                notes: monster.notes,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              handleCreateCharacter(newChar);

              if (insertInText && currentCampaign) {
                const embedTag = `\n\n{{ficha:${newChar.id}}}\n\n`;
                const nextNotes = `${currentCampaign.notes || ''}${embedTag}`;
                handleUpdateCampaign({ notes: nextNotes });
              }
            }}
            onGoToCampaign={() => setCurrentTab('campaign')}
          />
        ) : (
          <CharacterSheetsView
            characters={characters}
            activeCampaignId={activeCampaignId}
            campaignTitle={currentCampaign?.title || 'Campanha'}
            campaignSystem={currentCampaign?.system || 'D&D 5e'}
            settings={settings}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={setSelectedCharacterId}
            onCreateCharacter={handleCreateCharacter}
            onUpdateCharacter={handleUpdateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onOpenCampaignMenu={() => setIsCampaignMenuOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isMaster={isMaster}
            currentUserId={currentUser.id}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isFullScreenNotes && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={handleTabChange}
          characterCount={activeCampaignCharacterCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Campaign Menu & Management Modal */}
      <CampaignMenuModal
        isOpen={isCampaignMenuOpen}
        onClose={() => setIsCampaignMenuOpen(false)}
        campaigns={campaigns}
        activeCampaignId={activeCampaignId}
        characters={characters}
        currentUserId={currentUser.id}
        onSelectCampaign={(id) => {
          handleSelectCampaign(id);
          const campChars = characters.filter((c) => c.campaignId === id);
          if (campChars.length > 0) {
            setSelectedCharacterId(campChars[0].id);
          } else {
            setSelectedCharacterId(undefined);
          }
        }}
        onCreateCampaign={handleCreateCampaign}
        onUpdateCampaign={handleUpdateCampaignById}
        onDeleteCampaign={handleDeleteCampaign}
        onDeleteAllCampaigns={handleDeleteAllCampaigns}
        onJoinCampaignByCode={handleJoinCampaignByCode}
      />

      {/* Campaign Table & Party Collaboration Modal */}
      {currentCampaign && currentUser && (
        <CampaignTableModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
          campaign={currentCampaign}
          characters={characters}
          currentUser={currentUser}
          isMaster={isMaster}
          onUpdateCampaign={handleUpdateCampaign}
          onAddSharedItem={handleAddSharedItem}
          onRemoveSharedItem={handleRemoveSharedItem}
          onToggleCharacterShared={handleToggleCharacterShared}
          onSelectCharacterToView={(charId) => {
            setSelectedCharacterId(charId);
            setCurrentTab('characters');
          }}
        />
      )}

      {/* Settings & Firebase Cloud Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDataImported={handleDataImported}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSyncCloud={handleManualSyncCloud}
        isSyncing={isSyncingManual}
      />

      {/* Global Search Modal (Ctrl+K / ⌘K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        campaigns={campaigns}
        characters={characters}
        onNavigateToCampaign={handleNavigateToCampaign}
        onNavigateToCharacter={handleNavigateToCharacter}
      />

      {/* User Accounts & Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChanged={handleUserChanged}
      />
    </div>
  );
}

