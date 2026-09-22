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
} from 'lucide-react';
import { Campaign, CharacterSheet, UserProfile, CampaignSharedItem } from '../types';

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

  // Quick dice rolling state
  const [recentRolls, setRecentRolls] = useState<
    Array<{ die: string; result: number; timestamp: number }>
  >([]);

  // Find player's character in this campaign
  const myCharacter = characters.find(
    (c) => c.campaignId === campaign.id && (c.userId === currentUser.id || c.id === memberRecord?.characterId)
  );

  // Shared items from master
  const sharedItems = campaign.sharedItems || [];
  const revealedCharacters = characters.filter(
    (c) => c.campaignId === campaign.id && c.sharedWithPlayers && c.id !== myCharacter?.id
  );

  // Character creation modal state
  const [isCreatingChar, setIsCreatingChar] = useState(false);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharHp, setNewCharHp] = useState(20);

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

  // Handle character creation for player
  const handleCreateMyCharSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    const char: CharacterSheet = {
      id: `char-p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      campaignId: campaign.id,
      userId: currentUser.id,
      creatorName: currentUser.displayName,
      name: newCharName.trim(),
      role: newCharRole.trim() || 'Aventureiro',
      type: 'PJ',
      attributes: [
        { id: 'a1', key: 'FOR', value: 10 },
        { id: 'a2', key: 'DES', value: 10 },
        { id: 'a3', key: 'CON', value: 10 },
        { id: 'a4', key: 'INT', value: 10 },
        { id: 'a5', key: 'SAB', value: 10 },
        { id: 'a6', key: 'CAR', value: 10 },
      ],
      resources: [
        { id: 'r1', name: 'Pontos de Vida (PV)', current: newCharHp, max: newCharHp, color: 'emerald' },
        { id: 'r2', name: 'Mana / Habilidade', current: 5, max: 5, color: 'blue' },
      ],
      notes: `# Histórico & Equipamentos\n- Escreva aqui as magias, ataques e inventário do seu personagem.\n- O Mestre terá acesso direto a esta ficha.`,
      sharedWithPlayers: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateCharacter(char);
    setNewCharName('');
    setNewCharRole('');
    setIsCreatingChar(false);
  };

  // Adjust HP
  const handleAdjustHp = (delta: number) => {
    if (!myCharacter) return;
    const hpResource = myCharacter.resources.find((r) => r.name.toLowerCase().includes('vida') || r.name.toLowerCase().includes('pv'));
    if (!hpResource) return;

    const newCurrent = Math.max(0, Math.min(hpResource.max, hpResource.current + delta));
    const nextResources = myCharacter.resources.map((r) => (r.id === hpResource.id ? { ...r, current: newCurrent } : r));
    onUpdateCharacter({
      ...myCharacter,
      resources: nextResources,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden font-sans">
      {/* Player Top Banner */}
      <div className="px-5 py-3 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-zinc-100">{campaign.title}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                Portal do Jogador
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Mestre: <span className="text-zinc-300 font-medium">{campaign.masterName || 'Mestre da Masmorra'}</span> • Sistema:{' '}
              <span className="text-zinc-300 font-medium">{campaign.system}</span>
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

      {/* Secret GM Notes Privacy Notice */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-5 py-2 text-xs text-zinc-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>Privacidade da Mesa Ativa:</strong> As anotações secretas e capítulos do Mestre estão protegidos e ocultos para garantir a surpresa da campanha.
          </span>
        </div>
        {recentRolls.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-[11px] text-amber-300 font-mono bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-800/40">
            <span>Última Rolagem:</span>
            <span className="font-bold text-amber-200">
              {recentRolls[0].die} = {recentRolls[0].result}
            </span>
          </div>
        )}
      </div>

      {/* Main 3-Column Player Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-y-auto">
        {/* COLUMN 1: MY CHARACTER SHEET (5 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-zinc-100">Meu Personagem</h3>
              </div>
              <span className="text-[11px] text-emerald-400/90 font-medium">Sincronizado com o Mestre</span>
            </div>

            {myCharacter ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-bold text-zinc-100">{myCharacter.name}</h4>
                      <p className="text-xs text-zinc-400">{myCharacter.role}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      PJ Ativo
                    </span>
                  </div>

                  {/* HP & Resources Quick Tracker */}
                  <div className="mt-4 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                    {myCharacter.resources.map((res) => (
                      <div key={res.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-red-400" />
                            <span>{res.name}</span>
                          </span>
                          <span className="font-mono text-zinc-200">
                            <strong>{res.current}</strong> / {res.max}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-300"
                            style={{ width: `${Math.max(0, Math.min(100, (res.current / (res.max || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Quick HP Adjustment Buttons */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <span className="text-[10px] text-zinc-400">Ajuste de PV:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustHp(-5)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-red-950 text-red-300 text-xs font-mono font-bold border border-zinc-800 cursor-pointer"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustHp(-1)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-red-950 text-red-300 text-xs font-mono font-bold border border-zinc-800 cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjustHp(1)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-zinc-800 cursor-pointer"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjustHp(5)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-zinc-800 cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attributes Grid with click-to-roll */}
                  <div className="mt-4">
                    <span className="block text-[11px] font-semibold text-zinc-400 mb-2">
                      Atributos (Clique para Rolar d20 + Bônus):
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {myCharacter.attributes.map((attr) => {
                        const numVal = typeof attr.value === 'number' ? attr.value : Number(attr.value) || 10;
                        const mod = Math.floor((numVal - 10) / 2);
                        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                        return (
                          <button
                            key={attr.id}
                            onClick={() => {
                              const roll = Math.floor(Math.random() * 20) + 1;
                              const total = roll + mod;
                              setRecentRolls((prev) => [
                                { die: `${attr.key} (${roll} ${modStr})`, result: total, timestamp: Date.now() },
                                ...prev.slice(0, 4),
                              ]);
                            }}
                            className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition-all text-center cursor-pointer group"
                            title={`Rolar teste de ${attr.key}`}
                          >
                            <span className="block text-[10px] font-bold text-zinc-400 group-hover:text-amber-400">
                              {attr.key}
                            </span>
                            <span className="block text-sm font-extrabold text-zinc-100">{attr.value}</span>
                            <span className="block text-[10px] font-mono text-amber-400">{modStr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Character Spells/Notes preview */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Equipamentos & Magias:
                  </span>
                  <div className="max-h-36 overflow-y-auto text-xs text-zinc-300 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono whitespace-pre-wrap">
                    {myCharacter.notes || 'Sem anotações de equipamento.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-200">Você ainda não tem uma ficha nesta campanha</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Crie seu personagem para participar das sessões. O Mestre terá acesso em tempo real aos seus atributos e status.
                  </p>
                </div>

                {isCreatingChar ? (
                  <form onSubmit={handleCreateMyCharSubmit} className="w-full space-y-3 text-left pt-2">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Nome do Personagem</label>
                      <input
                        type="text"
                        value={newCharName}
                        onChange={(e) => setNewCharName(e.target.value)}
                        placeholder="e.g. Valerius, o Paladino"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-emerald-400"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Classe / Raça / Conceito</label>
                      <input
                        type="text"
                        value={newCharRole}
                        onChange={(e) => setNewCharRole(e.target.value)}
                        placeholder="e.g. Humano Paladino Nv 3"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Pontos de Vida Iniciais (PV)</label>
                      <input
                        type="number"
                        value={newCharHp}
                        onChange={(e) => setNewCharHp(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-emerald-400 font-mono"
                        min={1}
                        max={999}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsCreatingChar(false)}
                        className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs cursor-pointer"
                      >
                        Salvar Personagem
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingChar(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-950/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Minha Ficha</span>
                  </button>
                )}
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

        {/* COLUMN 3: MY ADVENTURE DIARY / NOTES (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
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
                  <span>Acesso compartilhado com o Mestre</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 mb-2">
              Suas anotações pessoais durante as sessões (pistas descobertas, teorias, nomes de NPCs). O Mestre também pode acompanhar seu diário.
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
    </div>
  );
};
