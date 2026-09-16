import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  Columns,
  Sparkles,
  Send,
  Square,
  Copy,
  Check,
  ArrowDownToLine,
  Compass,
  Scroll,
  BookOpen,
  Wand2,
  AlertCircle,
  HelpCircle,
  Dice5,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Campaign, CharacterSheet } from '../types';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface CampaignCopilotViewProps {
  campaigns: Campaign[];
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onCreateCampaign: (title: string, system: string) => void;
  onUpdateCampaign: (updated: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  characters: CharacterSheet[];
  model?: string;
  customApiKey?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const CampaignCopilotView: React.FC<CampaignCopilotViewProps> = ({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  characters,
  model = 'gemini-3.6-flash',
  customApiKey = '',
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const activeCampaign =
    campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  // Editor states
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isWideText, setIsWideText] = useState(false);
  const [notes, setNotes] = useState(activeCampaign?.notes || '');
  const [system, setSystem] = useState(activeCampaign?.system || 'D&D 5e');
  const [title, setTitle] = useState(activeCampaign?.title || 'Campanha');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [insertedMessageId, setInsertedMessageId] = useState<string | null>(null);

  // New Campaign Modal / prompt
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSystem, setNewSystem] = useState('D&D 5e');

  // Chat input
  const [inputPrompt, setInputPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Gemini Hook
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    stopStreaming,
  } = useGeminiChat({
    model,
    customApiKey,
  });

  // Sync state when active campaign changes
  useEffect(() => {
    if (activeCampaign) {
      setNotes(activeCampaign.notes || '');
      setSystem(activeCampaign.system || 'D&D 5e');
      setTitle(activeCampaign.title || 'Sem título');
    }
  }, [activeCampaign?.id]);

  // Debounced continuous auto-save for notes and system
  useEffect(() => {
    if (!activeCampaign) return;
    const timeout = setTimeout(() => {
      if (
        notes !== activeCampaign.notes ||
        system !== activeCampaign.system ||
        title !== activeCampaign.title
      ) {
        onUpdateCampaign({
          notes,
          system,
          title,
          updatedAt: Date.now(),
        });
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [notes, system, title, activeCampaign?.id]);

  // Auto scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // Quick prompt suggestions
  const quickPrompts = [
    {
      label: 'Sugerir gancho',
      prompt: 'Sugira 3 ganchos de aventura dramáticos e imersivos que se conectem com a situação atual das minhas anotações.',
      icon: Compass,
    },
    {
      label: 'Descrever cena',
      prompt: 'Crie uma descrição sensorial detalhada e atmosférica para a próxima cena/local das anotações, pronta para eu narrar aos jogadores.',
      icon: Scroll,
    },
    {
      label: 'Consultar regra do sistema',
      prompt: `Explique sucintamente uma regra comum ou como resolver um teste desafiador no sistema ${system || 'atual'}, dando exemplos práticos.`,
      icon: BookOpen,
    },
    {
      label: 'Criar NPC rápido',
      prompt: 'Gere um NPC rápido (Nome, Aparência marcante, Peculiaridade, Segredo e Estatísticas rápidas de combate) adequado para este momento.',
      icon: Wand2,
    },
    {
      label: 'Gerar reviravolta',
      prompt: 'Sugira uma reviravolta inesperada ou complicação súbita para abalar a tranquilidade dos jogadores.',
      icon: Dice5,
    },
  ];

  // Prepare context summaries of sheets
  const getCharactersSummary = () => {
    const campaignChars = characters.filter((c) => c.campaignId === activeCampaign?.id);
    if (campaignChars.length === 0) return '';
    return campaignChars
      .map(
        (c) =>
          `- [${c.type}] ${c.name} (${c.role}): PV ${
            c.resources.find((r) => r.name.toLowerCase().includes('vida') || r.name.toLowerCase().includes('pv'))?.current ?? 'N/A'
          }/${
            c.resources.find((r) => r.name.toLowerCase().includes('vida') || r.name.toLowerCase().includes('pv'))?.max ?? 'N/A'
          }. Atributos: ${c.attributes.map((a) => `${a.key}:${a.value}`).join(', ')}`
      )
      .join('\n');
  };

  const handleSendMessage = (textToSend?: string) => {
    const message = textToSend || inputPrompt;
    if (!message.trim() || isStreaming) return;

    sendMessage(message, {
      system,
      campaignTitle: title,
      notes,
      charactersSummary: getCharactersSummary(),
    });

    setInputPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Insert AI text into GM Notebook
  const handleInsertIntoNotes = (text: string, msgId: string) => {
    const separator = notes.trim() ? '\n\n---\n\n' : '';
    const newNotes = `${notes}${separator}### 💡 Sugestão do Copiloto\n${text}\n`;
    setNotes(newNotes);
    onUpdateCampaign({ notes: newNotes, updatedAt: Date.now() });
    setInsertedMessageId(msgId);
    setTimeout(() => setInsertedMessageId(null), 2000);
  };

  // Copy text to clipboard
  const handleCopy = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Quick Markdown formatting helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('campaign-notes-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = notes.substring(start, end);
    const replacement = `${prefix}${selected || 'texto'}${suffix}`;
    const newText = notes.substring(0, start) + replacement + notes.substring(end);
    setNotes(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 5));
    }, 0);
  };

  // Word count calculation
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-zinc-950 text-zinc-100">
      {/* ========================================================================= */}
      {/* LADO ESQUERDO: CADERNO / ANOTAÇÕES (OBSIDIAN-STYLE)                      */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isFullScreen ? 'w-full h-full' : 'border-r border-zinc-800/90 h-[50vh] md:h-full'
        }`}
      >
        {/* Top bar do Caderno: Seletor de Campanha + Sistema + Modo Tela Cheia */}
        <div className="p-3 px-4 bg-zinc-900/60 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
          {/* Campaign Selector & Focus Badge */}
          <div className="flex items-center gap-2">
            {isFullScreen && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-semibold select-none">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Modo Foco</span>
              </div>
            )}

            <div className="relative">
              <select
                id="campaign-select"
                value={activeCampaignId}
                onChange={(e) => onSelectCampaign(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-amber-500/50 cursor-pointer max-w-[200px] truncate"
              >
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.title}
                  </option>
                ))}
              </select>
            </div>

            {!isFullScreen && (
              <button
                id="new-campaign-btn"
                onClick={() => setIsNewCampaignOpen(true)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border border-zinc-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                title="Criar Nova Campanha"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Nova</span>
              </button>
            )}

            {!isFullScreen && campaigns.length > 1 && (
              <button
                onClick={() => {
                  if (confirm(`Excluir a campanha "${title}" e todas as suas anotações?`)) {
                    onDeleteCampaign(activeCampaignId);
                  }
                }}
                className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg text-xs transition-colors"
                title="Excluir Campanha Atual"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sistema de RPG & Controles de Visualização / Tela Cheia */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">Sistema:</span>
            <input
              id="campaign-system-input"
              type="text"
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              placeholder="ex: D&D 5e, Call of Cthulhu"
              className="w-28 sm:w-36 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-medium placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
              title="Sistema de RPG da Campanha"
            />

            {/* Largura do texto em Tela Cheia */}
            {isFullScreen && (
              <button
                type="button"
                onClick={() => setIsWideText((prev) => !prev)}
                className={`hidden md:inline-flex items-center px-2 py-1 rounded-lg text-xs border transition-colors ${
                  isWideText
                    ? 'bg-zinc-800 text-amber-300 border-zinc-700 font-medium'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                }`}
                title={isWideText ? 'Alternar para largura de foco confortável (centrado)' : 'Alternar para largura total (100%)'}
              >
                {isWideText ? 'Largura Total' : 'Centrado'}
              </button>
            )}

            {/* Mode switches (Edit / Preview / Split) */}
            <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg ml-1">
              <button
                onClick={() => setEditorMode('edit')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  editorMode === 'edit'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Editor"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditorMode('preview')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  editorMode === 'preview'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Visualização Markdown"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setEditorMode('split')}
                className={`hidden lg:block p-1.5 rounded-md text-xs transition-colors ${
                  editorMode === 'split'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Dividido (Lado a Lado)"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>

              {/* Botão de Tela Cheia no grupo de botões */}
              {!isFullScreen && onToggleFullScreen && (
                <>
                  <span className="w-px h-3 bg-zinc-800 mx-0.5" />
                  <button
                    id="enter-fullscreen-notes-btn"
                    onClick={onToggleFullScreen}
                    className="p-1.5 rounded-md text-xs text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                    title="Modo Tela Cheia (Foco sem distrações) • F11"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Botão proeminente de Sair da Tela Cheia quando ativo */}
            {isFullScreen && onToggleFullScreen && (
              <button
                id="exit-fullscreen-notes-btn"
                onClick={onToggleFullScreen}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs group"
                title="Sair do Modo Tela Cheia (Pressione Esc ou F11)"
              >
                <Minimize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Sair da Tela Cheia</span>
                <kbd className="text-[10px] bg-zinc-950 text-amber-400/80 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                  Esc
                </kbd>
              </button>
            )}
          </div>
        </div>

        {/* Campaign Title Bar (Inline editable) */}
        <div className={`px-5 py-2 bg-zinc-950 border-b border-zinc-800/40 flex items-center justify-between ${isFullScreen && !isWideText ? 'max-w-4xl w-full mx-auto' : ''}`}>
          <div className="flex items-center gap-2 flex-1 mr-4">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-zinc-900 border border-amber-500/50 text-sm font-semibold text-zinc-100 rounded px-2 py-0.5 w-full focus:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-semibold text-zinc-200 hover:text-amber-400 cursor-pointer flex items-center gap-1.5 transition-colors group"
                title="Clique para renomear"
              >
                <span>{title}</span>
                <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-60 text-zinc-400" />
              </h2>
            )}
          </div>

          <div className="text-[11px] text-zinc-500 font-mono flex items-center gap-3 shrink-0">
            <span>{wordCount} palavras</span>
            <span>{charCount} caracteres</span>
          </div>
        </div>

        {/* Markdown Toolbar */}
        {editorMode !== 'preview' && (
          <div className={`px-4 py-1.5 bg-zinc-950/90 border-b border-zinc-800/40 flex items-center gap-1 overflow-x-auto text-xs text-zinc-400 ${isFullScreen && !isWideText ? 'max-w-4xl w-full mx-auto' : ''}`}>
            <button
              onClick={() => insertFormatting('## ')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200 font-bold"
              title="Título H2"
            >
              H2
            </button>
            <button
              onClick={() => insertFormatting('### ')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200 font-semibold"
              title="Título H3"
            >
              H3
            </button>
            <span className="w-px h-3 bg-zinc-800 mx-1" />
            <button
              onClick={() => insertFormatting('**', '**')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200 font-bold"
              title="Negrito"
            >
              B
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200 italic font-serif"
              title="Itálico"
            >
              I
            </button>
            <span className="w-px h-3 bg-zinc-800 mx-1" />
            <button
              onClick={() => insertFormatting('- ')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200"
              title="Lista com marcadores"
            >
              • Lista
            </button>
            <button
              onClick={() => insertFormatting('> ')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200"
              title="Citação / Fala"
            >
              " Citação
            </button>
            <button
              onClick={() => insertFormatting('\n---\n')}
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200"
              title="Divisor de Sessão"
            >
              — Divisor
            </button>
            <button
              onClick={() =>
                insertFormatting('\n| Característica | Detalhe |\n| :--- | :--- |\n| CD do Teste | 15 |\n')
              }
              className="px-2 py-0.5 rounded hover:bg-zinc-900 hover:text-zinc-200"
              title="Tabela de Estatísticas"
            >
              Tabela
            </button>
          </div>
        )}

        {/* Editor / Preview Content Area */}
        <div className="flex-1 overflow-hidden relative flex">
          {/* Editor Mode */}
          {(editorMode === 'edit' || editorMode === 'split') && (
            <div className={`h-full flex-1 flex flex-col ${editorMode === 'split' ? 'border-r border-zinc-800' : ''}`}>
              <textarea
                id="campaign-notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="# Anotações da Sessão..."
                className={`w-full h-full bg-zinc-950 leading-relaxed text-zinc-200 placeholder:text-zinc-700 font-sans focus:outline-none resize-none overflow-y-auto selection:bg-amber-500/20 selection:text-amber-200 ${
                  isFullScreen
                    ? isWideText
                      ? 'p-8 sm:p-12 text-base md:text-lg'
                      : 'max-w-4xl mx-auto px-6 sm:px-12 py-8 text-base md:text-lg'
                    : 'p-6 text-sm sm:text-base'
                }`}
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview Mode */}
          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className={`h-full flex-1 overflow-y-auto ${isFullScreen ? 'bg-zinc-950' : 'bg-zinc-950/80'} ${isFullScreen && !isWideText ? 'flex justify-center' : ''}`}>
              <div className={`p-6 ${isFullScreen && !isWideText ? 'max-w-4xl w-full px-6 sm:px-12 py-8' : 'w-full'}`}>
                {notes.trim() ? (
                  <MarkdownRenderer content={notes} />
                ) : (
                  <div className="text-zinc-600 italic text-sm text-center pt-10">
                    Nenhuma anotação ainda. Escreva no modo editor para visualizar aqui.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Floating Esc helper badge in full screen mode */}
          {isFullScreen && (
            <div className="absolute bottom-3 right-5 pointer-events-none opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400 select-none">
              <span>Pressione</span>
              <kbd className="font-mono bg-zinc-800 text-amber-300/90 px-1 rounded">Esc</kbd>
              <span>para sair da tela cheia</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LADO DIREITO: CHAT COM IA (COPILOTO GEMINI 2.5 FLASH)                     */}
      {/* ========================================================================= */}
      {!isFullScreen && (
        <div className="w-full md:w-[420px] lg:w-[480px] flex flex-col h-[50vh] md:h-full bg-zinc-950 shrink-0">
        {/* Chat Header: Context indicator & Actions */}
        <div className="p-3 px-4 bg-zinc-900/70 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-zinc-100">Copiloto do Mestre</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-amber-400 font-mono">
                  gemini-2.5-flash
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 truncate max-w-[240px]">
                Contexto: {title} ({system || 'Sistema'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg text-xs transition-colors"
                title="Limpar Conversa"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Message Stream History */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm selection:bg-amber-500/20"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-3 text-amber-500 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                Copiloto RPG Pronto
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-4">
                Pergunte sobre regras, peça ganchos, crie encontros ou descreva cenas. O Copiloto conhece suas anotações atuais de{' '}
                <span className="text-amber-400 font-medium">"{title}"</span>.
              </p>

              <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Contexto das anotações injetado automaticamente</span>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-amber-950/40 text-amber-100 border border-amber-500/30 rounded-br-xs'
                        : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        {msg.content ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : msg.isStreaming ? (
                          <div className="flex items-center gap-1.5 text-zinc-400 text-xs italic py-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-100" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce delay-200" />
                            <span>Canalizando sabedoria...</span>
                          </div>
                        ) : null}

                        {/* Actions for Assistant Message */}
                        {!msg.isStreaming && msg.content && (
                          <div className="pt-2 mt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2 text-[11px] text-zinc-400">
                            <button
                              onClick={() => handleInsertIntoNotes(msg.content, msg.id)}
                              className="flex items-center gap-1 hover:text-amber-400 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                              title="Inserir texto diretamente no seu caderno"
                            >
                              {insertedMessageId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Inserido!</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownToLine className="w-3 h-3" />
                                  <span>Inserir no caderno</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="flex items-center gap-1 hover:text-zinc-200 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
                              title="Copiar texto"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Erro no Copiloto:</span> {error}
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar (Explicitly required by prompt) */}
        <div className="px-3 pt-2 pb-1 border-t border-zinc-800/80 bg-zinc-950">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {quickPrompts.map((qp, idx) => {
              const IconComp = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  disabled={isStreaming}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 hover:border-amber-500/40 rounded-full text-[11px] text-zinc-300 hover:text-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconComp className="w-3 h-3 text-amber-500" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Input Box */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800/80">
          <div className="relative bg-zinc-900 border border-zinc-800 focus-within:border-amber-500/60 rounded-xl p-2 transition-colors">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte ao Copiloto... (Enter envia, Shift+Enter pula linha)"
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none max-h-28 pr-10 pl-1"
            />
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40 mt-1">
              <span className="text-[10px] text-zinc-500">
                Injeta notas & fichas como instrução do sistema
              </span>
              <div className="flex items-center gap-1">
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded-lg text-xs transition-colors"
                    title="Parar resposta"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim()}
                    className="p-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
                    title="Enviar pergunta"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Modal: Nova Campanha */}
      {isNewCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">Criar Nova Campanha</h3>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Título da Campanha
              </label>
              <input
                type="text"
                placeholder="ex: As Areias de Al-Qadim"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Sistema de RPG
              </label>
              <input
                type="text"
                placeholder="ex: D&D 5e, Tormenta 20, Vampiro"
                value={newSystem}
                onChange={(e) => setNewSystem(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsNewCampaignOpen(false);
                  setNewTitle('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newTitle.trim()) {
                    onCreateCampaign(newTitle.trim(), newSystem.trim() || 'D&D 5e');
                    setIsNewCampaignOpen(false);
                    setNewTitle('');
                  }
                }}
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-zinc-950 font-semibold rounded-lg text-xs"
              >
                Criar Campanha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
