import React, { useState } from 'react';
import {
  X,
  Search,
  Plus,
  Skull,
  User,
  Sparkles,
  BookOpen,
  Edit3,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { CharacterSheet, BestiaryMonster, CharacterType } from '../types';
import { RPG_BESTIARY } from '../data/bestiary';

interface InsertSheetModalProps {
  isOpen: boolean;
  activeCampaignId: string;
  activeSystemName: string;
  campaignCharacters: CharacterSheet[];
  onClose: () => void;
  onInsertIntoText: (charId: string, charName: string) => void;
  onAddMonsterToCampaign: (
    monster: BestiaryMonster,
    insertIntoTextImmediately?: boolean
  ) => void;
  onEditCharacter: (character: CharacterSheet) => void;
  onOpenNewCharacterModal: (type: CharacterType) => void;
}

export const InsertSheetModal: React.FC<InsertSheetModalProps> = ({
  isOpen,
  activeCampaignId,
  activeSystemName,
  campaignCharacters,
  onClose,
  onInsertIntoText,
  onAddMonsterToCampaign,
  onEditCharacter,
  onOpenNewCharacterModal,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'campaign' | 'bestiary'>('campaign');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PJ' | 'NPC' | 'Monstro'>('ALL');
  const [selectedSystem, setSelectedSystem] = useState<string>('ALL');
  const [insertedNotice, setInsertedNotice] = useState<string | null>(null);

  // Available systems in bestiary
  const systemsInBestiary = Array.from(new Set(RPG_BESTIARY.map((m) => m.system)));

  // Filter campaign characters
  const filteredCampaignChars = campaignCharacters.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Filter bestiary
  const filteredBestiary = RPG_BESTIARY.filter((m) => {
    const matchesSys = selectedSystem === 'ALL' || m.system === selectedSystem;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.challenge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSys && matchesSearch;
  });

  const handleTriggerInsert = (char: CharacterSheet) => {
    onInsertIntoText(char.id, char.name);
    setInsertedNotice(`Ficha de "${char.name}" inserida no texto!`);
    setTimeout(() => {
      setInsertedNotice(null);
      onClose();
    }, 900);
  };

  const handleBestiaryInsert = (monster: BestiaryMonster, insertText: boolean) => {
    onAddMonsterToCampaign(monster, insertText);
    setInsertedNotice(`Monstro "${monster.name}" adicionado à campanha!`);
    setTimeout(() => {
      setInsertedNotice(null);
      onClose();
    }, 1000);
  };

  const getTypeBadge = (type: CharacterType) => {
    switch (type) {
      case 'Monstro':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <Skull className="w-2.5 h-2.5" /> Monstro
          </span>
        );
      case 'NPC':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <Sparkles className="w-2.5 h-2.5" /> NPC
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            <User className="w-2.5 h-2.5" /> PJ
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div
        id="insert-sheet-modal"
        className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100"
      >
        {/* Modal Header */}
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Inserir Ficha na Anotação da Campanha</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Adicione cards interativos de Personagens, NPCs ou Seres do Bestiário diretamente ao texto
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-4 pt-3 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('campaign')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'campaign'
                  ? 'border-amber-400 text-amber-300 bg-zinc-900/90'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Fichas da Campanha</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                {campaignCharacters.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bestiary')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bestiary'
                  ? 'border-rose-400 text-rose-300 bg-zinc-900/90'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-rose-400" />
              <span>Do Bestiário (1 Clique)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300 font-mono">
                {RPG_BESTIARY.length} criaturas
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pb-2">
            <button
              type="button"
              onClick={() => onOpenNewCharacterModal('Monstro')}
              className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Novo Monstro</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNewCharacterModal('NPC')}
              className="px-2 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/80 border border-purple-800/50 text-purple-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Novo NPC</span>
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-3 bg-zinc-900/80 border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'campaign'
                  ? 'Buscar por nome, classe ou arquétipo...'
                  : 'Buscar no bestiário por monstro, ND, categoria...'
              }
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {activeTab === 'campaign' ? (
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[11px]">
              {(['ALL', 'PJ', 'NPC', 'Monstro'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    typeFilter === t
                      ? 'bg-zinc-800 text-amber-300 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t === 'ALL' ? 'Todos' : t}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">Sistema:</span>
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 text-xs text-amber-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos os Sistemas</option>
                {systemsInBestiary.map((sys) => (
                  <option key={sys} value={sys}>
                    {sys}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Feedback notification toast */}
        {insertedNotice && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{insertedNotice}</span>
          </div>
        )}

        {/* Content List Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {activeTab === 'campaign' ? (
            filteredCampaignChars.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-3">
                <BookOpen className="w-8 h-8 mx-auto opacity-40 text-zinc-600" />
                <p className="text-xs">
                  {searchQuery
                    ? 'Nenhuma ficha encontrada para esta busca.'
                    : 'Ainda não há personagens, NPCs ou monstros cadastrados nesta campanha.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bestiary')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Explorar Bestiário (1 Clique)
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenNewCharacterModal('Monstro')}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Criar Ficha Manual
                  </button>
                </div>
              </div>
            ) : (
              filteredCampaignChars.map((char) => (
                <div
                  key={char.id}
                  className="p-3 bg-zinc-950/70 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between gap-3 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {char.avatarUrl ? (
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-700 bg-zinc-900 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        {char.type === 'Monstro' ? (
                          <Skull className="w-4 h-4 text-rose-400" />
                        ) : char.type === 'NPC' ? (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        ) : (
                          <User className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                          {char.name}
                        </h4>
                        {getTypeBadge(char.type)}
                        {char.challengeRating && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {char.challengeRating}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{char.role}</p>
                      {/* Attributes & Health Preview */}
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                        {char.resources[0] && (
                          <span className="text-rose-400">
                            {char.resources[0].name}: {char.resources[0].current}/{char.resources[0].max}
                          </span>
                        )}
                        {char.attributes.length > 0 && (
                          <span>
                            • {char.attributes.slice(0, 3).map((a) => `${a.key}:${a.value}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditCharacter(char)}
                      className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                      title="Modificar ficha antes de inserir"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerInsert(char)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Inserir no Texto</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )
          ) : (
            // Bestiary list
            filteredBestiary.map((monster) => (
              <div
                key={monster.id}
                className="p-3 bg-zinc-950/70 hover:bg-zinc-950 border border-zinc-800 hover:border-rose-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={monster.avatarUrl}
                    alt={monster.name}
                    className="w-11 h-11 rounded-lg object-cover border border-zinc-700 bg-zinc-900 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-zinc-100 group-hover:text-rose-400 transition-colors">
                        {monster.name}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
                        {monster.challenge}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                        {monster.system}
                      </span>
                      <span className="text-[10px] text-zinc-400 hidden md:inline">
                        {monster.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 truncate">{monster.role}</p>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono mt-0.5">
                      {monster.resources[0] && (
                        <span className="text-rose-400">
                          {monster.resources[0].name}: {monster.resources[0].current}
                        </span>
                      )}
                      <span>
                        • {monster.attributes.slice(0, 4).map((a) => `${a.key}:${a.value}`).join(' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleBestiaryInsert(monster, false)}
                    className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="Adicionar à lista de fichas da campanha sem inserir tag no texto"
                  >
                    + Adicionar à Campanha
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBestiaryInsert(monster, true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    title="Adicionar ficha à campanha e imediatamente inserir no texto das anotações"
                  >
                    <Skull className="w-3.5 h-3.5" />
                    <span>1-Clique: Inserir no Texto</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="hidden sm:inline">
            Dica: Ao inserir no texto, você pode ajustar o PV e rolar dados diretamente do card interativo.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg ml-auto transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
