import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Copy,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Search,
  X,
  Check,
  Calendar,
  FileText,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Swords,
  Compass,
} from 'lucide-react';
import { CampaignChapter } from '../types';

interface CampaignChaptersSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  chapters: CampaignChapter[];
  activeChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  onCreateChapter: (title: string, sessionDate: string, templateType?: string) => void;
  onUpdateChapter: (chapterId: string, updates: Partial<CampaignChapter>) => void;
  onDeleteChapter: (chapterId: string) => void;
  onDuplicateChapter: (chapterId: string) => void;
  onReorderChapters: (reordered: CampaignChapter[]) => void;
  campaignTitle: string;
  systemName: string;
  isFullScreen?: boolean;
}

export const CampaignChaptersSidebar: React.FC<CampaignChaptersSidebarProps> = ({
  isOpen,
  onToggleOpen,
  chapters,
  activeChapterId,
  onSelectChapter,
  onCreateChapter,
  onUpdateChapter,
  onDeleteChapter,
  onDuplicateChapter,
  onReorderChapters,
  campaignTitle,
  systemName,
  isFullScreen = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CampaignChapter | null>(null);
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null);
  const [dragOverChapterId, setDragOverChapterId] = useState<string | null>(null);

  // New chapter form
  const [newTitle, setNewTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newTemplate, setNewTemplate] = useState<'standard' | 'blank' | 'dungeon' | 'investigation'>('standard');

  // Edit chapter form
  const [editTitle, setEditTitle] = useState('');
  const [editSessionDate, setEditSessionDate] = useState('');
  const [editSummary, setEditSummary] = useState('');

  // Sorted chapters by order
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  // Filtered chapters by search query
  const filteredChapters = sortedChapters.filter((ch) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      (ch.sessionDate && ch.sessionDate.toLowerCase().includes(q)) ||
      (ch.summary && ch.summary.toLowerCase().includes(q)) ||
      ch.content.toLowerCase().includes(q)
    );
  });

  // Calculate campaign total words
  const totalWords = chapters.reduce((acc, ch) => {
    const words = ch.content.trim() ? ch.content.trim().split(/\s+/).length : 0;
    return acc + words;
  }, 0);

  const handleOpenNewChapter = () => {
    const nextNum = chapters.length + 1;
    setNewTitle(`Capítulo ${nextNum}: Nova Jornada`);
    setNewSessionDate(`Sessão ${String(nextNum).padStart(2, '0')}`);
    setNewTemplate('standard');
    setIsNewModalOpen(true);
  };

  const handleSubmitNewChapter = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newTitle.trim() || `Capítulo ${chapters.length + 1}`;
    const finalSession = newSessionDate.trim() || `Sessão ${chapters.length + 1}`;
    onCreateChapter(finalTitle, finalSession, newTemplate);
    setIsNewModalOpen(false);
  };

  const handleOpenEdit = (chapter: CampaignChapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapter(chapter);
    setEditTitle(chapter.title);
    setEditSessionDate(chapter.sessionDate || '');
    setEditSummary(chapter.summary || '');
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter) return;
    onUpdateChapter(editingChapter.id, {
      title: editTitle.trim() || editingChapter.title,
      sessionDate: editSessionDate.trim() || undefined,
      summary: editSummary.trim() || undefined,
    });
    setEditingChapter(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedChapters.length) return;

    const reordered = [...sortedChapters];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedWithOrder = reordered.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    onReorderChapters(updatedWithOrder);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedChapterId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverChapterId !== id) {
      setDragOverChapterId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedChapterId || draggedChapterId === targetId) {
      setDraggedChapterId(null);
      setDragOverChapterId(null);
      return;
    }

    const currentIndex = sortedChapters.findIndex((c) => c.id === draggedChapterId);
    const targetIndex = sortedChapters.findIndex((c) => c.id === targetId);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const reordered = [...sortedChapters];
      const [moved] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, moved);

      const updatedWithOrder = reordered.map((item, idx) => ({
        ...item,
        order: idx,
      }));
      onReorderChapters(updatedWithOrder);
    }

    setDraggedChapterId(null);
    setDragOverChapterId(null);
  };

  const handleDragEnd = () => {
    setDraggedChapterId(null);
    setDragOverChapterId(null);
  };

  // Helper for word count
  const getWordCount = (text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  return (
    <>
      {/* Mobile Backdrop when open */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="campaign-chapters-sidebar"
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-10 flex flex-col bg-zinc-950 border-r border-zinc-800/80 transition-all duration-200 ease-in-out shrink-0 select-none ${
          isOpen
            ? 'w-[280px] sm:w-[300px] translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:pointer-events-none'
        } ${isFullScreen ? 'md:bg-zinc-950/95' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="p-3 px-3.5 border-b border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider truncate">
                  Capítulos
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-cyan-300 font-mono border border-zinc-700">
                  {chapters.length}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 truncate" title={campaignTitle}>
                {campaignTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="sidebar-new-chapter-quick-btn"
              onClick={handleOpenNewChapter}
              className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
              title="Adicionar Novo Capítulo à Campanha"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="sidebar-close-toggle-btn"
              onClick={onToggleOpen}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer"
              title="Recolher Barra Lateral de Capítulos"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-2.5 border-b border-zinc-800/60 bg-zinc-950/70 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              id="chapters-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título ou sessão..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-cyan-500/50 rounded-lg pl-8 pr-7 py-1 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-zinc-500 hover:text-zinc-300 p-0.5"
                title="Limpar busca"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
          {filteredChapters.length > 0 ? (
            filteredChapters.map((chapter, index) => {
              const isActive = chapter.id === activeChapterId;
              const isDragging = draggedChapterId === chapter.id;
              const isOver = dragOverChapterId === chapter.id;
              const words = getWordCount(chapter.content);

              return (
                <div
                  key={chapter.id}
                  id={`chapter-sidebar-item-${chapter.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, chapter.id)}
                  onDragOver={(e) => handleDragOver(e, chapter.id)}
                  onDrop={(e) => handleDrop(e, chapter.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectChapter(chapter.id)}
                  className={`group relative rounded-xl p-2.5 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-xs ring-1 ring-cyan-500/20'
                      : 'bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800/70 hover:border-zinc-700'
                  } ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'} ${
                    isOver && !isDragging ? 'border-t-2 border-t-cyan-400 bg-zinc-800/70' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Drag Handle & Order Number */}
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <span
                        className="cursor-grab active:cursor-grabbing text-zinc-600 group-hover:text-zinc-400 transition-colors p-0.5"
                        title="Arrastar para reordenar"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Chapter Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {chapter.sessionDate && (
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded-md border flex items-center gap-1 shrink-0 ${
                              isActive
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                            }`}
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[90px]">{chapter.sessionDate}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-zinc-500">
                          {words} {words === 1 ? 'palavra' : 'palavras'}
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-medium leading-snug line-clamp-2 ${
                          isActive ? 'text-cyan-200 font-semibold' : 'text-zinc-300 group-hover:text-zinc-100'
                        }`}
                        title={chapter.title}
                      >
                        {chapter.title}
                      </h4>

                      {chapter.summary && (
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 italic">
                          {chapter.summary}
                        </p>
                      )}
                    </div>

                    {/* Actions Menu / Quick Buttons */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => handleMove(index, 'up', e)}
                        className="p-1 rounded text-zinc-500 hover:text-cyan-300 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>

                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === sortedChapters.length - 1}
                        onClick={(e) => handleMove(index, 'down', e)}
                        className="p-1 rounded text-zinc-500 hover:text-cyan-300 hover:bg-zinc-800 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Chapter Actions Bar (Visible on active or hover) */}
                  <div
                    className={`mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] ${
                      isActive ? 'flex' : 'hidden group-hover:flex'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(chapter, e)}
                        className="px-1.5 py-0.5 rounded text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/80 flex items-center gap-1 transition-colors"
                        title="Renomear ou editar resumo"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateChapter(chapter.id);
                        }}
                        className="px-1.5 py-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 flex items-center gap-1 transition-colors"
                        title="Duplicar este capítulo"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>Copiar</span>
                      </button>
                    </div>

                    {/* Delete button (disabled if only 1 chapter) */}
                    <button
                      type="button"
                      disabled={chapters.length <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingChapterId(chapter.id);
                      }}
                      className="px-1.5 py-0.5 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors"
                      title={
                        chapters.length <= 1
                          ? 'A campanha precisa de ao menos um capítulo'
                          : 'Excluir capítulo'
                      }
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-zinc-500 text-xs space-y-2">
              <Search className="w-6 h-6 mx-auto text-zinc-600 opacity-60" />
              <p>Nenhum capítulo encontrado para "{searchQuery}".</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:pb-3 border-t border-zinc-800/80 bg-zinc-900/90 space-y-2 shrink-0">
          <button
            type="button"
            id="sidebar-add-chapter-main-btn"
            onClick={handleOpenNewChapter}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Adicionar Novo Capítulo</span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1">
            <span>{chapters.length} {chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
            <span>Total: {totalWords.toLocaleString()} palavras</span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MODAL: CRIAR NOVO CAPÍTULO COM MODELOS                                    */}
      {/* ========================================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">Novo Capítulo da Campanha</h3>
                  <p className="text-[11px] text-zinc-400">Crie uma nova sessão com modelo pronto ou folha em branco</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewChapter} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título do Capítulo / Ato
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Capítulo 02 — As Ruínas Subterrâneas"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tag de Sessão ou Data (Opcional)
                </label>
                <input
                  type="text"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  placeholder="Ex: Sessão 03 ou 22/09/2026"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Escolha um Modelo Inicial de Estrutura
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Padrão */}
                  <div
                    onClick={() => setNewTemplate('standard')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newTemplate === 'standard'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sessão Padrão</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      Objetivos, Clima & Atmosfera, Cenas & Ganchos, NPCs e Tesouros.
                    </p>
                  </div>

                  {/* Masmorra */}
                  <div
                    onClick={() => setNewTemplate('dungeon')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newTemplate === 'dungeon'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Swords className="w-3.5 h-3.5 text-amber-400" />
                      <span>Masmorra / Ruínas</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      Salas numeradas, armadilhas, encontros de monstros e segredos.
                    </p>
                  </div>

                  {/* Investigação */}
                  <div
                    onClick={() => setNewTemplate('investigation')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newTemplate === 'investigation'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <Compass className="w-3.5 h-3.5 text-purple-400" />
                      <span>Investigação</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      Enigmas, pistas graduais, suspeitos e revelações de mistério.
                    </p>
                  </div>

                  {/* Em Branco */}
                  <div
                    onClick={() => setNewTemplate('blank')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      newTemplate === 'blank'
                        ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Em Branco</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                      Página limpa apenas com o título do capítulo pronto para redigir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="confirm-create-chapter-btn"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors shadow-xs"
                >
                  Criar Capítulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR METADADOS DO CAPÍTULO                                       */}
      {/* ========================================================================= */}
      {editingChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-4 px-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Editar Detalhes do Capítulo</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingChapter(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título do Capítulo
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500/60"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tag de Sessão ou Data
                </label>
                <input
                  type="text"
                  value={editSessionDate}
                  onChange={(e) => setEditSessionDate(e.target.value)}
                  placeholder="Ex: Sessão 04"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Resumo Rápido (Usado pelo Copiloto IA)
                </label>
                <textarea
                  rows={3}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Ex: Os heróis descobriram o portal arcano e foram emboscados por cultistas..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingChapter(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-colors shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAÇÃO DE EXCLUSÃO DE CAPÍTULO                                 */}
      {/* ========================================================================= */}
      {deletingChapterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/50 border border-rose-800/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Excluir Capítulo?</h3>
                <p className="text-xs text-zinc-400">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              O capítulo "
              <strong className="text-zinc-100 font-semibold">
                {chapters.find((c) => c.id === deletingChapterId)?.title}
              </strong>
              " e todas as suas anotações serão removidos permanentemente.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeletingChapterId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteChapter(deletingChapterId);
                  setDeletingChapterId(null);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
