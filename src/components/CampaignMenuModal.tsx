import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Dices,
  Users,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Sparkles,
  Scroll,
  Shield,
  Layers,
  FolderOpen,
  Copy,
  Lock,
} from 'lucide-react';
import { Campaign, CharacterSheet } from '../types';
import { RPG_SYSTEMS, POPULAR_SYSTEM_GROUPS } from '../data/rpgSystems';

interface CampaignMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  activeCampaignId: string;
  characters: CharacterSheet[];
  currentUserId?: string;
  onSelectCampaign: (id: string) => void;
  onCreateCampaign: (title: string, system: string) => void;
  onUpdateCampaign: (id: string, updated: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  onDeleteAllCampaigns: (options?: { deleteCharacters?: boolean }) => Promise<void> | void;
  onJoinCampaignByCode?: (code: string) => Promise<{ success: boolean; error?: string }>;
}

export const CampaignMenuModal: React.FC<CampaignMenuModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  activeCampaignId,
  characters,
  currentUserId,
  onSelectCampaign,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onDeleteAllCampaigns,
  onJoinCampaignByCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSystem, setNewSystem] = useState('D&D 5e');
  const [customSystem, setCustomSystem] = useState('');

  // Join by code state
  const [isJoiningByCode, setIsJoiningByCode] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isJoiningLoading, setIsJoiningLoading] = useState(false);
  const [joinErrorMessage, setJoinErrorMessage] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);

  // Inline editing state for campaign title
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Danger zone: Delete all campaigns confirmation state
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [alsoDeleteCharacters, setAlsoDeleteCharacters] = useState(true);
  const [isDeletingAllProcess, setIsDeletingAllProcess] = useState(false);

  // Filter campaigns by search
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.system && c.system.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [campaigns, searchQuery]);

  // Handle join campaign by invite code
  const handleJoinCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim() || !onJoinCampaignByCode) return;
    setIsJoiningLoading(true);
    setJoinErrorMessage(null);
    try {
      const res = await onJoinCampaignByCode(inviteCodeInput.trim());
      if (res.success) {
        setIsJoiningByCode(false);
        setInviteCodeInput('');
        onClose();
      } else {
        setJoinErrorMessage(res.error || 'Código de convite inválido ou campanha não encontrada.');
      }
    } catch (err: any) {
      setJoinErrorMessage(err?.message || 'Erro ao conectar à campanha.');
    } finally {
      setIsJoiningLoading(false);
    }
  };

  // Copy invite code helper
  const handleCopyCode = (campId: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedInviteId(campId);
    setTimeout(() => setCopiedInviteId(null), 2000);
  };

  // Select campaign and close modal
  const handleSelect = (id: string) => {
    onSelectCampaign(id);
    onClose();
  };

  // Handle create new campaign
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newTitle.trim() || 'Nova Campanha';
    const finalSystem = newSystem === 'custom' ? customSystem.trim() || 'Sistema Próprio' : newSystem;
    onCreateCampaign(finalTitle, finalSystem);
    setNewTitle('');
    setCustomSystem('');
    setIsCreating(false);
    onClose();
  };

  // Start editing campaign title
  const handleStartEdit = (camp: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCampaignId(camp.id);
    setEditingTitleText(camp.title);
  };

  // Save edited title
  const handleSaveEdit = (campId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitleText.trim()) {
      onUpdateCampaign(campId, { title: editingTitleText.trim() });
    }
    setEditingCampaignId(null);
  };

  // Delete single campaign
  const handleDeleteSingle = (camp: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    const charCount = characters.filter((c) => c.campaignId === camp.id).length;
    const msg = charCount > 0
      ? `Excluir a campanha "${camp.title}"?\n\nEla possui ${charCount} ficha(s) vinculada(s). Todas as anotações do mestre desta campanha serão apagadas.`
      : `Excluir a campanha "${camp.title}" e todas as suas anotações?`;

    if (confirm(msg)) {
      onDeleteCampaign(camp.id);
    }
  };

  // Confirm delete all campaigns
  const handleConfirmDeleteAll = async () => {
    if (deleteConfirmationInput.trim().toUpperCase() !== 'APAGAR') return;
    setIsDeletingAllProcess(true);
    try {
      await onDeleteAllCampaigns({ deleteCharacters: alsoDeleteCharacters });
      setIsConfirmingDeleteAll(false);
      setDeleteConfirmationInput('');
      onClose();
    } catch (err) {
      console.error('Erro ao excluir todas as campanhas:', err);
    } finally {
      setIsDeletingAllProcess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        id="campaign-menu-modal"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/20 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">
                  Menu de Campanhas
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-cyan-400 font-mono font-medium border border-cyan-500/20">
                  {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Selecione qual campanha deseja abrir, crie novas aventuras ou gerencie suas mesas.
              </p>
            </div>
          </div>
          <button
            id="close-campaign-menu-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View 1: Delete All Campaigns Confirmation View */}
        {isConfirmingDeleteAll ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-200">
                    Atenção: Exclusão de TODAS as Campanhas
                  </h3>
                  <p className="text-xs text-rose-300/90 leading-relaxed">
                    Você está prestes a apagar permanentemente todas as{' '}
                    <strong className="underline text-white font-bold">{campaigns.length} campanhas</strong>{' '}
                    cadastradas no seu grimório, juntamente com todos os seus cadernos de anotações e históricos de conversas com o Copiloto IA tanto localmente quanto na nuvem.
                  </p>
                </div>
              </div>
            </div>

            {/* Checkbox: also delete characters */}
            <div className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={alsoDeleteCharacters}
                  onChange={(e) => setAlsoDeleteCharacters(e.target.checked)}
                  className="rounded border-zinc-700 text-rose-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <div className="text-xs text-zinc-200">
                  <span className="font-semibold">Também apagar todas as fichas de personagens</span>
                  <span className="text-zinc-400 block text-[11px]">
                    Atualmente você possui {characters.length} ficha(s) (PJs e NPCs). Desmarque caso deseje mantê-las.
                  </span>
                </div>
              </label>
            </div>

            {/* Type APAGAR confirmation field */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Para confirmar a exclusão em massa, digite <span className="font-mono text-rose-400 font-bold bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/60">APAGAR</span> abaixo:
              </label>
              <input
                type="text"
                id="delete-all-confirmation-input"
                placeholder="Digite APAGAR para prosseguir"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg px-3.5 py-2 text-xs text-zinc-100 font-mono tracking-wider placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDeleteAll(false);
                  setDeleteConfirmationInput('');
                }}
                disabled={isDeletingAllProcess}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                id="confirm-delete-all-btn"
                onClick={handleConfirmDeleteAll}
                disabled={deleteConfirmationInput.trim().toUpperCase() !== 'APAGAR' || isDeletingAllProcess}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeletingAllProcess ? 'Apagando tudo...' : 'Confirmar Exclusão de Todas as Campanhas'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* View 2: Main Campaign Selection & Management View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Top Toolbar: Search & New Campaign Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="campaign-search-input"
                  type="text"
                  placeholder="Buscar campanha por título ou sistema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Action Buttons: Join by Code & New Campaign */}
              <div className="flex items-center gap-2">
                {onJoinCampaignByCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsJoiningByCode((prev) => !prev);
                      setIsCreating(false);
                      setJoinErrorMessage(null);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isJoiningByCode
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Entrar com Código</span>
                  </button>
                )}

                <button
                  type="button"
                  id="modal-create-campaign-toggle-btn"
                  onClick={() => {
                    setIsCreating((prev) => !prev);
                    setIsJoiningByCode(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCreating
                      ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-md shadow-cyan-950/20'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'Fechar Formulário' : 'Nova Campanha'}</span>
                </button>
              </div>
            </div>

            {/* Inline Join Campaign by Code Form */}
            {isJoiningByCode && (
              <form
                onSubmit={handleJoinCodeSubmit}
                className="p-4 bg-zinc-900/95 border border-amber-500/40 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Users className="w-4 h-4" />
                    <span>Entrar em Campanha como Jogador</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsJoiningByCode(false)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Digite o código de 6 dígitos que seu Mestre compartilhou (ex:{' '}
                  <code className="font-mono text-amber-300 font-bold bg-zinc-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                    GRM-8X2L
                  </code>
                  ). Você poderá adicionar seu personagem e acompanhar fotos e pistas reveladas pela mesa, mantendo as anotações do mestre em sigilo.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Código de Convite (ex: W4K8N2)"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    maxLength={12}
                    className="flex-1 bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-amber-200 font-mono tracking-widest uppercase placeholder:text-zinc-600 focus:outline-none"
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isJoiningLoading || !inviteCodeInput.trim()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    {isJoiningLoading ? 'Conectando...' : 'Entrar na Mesa'}
                  </button>
                </div>

                {joinErrorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{joinErrorMessage}</span>
                  </div>
                )}
              </form>
            )}

            {/* Inline New Campaign Form */}
            {isCreating && (
              <form
                onSubmit={handleCreateSubmit}
                className="p-4 bg-zinc-900/80 border border-cyan-500/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Criar Nova Campanha</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Título da Aventura
                    </label>
                    <input
                      type="text"
                      id="new-campaign-modal-title"
                      placeholder="Ex: A Maldição da Lua de Sangue"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      autoFocus
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Sistema de Regras
                    </label>
                    <select
                      id="new-campaign-modal-system"
                      value={newSystem}
                      onChange={(e) => setNewSystem(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {POPULAR_SYSTEM_GROUPS.map((group) => (
                        <optgroup key={group.group} label={group.group} className="bg-zinc-900 text-zinc-400">
                          {group.systems.map((s) => (
                            <option key={s.id} value={s.shortName} className="text-zinc-200">
                              {s.name} ({s.diceConvention})
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="custom" className="text-cyan-400 font-bold">
                        Outro / Sistema Próprio...
                      </option>
                    </select>
                  </div>
                </div>

                {newSystem === 'custom' && (
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Nome do Sistema Customizado
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Savage Worlds, 3D&T, Gurps..."
                      value={customSystem}
                      onChange={(e) => setCustomSystem(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    id="submit-create-campaign-btn"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/30 cursor-pointer"
                  >
                    <span>Criar e Abrir Campanha</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Campaigns Grid / Cards */}
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 px-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-300">
                    {campaigns.length === 0 ? 'Nenhuma campanha cadastrada' : 'Nenhuma campanha encontrada na busca'}
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
                    {campaigns.length === 0
                      ? 'Crie sua primeira campanha para começar a escrever anotações de sessão, gerenciar fichas e consultar o Copiloto IA.'
                      : 'Tente buscar por outro termo ou limpe o filtro de busca acima.'}
                  </p>
                </div>
                {campaigns.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Primeira Campanha</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCampaigns.map((camp) => {
                  const isActive = camp.id === activeCampaignId;
                  const campChars = characters.filter((c) => c.campaignId === camp.id);
                  const pjCount = campChars.filter((c) => c.type === 'PJ').length;
                  const npcCount = campChars.filter((c) => c.type === 'NPC').length;
                  const isEditingThisTitle = editingCampaignId === camp.id;

                  const isUserMaster = !currentUserId || camp.userId === currentUserId || camp.masterId === currentUserId;
                  const memberCount = camp.members?.length || 1;
                  const inviteCode = camp.inviteCode || 'GRM-MES';
                  const isCopied = copiedInviteId === camp.id;

                  // Date format
                  const updatedDate = new Date(camp.updatedAt || camp.createdAt || Date.now());
                  const formattedDate = updatedDate.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={camp.id}
                      id={`campaign-card-${camp.id}`}
                      onClick={() => !isEditingThisTitle && handleSelect(camp.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group relative ${
                        isActive
                          ? 'bg-cyan-500/10 border-cyan-500/80 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/40'
                          : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      {/* Top Row: Title + System Badge */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          {isEditingThisTitle ? (
                            <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingTitleText}
                                onChange={(e) => setEditingTitleText(e.target.value)}
                                autoFocus
                                className="w-full bg-zinc-950 border border-cyan-500 rounded px-2 py-0.5 text-xs text-zinc-100 font-bold"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleSaveEdit(camp.id, e)}
                                className="p-1 bg-cyan-500 text-zinc-950 rounded hover:bg-cyan-400"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-zinc-100 truncate group-hover:text-cyan-300 transition-colors">
                                {camp.title}
                              </h3>
                              {isUserMaster && (
                                <button
                                  type="button"
                                  onClick={(e) => handleStartEdit(camp, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-200 rounded transition-opacity"
                                  title="Renomear título"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Active badge */}
                          {isActive && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-cyan-400 text-zinc-950 font-bold flex items-center gap-1 shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Ativa</span>
                            </span>
                          )}
                        </div>

                        {/* Badges: Role, System, and Invite Code */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isUserMaster ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                              <span>👑 Mestre</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1">
                              <span>🎲 Jogador ({camp.masterName || 'Mestre'})</span>
                            </span>
                          )}

                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 border border-zinc-700/80 font-mono font-medium flex items-center gap-1">
                            <Dices className="w-3 h-3 text-cyan-400" />
                            <span>{camp.system || 'D&D 5e'}</span>
                          </span>

                          {/* Quick copy invite code */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(camp.id, inviteCode, e)}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copiar código de convite para outros jogadores"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>{isCopied ? 'Copiado!' : inviteCode}</span>
                          </button>
                        </div>

                        {/* Notes Preview snippet or Privacy Notice */}
                        {isUserMaster ? (
                          camp.notes ? (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                              {camp.notes.replace(/[#*`_]/g, '').trim() || 'Sem anotações no caderno.'}
                            </p>
                          ) : null
                        ) : (
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 italic">
                            <Lock className="w-3 h-3 text-amber-500/70 shrink-0" />
                            <span>Anotações e capítulos do Mestre protegidos em sigilo.</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Characters Count + Members + Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex items-center gap-3 text-[11px] flex-wrap">
                          <span className="flex items-center gap-1 text-amber-300 font-medium" title="Membros na mesa">
                            <Users className="w-3 h-3 text-amber-400" />
                            <span>{memberCount} {memberCount === 1 ? 'membro' : 'membros'}</span>
                          </span>

                          {isUserMaster && camp.chapters && camp.chapters.length > 0 && (
                            <span className="flex items-center gap-1 text-cyan-300 font-medium">
                              <BookOpen className="w-3 h-3 text-cyan-400" />
                              <span>{camp.chapters.length} {camp.chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-zinc-300">
                            <Shield className="w-3 h-3 text-zinc-400" />
                            <span>{campChars.length} fichas</span>
                          </span>

                          {campChars.length > 0 && (
                            <span className="text-zinc-500 hidden sm:inline">
                              ({pjCount} PJs, {npcCount} NPCs)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Delete individual campaign button */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(camp, e)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title={`Excluir campanha "${camp.title}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelect(camp.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-zinc-800 text-zinc-200 hover:bg-cyan-500 hover:text-zinc-950'
                            }`}
                          >
                            <span>{isActive ? 'Aberta' : 'Abrir'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        {!isConfirmingDeleteAll && (
          <div className="p-3.5 sm:p-4 border-t border-zinc-800/90 bg-zinc-900/70 flex items-center justify-between gap-3 shrink-0">
            {/* Danger Zone: Delete All Campaigns trigger */}
            {campaigns.length > 0 ? (
              <button
                type="button"
                id="open-delete-all-confirmation-btn"
                onClick={() => setIsConfirmingDeleteAll(true)}
                className="px-2.5 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                title="Apagar permanentemente todas as campanhas"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Apagar Todas as Campanhas</span>
              </button>
            ) : (
              <div />
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
