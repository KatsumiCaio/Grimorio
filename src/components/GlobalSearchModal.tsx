import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  BookOpen,
  FileText,
  Users,
  Shield,
  CornerDownLeft,
  ArrowUpDown,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Campaign, CharacterSheet, MainTab } from '../types';

export type SearchCategory = 'ALL' | 'CAMPAIGNS' | 'NOTES' | 'CHARACTERS';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  characters: CharacterSheet[];
  onNavigateToCampaign: (campaignId: string) => void;
  onNavigateToCharacter: (campaignId: string, characterId: string) => void;
}

interface SearchItem {
  id: string;
  type: 'campaign' | 'note' | 'character';
  title: string;
  subtitle: string;
  campaignId: string;
  campaignTitle: string;
  characterId?: string;
  snippet?: string;
  badge?: string;
  badgeColor?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  characters,
  onNavigateToCampaign,
  onNavigateToCharacter,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveCategory('ALL');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Compute search results across campaigns, notes, and characters
  const results = useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: SearchItem[] = [];

    // Helper map of campaign ID to title & system
    const campaignMap = new Map<string, Campaign>();
    campaigns.forEach((c) => campaignMap.set(c.id, c));

    // 1. CAMPAIGNS SEARCH
    campaigns.forEach((camp) => {
      const titleMatches = camp.title.toLowerCase().includes(q);
      const systemMatches = camp.system?.toLowerCase().includes(q);

      if (!q || titleMatches || systemMatches) {
        items.push({
          id: `camp-${camp.id}`,
          type: 'campaign',
          title: camp.title,
          subtitle: `Sistema: ${camp.system || 'Livre'}`,
          campaignId: camp.id,
          campaignTitle: camp.title,
          badge: 'Campanha',
          badgeColor: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
        });
      }
    });

    // 2. NOTES SEARCH (Deep scan into markdown text)
    campaigns.forEach((camp) => {
      const notesLower = (camp.notes || '').toLowerCase();
      if (q && notesLower.includes(q)) {
        // Extract relevant snippet around match
        const matchIndex = notesLower.indexOf(q);
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(camp.notes.length, matchIndex + q.length + 60);
        let snippet = camp.notes.substring(start, end).replace(/\n+/g, ' ');
        if (start > 0) snippet = '...' + snippet;
        if (end < camp.notes.length) snippet = snippet + '...';

        items.push({
          id: `note-${camp.id}`,
          type: 'note',
          title: `Caderno: ${camp.title}`,
          subtitle: `Menção em notas da campanha`,
          campaignId: camp.id,
          campaignTitle: camp.title,
          snippet,
          badge: 'Nota',
          badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
        });
      }
    });

    // 3. CHARACTERS SEARCH (Name, role, type, attributes, notes)
    characters.forEach((char) => {
      const camp = campaignMap.get(char.campaignId);
      const campTitle = camp?.title || 'Campanha Desconhecida';

      const nameMatches = char.name.toLowerCase().includes(q);
      const roleMatches = char.role.toLowerCase().includes(q);
      const typeMatches = char.type.toLowerCase() === q;
      const notesMatches = (char.notes || '').toLowerCase().includes(q);
      const attrMatches = char.attributes.some(
        (a) =>
          a.key.toLowerCase().includes(q) ||
          String(a.value).toLowerCase().includes(q)
      );

      if (!q || nameMatches || roleMatches || typeMatches || notesMatches || attrMatches) {
        let snippet: string | undefined = undefined;
        if (q && notesMatches && !nameMatches && !roleMatches) {
          const charNotesLower = char.notes.toLowerCase();
          const matchIndex = charNotesLower.indexOf(q);
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(char.notes.length, matchIndex + q.length + 50);
          snippet = char.notes.substring(start, end).replace(/\n+/g, ' ');
          if (start > 0) snippet = '...' + snippet;
          if (end < char.notes.length) snippet = snippet + '...';
        } else if (q && attrMatches) {
          const matchedAttr = char.attributes.find(
            (a) =>
              a.key.toLowerCase().includes(q) ||
              String(a.value).toLowerCase().includes(q)
          );
          if (matchedAttr) {
            snippet = `Atributo correspondente: ${matchedAttr.key} = ${matchedAttr.value}`;
          }
        }

        items.push({
          id: `char-${char.id}`,
          type: 'character',
          title: char.name,
          subtitle: `${char.role || 'Sem classe'} • ${char.type === 'PJ' ? 'Personagem Jogador' : 'NPC / Monstro'}`,
          campaignId: char.campaignId,
          campaignTitle: campTitle,
          characterId: char.id,
          snippet,
          badge: char.type === 'PJ' ? 'PJ' : 'NPC',
          badgeColor:
            char.type === 'PJ'
              ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
              : 'border-purple-500/40 bg-purple-500/15 text-purple-300',
        });
      }
    });

    return items;
  }, [campaigns, characters, query]);

  // Filter by category
  const filteredResults = useMemo(() => {
    if (activeCategory === 'ALL') return results;
    if (activeCategory === 'CAMPAIGNS') return results.filter((r) => r.type === 'campaign');
    if (activeCategory === 'NOTES') return results.filter((r) => r.type === 'note');
    if (activeCategory === 'CHARACTERS') return results.filter((r) => r.type === 'character');
    return results;
  }, [results, activeCategory]);

  // Counts for tabs
  const countAll = results.length;
  const countCampaigns = results.filter((r) => r.type === 'campaign').length;
  const countNotes = results.filter((r) => r.type === 'note').length;
  const countCharacters = results.filter((r) => r.type === 'character').length;

  // Reset selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults.length, activeCategory, query]);

  // Handle selection action
  const handleSelectItem = (item: SearchItem) => {
    if (item.type === 'campaign' || item.type === 'note') {
      onNavigateToCampaign(item.campaignId);
    } else if (item.type === 'character' && item.characterId) {
      onNavigateToCharacter(item.campaignId, item.characterId);
    }
    onClose();
  };

  // Keyboard navigation inside search modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      scrollSelectedIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      scrollSelectedIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const scrollSelectedIntoView = () => {
    setTimeout(() => {
      const activeEl = document.getElementById(`search-item-${selectedIndex}`);
      activeEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 10);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-[8vh] sm:pt-[12vh] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="global-search-dialog"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl shadow-cyan-950/20 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input Box */}
        <div className="p-3 sm:p-4 border-b border-zinc-800/90 flex items-center gap-3 bg-zinc-900/60 shrink-0">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por campanhas, trechos de notas, PJs, NPCs..."
            className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-800/80 bg-zinc-950/80 text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            id="filter-all-btn"
            onClick={() => setActiveCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Tudo ({countAll})
          </button>
          <button
            id="filter-campaigns-btn"
            onClick={() => setActiveCategory('CAMPAIGNS')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'CAMPAIGNS'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Campanhas ({countCampaigns})
          </button>
          <button
            id="filter-notes-btn"
            onClick={() => setActiveCategory('NOTES')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'NOTES'
                ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Notas do Caderno ({countNotes})
          </button>
          <button
            id="filter-characters-btn"
            onClick={() => setActiveCategory('CHARACTERS')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'CHARACTERS'
                ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Fichas ({countCharacters})
          </button>
        </div>

        {/* Search Results List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 focus:outline-none"
        >
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Search className="w-8 h-8 mx-auto text-zinc-700" />
              <p className="text-xs sm:text-sm font-medium text-zinc-400">
                Nenhum resultado encontrado para &quot;{query}&quot;
              </p>
              <p className="text-[11px] text-zinc-600 max-w-xs mx-auto">
                Tente buscar pelo nome da campanha, trechos do diário de bordo, nome do personagem
                ou atributo.
              </p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={item.id}
                  id={`search-item-${index}`}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-zinc-900 border-cyan-500/50 shadow-xs ring-1 ring-cyan-500/20'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Icon by Type */}
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        item.type === 'campaign'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : item.type === 'note'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {item.type === 'campaign' && <BookOpen className="w-4 h-4" />}
                      {item.type === 'note' && <FileText className="w-4 h-4" />}
                      {item.type === 'character' && <Users className="w-4 h-4" />}
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium border ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 truncate">
                        <span>{item.subtitle}</span>
                        {item.type !== 'campaign' && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-500 truncate">
                              Campanha: {item.campaignTitle}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Matching text snippet */}
                      {item.snippet && (
                        <div className="text-[11px] text-zinc-300 bg-zinc-900/80 border border-zinc-800/80 rounded-md p-2 font-mono mt-1 leading-relaxed">
                          <span className="text-zinc-500 mr-1.5">&quot;</span>
                          <span className="text-cyan-200/90">{item.snippet}</span>
                          <span className="text-zinc-500 ml-1.5">&quot;</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enter indicator */}
                  <div className="flex items-center gap-1 shrink-0 text-zinc-500 self-center">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                        <span>Abrir</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Keyboard Bar */}
        <div className="p-3 border-t border-zinc-800/90 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px]">
                ↓
              </kbd>
              <span className="hidden sm:inline">Navegar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px]">
                ↵
              </kbd>
              <span className="hidden sm:inline">Selecionar</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[10px]">
                ESC
              </kbd>
              <span className="hidden sm:inline">Fechar</span>
            </span>
          </div>

          <div className="text-[11px] text-zinc-400 font-mono">
            {filteredResults.length} {filteredResults.length === 1 ? 'resultado' : 'resultados'}
          </div>
        </div>
      </div>
    </div>
  );
};
