import React, { useState } from 'react';
import {
  Skull,
  Search,
  Filter,
  Plus,
  Check,
  Zap,
  Shield,
  Heart,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Edit3,
  Dices,
  Sparkles,
} from 'lucide-react';
import { BestiaryMonster, Campaign, CharacterSheet } from '../types';
import { RPG_BESTIARY } from '../data/bestiary';

interface BestiaryViewProps {
  activeCampaign?: Campaign;
  onAddMonsterToCampaign: (
    monster: BestiaryMonster,
    insertIntoCampaignText?: boolean
  ) => void;
  onGoToCampaign?: () => void;
  onCustomizeMonster?: (monster: BestiaryMonster) => void;
}

export const BestiaryView: React.FC<BestiaryViewProps> = ({
  activeCampaign,
  onAddMonsterToCampaign,
  onGoToCampaign,
  onCustomizeMonster,
}) => {
  // Pre-filter to campaign system if active campaign exists and has a match
  const defaultSystem =
    activeCampaign?.system &&
    RPG_BESTIARY.some(
      (m) =>
        m.system.toLowerCase().includes(activeCampaign.system.toLowerCase()) ||
        activeCampaign.system.toLowerCase().includes(m.system.toLowerCase())
    )
      ? RPG_BESTIARY.find(
          (m) =>
            m.system.toLowerCase().includes(activeCampaign.system.toLowerCase()) ||
            activeCampaign.system.toLowerCase().includes(m.system.toLowerCase())
        )?.system || 'ALL'
      : 'ALL';

  const [selectedSystem, setSelectedSystem] = useState<string>(defaultSystem);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>(
    RPG_BESTIARY[0]?.id || ''
  );
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  // Distinct systems & categories
  const systems = ['ALL', ...Array.from(new Set(RPG_BESTIARY.map((m) => m.system)))];
  const categories = [
    'ALL',
    ...Array.from(new Set(RPG_BESTIARY.map((m) => m.category))),
  ];

  // Filtered monsters
  const filteredMonsters = RPG_BESTIARY.filter((m) => {
    const matchesSys = selectedSystem === 'ALL' || m.system === selectedSystem;
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.challenge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSys && matchesCat && matchesSearch;
  });

  const selectedMonster =
    filteredMonsters.find((m) => m.id === selectedMonsterId) ||
    filteredMonsters[0] ||
    RPG_BESTIARY[0];

  const handleAdd = (monster: BestiaryMonster, insertInText: boolean = false) => {
    onAddMonsterToCampaign(monster, insertInText);
    setAddedNotice(
      insertInText
        ? `"${monster.name}" adicionado à campanha e inserido no texto!`
        : `"${monster.name}" adicionado à campanha com sucesso!`
    );
    setTimeout(() => setAddedNotice(null), 2500);

    if (insertInText && onGoToCampaign) {
      setTimeout(() => {
        onGoToCampaign();
      }, 500);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* Top Banner Header */}
      <div className="p-4 bg-zinc-900/90 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100 font-mono">
                Bestiário & Compêndio de Criaturas
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                {filteredMonsters.length} disponíveis
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Monstros, seres e adversários balanceados prontos para adicionar à campanha em um clique
            </p>
          </div>
        </div>

        {activeCampaign && (
          <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
            <span className="text-zinc-500">Campanha Ativa:</span>
            <span className="font-bold text-cyan-300 truncate max-w-[140px]">
              {activeCampaign.title}
            </span>
            <span className="text-[10px] text-cyan-400/80 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20 font-mono">
              {activeCampaign.system}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3 bg-zinc-900/50 border-b border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por monstro, ND, poderes..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/60"
          />
        </div>

        {/* System Filter Chips / Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] text-zinc-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-zinc-500" />
            Sistema:
          </span>
          <div className="flex items-center gap-1">
            {systems.map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() => setSelectedSystem(sys)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSystem === sys
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {sys === 'ALL' ? 'Todos' : sys}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {addedNotice && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shrink-0">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Main Split Body: Monster List + Monster Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monster List Column */}
        <div className="w-full md:w-80 lg:w-96 border-r border-zinc-800 bg-zinc-950/70 overflow-y-auto p-3 space-y-2 shrink-0">
          {filteredMonsters.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <Skull className="w-8 h-8 mx-auto opacity-30 text-zinc-600" />
              <p className="text-xs">Nenhuma criatura encontrada para estes filtros.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedSystem('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-400 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filteredMonsters.map((monster) => {
              const isSelected = selectedMonster?.id === monster.id;
              return (
                <div
                  key={monster.id}
                  onClick={() => setSelectedMonsterId(monster.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-zinc-900 border-rose-500/60 shadow-md ring-1 ring-rose-500/20'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={monster.avatarUrl}
                      alt={monster.name}
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700 bg-zinc-950 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-zinc-100 truncate">
                          {monster.name}
                        </h4>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-rose-500/15 text-rose-300 font-bold border border-rose-500/20">
                          {monster.challenge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate mt-0.5">
                        <span className="font-mono text-zinc-500">{monster.system}</span>
                        <span>•</span>
                        <span className="truncate">{monster.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(monster, false);
                    }}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-600 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Adicionar à campanha em 1 clique"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Monster Inspector */}
        {selectedMonster ? (
          <div className="hidden md:flex flex-1 flex-col bg-zinc-950 overflow-y-auto">
            {/* Monster Hero Header */}
            <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedMonster.avatarUrl}
                  alt={selectedMonster.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500/40 bg-zinc-900 shadow-xl shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-zinc-100">
                      {selectedMonster.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                      {selectedMonster.challenge}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono font-medium">
                      {selectedMonster.system}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400">
                    <strong className="text-zinc-300">{selectedMonster.category}</strong> — {selectedMonster.role}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    {selectedMonster.resources.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/30" />
                        <span className="text-zinc-400 font-medium">{res.name}:</span>
                        <span className="font-bold text-zinc-100 font-mono">
                          {res.current}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: 1-Click to Campaign */}
              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 self-stretch sm:self-auto">
                <button
                  type="button"
                  id="add-monster-to-campaign-btn"
                  onClick={() => handleAdd(selectedMonster, false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                  title="Criar ficha desta criatura na campanha ativa em um clique"
                >
                  <Plus className="w-4 h-4" />
                  <span>1-Clique: Adicionar à Campanha</span>
                </button>

                <button
                  type="button"
                  id="insert-monster-into-text-btn"
                  onClick={() => handleAdd(selectedMonster, true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                  title="Adicionar à campanha e abrir a escrita para inserir o card no texto"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Inserir no Texto da Campanha</span>
                </button>
              </div>
            </div>

            {/* Monster Attributes Grid */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Atributos do Sistema ({selectedMonster.system})</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {selectedMonster.attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-0.5"
                    >
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">
                        {attr.key}
                      </div>
                      <div className="text-sm font-bold text-cyan-300 font-mono">
                        {attr.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monster Notes, Attacks & Actions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ações, Habilidades Especiais & Estatísticas de Combate</span>
                </h4>

                <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {selectedMonster.notes}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-zinc-500 text-xs">
            Selecione uma criatura na lista para inspecionar estatísticas e adicionar à campanha.
          </div>
        )}
      </div>
    </div>
  );
};
