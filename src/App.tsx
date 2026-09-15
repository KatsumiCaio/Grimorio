import { useState, useEffect, useCallback } from 'react';
import { Campaign, CharacterSheet, MainTab, AppSettings } from './types';
import { storageService } from './services/storage';
import { Header } from './components/Header';
import { CampaignCopilotView } from './components/CampaignCopilotView';
import { CharacterSheetsView } from './components/CharacterSheetsView';
import { SettingsModal } from './components/SettingsModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

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

  // Global keyboard shortcut for search (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Sync state with storage whenever campaigns change
  const handleUpdateCampaign = useCallback((updated: Partial<Campaign>) => {
    setCampaigns((prev) => {
      const next = prev.map((c) => (c.id === activeCampaignId ? { ...c, ...updated, updatedAt: Date.now() } : c));
      storageService.saveCampaigns(next);
      return next;
    });
  }, [activeCampaignId]);

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
  }, []);

  const handleDeleteCampaign = useCallback((idToDelete: string) => {
    setCampaigns((prev) => {
      const next = prev.filter((c) => c.id !== idToDelete);
      storageService.saveCampaigns(next);
      if (activeCampaignId === idToDelete && next.length > 0) {
        setActiveCampaignId(next[0].id);
      }
      return next;
    });
  }, [activeCampaignId]);

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
      return newChar;
    },
    []
  );

  const handleUpdateCharacter = useCallback((id: string, updated: Partial<CharacterSheet>) => {
    setCharacters((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updated, updatedAt: Date.now() } : c));
      storageService.saveCharacters(next);
      return next;
    });
  }, []);

  const handleDeleteCharacter = useCallback((id: string) => {
    setCharacters((prev) => {
      const next = prev.filter((c) => c.id !== id);
      storageService.saveCharacters(next);
      return next;
    });
  }, []);

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
  }, []);

  const currentCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const activeCampaignCharacterCount = characters.filter((c) => c.campaignId === activeCampaignId).length;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Header Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        characterCount={activeCampaignCharacterCount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

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

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDataImported={handleDataImported}
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
