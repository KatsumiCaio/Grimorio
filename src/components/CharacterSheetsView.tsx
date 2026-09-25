import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Search,
  Shield,
  User,
  Heart,
  Flame,
  Brain,
  Sparkles,
  Minus,
  Dices,
  Info,
  Check,
  Wand2,
  Image as ImageIcon,
  Skull,
  Crown,
  Sword,
  ArrowLeft,
  Eye,
  EyeOff,
  BookOpen,
  Scroll,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { CharacterSheet, CharacterType, AttributeItem, ResourceBar, AppSettings } from '../types';
import { NewCharacterModal } from './NewCharacterModal';
import { ApplyTemplateModal } from './ApplyTemplateModal';
import { GeneratePortraitModal } from './GeneratePortraitModal';
import { MarkdownRenderer } from './MarkdownRenderer';

interface CharacterSheetsViewProps {
  characters: CharacterSheet[];
  activeCampaignId: string;
  campaignTitle: string;
  campaignSystem?: string;
  settings?: AppSettings;
  selectedCharacterId?: string;
  onSelectCharacter?: (id: string) => void;
  onCreateCharacter: (character: Omit<CharacterSheet, 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onUpdateCharacter: (id: string, updated: Partial<CharacterSheet>) => void;
  onDeleteCharacter: (id: string) => void;
  onOpenCampaignMenu?: () => void;
  onOpenSettings?: () => void;
  isMaster?: boolean;
  currentUserId?: string;
}

export const CharacterSheetsView: React.FC<CharacterSheetsViewProps> = ({
  characters,
  activeCampaignId,
  campaignTitle,
  campaignSystem,
  settings,
  selectedCharacterId,
  onSelectCharacter,
  onCreateCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
  onOpenCampaignMenu,
  onOpenSettings,
  isMaster = true,
  currentUserId,
}) => {
  // Filter sheets belonging to active campaign (Masters see all, players see their own + shared sheets)
  const campaignCharacters = characters.filter((c) => {
    if (c.campaignId !== activeCampaignId) return false;
    if (isMaster) return true;
    return c.userId === currentUserId || c.sharedWithPlayers === true;
  });

  const [selectedCharId, setSelectedCharId] = useState<string>(
    selectedCharacterId || campaignCharacters[0]?.id || ''
  );

  // Sync if external selectedCharacterId changes
  useEffect(() => {
    if (selectedCharacterId && campaignCharacters.some((c) => c.id === selectedCharacterId)) {
      setSelectedCharId(selectedCharacterId);
    } else if (
      (!selectedCharId || !campaignCharacters.some((c) => c.id === selectedCharId)) &&
      campaignCharacters.length > 0
    ) {
      setSelectedCharId(campaignCharacters[0].id);
    }
  }, [selectedCharacterId, activeCampaignId, campaignCharacters]);
  const [filterType, setFilterType] = useState<'ALL' | 'PJ' | 'NPC' | 'Monstro'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [activeSheetTab, setActiveSheetTab] = useState<'sheet' | 'history' | 'notes'>('sheet');
  const [historyViewMode, setHistoryViewMode] = useState<'edit' | 'preview'>('edit');
  const [historyNotice, setHistoryNotice] = useState<string | null>(null);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');
  const [isAddingAttr, setIsAddingAttr] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [rollNotification, setRollNotification] = useState<string | null>(null);

  const handleRollAttribute = (attrKey: string, attrVal: string | number) => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const num = typeof attrVal === 'number' ? attrVal : parseInt(String(attrVal).match(/\d+/)?.[0] || '10');
    const mod = !isNaN(num) && num >= 1 && num <= 30 ? Math.floor((num - 10) / 2) : 0;
    const total = d20 + mod;
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
    const isCrit = d20 === 20;
    const isFumble = d20 === 1;

    setRollNotification(
      `🎲 Teste de ${attrKey}: d20 (${d20}) ${modStr} = ${total}${isCrit ? ' 🌟 Sucesso Crítico!' : isFumble ? ' 💀 Falha Crítica!' : ''}`
    );
    setTimeout(() => setRollNotification(null), 3500);
  };

  const showHistoryToast = (msg: string) => {
    setHistoryNotice(msg);
    setTimeout(() => setHistoryNotice(null), 3000);
  };

  // Helper to insert structured story template
  const handleInsertHistoryTemplate = () => {
    if (!selectedChar) return;
    const templateText = `### 🏡 Origem & Terra Natal
Nasceu nas terras de [Local de Origem], sob a tutela de [Família, Mentor ou Clã]. Um evento definidor em sua infância foi [acontecimento marcante].

### 🎭 Personalidade & Traços
- **Virtude Maior:** [Lealdade / Justiça / Coragem / Curiosidade insaciável]
- **Fraqueza ou Vício:** [Orgulho / Desconfiança / Vingança / Cobiça por segredos]
- **Maneirismo Marcante:** [Um tique, fala mansa, olhar inquisidor ou hábito de girar uma moeda]

### 🎯 Motivação & Objetivos na Campanha
Juntou-se a esta jornada em busca de [objetivo ou redenção]. Nada o fará desistir até que [condição definitiva].

### 🤝 Vínculos & Conexões
- **Aliado ou Mentor:** [Nome de alguém do passado que lhe deve lealdade]
- **Rival ou Ameaça:** [Inimigo ou facção que o persegue nas sombras]
- **Objeto de Valor Sentimental:** [Um amuleto, arma ancestral ou carta selada]

### 👁️ Segredo Pessoal
Guarda a sete chaves que [segredo obscuro que ninguém no grupo suspeita].

### 👤 Aparência Física
Porte altivo, olhar penetrante e uma cicatriz característica em [detalhe]. Veste-se com roupas práticas e detalhes que revelam sua origem.`;

    const currentText = selectedChar.backstory?.trim() || '';
    const updated = currentText ? `${currentText}\n\n${templateText}` : templateText;
    onUpdateCharacter(selectedChar.id, { backstory: updated });
    showHistoryToast('Estrutura de história inserida com sucesso!');
  };

  // Helper to append a dynamic narrative hook
  const handleGenerateStoryHook = () => {
    if (!selectedChar) return;
    const hooks = [
      `Herdeiro de uma linhagem caída em desgraça por conspiração palaciana. Viaja incógnito buscando desvendar quem financiou a ruína de seu clã.`,
      `Sobrevivente solitário de um santuário devastado por criaturas arcanas. Carrega consigo o último fragmento de uma relíquia viva que sussurra avisos.`,
      `Fez um pacto desesperado em seu leito de morte com uma entidade esquecida. O poder foi concedido, mas a cada lua nova uma dívida cobra seu tributo.`,
      `Ex-inquisidor que descobriu podridão nos próprios dogmas que defendia. Agora protege aqueles que outrora fora ordenado a caçar.`,
      `Cresceu nas sombras das metrópoles como mensageiro de segredos proibidos. Leu uma carta que não deveria e agora é procurado por nobres e guildas.`,
      `Teve a mente tocada pelas brumas do além e despertou com memórias que não lhe pertencem. Procura desesperadamente pelo homem de seus sonhos.`,
    ];
    const picked = hooks[Math.floor(Math.random() * hooks.length)];
    const currentText = selectedChar.backstory?.trim() || '';
    const newHookSection = `\n\n> 🎲 **Gancho de Trama:** ${picked}\n`;
    onUpdateCharacter(selectedChar.id, { backstory: currentText ? `${currentText}${newHookSection}` : picked });
    showHistoryToast('Gancho narrativo adicionado à história!');
  };

  // Template Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalType, setNewModalType] = useState<CharacterType>('PJ');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);

  // Fallback to first character if current selection is invalid
  const selectedChar =
    campaignCharacters.find((c) => c.id === selectedCharId) || campaignCharacters[0];

  // Filter list
  const filteredList = campaignCharacters.filter((c) => {
    const matchesType = filterType === 'ALL' || c.type === filterType;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOpenNewModal = (type: CharacterType = 'PJ') => {
    setNewModalType(type);
    setIsNewModalOpen(true);
  };

  const handleCreatedFromModal = (
    newCharData: Omit<CharacterSheet, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const generatedId = `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    onCreateCharacter({
      ...newCharData,
      id: generatedId,
    });
    setSelectedCharId(generatedId);
    setMobileView('detail');
  };

  const handleApplyTemplate = (
    newAttributes: AttributeItem[],
    newResources?: ResourceBar[],
    newNotes?: string
  ) => {
    if (!selectedChar) return;
    const updates: Partial<CharacterSheet> = {
      attributes: newAttributes,
    };
    if (newResources) {
      updates.resources = newResources;
    }
    if (newNotes) {
      updates.notes = newNotes;
    }
    onUpdateCharacter(selectedChar.id, updates);
  };

  const handleDuplicate = (char: CharacterSheet) => {
    const duplicateId = `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    onCreateCharacter({
      id: duplicateId,
      campaignId: char.campaignId,
      name: `${char.name} (Cópia)`,
      role: char.role,
      type: char.type,
      attributes: char.attributes.map((a) => ({ ...a, id: `attr-${Date.now()}-${Math.random()}` })),
      resources: char.resources.map((r) => ({ ...r, id: `res-${Date.now()}-${Math.random()}` })),
      notes: char.notes,
      backstory: char.backstory,
      avatarUrl: char.avatarUrl,
      challengeRating: char.challengeRating,
      system: char.system,
      sharedWithPlayers: char.sharedWithPlayers,
    });
    setSelectedCharId(duplicateId);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Resources handlers
  const updateResourceValue = (resId: string, delta: number) => {
    if (!selectedChar) return;
    const updatedResources = selectedChar.resources.map((res) => {
      if (res.id === resId) {
        const nextVal = Math.max(0, Math.min(res.max, res.current + delta));
        return { ...res, current: nextVal };
      }
      return res;
    });
    onUpdateCharacter(selectedChar.id, { resources: updatedResources });
  };

  const setResourceExact = (resId: string, current: number, max?: number) => {
    if (!selectedChar) return;
    const updatedResources = selectedChar.resources.map((res) => {
      if (res.id === resId) {
        return {
          ...res,
          current: Math.max(0, current),
          max: max !== undefined ? Math.max(1, max) : res.max,
        };
      }
      return res;
    });
    onUpdateCharacter(selectedChar.id, { resources: updatedResources });
  };

  const addResource = () => {
    if (!selectedChar) return;
    const newRes: ResourceBar = {
      id: `res-${Date.now()}`,
      name: 'Mana / Recurso',
      current: 10,
      max: 10,
      color: 'blue',
    };
    onUpdateCharacter(selectedChar.id, {
      resources: [...selectedChar.resources, newRes],
    });
  };

  const removeResource = (resId: string) => {
    if (!selectedChar) return;
    onUpdateCharacter(selectedChar.id, {
      resources: selectedChar.resources.filter((r) => r.id !== resId),
    });
  };

  // Attributes handlers
  const addAttribute = () => {
    if (!selectedChar || !newAttributeKey.trim()) return;
    const newAttr: AttributeItem = {
      id: `attr-${Date.now()}`,
      key: newAttributeKey.trim().toUpperCase(),
      value: newAttributeValue.trim() || '10',
    };
    onUpdateCharacter(selectedChar.id, {
      attributes: [...selectedChar.attributes, newAttr],
    });
    setNewAttributeKey('');
    setNewAttributeValue('');
    setIsAddingAttr(false);
  };

  const updateAttribute = (attrId: string, key: string, value: string | number) => {
    if (!selectedChar) return;
    const updated = selectedChar.attributes.map((a) =>
      a.id === attrId ? { ...a, key, value } : a
    );
    onUpdateCharacter(selectedChar.id, { attributes: updated });
  };

  const removeAttribute = (attrId: string) => {
    if (!selectedChar) return;
    onUpdateCharacter(selectedChar.id, {
      attributes: selectedChar.attributes.filter((a) => a.id !== attrId),
    });
  };

  // Zero-state when no campaign is selected or all campaigns were deleted
  if (!activeCampaignId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/20">
          <Shield className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">Nenhuma Campanha Selecionada</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Para gerenciar ou criar fichas de personagens (PJs e NPCs), escolha ou crie uma campanha no menu de campanhas.
          </p>
        </div>
        {onOpenCampaignMenu && (
          <button
            type="button"
            id="empty-sheets-open-menu-btn"
            onClick={onOpenCampaignMenu}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/30 cursor-pointer transition-all"
          >
            <Shield className="w-4 h-4" />
            <span>Abrir Menu de Campanhas</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-zinc-950 text-zinc-100">
      {/* ========================================================================= */}
      {/* SIDEBAR: LISTA DE FICHAS (PJs & NPCs)                                     */}
      {/* ========================================================================= */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-800/90 flex flex-col h-full bg-zinc-950/90 shrink-0 ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}`}>
        {/* Sidebar Header */}
        <div className="p-3 sm:p-3.5 border-b border-zinc-800/80 bg-zinc-900/50 space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <Shield className="w-4 h-4 text-cyan-500 shrink-0" />
              <h2 className="text-xs font-semibold text-zinc-200 truncate">Fichas</h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono font-medium">
                {campaignCharacters.length}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 flex-wrap">
              <button
                id="create-pj-btn"
                onClick={() => handleOpenNewModal('PJ')}
                className="px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Novo Personagem de Jogador (PJ) com campos de sistema"
              >
                <Plus className="w-3 h-3" />
                <span>PJ</span>
              </button>
              <button
                id="create-npc-btn"
                onClick={() => handleOpenNewModal('NPC')}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Novo NPC com campos de sistema"
              >
                <Plus className="w-3 h-3" />
                <span>NPC</span>
              </button>
              <button
                id="create-monstro-btn"
                onClick={() => handleOpenNewModal('Monstro')}
                className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Novo Monstro ou Criatura com campos de sistema"
              >
                <Skull className="w-3 h-3 text-rose-400" />
                <span className="hidden xs:inline">Monstro</span>
              </button>
              <button
                id="open-templates-btn"
                onClick={() => handleOpenNewModal('PJ')}
                className="p-1 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-cyan-500/20 rounded-md text-[11px] transition-colors cursor-pointer"
                title="Escolher Template de Sistema (D&D, Tormenta 20, CoC, etc)"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou classe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Filters: ALL | PJ | NPC | Monstro */}
          <div className="grid grid-cols-4 gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <button
              onClick={() => setFilterType('ALL')}
              className={`py-1 rounded text-center transition-colors truncate ${
                filterType === 'ALL'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({campaignCharacters.length})
            </button>
            <button
              onClick={() => setFilterType('PJ')}
              className={`py-1 rounded text-center transition-colors truncate ${
                filterType === 'PJ'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              PJs ({campaignCharacters.filter((c) => c.type === 'PJ').length})
            </button>
            <button
              onClick={() => setFilterType('NPC')}
              className={`py-1 rounded text-center transition-colors truncate ${
                filterType === 'NPC'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              NPCs ({campaignCharacters.filter((c) => c.type === 'NPC').length})
            </button>
            <button
              onClick={() => setFilterType('Monstro')}
              className={`py-1 rounded text-center transition-colors truncate ${
                filterType === 'Monstro'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Monstros ({campaignCharacters.filter((c) => c.type === 'Monstro').length})
            </button>
          </div>
        </div>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto p-2 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-4 space-y-1.5 min-h-0">
          {filteredList.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs px-4">
              Nenhuma ficha encontrada.{' '}
              <button
                onClick={() => handleOpenNewModal('PJ')}
                className="text-cyan-400 underline hover:text-cyan-300 ml-1 cursor-pointer font-medium"
              >
                Criar a primeira
              </button>
            </div>
          ) : (
            filteredList.map((char) => {
              const isSelected = char.id === selectedChar?.id;
              const hpRes = char.resources.find((r) =>
                r.name.toLowerCase().includes('vida') || r.name.toLowerCase().includes('pv')
              );
              const hpPercent = hpRes ? Math.round((hpRes.current / (hpRes.max || 1)) * 100) : 100;

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    setSelectedCharId(char.id);
                    onSelectCharacter?.(char.id);
                    setMobileView('detail');
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-zinc-900 border-cyan-500/40 shadow-xs'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {char.avatarUrl ? (
                      <img
                        src={char.avatarUrl}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-lg object-cover border border-cyan-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                        {char.name.slice(0, 2).toUpperCase() || 'P'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-xs text-zinc-100 truncate">
                          {char.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {char.sharedWithPlayers && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30" title="Revelada para jogadores">
                              Revelada
                            </span>
                          )}
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                              char.type === 'PJ'
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {char.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="truncate">{char.role || 'Sem classe'}</span>
                        {char.creatorName && (
                          <span className="text-[10px] text-cyan-400/80 font-medium shrink-0 ml-1">
                            {char.creatorName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mini HP bar if available */}
                  {hpRes && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 text-rose-500" />
                          <span>PV</span>
                        </span>
                        <span>
                          {hpRes.current}/{hpRes.max}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            hpPercent > 50
                              ? 'bg-emerald-500'
                              : hpPercent > 25
                              ? 'bg-cyan-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAINEL PRINCIPAL: DETALHES & EDIÇÃO DA FICHA                             */}
      {/* ========================================================================= */}
      <div className={`flex-1 flex flex-col h-full overflow-y-auto min-h-0 bg-zinc-950 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8 ${mobileView === 'detail' ? 'flex' : 'hidden md:flex'}`}>
        {/* Mobile Back to List Bar */}
        <div className="md:hidden p-2.5 px-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm backdrop-blur-xs">
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold py-1.5 px-3 rounded-lg bg-zinc-800 border border-zinc-700 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lista de Fichas</span>
          </button>
          {selectedChar && (
            <span className="text-xs text-zinc-300 font-medium truncate max-w-[170px]">
              {selectedChar.name}
            </span>
          )}
        </div>

        {!selectedChar ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500">
            <User className="w-12 h-12 text-zinc-700 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300 mb-1">
              Nenhuma Ficha Selecionada
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-4">
              Selecione uma ficha na lista lateral ou crie um novo personagem para gerenciar atributos e recursos.
            </p>
            <button
              onClick={() => handleOpenNewModal('PJ')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-zinc-950 font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-cyan-950/30 transition-all"
            >
              Criar Nova Ficha com Modelo
            </button>
          </div>
        ) : (
          <div className="p-3.5 sm:p-5 md:p-8 max-w-4xl w-full mx-auto space-y-4 sm:space-y-6">
            {/* Roll Toast Notification */}
            {rollNotification && (
              <div className="p-3 bg-gradient-to-r from-cyan-500/20 via-cyan-600/30 to-cyan-500/20 border-2 border-cyan-500/60 rounded-xl flex items-center justify-between text-cyan-200 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/40 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{rollNotification}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRollNotification(null)}
                  className="text-cyan-400/70 hover:text-cyan-200 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header: Name, Role, Portrait, Type, Delete */}
            <div className="relative bg-gradient-to-b from-cyan-950/20 via-zinc-900 to-zinc-950 border-2 border-cyan-500/40 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl shadow-cyan-950/15 overflow-hidden">
              {/* Corner Filigree Ornaments */}
              <div className="absolute top-2 left-2 text-cyan-500/40 pointer-events-none select-none text-xs">⚜</div>
              <div className="absolute top-2 right-2 text-cyan-500/40 pointer-events-none select-none text-xs">⚜</div>
              <div className="absolute bottom-2 left-2 text-cyan-500/40 pointer-events-none select-none text-xs">⚜</div>
              <div className="absolute bottom-2 right-2 text-cyan-500/40 pointer-events-none select-none text-xs">⚜</div>

              <div className="flex flex-col sm:flex-row items-start gap-4 relative z-10">
                {/* Character Portrait Box */}
                <div className="relative group shrink-0">
                  {selectedChar.avatarUrl ? (
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-cyan-500/60 ring-offset-2 ring-offset-zinc-950 border border-cyan-500/50 shadow-lg shadow-cyan-950/30 group">
                      <img
                        src={selectedChar.avatarUrl}
                        alt={`Retrato de ${selectedChar.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                        <button
                          type="button"
                          onClick={() => setIsPortraitModalOpen(true)}
                          className="px-2 py-1 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold text-[10px] rounded-md transition-colors cursor-pointer"
                          title="Alterar imagem do personagem"
                        >
                          Trocar
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateCharacter(selectedChar.id, { avatarUrl: undefined })}
                          className="text-rose-400 hover:text-rose-300 text-[10px] underline cursor-pointer"
                          title="Remover retrato da ficha"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPortraitModalOpen(true)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-cyan-500/80 bg-zinc-950/80 hover:bg-zinc-900/80 flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-cyan-400 transition-all cursor-pointer group shadow-inner"
                      title="Adicionar Retrato do Personagem"
                    >
                      <ImageIcon className="w-5 h-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                      <span className="text-[10px] font-bold text-center leading-tight px-1 text-zinc-400 group-hover:text-cyan-300">
                        Adicionar Retrato
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          id="character-name-input"
                          type="text"
                          value={selectedChar.name}
                          onChange={(e) => onUpdateCharacter(selectedChar.id, { name: e.target.value })}
                          placeholder="Nome do Personagem"
                          className="text-lg md:text-xl font-bold bg-transparent text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-b border-cyan-500/60 w-full"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedChar.role}
                        onChange={(e) => onUpdateCharacter(selectedChar.id, { role: e.target.value })}
                        placeholder="Papel / Classe / Conceito (ex: Ladino Assassino Nv 4)"
                        className="text-xs md:text-sm text-zinc-400 bg-transparent placeholder:text-zinc-600 focus:outline-none focus:border-b border-cyan-500/60 w-full"
                      />
                    </div>

                    {/* Actions & Type Switch */}
                    <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsPortraitModalOpen(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                        title="Adicionar ou alterar imagem do personagem"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="hidden md:inline">Retrato</span>
                      </button>

                      <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
                        <button
                          onClick={() => onUpdateCharacter(selectedChar.id, { type: 'PJ' })}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                            selectedChar.type === 'PJ'
                              ? 'bg-cyan-500 text-zinc-950'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          PJ
                        </button>
                        <button
                          onClick={() => onUpdateCharacter(selectedChar.id, { type: 'NPC' })}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                            selectedChar.type === 'NPC'
                              ? 'bg-zinc-800 text-cyan-300'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          NPC
                        </button>
                      </div>

                      {/* Master visibility toggle button */}
                      {isMaster && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateCharacter(selectedChar.id, {
                              sharedWithPlayers: !selectedChar.sharedWithPlayers,
                            })
                          }
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            selectedChar.sharedWithPlayers
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                          title={
                            selectedChar.sharedWithPlayers
                              ? 'Ficha revelada para todos os jogadores na mesa. Clique para ocultar.'
                              : 'Ficha oculta dos jogadores (apenas o mestre vê). Clique para revelar.'
                          }
                        >
                          {selectedChar.sharedWithPlayers ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden md:inline">Revelada</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="hidden md:inline">Oculta</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleDuplicate(selectedChar)}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                        title="Duplicar Ficha"
                      >
                        {copiedNotification ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Excluir a ficha de "${selectedChar.name}"?`)) {
                            onDeleteCharacter(selectedChar.id);
                          }
                        }}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
                        title="Excluir Ficha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Character Sheet Tab Navigation */}
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-x-auto scrollbar-none shadow-sm shrink-0">
              <button
                type="button"
                id="sheet-tab-attributes"
                onClick={() => setActiveSheetTab('sheet')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSheetTab === 'sheet'
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-950/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Ficha & Atributos</span>
              </button>

              <button
                type="button"
                id="sheet-tab-history"
                onClick={() => setActiveSheetTab('history')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap relative ${
                  activeSheetTab === 'history'
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-950/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>História & Biografia</span>
                {selectedChar.backstory?.trim() ? (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeSheetTab === 'history' ? 'bg-zinc-950' : 'bg-cyan-400 animate-pulse'
                    }`}
                    title="História preenchida"
                  />
                ) : (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                      activeSheetTab === 'history' ? 'bg-zinc-950/20 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    novo
                  </span>
                )}
              </button>

              <button
                type="button"
                id="sheet-tab-notes"
                onClick={() => setActiveSheetTab('notes')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeSheetTab === 'notes'
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-950/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Sword className="w-3.5 h-3.5" />
                <span>Equipamento & Magias</span>
              </button>
            </div>

            {/* TAB 1: FICHA & ATRIBUTOS */}
            {activeSheetTab === 'sheet' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Section 1: Barras de Recursos (HP, Mana, Sanidade, etc.) */}
                <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Flame className="w-4 h-4 text-cyan-500" />
                  <span>Barras de Recursos em Tempo Real</span>
                </div>
                <button
                  onClick={addResource}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Recurso
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {selectedChar.resources.map((res) => {
                  const percent = Math.round((res.current / (res.max || 1)) * 100);
                  const isLow = percent < 30;

                  return (
                    <div
                      key={res.id}
                      className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3.5 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={res.name}
                          onChange={(e) => {
                            const updated = selectedChar.resources.map((r) =>
                              r.id === res.id ? { ...r, name: e.target.value } : r
                            );
                            onUpdateCharacter(selectedChar.id, { resources: updated });
                          }}
                          className="text-xs font-semibold text-zinc-200 bg-transparent focus:outline-none focus:border-b border-cyan-500/50"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={res.current}
                            onChange={(e) =>
                              setResourceExact(res.id, parseInt(e.target.value) || 0)
                            }
                            className="w-12 bg-zinc-900 border border-zinc-800 text-center font-mono font-bold text-xs text-cyan-400 rounded py-0.5"
                          />
                          <span className="text-zinc-600 text-xs">/</span>
                          <input
                            type="number"
                            value={res.max}
                            onChange={(e) =>
                              setResourceExact(res.id, res.current, parseInt(e.target.value) || 1)
                            }
                            className="w-12 bg-zinc-900 border border-zinc-800 text-center font-mono text-xs text-zinc-400 rounded py-0.5"
                          />
                          <button
                            onClick={() => removeResource(res.id)}
                            className="p-1 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            title="Remover barra"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar Visual */}
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            res.color === 'blue'
                              ? 'bg-sky-500'
                              : res.color === 'purple'
                              ? 'bg-purple-500'
                              : res.color === 'amber'
                              ? 'bg-cyan-500'
                              : isLow
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
                        />
                      </div>

                      {/* Quick Adjust Buttons (-5, -1, +1, +5) for GM */}
                      <div className="flex items-center justify-end gap-1 text-[10px] font-mono">
                        <button
                          onClick={() => updateResourceValue(res.id, -5)}
                          className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 hover:border-zinc-700"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateResourceValue(res.id, -1)}
                          className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 hover:border-zinc-700"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateResourceValue(res.id, 1)}
                          className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 rounded border border-zinc-800 hover:border-zinc-700 font-bold"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => updateResourceValue(res.id, 5)}
                          className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-cyan-400 rounded border border-zinc-800 hover:border-zinc-700 font-bold"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Atributos Rápidos (Flexíveis para Qualquer Sistema) */}
            <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Brain className="w-4 h-4 text-cyan-500" />
                  <span>Atributos Rápidos & Perícias (Adaptável a qualquer RPG)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="apply-template-btn"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="text-xs text-zinc-300 hover:text-cyan-300 flex items-center gap-1.5 font-medium px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 hover:border-cyan-500/50 rounded-lg transition-colors cursor-pointer"
                    title="Reaplicar ou trocar modelo de atributos (D&D, OSR, CoC...)"
                  >
                    <Dices className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Reaplicar Modelo</span>
                  </button>
                  <button
                    id="add-attribute-btn"
                    onClick={() => setIsAddingAttr(!isAddingAttr)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Novo Atributo
                  </button>
                </div>
              </div>

              {/* Form to add custom attribute */}
              {isAddingAttr && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center gap-2 animate-in fade-in duration-100">
                  <input
                    type="text"
                    placeholder="Chave (ex: SANIDADE, FOR, AGIL)"
                    value={newAttributeKey}
                    onChange={(e) => setNewAttributeKey(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 uppercase"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Valor (ex: 16 ou +3 ou 65%)"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    className="w-28 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200"
                  />
                  <button
                    onClick={addAttribute}
                    className="px-3 py-1 bg-cyan-500 text-zinc-950 font-semibold rounded text-xs hover:bg-cyan-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setIsAddingAttr(false)}
                    className="px-2 py-1 text-zinc-400 hover:text-zinc-200 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Attributes Grid with Ornate Runic Heraldic Styling */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {selectedChar.attributes.map((attr) => {
                  const num = typeof attr.value === 'number' ? attr.value : parseInt(String(attr.value).match(/\d+/)?.[0] || '');
                  const hasValidMod = !isNaN(num) && num >= 1 && num <= 30;
                  const mod = hasValidMod ? Math.floor((num - 10) / 2) : null;
                  const modStr = mod !== null ? (mod >= 0 ? `+${mod}` : `${mod}`) : null;

                  return (
                    <div
                      key={attr.id}
                      className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-cyan-500/30 hover:border-cyan-500/70 rounded-xl p-2.5 text-center relative group flex flex-col items-center justify-between shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all"
                    >
                      {/* Top decorative notch */}
                      <div className="w-4 h-0.5 bg-cyan-500/40 group-hover:bg-cyan-400 rounded-full mb-1 transition-colors" />

                      <button
                        onClick={() => removeAttribute(attr.id)}
                        className="absolute top-1 right-1 p-0.5 text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Excluir atributo"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>

                      <input
                        type="text"
                        value={attr.key}
                        onChange={(e) => updateAttribute(attr.id, e.target.value.toUpperCase(), attr.value)}
                        className="text-[11px] font-bold text-cyan-300 uppercase text-center bg-transparent w-full focus:outline-none font-serif tracking-wider"
                      />

                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => updateAttribute(attr.id, attr.key, e.target.value)}
                        className="text-base sm:text-lg font-black font-mono text-zinc-100 group-hover:text-cyan-200 text-center bg-transparent w-full focus:outline-none my-0.5"
                      />

                      {/* Modifier Chip and D20 Roll Trigger */}
                      <button
                        type="button"
                        onClick={() => handleRollAttribute(attr.key, attr.value)}
                        className="w-full mt-1 py-0.5 px-1 rounded-md bg-zinc-900 hover:bg-cyan-500/20 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title={`Rolar d20 ${modStr || ''} para ${attr.key}`}
                      >
                        <Dices className="w-3 h-3 text-cyan-400" />
                        <span>{modStr ? modStr : 'rolar'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

                {/* Resumo Rápido da História na Ficha */}
                <div className="bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                      <BookOpen className="w-4 h-4 text-cyan-500" />
                      <span>História & Origem de {selectedChar.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSheetTab('history')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{selectedChar.backstory?.trim() ? 'Ver e Editar História Completa' : 'Escrever História'}</span>
                      <span>→</span>
                    </button>
                  </div>
                  {selectedChar.backstory?.trim() ? (
                    <div className="text-xs text-zinc-300 bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3.5 line-clamp-4 leading-relaxed font-sans whitespace-pre-wrap">
                      {selectedChar.backstory}
                    </div>
                  ) : (
                    <div className="text-center py-4 px-3 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800/80 space-y-2">
                      <p className="text-xs text-zinc-400">
                        Este personagem ainda não possui história registrada.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveSheetTab('history')}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Abrir Aba de História & Biografia
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: HISTÓRIA & BIOGRAFIA */}
            {activeSheetTab === 'history' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Story Notification Toast */}
                {historyNotice && (
                  <div className="p-3 bg-cyan-500/15 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs font-semibold flex items-center justify-between animate-fadeIn shadow-lg shadow-cyan-950/20">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{historyNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHistoryNotice(null)}
                      className="text-cyan-400/70 hover:text-cyan-200 text-xs p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Story Workspace Header Card */}
                <div className="bg-gradient-to-b from-cyan-950/20 via-zinc-900 to-zinc-950 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md shadow-cyan-950/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
                          <span>História, Origem & Biografia</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            {selectedChar.type}
                          </span>
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          Construa a narrativa, as origens, os laços e os segredos de {selectedChar.name}
                        </p>
                      </div>
                    </div>

                    {/* Metrics & Save Status */}
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 shrink-0 self-end sm:self-center font-mono">
                      <span>
                        <strong className="text-zinc-200">
                          {selectedChar.backstory?.trim() ? selectedChar.backstory.trim().split(/\s+/).length : 0}
                        </strong>{' '}
                        palavras
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span className="font-sans text-[10px]">Salvo na campanha</span>
                      </span>
                    </div>
                  </div>

                  {/* Toolbar: Template Generator, Prompt Hook, Mode Toggle, Clear */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleInsertHistoryTemplate}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Inserir estrutura pronta com Origem, Personalidade, Motivação, Vínculos e Segredo"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inserir Estrutura Completa</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateStoryHook}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-300 border border-zinc-700/70 hover:border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        title="Sortear gancho narrativo e adicionar à história"
                      >
                        <Dices className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sortear Gancho de Trama</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit / Preview Toggle */}
                      <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setHistoryViewMode('edit')}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                            historyViewMode === 'edit'
                              ? 'bg-cyan-500 text-zinc-950 font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Escrever
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryViewMode('preview')}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                            historyViewMode === 'preview'
                              ? 'bg-cyan-500 text-zinc-950 font-bold'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Pré-visualizar
                        </button>
                      </div>

                      {selectedChar.backstory?.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Tem certeza de que deseja limpar a história de "${selectedChar.name}"?`)) {
                              onUpdateCharacter(selectedChar.id, { backstory: '' });
                              showHistoryToast('História limpa com sucesso.');
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Limpar história"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Editor or Preview Pane */}
                {historyViewMode === 'edit' ? (
                  <div className="space-y-2">
                    <textarea
                      value={selectedChar.backstory || ''}
                      onChange={(e) => onUpdateCharacter(selectedChar.id, { backstory: e.target.value })}
                      rows={14}
                      placeholder="Escreva a biografia e história deste personagem...&#10;&#10;Dicas de inspiração:&#10;• Onde ele nasceu e como foi sua infância?&#10;• Que evento trágico ou glorioso definiu sua vida?&#10;• Qual é a sua motivação para se aventurar na campanha?&#10;• Quem são seus aliados, mentores ou maiores inimigos?&#10;• Que segredo ou dívida ele guarda com receio de ser descoberto?&#10;&#10;Suporta formatação Markdown (### títulos, - listas, **negrito**, > citações)."
                      className="w-full bg-zinc-950 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 leading-relaxed focus:outline-none focus:border-cyan-500/60 resize-y shadow-inner font-sans selection:bg-cyan-500/30"
                    />
                  </div>
                ) : (
                  <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-5 sm:p-6 shadow-inner min-h-[300px]">
                    {selectedChar.backstory?.trim() ? (
                      <MarkdownRenderer
                        content={selectedChar.backstory}
                        className="prose-zinc max-w-none text-zinc-200 leading-relaxed text-xs sm:text-sm"
                      />
                    ) : (
                      <div className="py-12 text-center text-zinc-500 space-y-2">
                        <BookOpen className="w-8 h-8 mx-auto opacity-30 text-zinc-600" />
                        <p className="text-xs">Nenhum texto de história escrito ainda.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryViewMode('edit');
                            handleInsertHistoryTemplate();
                          }}
                          className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
                        >
                          Clique aqui para inserir o modelo inicial
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* RPG Narrative Roleplay Spark Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <span>🏡</span> Origem & Passado
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      De onde veio sua família? Que tradições ou cicatrizes de sua terra natal moldam seu comportamento?
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <span>🎯</span> Motivação Central
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      O que o fez deixar a segurança do lar? O que ele busca conquistar antes que seus dias terminem?
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <span>🤝</span> Vínculos & Lealdades
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Quem é a pessoa pela qual arriscaria a própria vida? Existe alguma organização ou templo a quem deve obediência?
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                      <span>👁️</span> O Segredo Oculto
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Qual pecado, dívida de sangue ou verdade oculta o personagem esconde até mesmo de seus companheiros de mesa?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: EQUIPAMENTO & MAGIAS */}
            {activeSheetTab === 'notes' && (
              <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                    <Sparkles className="w-4 h-4 text-cyan-500" />
                    <span>Equipamento, Talentos & Anotações</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPortraitModalOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-medium"
                    title="Adicionar ou trocar retrato deste personagem"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Definir Retrato</span>
                  </button>
                </div>

                <textarea
                  value={selectedChar.notes}
                  onChange={(e) => onUpdateCharacter(selectedChar.id, { notes: e.target.value })}
                  rows={8}
                  placeholder="Insira detalhes de armas, itens mágicos, perícias, fraquezas ou segredos que o mestre preparou para este personagem..."
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl p-3.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-700 leading-relaxed focus:outline-none focus:border-cyan-500/50 resize-y"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criação de Ficha com Seletor de Modelos de RPG */}
      <NewCharacterModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        campaignId={activeCampaignId}
        campaignSystem={campaignSystem}
        initialType={newModalType}
        onCreateCharacter={handleCreatedFromModal}
      />

      {/* Modal para Reaplicar Modelo de Atributos na Ficha Selecionada */}
      {selectedChar && (
        <ApplyTemplateModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          character={selectedChar}
          campaignSystem={campaignSystem}
          onApplyTemplate={handleApplyTemplate}
        />
      )}

      {/* Modal de Retrato do Personagem (Upload, Galeria, URL) */}
      {selectedChar && (
        <GeneratePortraitModal
          isOpen={isPortraitModalOpen}
          onClose={() => setIsPortraitModalOpen(false)}
          character={selectedChar}
          campaignSystem={campaignSystem}
          onApplyPortrait={(imageUrl) => {
            onUpdateCharacter(selectedChar.id, { avatarUrl: imageUrl });
          }}
        />
      )}
    </div>
  );
};
