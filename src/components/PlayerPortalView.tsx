import React, { useState, useEffect } from 'react';
import {
  Shield,
  BookOpen,
  Image as ImageIcon,
  Scroll,
  Plus,
  Edit2,
  Trash2,
  Save,
  Dices,
  Lock,
  ExternalLink,
  Users,
  Eye,
  Sparkles,
  Heart,
  ChevronRight,
  Flame,
  CheckCircle2,
  Brain,
  Wand2,
  Award,
  Zap,
  Check,
} from 'lucide-react';
import { Campaign, CharacterSheet, UserProfile, CampaignSharedItem, ResourceBar } from '../types';
import { NewCharacterModal } from './NewCharacterModal';
import { EditCharacterModal } from './EditCharacterModal';
import { findTemplateBySystem, createSystemCharacter } from '../data/sheetTemplates';

interface PlayerPortalViewProps {
  campaign: Campaign;
  currentUser: UserProfile;
  characters: CharacterSheet[];
  onCreateCharacter: (char: CharacterSheet) => void;
  onUpdateCharacter: (char: CharacterSheet) => void;
  onSavePlayerNotes: (notes: string) => void;
  onOpenTableModal: () => void;
  onOpenCampaignMenu: () => void;
}

export const PlayerPortalView: React.FC<PlayerPortalViewProps> = ({
  campaign,
  currentUser,
  characters,
  onCreateCharacter,
  onUpdateCharacter,
  onSavePlayerNotes,
  onOpenTableModal,
  onOpenCampaignMenu,
}) => {
  // Find current player's member record in campaign
  const memberRecord = campaign.members?.find((m) => m.userId === currentUser.id);

  // Player's notes in this campaign
  const [playerNotes, setPlayerNotes] = useState(memberRecord?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Modals state
  const [isNewCharModalOpen, setIsNewCharModalOpen] = useState(false);
  const [isEditCharModalOpen, setIsEditCharModalOpen] = useState(false);

  // Quick dice rolling state
  const [recentRolls, setRecentRolls] = useState<
    Array<{ die: string; result: number; note?: string; timestamp: number }>
  >([]);

  // Find player's character in this campaign
  const myCharacter = characters.find(
    (c) =>
      c.campaignId === campaign.id &&
      (c.userId === currentUser.id || c.id === memberRecord?.characterId)
  );

  // Shared items from master
  const sharedItems = campaign.sharedItems || [];
  const revealedCharacters = characters.filter(
    (c) => c.campaignId === campaign.id && c.sharedWithPlayers && c.id !== myCharacter?.id
  );

  // Active template for campaign system
  const activeTemplate = findTemplateBySystem(campaign.system);

  // Inline Quick creation state
  const [isInlineCreating, setIsInlineCreating] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickRole, setQuickRole] = useState(activeTemplate.defaultRolePJ);
  const [quickArchetype, setQuickArchetype] = useState<string>('');

  // Synchronize player notes when changed from remote
  useEffect(() => {
    if (memberRecord?.notes !== undefined && memberRecord.notes !== playerNotes) {
      setPlayerNotes(memberRecord.notes);
    }
  }, [memberRecord?.notes]);

  // Debounced auto-save for player notes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (playerNotes !== (memberRecord?.notes || '')) {
        setIsSavingNotes(true);
        onSavePlayerNotes(playerNotes);
        setTimeout(() => {
          setIsSavingNotes(false);
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 400);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [playerNotes, memberRecord?.notes, onSavePlayerNotes]);

  // Quick roll die
  const handleRollDie = (sides: number) => {
    const result = Math.floor(Math.random() * sides) + 1;
    const dieName = `d${sides}`;
    setRecentRolls((prev) => [{ die: dieName, result, timestamp: Date.now() }, ...prev.slice(0, 4)]);
  };

  // Adjust any resource value
  const handleAdjustResource = (resourceId: string, delta: number) => {
    if (!myCharacter) return;
    const res = myCharacter.resources.find((r) => r.id === resourceId);
    if (!res) return;

    const newCurrent = Math.max(0, Math.min(res.max, res.current + delta));
    const nextResources = myCharacter.resources.map((r) =>
      r.id === resourceId ? { ...r, current: newCurrent } : r
    );
    onUpdateCharacter({
      ...myCharacter,
      resources: nextResources,
      updatedAt: Date.now(),
    });
  };

  // Quick Archetype 1-Click creation
  const handleCreateWithArchetype = (archetypeId: string) => {
    const charData = createSystemCharacter({
      campaignId: campaign.id,
      systemName: campaign.system,
      name: `${currentUser.displayName}`,
      userId: currentUser.id,
      masterId: campaign.masterId || campaign.userId,
      creatorName: currentUser.displayName,
      archetypeId,
    });

    const fullChar: CharacterSheet = {
      ...charData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateCharacter(fullChar);
  };

  // Inline form submit with system template
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const charData = createSystemCharacter({
      campaignId: campaign.id,
      systemName: campaign.system,
      name: quickName.trim(),
      role: quickRole.trim() || activeTemplate.defaultRolePJ,
      userId: currentUser.id,
      masterId: campaign.masterId || campaign.userId,
      creatorName: currentUser.displayName,
      archetypeId: quickArchetype || undefined,
    });

    const fullChar: CharacterSheet = {
      ...charData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateCharacter(fullChar);
    setQuickName('');
    setIsInlineCreating(false);
  };

  // System-specific roll logic for attributes
  const handleRollAttribute = (key: string, rawVal: string | number) => {
    const numVal = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal), 10) || 10;
    const sys = (myCharacter?.system || campaign.system || '').toLowerCase();

    // Call of Cthulhu: 1d100 test against characteristic
    if (sys.includes('cthulhu') || sys.includes('coc') || numVal > 25) {
      const roll = Math.floor(Math.random() * 100) + 1;
      let degree = 'Falha';
      if (roll === 1) degree = 'Sucesso Crítico!';
      else if (roll <= Math.floor(numVal / 5)) degree = 'Sucesso Extremo!';
      else if (roll <= Math.floor(numVal / 2)) degree = 'Bom Sucesso!';
      else if (roll <= numVal) degree = 'Sucesso Regular';
      else if (roll >= 96) degree = 'Desastre / Fumble!';

      setRecentRolls((prev) => [
        {
          die: `1d100 vs ${key} (${numVal})`,
          result: roll,
          note: degree,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 4),
      ]);
      return;
    }

    // 3D&T: 1d6 + Habilidade / Característica
    if (sys.includes('3d&t') || sys.includes('3det')) {
      const roll = Math.floor(Math.random() * 6) + 1;
      const total = roll + numVal;
      setRecentRolls((prev) => [
        {
          die: `1d6 (${roll}) + ${key} (${numVal})`,
          result: total,
          note: roll === 6 ? 'Crítico!' : undefined,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 4),
      ]);
      return;
    }

    // Ordem Paranormal: roll dice pool of d20s equal to attribute
    if (sys.includes('ordem') || sys.includes('paranormal')) {
      const diceCount = Math.max(1, Math.min(10, numVal));
      const rolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 20) + 1);
      const highest = Math.max(...rolls);
      setRecentRolls((prev) => [
        {
          die: `${diceCount}d20 [${rolls.join(', ')}]`,
          result: highest,
          note: highest === 20 ? 'Crítico!' : `Maior de ${key}`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 4),
      ]);
      return;
    }

    // Tormenta 20, D&D 5e, Pathfinder 2e: standard d20 + modifier
    let mod = numVal;
    if (numVal >= 8 && numVal <= 30 && !sys.includes('t20') && !sys.includes('tormenta')) {
      // D&D 5e score -> mod
      mod = Math.floor((numVal - 10) / 2);
    }
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + mod;
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;

    setRecentRolls((prev) => [
      {
        die: `1d20 (${d20}) ${modStr} [${key}]`,
        result: total,
        note: d20 === 20 ? '20 Natural!' : d20 === 1 ? '1 Natural!' : undefined,
        timestamp: Date.now(),
      },
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden font-sans">
      {/* Player Top Banner */}
      <div className="px-5 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-zinc-100">{campaign.title}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                Portal do Jogador
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Mestre: <span className="text-zinc-300 font-medium">{campaign.masterName || 'Mestre da Masmorra'}</span> • Sistema:{' '}
              <span className="text-cyan-300 font-semibold">{campaign.system}</span>
            </p>
          </div>
        </div>

        {/* Quick actions for player */}
        <div className="flex items-center gap-2">
          {/* Quick Dice Bar */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            <span className="text-[10px] font-semibold text-zinc-400 mr-1 flex items-center gap-1">
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Dados:</span>
            </span>
            {[20, 6, 8, 10, 12, 100].map((d) => (
              <button
                key={d}
                onClick={() => handleRollDie(d)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                title={`Rolar 1d${d}`}
              >
                d{d}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenTableModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Mesa ({campaign.members?.length || 1})</span>
          </button>
        </div>
      </div>

      {/* Security & Sync Bar */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-5 py-2 text-xs text-zinc-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Privacidade da Mesa:</strong> As anotações secretas do Mestre estão protegidas. Sua ficha e diário são sincronizados automaticamente com o Mestre.
          </span>
        </div>
        {recentRolls.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-[11px] text-amber-300 font-mono bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-800/40">
            <span>Última Rolagem:</span>
            <span className="font-bold text-amber-200">
              {recentRolls[0].die} = {recentRolls[0].result}
            </span>
            {recentRolls[0].note && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans font-semibold">
                {recentRolls[0].note}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main 3-Column Player Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto">
        {/* COLUMN 1: MY CHARACTER SHEET (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-zinc-100">Meu Personagem</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400/90 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sincronizado com Mestre</span>
                </span>
                {myCharacter && (
                  <button
                    onClick={() => setIsEditCharModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-cyan-400" />
                    <span>Editar Ficha</span>
                  </button>
                )}
              </div>
            </div>

            {myCharacter ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold overflow-hidden shrink-0">
                        {myCharacter.avatarUrl ? (
                          <img src={myCharacter.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          myCharacter.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-zinc-100">{myCharacter.name}</h4>
                        <p className="text-xs text-zinc-400">{myCharacter.role}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">
                          {myCharacter.system || campaign.system}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      PJ Ativo
                    </span>
                  </div>

                  {/* Resources Bars Tracker (PV, PM, PE, Sanidade, etc.) */}
                  <div className="mt-4 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-400">Recursos de Combate:</span>
                      <span className="text-[10px] text-zinc-500">Mestre tem acesso em tempo real</span>
                    </div>

                    {myCharacter.resources.map((res) => {
                      const pct = Math.max(0, Math.min(100, (res.current / (res.max || 1)) * 100));
                      const isLow = pct <= 25;
                      const isHp = res.name.toLowerCase().includes('vida') || res.name.toLowerCase().includes('pv');

                      return (
                        <div key={res.id} className="space-y-1.5 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                              {isHp ? (
                                <Heart className={`w-3.5 h-3.5 ${isLow ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
                              ) : (
                                <Zap className="w-3.5 h-3.5 text-blue-400" />
                              )}
                              <span>{res.name}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-zinc-200 text-xs">
                                <strong className="text-zinc-100">{res.current}</strong> / {res.max}
                              </span>
                              {/* Quick Adjustment +/- buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleAdjustResource(res.id, -5)}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-red-950 text-red-300 text-[10px] font-mono font-bold cursor-pointer"
                                  title="Remover 5"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => handleAdjustResource(res.id, -1)}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-red-950 text-red-300 text-[10px] font-mono font-bold cursor-pointer"
                                  title="Remover 1"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustResource(res.id, 1)}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold cursor-pointer"
                                  title="Adicionar 1"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleAdjustResource(res.id, 5)}
                                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold cursor-pointer"
                                  title="Adicionar 5"
                                >
                                  +5
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isHp
                                  ? isLow
                                    ? 'bg-red-600'
                                    : 'bg-gradient-to-r from-red-500 to-rose-400'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Attributes Grid with system-based click-to-roll */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Atributos do Sistema (Clique para Rolar):
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {campaign.system}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {myCharacter.attributes.map((attr) => {
                        const numVal = typeof attr.value === 'number' ? attr.value : Number(attr.value);
                        const isScore = !isNaN(numVal) && numVal >= 8 && numVal <= 30 && !campaign.system.toLowerCase().includes('t20');
                        const mod = isScore ? Math.floor((numVal - 10) / 2) : numVal;
                        const modLabel = !isNaN(mod) ? (mod >= 0 ? `+${mod}` : `${mod}`) : '';

                        return (
                          <button
                            key={attr.id}
                            onClick={() => handleRollAttribute(attr.key, attr.value)}
                            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all text-center cursor-pointer group"
                            title={`Rolar teste de ${attr.key}`}
                          >
                            <span className="block text-[10px] font-bold text-zinc-400 group-hover:text-cyan-400">
                              {attr.key}
                            </span>
                            <span className="block text-sm font-extrabold text-zinc-100">{attr.value}</span>
                            {modLabel && (
                              <span className="block text-[10px] font-mono text-cyan-400">{modLabel}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Character Spells/Equipment preview */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-zinc-400">
                      Equipamentos, Magias & Anotações:
                    </span>
                    <button
                      onClick={() => setIsEditCharModalOpen(true)}
                      className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      Editar Anotações
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono whitespace-pre-wrap">
                    {myCharacter.notes || 'Sem anotações de equipamento.'}
                  </div>
                </div>
              </div>
            ) : (
              /* PLAYER HAS NO CHARACTER YET: SYSTEM GUIDED SETUP */
              <div className="flex-1 flex flex-col space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/20 to-zinc-950 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                        <span>Ficha do Sistema:</span>
                        <span className="text-cyan-400 font-mono">{activeTemplate.name}</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {activeTemplate.description}
                      </p>
                    </div>
                  </div>

                  {/* System Attributes Preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Atributos Oficiais deste Sistema:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeTemplate.attributes.map((a) => (
                        <span
                          key={a.key}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-mono"
                          title={a.label}
                        >
                          {a.key}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* System Resources Preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      Recursos de Combate:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeTemplate.resources.map((r) => (
                        <span
                          key={r.name}
                          className="px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[10px] font-medium"
                        >
                          {r.name} ({r.current})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Master Guarantee Notice */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/30 flex items-center gap-2 text-[11px] text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      O Mestre (<strong>{campaign.masterName || 'Mestre da Masmorra'}</strong>) terá acesso total e em tempo real a esta ficha assim que ela for criada.
                    </span>
                  </div>
                </div>

                {/* Primary Action: Open Full System Character Modal */}
                <button
                  id="btn-open-system-character-modal"
                  onClick={() => setIsNewCharModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Montar Ficha Completa no Sistema ({activeTemplate.name})</span>
                </button>

                {/* Quick Archetype 1-Click Cards */}
                {activeTemplate.archetypes && activeTemplate.archetypes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-400 block">
                      Ou escolha um Arquétipo Pronto (1-Clique):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeTemplate.archetypes.map((arch) => (
                        <button
                          key={arch.id}
                          onClick={() => handleCreateWithArchetype(arch.id)}
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-cyan-500/60 hover:bg-zinc-900 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-zinc-100 group-hover:text-cyan-400">
                              {arch.name}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400" />
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {arch.description}
                          </p>
                          <span className="inline-block mt-2 text-[10px] text-cyan-400 font-medium">
                            Montar como {arch.rolePJ} →
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Inline Quick Creation Form */}
                <div className="pt-2 border-t border-zinc-800/80">
                  {isInlineCreating ? (
                    <form onSubmit={handleQuickSubmit} className="space-y-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">Criação Rápida de Ficha</span>
                        <button
                          type="button"
                          onClick={() => setIsInlineCreating(false)}
                          className="text-xs text-zinc-400 hover:text-zinc-200"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Nome do Personagem</label>
                        <input
                          type="text"
                          value={quickName}
                          onChange={(e) => setQuickName(e.target.value)}
                          placeholder="e.g. Sir Gideon, o Guardião"
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                          required
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Classe / Conceito</label>
                        <input
                          type="text"
                          value={quickRole}
                          onChange={(e) => setQuickRole(e.target.value)}
                          placeholder={`Padrão: ${activeTemplate.defaultRolePJ}`}
                          className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs cursor-pointer"
                        >
                          Salvar e Vincular ao Mestre
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsInlineCreating(true)}
                      className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 cursor-pointer transition-colors"
                    >
                      Preenchimento Rápido com Nome Personalizado
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: MASTER REVELATIONS & SHARED HANDOUTS (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-100">Mural do Mestre</h3>
              </div>
              <span className="text-[11px] text-zinc-400">
                {sharedItems.length} foto(s) / pista(s)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {sharedItems.length === 0 ? (
                <div className="text-center py-12 px-3 rounded-xl border border-dashed border-zinc-800 text-zinc-400 text-xs space-y-2">
                  <Scroll className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p>O Mestre ainda não revelou nenhuma foto, mapa ou pista nesta sessão.</p>
                  <p className="text-[11px] text-zinc-400">
                    Quando o Mestre compartilhar mapas ou documentos, eles aparecerão aqui instantaneamente.
                  </p>
                </div>
              ) : (
                sharedItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-sm"
                  >
                    {item.url && (
                      <div className="relative aspect-video bg-zinc-900 overflow-hidden group">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-2 right-2 p-1 rounded bg-black/70 text-zinc-200 hover:text-white"
                          title="Ver em tamanho real"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                    <div className="p-3 space-y-1.5">
                      <h4 className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
                        {item.type === 'image' ? (
                          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Scroll className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>{item.title}</span>
                      </h4>
                      {item.content && (
                        <p className="text-[11px] text-zinc-300 font-serif leading-relaxed whitespace-pre-wrap bg-zinc-900/60 p-2 rounded border border-zinc-800/80">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Revealed NPC Sheets */}
              {revealedCharacters.length > 0 && (
                <div className="pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-2">
                    Fichas Reveladas pelo Mestre ({revealedCharacters.length}):
                  </span>
                  <div className="space-y-2">
                    {revealedCharacters.map((npc) => (
                      <div
                        key={npc.id}
                        className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-zinc-200 block">{npc.name}</span>
                          <span className="text-[10px] text-zinc-400">{npc.role}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {npc.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: MY ADVENTURE DIARY / NOTES (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-zinc-100">Meu Diário de Aventura</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                {isSavingNotes ? (
                  <span className="text-amber-400 animate-pulse">Salvando...</span>
                ) : lastSavedTime ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Salvo às {lastSavedTime}</span>
                  </span>
                ) : (
                  <span>Acesso com o Mestre</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2">
              Suas anotações pessoais durante as sessões (pistas descobertas, inventário, teorias). O Mestre pode acompanhar seu diário.
            </p>

            <textarea
              value={playerNotes}
              onChange={(e) => setPlayerNotes(e.target.value)}
              placeholder="Escreva aqui seu diário de campanha...&#10;&#10;Exemplo:&#10;- Conhecemos o taverneiro manco que nos deu uma dica sobre a floresta.&#10;- Preciso comprar 10 tochas e corda de seda.&#10;- Suspeitamos que o barão não seja quem diz ser..."
              className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-400 resize-none font-sans leading-relaxed shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* New Character Creation Modal configured for this system */}
      {isNewCharModalOpen && (
        <NewCharacterModal
          isOpen={isNewCharModalOpen}
          onClose={() => setIsNewCharModalOpen(false)}
          campaignId={campaign.id}
          campaignSystem={campaign.system}
          initialType="PJ"
          isPlayerMode={true}
          playerName={currentUser.displayName}
          masterId={campaign.masterId || campaign.userId}
          onCreateCharacter={(char) => {
            onCreateCharacter({
              ...char,
              id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              userId: currentUser.id,
              masterId: campaign.masterId || campaign.userId,
              creatorName: currentUser.displayName,
              system: activeTemplate.system,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            setIsNewCharModalOpen(false);
          }}
        />
      )}

      {/* Edit Character Modal */}
      {isEditCharModalOpen && myCharacter && (
        <EditCharacterModal
          isOpen={isEditCharModalOpen}
          character={myCharacter}
          onClose={() => setIsEditCharModalOpen(false)}
          onSave={(updated) => {
            onUpdateCharacter({
              ...updated,
              masterId: myCharacter.masterId || campaign.masterId || campaign.userId,
              userId: myCharacter.userId || currentUser.id,
              system: myCharacter.system || campaign.system,
            });
            setIsEditCharModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
