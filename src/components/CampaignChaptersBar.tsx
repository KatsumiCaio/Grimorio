import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText,
  Calendar,
  Sparkles,
  X,
  Check,
  Compass,
  Swords,
  Search,
  PanelLeft,
} from 'lucide-react';
import { CampaignChapter } from '../types';

interface CampaignChaptersBarProps {
  chapters: CampaignChapter[];
  activeChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onCreateChapter: (title: string, sessionDate: string, templateType?: string) => void;
  onUpdateChapter: (chapterId: string, updates: Partial<CampaignChapter>) => void;
  onDeleteChapter: (chapterId: string) => void;
  onDuplicateChapter: (chapterId: string) => void;
  onReorderChapters: (reordered: CampaignChapter[]) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isFullScreen?: boolean;
  isWideText?: boolean;
}

export const CampaignChaptersBar: React.FC<CampaignChaptersBarProps> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  onCreateChapter,
  onUpdateChapter,
  onDeleteChapter,
  onDuplicateChapter,
  onReorderChapters,
  isSidebarOpen,
  onToggleSidebar,
  isFullScreen = false,
  isWideText = false,
}) => {
  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CampaignChapter | null>(null);
  const [menuOpenChapterId, setMenuOpenChapterId] = useState<string | null>(null);

  // New chapter form state
  const [newTitle, setNewTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newTemplate, setNewTemplate] = useState<'standard' | 'blank' | 'dungeon' | 'investigation'>('standard');

  // Edit chapter form state
  const [editTitle, setEditTitle] = useState('');
  const [editSessionDate, setEditSessionDate] = useState('');
  const [editSummary, setEditSummary] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sort chapters by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
  const activeIndex = sortedChapters.findIndex((c) => c.id === activeChapterId);
  const activeChapter = sortedChapters[activeIndex] || sortedChapters[0];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleOpenNewChapter = () => {
    const nextNum = chapters.length + 1;
    setNewTitle(`Capítulo ${nextNum}: Nova Jornada`);
    setNewSessionDate(`Sessão ${String(nextNum).padStart(2, '0')}`);
    setNewTemplate('standard');
    setIsNewChapterModalOpen(true);
  };

  const handleSubmitNewChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newTitle.trim() || `Capítulo ${chapters.length + 1}`;
    const finalSession = newSessionDate.trim() || `Sessão ${chapters.length + 1}`;
    onCreateChapter(finalTitle, finalSession, newTemplate);
    setIsNewChapterModalOpen(false);
  };

  const handleOpenEdit = (chapter: CampaignChapter) => {
    setEditingChapter(chapter);
    setEditTitle(chapter.title);
    setEditSessionDate(chapter.sessionDate || '');
    setEditSummary(chapter.summary || '');
    setMenuOpenChapterId(null);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;
    onUpdateChapter(editingChapter.id, {
      title: editTitle.trim() || editingChapter.title,
      sessionDate: editSessionDate.trim(),
      summary: editSummary.trim(),
      updatedAt: Date.now(),
    });
    setEditingChapter(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedChapters.length) return;

    const list = [...sortedChapters];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    onReorderChapters(reordered);
  };

  return (
    <div
      className={`border-b border-zinc-800/60 bg-zinc-950/70 select-none ${
        isFullScreen && !isWideText ? 'max-w-4xl w-full mx-auto' : 'w-full'
      }`}
    >
      <div className="px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2">
        {/* Left Section: Section indicator & Table of contents button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              id="bar-toggle-chapters-sidebar-btn"
              onClick={onToggleSidebar}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                  : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={`${isSidebarOpen ? 'Ocultar' : 'Exibir'} Barra Lateral de Capítulos`}
            >
              <PanelLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline text-[11px]">Barra Lateral</span>
            </button>
          )}

          <button
            type="button"
            id="open-chapters-index-btn"
            onClick={() => setIsManageModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-cyan-300 text-xs font-medium transition-colors cursor-pointer"
            title="Abrir Índice e Gerenciador de Capítulos"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-semibold">Capítulos</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
              {chapters.length}
            </span>
          </button>

          {/* Quick Prev Chapter arrow */}
          {sortedChapters.length > 1 && (
            <button
              type="button"
              disabled={activeIndex <= 0}
              onClick={() => {
                if (activeIndex > 0) {
                  onSelectChapter(sortedChapters[activeIndex - 1].id);
                }
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Capítulo Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Next Chapter arrow */}
          {sortedChapters.length > 1 && (
            <button
              type="button"
              disabled={activeIndex >= sortedChapters.length - 1}
              onClick={() => {
                if (activeIndex < sortedChapters.length - 1) {
                  onSelectChapter(sortedChapters[activeIndex + 1].id);
                }
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Próximo Capítulo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Scrollable Chapters Tab Strip */}
        <div className="relative flex-1 flex items-center min-w-0">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar scroll-smooth flex-1 min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedChapters.map((chap, idx) => {
              const isActive = chap.id === activeChapterId;
              return (
                <div
                  key={chap.id}
                  className={`group relative flex items-center rounded-lg text-xs transition-all shrink-0 border ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200 shadow-xs'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChapter(chap.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-left cursor-pointer focus:outline-none"
                    title={`${chap.title}${chap.sessionDate ? ` (${chap.sessionDate})` : ''}`}
                  >
                    {chap.sessionDate && (
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700/60 group-hover:border-zinc-600'
                        }`}
                      >
                        {chap.sessionDate}
                      </span>
                    )}
                    <span className="font-medium max-w-[130px] sm:max-w-[180px] truncate">
                      {chap.title}
                    </span>
                  </button>

                  {/* Chapter Options Dropdown Button */}
                  <div className="relative pr-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenChapterId(menuOpenChapterId === chap.id ? null : chap.id);
                      }}
                      className={`p-1 rounded hover:bg-zinc-800 transition-colors ${
                        isActive
                          ? 'text-cyan-400 hover:text-cyan-200'
                          : 'text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Opções do capítulo"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpenChapterId === chap.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setMenuOpenChapterId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-xl py-1 z-40 text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(chap)}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-cyan-300 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Renomear / Editar Info</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onDuplicateChapter(chap.id);
                              setMenuOpenChapterId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-200 hover:bg-zinc-800 hover:text-cyan-300 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Duplicar Capítulo</span>
                          </button>

                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleMove(idx, 'up');
                                setMenuOpenChapterId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Mover para a esquerda</span>
                            </button>
                          )}

                          {idx < sortedChapters.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleMove(idx, 'down');
                                setMenuOpenChapterId(null);
                              }}
                              className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Mover para a direita</span>
                            </button>
                          )}

                          {chapters.length > 1 && (
                            <div className="pt-1 mt-1 border-t border-zinc-800">
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Excluir o capítulo "${chap.title}" e todo o seu conteúdo?`)) {
                                    onDeleteChapter(chap.id);
                                  }
                                  setMenuOpenChapterId(null);
                                }}
                                className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-400 hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Capítulo</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Add New Chapter Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            id="add-new-chapter-btn"
            onClick={handleOpenNewChapter}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Adicionar Novo Capítulo ou Sessão"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Capítulo</span>
          </button>
        </div>
      </div>

      {/* MODAL: NOVO CAPÍTULO */}
      {isNewChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-zinc-100">Adicionar Novo Capítulo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChapterModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewChapter} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Título do Capítulo / Nome do Episódio
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Capítulo 3: A Cripta Subterrânea"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Identificador da Sessão ou Data (Opcional)
                </label>
                <input
                  type="text"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  placeholder="Ex: Sessão 03, Ato II, ou 22/09/2026"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Modelo Inicial do Caderno
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewTemplate('standard')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newTemplate === 'standard'
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200 mb-0.5">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sessão Padrão</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-tight">
                      Objetivos, clima, cenas e recompensas.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTemplate('dungeon')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newTemplate === 'dungeon'
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200 mb-0.5">
                      <Swords className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Masmorra / Combate</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-tight">
                      Salas, armadilhas, monstros e tesouros.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTemplate('investigation')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newTemplate === 'investigation'
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200 mb-0.5">
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Investigação</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-tight">
                      Pistas, suspeitos, segredos e locais.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTemplate('blank')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      newTemplate === 'blank'
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200 mb-0.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Em Branco</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 leading-tight">
                      Comece com uma folha completamente limpa.
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewChapterModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-zinc-950 transition-colors cursor-pointer shadow-md"
                >
                  Criar Capítulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CAPÍTULO */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-zinc-100">Editar Detalhes do Capítulo</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingChapter(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Título do Capítulo
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Identificador da Sessão ou Data
                </label>
                <input
                  type="text"
                  value={editSessionDate}
                  onChange={(e) => setEditSessionDate(e.target.value)}
                  placeholder="Ex: Sessão 03, 22/09/2026"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Resumo / Objetivo Rápido (Opcional)
                </label>
                <textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Ex: Os heróis investigam as catacumbas e confrontam o Mago Vermelho..."
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-zinc-950 transition-colors cursor-pointer shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ÍNDICE & GERENCIADOR COMPLETO DE CAPÍTULOS */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Índice & Capítulos da Campanha</h3>
                  <p className="text-xs text-zinc-400">
                    Organize e navegue por todas as sessões e seções de anotações.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {sortedChapters.map((chap, idx) => {
                const isActive = chap.id === activeChapterId;
                const words = chap.content ? chap.content.trim().split(/\s+/).filter(Boolean).length : 0;
                return (
                  <div
                    key={chap.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-cyan-950/30 border-cyan-500/50 shadow-xs'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex flex-col gap-0.5 pt-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed rounded"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sortedChapters.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 disabled:cursor-not-allowed rounded"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {chap.sessionDate && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              {chap.sessionDate}
                            </span>
                          )}
                          <h4 className="text-sm font-semibold text-zinc-200 truncate">
                            {chap.title}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                              Ativo
                            </span>
                          )}
                        </div>

                        {chap.summary ? (
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{chap.summary}</p>
                        ) : (
                          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                            {chap.content ? chap.content.slice(0, 100).replace(/[#*`_]/g, '') : 'Sem anotações ainda.'}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1.5">
                          <span>{words} palavras</span>
                          <span>•</span>
                          <span>Atualizado {new Date(chap.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectChapter(chap.id);
                            setIsManageModalOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-medium transition-colors"
                        >
                          Abrir
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(chap)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Editar Detalhes"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDuplicateChapter(chap.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Duplicar Capítulo"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Excluir o capítulo "${chap.title}" e todo o seu conteúdo?`)) {
                              onDeleteChapter(chap.id);
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Excluir Capítulo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsManageModalOpen(false);
                  handleOpenNewChapter();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Novo Capítulo</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
