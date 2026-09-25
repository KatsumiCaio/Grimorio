import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  Image as ImageIcon,
  FileText,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  BookOpen,
  Shield,
  User,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Scroll,
  HelpCircle,
} from 'lucide-react';
import { Campaign, CampaignMember, CampaignSharedItem, CharacterSheet, UserProfile } from '../types';
import { storageService } from '../services/storage';

interface CampaignTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  characters: CharacterSheet[];
  currentUser: UserProfile;
  isMaster: boolean;
  onUpdateCampaign: (updated: Partial<Campaign>) => void;
  onAddSharedItem: (item: CampaignSharedItem) => void;
  onRemoveSharedItem: (itemId: string) => void;
  onToggleCharacterShared: (characterId: string, shared: boolean) => void;
  onSelectCharacterToView?: (characterId: string) => void;
}

export const CampaignTableModal: React.FC<CampaignTableModalProps> = ({
  isOpen,
  onClose,
  campaign,
  characters,
  currentUser,
  isMaster,
  onUpdateCampaign,
  onAddSharedItem,
  onRemoveSharedItem,
  onToggleCharacterShared,
  onSelectCharacterToView,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'shared' | 'sheets'>('members');
  const [copiedCode, setCopiedCode] = useState(false);

  // New shared item form
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemType, setNewItemType] = useState<'image' | 'handout'>('image');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemContent, setNewItemContent] = useState('');

  // Selected player notes to inspect
  const [inspectingPlayer, setInspectingPlayer] = useState<CampaignMember | null>(null);
  const [inspectingCharacter, setInspectingCharacter] = useState<CharacterSheet | null>(null);

  if (!isOpen) return null;

  const inviteCode = campaign.inviteCode || 'GRM-MES';
  const members = campaign.members || [
    {
      userId: campaign.userId || currentUser.id,
      displayName: campaign.masterName || currentUser.displayName,
      role: 'master',
      joinedAt: campaign.createdAt || Date.now(),
    },
  ];
  const sharedItems = campaign.sharedItems || [];
  const campaignCharacters = characters.filter((c) => c.campaignId === campaign.id);

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateSharedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const item: CampaignSharedItem = {
      id: `shared-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      campaignId: campaign.id,
      title: newItemTitle.trim(),
      type: newItemType,
      category: newItemType === 'image' ? 'photo' : 'document',
      url: newItemType === 'image' ? newItemUrl.trim() : '',
      content: newItemContent.trim() || '',
      sharedBy: currentUser.id,
      sharedAt: Date.now(),
    };

    onAddSharedItem(item);
    setNewItemTitle('');
    setNewItemUrl('');
    setNewItemContent('');
    setIsAddingItem(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 truncate">{campaign.title}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 shrink-0">
                  {campaign.system}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
                {isMaster ? 'Painel do Mestre: Gerencie jogadores, compartilhe pistas e fotos' : 'Mesa de Jogo e Conteúdo Compartilhado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invite Code Bar */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-900 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 font-medium">Código de Convite:</span>
            <span className="font-mono text-xs sm:text-sm font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-zinc-800 border border-amber-500/40 text-amber-300 tracking-wider">
              {inviteCode}
            </span>
            <button
              onClick={handleCopyInviteCode}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-all cursor-pointer"
              title="Copiar código para enviar aos jogadores"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copiado!' : 'Copiar Convite'}</span>
            </button>
          </div>
          <span className="text-[11px] text-zinc-400 hidden md:inline">
            Outros jogadores usam este código no menu "Entrar em Campanha".
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-3 sm:px-6 pt-2 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'members'
                ? 'border-amber-400 text-amber-300 bg-zinc-900/50 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Membros ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shared')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'shared'
                ? 'border-amber-400 text-amber-300 bg-zinc-900/50 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Fotos & Pistas ({sharedItems.length})</span>
          </button>

          {isMaster && (
            <button
              onClick={() => setActiveTab('sheets')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'sheets'
                  ? 'border-amber-400 text-amber-300 bg-zinc-900/50 rounded-t-lg'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Revelar Fichas ({campaignCharacters.filter((c) => c.sharedWithPlayers).length})</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Jogadores conectados nesta campanha. O Mestre tem acesso completo às fichas e anotações dos jogadores.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => {
                  const isUserMaster = member.role === 'master';
                  const playerSheet = campaignCharacters.find(
                    (c) => c.userId === member.userId || c.id === member.characterId
                  );

                  return (
                    <div
                      key={member.userId}
                      className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold overflow-hidden">
                            {member.avatarUrl && member.avatarUrl.startsWith('http') ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              member.displayName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-zinc-100">{member.displayName}</span>
                              {isUserMaster ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                  👑 Mestre
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                                  🎲 Jogador
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-400">
                              {playerSheet ? `Personagem: ${playerSheet.name} (${playerSheet.role})` : 'Ainda sem ficha vinculada'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for Master inspecting player data */}
                      {!isUserMaster && isMaster && (
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                          {playerSheet && (
                            <button
                              onClick={() => setInspectingCharacter(playerSheet)}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium border border-cyan-800/50 transition-colors cursor-pointer"
                            >
                              <Shield className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Ver Ficha ({playerSheet.name})</span>
                            </button>
                          )}
                          <button
                            onClick={() => setInspectingPlayer(member)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                            <span>Ver Diário & Anotações</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Master Character Sheet Inspector Modal */}
              {inspectingCharacter && (
                <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 max-w-2xl w-full max-h-[85vh] flex flex-col space-y-4 shadow-2xl">
                    <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold overflow-hidden shrink-0">
                          {inspectingCharacter.avatarUrl ? (
                            <img src={inspectingCharacter.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            inspectingCharacter.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-zinc-100">{inspectingCharacter.name}</h3>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                              {inspectingCharacter.system || campaign.system}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">{inspectingCharacter.role}</p>
                          <span className="text-[11px] text-zinc-500">
                            Criada por: <strong className="text-zinc-300">{inspectingCharacter.creatorName || 'Jogador'}</strong>
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setInspectingCharacter(null)}
                        className="text-zinc-400 hover:text-zinc-100 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Resources */}
                    <div className="space-y-2">
                      <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                        Recursos & Status de Combate:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {inspectingCharacter.resources.map((res) => (
                          <div key={res.id} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-zinc-300">{res.name}</span>
                              <span className="font-mono text-zinc-200">
                                <strong>{res.current}</strong> / {res.max}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-cyan-500"
                                style={{ width: `${Math.max(0, Math.min(100, (res.current / (res.max || 1)) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Attributes */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                        Atributos do Sistema:
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {inspectingCharacter.attributes.map((attr) => (
                          <div key={attr.id} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-center">
                            <span className="block text-[10px] font-bold text-zinc-400">{attr.key}</span>
                            <span className="block text-sm font-extrabold text-zinc-100">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes & Equipment */}
                    <div className="flex-1 overflow-y-auto space-y-1">
                      <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                        Equipamentos, Magias & Histórico:
                      </span>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-300 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                        {inspectingCharacter.notes || 'Sem anotações ou equipamentos informados.'}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                      {onSelectCharacterToView && (
                        <button
                          onClick={() => {
                            onSelectCharacterToView(inspectingCharacter.id);
                            setInspectingCharacter(null);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Abrir no Gerenciador Completo de Fichas
                        </button>
                      )}
                      <button
                        onClick={() => setInspectingCharacter(null)}
                        className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer ml-auto"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Player Notes Inspector Modal */}
              {inspectingPlayer && (
                <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-xl w-full max-h-[80vh] flex flex-col space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <div>
                        <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span>Anotações & Diário de {inspectingPlayer.displayName}</span>
                        </h3>
                        <p className="text-xs text-zinc-400">
                          Visualização do Mestre: anotações que o jogador registrou durante as sessões.
                        </p>
                      </div>
                      <button
                        onClick={() => setInspectingPlayer(null)}
                        className="text-zinc-400 hover:text-zinc-100 p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {(inspectingPlayer.notes?.trim() || storageService.getPlayerCampaignNotes(campaign.id, inspectingPlayer.userId)?.trim()) || (
                        <span className="text-zinc-400 italic">
                          O jogador ainda não escreveu nenhuma anotação em seu diário nesta campanha.
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setInspectingPlayer(null)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SHARED ITEMS (PHOTOS, MAPS, HANDOUTS) */}
          {activeTab === 'shared' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Mural de Revelações do Mestre</h3>
                  <p className="text-xs text-zinc-400">
                    Fotos, mapas e pistas compartilhadas para todos os jogadores visualizarem.
                  </p>
                </div>
                {isMaster && (
                  <button
                    onClick={() => setIsAddingItem(!isAddingItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Compartilhar Foto ou Pista</span>
                  </button>
                )}
              </div>

              {/* Add Shared Item Form (Master only) */}
              {isMaster && isAddingItem && (
                <form
                  onSubmit={handleCreateSharedItem}
                  className="p-4 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300">Novo Conteúdo para Revelar aos Jogadores</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(false)}
                      className="text-zinc-400 hover:text-zinc-200 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewItemType('image')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                        newItemType === 'image'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Foto ou Mapa (URL)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemType('handout')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                        newItemType === 'handout'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Carta, Pista ou Texto
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Título / Descrição Curta</label>
                    <input
                      type="text"
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      placeholder={newItemType === 'image' ? 'e.g. Mapa Antigo das Catacumbas' : 'e.g. Bilhete Manchado de Sangue'}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  {newItemType === 'image' && (
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">URL da Imagem / Foto / Mapa</label>
                      <input
                        type="url"
                        value={newItemUrl}
                        onChange={(e) => setNewItemUrl(e.target.value)}
                        placeholder="https://exemplo.com/mapa.jpg"
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      {newItemType === 'image' ? 'Legenda ou Pista Adicional (Opcional)' : 'Conteúdo do Texto / Carta (Markdown)'}
                    </label>
                    <textarea
                      value={newItemContent}
                      onChange={(e) => setNewItemContent(e.target.value)}
                      rows={3}
                      placeholder={newItemType === 'image' ? 'Detalhe o que os personagens notam à primeira vista...' : 'Escreva a carta ou pista que os heróis encontraram...'}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-amber-400 resize-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs cursor-pointer"
                    >
                      Revelar na Mesa
                    </button>
                  </div>
                </form>
              )}

              {/* Shared Items Grid */}
              {sharedItems.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40">
                  <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-zinc-400">Nenhum conteúdo compartilhado ainda.</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    {isMaster
                      ? 'Como Mestre, você pode compartilhar imagens de mapas, retratos de NPCs, cartas antigas e pistas para os jogadores explorarem.'
                      : 'O Mestre ainda não revelou nenhuma foto ou pista nesta sessão.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sharedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col justify-between"
                    >
                      {item.url && (
                        <div className="relative aspect-video bg-zinc-900 border-b border-zinc-800 overflow-hidden group">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-black/70 text-zinc-200 hover:text-white hover:bg-black/90 transition-colors"
                            title="Abrir imagem em tamanho original"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      <div className="p-4 space-y-2 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                            {item.type === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <Scroll className="w-4 h-4 text-blue-400 shrink-0" />
                            )}
                            <span>{item.title}</span>
                          </h4>
                          {isMaster && (
                            <button
                              onClick={() => onRemoveSharedItem(item.id)}
                              className="text-zinc-400 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Remover do mural dos jogadores"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {item.content && (
                          <div className="text-xs text-zinc-300 whitespace-pre-wrap bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/80 font-serif">
                            {item.content}
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-2 bg-zinc-900/30 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Revelado pelo Mestre</span>
                        <span>{new Date(item.sharedAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHARED CHARACTER SHEETS (NPCs & Monsters) */}
          {activeTab === 'sheets' && isMaster && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Controle de Visibilidade de Fichas</h3>
                <p className="text-xs text-zinc-400">
                  Escolha quais NPCs, aliados ou monstros da campanha os jogadores podem visualizar.
                </p>
              </div>

              {campaignCharacters.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs">
                  Nenhuma ficha cadastrada nesta campanha ainda. Crie fichas na aba "Fichas" ou adicione do Bestiário.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800 rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                  {campaignCharacters.map((char) => (
                    <div
                      key={char.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {char.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-zinc-200">{char.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                              {char.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400">{char.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleCharacterShared(char.id, !char.sharedWithPlayers)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            char.sharedWithPlayers
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200 hover:bg-zinc-700'
                          }`}
                        >
                          {char.sharedWithPlayers ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Revelada aos Jogadores</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Oculta (Segredo do Mestre)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
