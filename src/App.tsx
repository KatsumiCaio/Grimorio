import { useState, useEffect, useCallback, useRef } from 'react';
import { Campaign, CharacterSheet, MainTab, AppSettings } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { CampaignCopilotView } from './components/CampaignCopilotView';
import { CharacterSheetsView } from './components/CharacterSheetsView';
import { SettingsModal } from './components/SettingsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import type { User } from 'firebase/auth';
import {
  signInAnonymousUser,
  signInWithGoogleAccount,
  logoutUser,
  onAuthStatusChange,
  subscribeToUserCampaigns,
  subscribeToUserCharacters,
  saveCampaignToFirestore,
  deleteCampaignFromFirestore,
  saveCharacterToFirestore,
  deleteCharacterFromFirestore,
  checkAndSeedCloudData,
} from './services/firebase';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => storageService.getCampaigns());
  const [characters, setCharacters] = useState<CharacterSheet[]>(() => storageService.getCharacters());
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [activeCampaignId, setActiveCampaignId] = useState<string>(() => {
    const loaded = storageService.getCampaigns();
    return loaded[0]?.id || '';
  });
  const [currentTab, setCurrentTab] = useState<MainTab>('campaign');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | undefined>(undefined);
  const [isFullScreenNotes, setIsFullScreenNotes] = useState(false);

  // Firebase Auth & Cloud Sync States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const isCloudLoadedRef = useRef(false);

  // Initialize Firebase Auth & Realtime Subscriptions
  useEffect(() => {
    let unsubCampaigns: (() => void) | null = null;
    let unsubCharacters: (() => void) | null = null;

    const unsubscribeAuth = onAuthStatusChange(async (user) => {
      // Clean up previous listeners if user changed
      if (unsubCampaigns) {
        unsubCampaigns();
        unsubCampaigns = null;
      }
      if (unsubCharacters) {
        unsubCharacters();
        unsubCharacters = null;
      }

      if (user) {
        setCurrentUser(user);
        setSyncStatus('syncing');

        try {
          // Check if user already has data in cloud, if not seed current local data
          const localCamps = storageService.getCampaigns();
          const localChars = storageService.getCharacters();
          await checkAndSeedCloudData(user.uid, localCamps, localChars);

          // Realtime listener for campaigns
          unsubCampaigns = subscribeToUserCampaigns(
            user.uid,
            (cloudCampaigns) => {
              if (cloudCampaigns.length > 0) {
                setCampaigns(cloudCampaigns);
                storageService.saveCampaigns(cloudCampaigns);
                setActiveCampaignId((prev) => {
                  if (prev && cloudCampaigns.some((c) => c.id === prev)) return prev;
                  return cloudCampaigns[0].id;
                });
              }
              isCloudLoadedRef.current = true;
              setSyncStatus('synced');
            },
            (err) => {
              console.warn('Erro na sincronização de campanhas:', err);
              setSyncStatus('offline');
            }
          );

          // Realtime listener for characters
          unsubCharacters = subscribeToUserCharacters(
            user.uid,
            (cloudCharacters) => {
              if (cloudCharacters.length > 0) {
                setCharacters(cloudCharacters);
                storageService.saveCharacters(cloudCharacters);
              }
              setSyncStatus('synced');
            },
            (err) => {
              console.warn('Erro na sincronização de fichas:', err);
              setSyncStatus('offline');
            }
          );
        } catch (err) {
          console.warn('Erro ao conectar ao Firestore:', err);
          setSyncStatus('offline');
        }
      } else {
        setCurrentUser(null);
        // Seamlessly attempt anonymous authentication or fallback safely to offline local storage
        signInAnonymousUser().then((anonUser) => {
          if (!anonUser) {
            setSyncStatus('offline');
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubCampaigns) unsubCampaigns();
      if (unsubCharacters) unsubCharacters();
    };
  }, []);

  // Google Login Handler
  const handleSignInGoogle = useCallback(async () => {
    setSyncStatus('syncing');
    setAuthNotice(null);
    const res = await signInWithGoogleAccount();
    if (res.error) {
      setSyncStatus('offline');
      setAuthNotice(res.error);
      setIsSettingsOpen(true);
    } else {
      setAuthNotice(null);
      setSyncStatus('synced');
    }
  }, []);

  // Logout Handler
  const handleSignOut = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    setSyncStatus('offline');
  }, []);

  // Manual Full Cloud Sync Handler
  const handleManualSyncCloud = useCallback(async () => {
    if (!currentUser) return;
    setIsSyncingManual(true);
    setSyncStatus('syncing');
    try {
      for (const camp of campaigns) {
        await saveCampaignToFirestore(currentUser.uid, camp);
      }
      for (const char of characters) {
        await saveCharacterToFirestore(currentUser.uid, char);
      }
      setSyncStatus('synced');
    } catch (e) {
      console.error('Erro na sincronização manual:', e);
      setSyncStatus('error');
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
  const handleNavigateToCampaign = useCallback((campaignId: string) => {
    setActiveCampaignId(campaignId);
    setCurrentTab('campaign');
  }, []);

  const handleNavigateToCharacter = useCallback((campaignId: string, charId: string) => {
    setActiveCampaignId(campaignId);
    setSelectedCharacterId(charId);
    setCurrentTab('characters');
  }, []);

  // Sync state with storage and Firestore whenever campaigns change
  const handleUpdateCampaign = useCallback((updated: Partial<Campaign>) => {
    setCampaigns((prev) => {
      let updatedCamp: Campaign | null = null;
      const next = prev.map((c) => {
        if (c.id === activeCampaignId) {
          updatedCamp = { ...c, ...updated, updatedAt: Date.now() };
          return updatedCamp;
        }
        return c;
      });
      storageService.saveCampaigns(next);

      // Persist to Firestore
      if (currentUser && updatedCamp) {
        saveCampaignToFirestore(currentUser.uid, updatedCamp).catch((err) => {
          console.warn('Erro ao sincronizar campanha no Firestore:', err);
        });
      }

      return next;
    });
  }, [activeCampaignId, currentUser]);

  const handleCreateCampaign = useCallback((title: string, system: string) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      title,
      system: system || 'D&D 5e',
      notes: `# ${title}\n\n## 📝 Rascunhos da Sessão\n- Escreva aqui ganchos, cenas e acontecimentos da aventura.\n`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCampaigns((prev) => {
      const next = [newCamp, ...prev];
      storageService.saveCampaigns(next);
      return next;
    });
    setActiveCampaignId(newCamp.id);

    // Persist to Firestore
    if (currentUser) {
      saveCampaignToFirestore(currentUser.uid, newCamp).catch((err) => {
        console.warn('Erro ao salvar nova campanha no Firestore:', err);
      });
    }
  }, [currentUser]);

  const handleDeleteCampaign = useCallback((idToDelete: string) => {
    setCampaigns((prev) => {
      const next = prev.filter((c) => c.id !== idToDelete);
      storageService.saveCampaigns(next);
      if (activeCampaignId === idToDelete && next.length > 0) {
        setActiveCampaignId(next[0].id);
      }
      return next;
    });

    // Delete from Firestore
    if (currentUser) {
      deleteCampaignFromFirestore(idToDelete).catch((err) => {
        console.warn('Erro ao excluir campanha no Firestore:', err);
      });
    }
  }, [activeCampaignId, currentUser]);

  // Character handlers
  const handleCreateCharacter = useCallback(
    (charData: Omit<CharacterSheet, 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const newChar: CharacterSheet = {
        ...charData,
        id: charData.id || `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setCharacters((prev) => {
        const next = [...prev, newChar];
        storageService.saveCharacters(next);
        return next;
      });

      // Persist to Firestore
      if (currentUser) {
        saveCharacterToFirestore(currentUser.uid, newChar).catch((err) => {
          console.warn('Erro ao salvar ficha no Firestore:', err);
        });
      }

      return newChar;
    },
    [currentUser]
  );

  const handleUpdateCharacter = useCallback((id: string, updated: Partial<CharacterSheet>) => {
    setCharacters((prev) => {
      let updatedChar: CharacterSheet | null = null;
      const next = prev.map((c) => {
        if (c.id === id) {
          updatedChar = { ...c, ...updated, updatedAt: Date.now() };
          return updatedChar;
        }
        return c;
      });
      storageService.saveCharacters(next);

      // Persist to Firestore
      if (currentUser && updatedChar) {
        saveCharacterToFirestore(currentUser.uid, updatedChar).catch((err) => {
          console.warn('Erro ao atualizar ficha no Firestore:', err);
        });
      }

      return next;
    });
  }, [currentUser]);

  const handleDeleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => {
      const next = prev.filter((c) => c.id !== id);
      storageService.saveCharacters(next);
      return next;
    });

    // Delete from Firestore
    if (currentUser) {
      deleteCharacterFromFirestore(id).catch((err) => {
        console.warn('Erro ao excluir ficha no Firestore:', err);
      });
    }
  }, [currentUser]);

  // Settings handlers
  const handleSaveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  }, []);

  const handleDataImported = useCallback(() => {
    const freshCampaigns = storageService.getCampaigns();
    const freshCharacters = storageService.getCharacters();
    const freshSettings = storageService.getSettings();
    setCampaigns(freshCampaigns);
    setCharacters(freshCharacters);
    setSettings(freshSettings);
    if (freshCampaigns.length > 0) {
      setActiveCampaignId(freshCampaigns[0].id);
    }
    // If logged in, also sync imported data to Firestore
    if (currentUser) {
      for (const camp of freshCampaigns) {
        saveCampaignToFirestore(currentUser.uid, camp);
      }
      for (const char of freshCharacters) {
        saveCharacterToFirestore(currentUser.uid, char);
      }
    }
  }, [currentUser]);

  const currentCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const activeCampaignCharacterCount = characters.filter((c) => c.campaignId === activeCampaignId).length;

  const handleTabChange = useCallback((tab: MainTab) => {
    if (tab !== 'campaign' && isFullScreenNotes) {
      setIsFullScreenNotes(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    setCurrentTab(tab);
  }, [isFullScreenNotes]);

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header Navigation (escondido no modo de tela cheia sem distrações) */}
      {!isFullScreenNotes && (
        <Header
          currentTab={currentTab}
          onTabChange={handleTabChange}
          characterCount={activeCampaignCharacterCount}
          syncStatus={syncStatus}
          user={currentUser}
          onSignInGoogle={handleSignInGoogle}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      {/* Main App Body */}
      <main className="flex-1 flex overflow-hidden">
        {currentTab === 'campaign' ? (
          <CampaignCopilotView
            campaigns={campaigns}
            activeCampaignId={activeCampaignId}
            onSelectCampaign={setActiveCampaignId}
            onCreateCampaign={handleCreateCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            characters={characters}
            model={settings.model}
            customApiKey={settings.customApiKey}
            isFullScreen={isFullScreenNotes}
            onToggleFullScreen={handleToggleFullScreen}
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
          />
        )}
      </main>

      {/* Settings & Firebase Cloud Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setAuthNotice(null);
        }}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDataImported={handleDataImported}
        user={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        onSyncCloud={handleManualSyncCloud}
        isSyncing={isSyncingManual}
        authNotice={authNotice}
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
    </div>
  );
}
