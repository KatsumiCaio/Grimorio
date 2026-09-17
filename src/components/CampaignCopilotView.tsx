import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Dices,
  ShieldCheck,
  X,
  ChevronDown,
  Info,
  Cloud,
  Database,
  Skull,
} from 'lucide-react';
import { Campaign, CharacterSheet, BestiaryMonster, CharacterType } from '../types';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { EditCharacterModal } from './EditCharacterModal';
import { InsertSheetModal } from './InsertSheetModal';
import { storageService } from '../services/storage';
import { RPG_BESTIARY } from '../data/bestiary';
import {
  subscribeToCampaignChat,
  saveCampaignChatMessage,
  clearCampaignChatInFirestore,
  auth,
} from '../services/firebase';
import {
  RPG_SYSTEMS,
  POPULAR_SYSTEM_GROUPS,
  getSystemKnowledge,
  RpgSystemDefinition,
} from '../data/rpgSystems';

interface CampaignCopilotViewProps {
  campaigns: Campaign[];
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onCreateCampaign: (title: string, system: string) => void;
  onUpdateCampaign: (updated: Partial<Campaign>) => void;
  onDeleteCampaign: (id: string) => void;
  onOpenCampaignMenu?: () => void;
  characters: CharacterSheet[];
  onCreateCharacter?: (character: CharacterSheet) => void;
  onUpdateCharacter?: (character: CharacterSheet) => void;
  onOpenBestiaryTab?: () => void;
  model?: string;
  customApiKey?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  userId?: string;
}

export const CampaignCopilotView: React.FC<CampaignCopilotViewProps> = ({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onCreateCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  onOpenCampaignMenu,
  characters,
  onCreateCharacter,
  onUpdateCharacter,
  onOpenBestiaryTab,
  model = 'gemini-3.6-flash',
  customApiKey = '',
  isFullScreen = false,
  onToggleFullScreen,
  userId,
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

  // Sheet & Bestiary insertion and editing states
  const [isInsertSheetModalOpen, setIsInsertSheetModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterSheet | null>(null);
  const [sheetInsertedNotice, setSheetInsertedNotice] = useState<string | null>(null);

  // Scan notes for embedded ficha tags and resolve their characters
  const embeddedFichaCards = useMemo(() => {
    const regex = /\{\{(?:ficha|sheet):([a-zA-Z0-9_\-]+)\}\}/g;
    const list: CharacterSheet[] = [];
    const stored = storageService.getCharacters();
    const allAvailable = [...characters, ...stored];
    let m;
    while ((m = regex.exec(notes)) !== null) {
      const rawId = m[1].toLowerCase().trim();
      let char = allAvailable.find(
        (c) => c.id.toLowerCase() === rawId || c.name.toLowerCase() === rawId
      );
      if (!char) {
        const bestiary = RPG_BESTIARY.find(
          (b) => b.id.toLowerCase() === rawId || b.name.toLowerCase() === rawId
        );
        if (bestiary) {
          char = {
            id: m[1],
            campaignId: activeCampaign?.id || '',
            name: bestiary.name,
            role: bestiary.role,
            type: bestiary.type || 'Monstro',
            challengeRating: bestiary.challenge,
            avatarUrl: bestiary.avatarUrl,
            attributes: [...bestiary.attributes],
            resources: [...bestiary.resources],
            notes: bestiary.notes,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }
      }
      if (char && !list.some((existing) => existing.id === char!.id)) {
        list.push(char);
      }
    }
    return list;
  }, [notes, characters, activeCampaign?.id]);

  // System and Active Campaign Knowledge
  const [isEditingCustomSystem, setIsEditingCustomSystem] = useState(false);
  const [showSystemRulesInfo, setShowSystemRulesInfo] = useState(false);
  const activeSystemKnowledge = getSystemKnowledge(system);

  // New Campaign Modal / prompt
  const [isNewCampaignOpen, setIsNewCampaignOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedSystemId, setSelectedSystemId] = useState('dnd5e');
  const [customSystemText, setCustomSystemText] = useState('');

  // Chat input
  const [inputPrompt, setInputPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isCloudChatSynced, setIsCloudChatSynced] = useState(false);

  // Gemini Hook with Firestore and LocalStorage sync
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    stopStreaming,
    setMessages,
  } = useGeminiChat({
    model,
    customApiKey,
    onUserMessageAdded: (userMsg) => {
      if (activeCampaign?.id) {
        const currentUid = userId || auth.currentUser?.uid;
        // Save to local storage cache immediately
        const prevMsgs = storageService.getCampaignChatMessages(activeCampaign.id);
        const nextMsgs = [...prevMsgs, userMsg];
        storageService.saveCampaignChatMessages(activeCampaign.id, nextMsgs);

        // Persist to Firestore subcollection /campaigns/{campaignId}/messages/{messageId}
        if (currentUid) {
          saveCampaignChatMessage(currentUid, activeCampaign.id, userMsg, system).catch((err) => {
            console.warn('Aviso ao salvar mensagem de usuário no Firestore:', err);
          });
        }
      }
    },
    onMessageComplete: (_userMsg, assistantMsg) => {
      if (activeCampaign?.id) {
        const currentUid = userId || auth.currentUser?.uid;
        // Save finalized assistant answer to local storage cache
        const prevMsgs = storageService.getCampaignChatMessages(activeCampaign.id);
        const filtered = prevMsgs.filter((m) => m.id !== assistantMsg.id);
        const nextMsgs = [...filtered, assistantMsg];
        storageService.saveCampaignChatMessages(activeCampaign.id, nextMsgs);

        // Persist to Firestore subcollection
        if (currentUid) {
          saveCampaignChatMessage(currentUid, activeCampaign.id, assistantMsg, system).catch((err) => {
            console.warn('Aviso ao salvar resposta no Firestore:', err);
          });
        }
      }
    },
  });

  // Load and subscribe to chat messages for the active campaign
  useEffect(() => {
    if (!activeCampaign?.id) return;

    // 1. Immediately load local cached messages for this campaign
    const localMsgs = storageService.getCampaignChatMessages(activeCampaign.id);
    setMessages(localMsgs);

    // 2. If authenticated or userId present, listen to real-time updates from Firestore
    const currentUid = userId || auth.currentUser?.uid;
    let unsubscribe = () => {};

    if (currentUid) {
      unsubscribe = subscribeToCampaignChat(
        activeCampaign.id,
        (cloudMsgs) => {
          if (cloudMsgs && cloudMsgs.length > 0) {
            setMessages(cloudMsgs);
            storageService.saveCampaignChatMessages(activeCampaign.id, cloudMsgs);
            setIsCloudChatSynced(true);
          } else if (localMsgs.length > 0) {
            // Seed local messages to Firestore if cloud is empty
            localMsgs.forEach((msg) => {
              saveCampaignChatMessage(currentUid, activeCampaign.id, msg, activeCampaign.system);
            });
            setIsCloudChatSynced(true);
          }
        },
        (err) => {
          console.warn('Aviso no listener de chat do Firestore:', err);
          setIsCloudChatSynced(false);
        }
      );
    } else {
      setIsCloudChatSynced(false);
    }

    return () => {
      unsubscribe();
    };
  }, [activeCampaign?.id, userId]);

  // Clear chat for current campaign
  const handleClearChat = () => {
    clearMessages();
    if (activeCampaign?.id) {
      storageService.clearCampaignChatMessages(activeCampaign.id);
      const currentUid = userId || auth.currentUser?.uid;
      if (currentUid) {
        clearCampaignChatInFirestore(activeCampaign.id).catch((err) => {
          console.warn('Aviso ao limpar chat no Firestore:', err);
        });
      }
    }
  };

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

  // Quick prompt suggestions adapted to active system
  const quickPrompts = [
    {
      label: `Regras (${activeSystemKnowledge.shortName})`,
      prompt: `Como Mestre de ${activeSystemKnowledge.name}, explique a regra oficial sobre: [ex: agarrar em combate / descanso / teste de resistência / custo de magia / ferimentos]. Especifique os dados (${activeSystemKnowledge.diceConvention}) e as dificuldades/CDs apropriadas.`,
      icon: BookOpen,
    },
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
      label: 'Criar NPC rápido',
      prompt: `Gere um NPC rápido compatível com as regras de ${activeSystemKnowledge.name} (Nome, Aparência marcante, Peculiaridade, Segredo e Estatísticas rápidas) adequado para este momento.`,
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

  // Insert character / monster sheet tag into notes at cursor position
  const handleInsertSheetIntoNotes = (charId: string, charName?: string) => {
    const textarea = document.getElementById('campaign-notes-textarea') as HTMLTextAreaElement;
    const embedCode = `\n\n{{ficha:${charId}}}\n\n`;
    if (textarea) {
      const start = textarea.selectionStart ?? notes.length;
      const end = textarea.selectionEnd ?? notes.length;
      const newText = notes.substring(0, start) + embedCode + notes.substring(end);
      setNotes(newText);
      onUpdateCampaign({ notes: newText, updatedAt: Date.now() });
      setTimeout(() => {
        textarea.focus();
        const cursorAfter = start + embedCode.length;
        textarea.setSelectionRange(cursorAfter, cursorAfter);
      }, 50);
    } else {
      const newText = `${notes.trimEnd()}${embedCode}`;
      setNotes(newText);
      onUpdateCampaign({ notes: newText, updatedAt: Date.now() });
    }

    // Automatically switch to split or preview mode so the user immediately sees the rendered interactive card!
    if (window.innerWidth >= 850) {
      setEditorMode('split');
    } else {
      setEditorMode('preview');
    }

    const nameLabel = charName ? ` de "${charName}"` : '';
    setSheetInsertedNotice(`Ficha${nameLabel} inserida! Ela agora está visível e interativa no texto.`);
    setTimeout(() => setSheetInsertedNotice(null), 5000);
  };

  // Remove ficha embed tag from notes
  const handleRemoveEmbedFromNotes = (charId: string) => {
    const regex = new RegExp(`\\n?\\n?\\{\\{(?:ficha|sheet):${charId}\\}\\}\\n?\\n?`, 'g');
    const newText = notes.replace(regex, '\n\n').trim();
    setNotes(newText);
    onUpdateCampaign({ notes: newText, updatedAt: Date.now() });
  };

  // Add monster from Bestiary directly to campaign character sheets, with optional immediate note insertion
  const handleAddMonsterToCampaign = (
    monster: BestiaryMonster,
    insertIntoTextImmediately?: boolean
  ) => {
    if (!activeCampaign) return;
    const newChar: CharacterSheet = {
      id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      campaignId: activeCampaign.id,
      name: monster.name,
      role: monster.role,
      type: monster.type || 'Monstro',
      challengeRating: monster.challenge,
      avatarUrl: monster.avatarUrl,
      attributes: [...monster.attributes],
      resources: [...monster.resources],
      notes: monster.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onCreateCharacter?.(newChar);

    if (insertIntoTextImmediately) {
      handleInsertSheetIntoNotes(newChar.id, newChar.name);
    }
  };

  const handleUpdateCharacterSheet = (updatedChar: CharacterSheet) => {
    onUpdateCharacter?.(updatedChar);
  };

  // Word count calculation
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  // Zero-state if all campaigns were deleted
  if (campaigns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-100 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/20">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">Nenhuma Campanha Cadastrada</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Você não possui campanhas ativas no momento. Crie uma nova aventura ou abra o Menu de Campanhas para começar a mestrar, registrar anotações de sessão e usar o Copiloto IA.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onOpenCampaignMenu && (
            <button
              type="button"
              id="empty-state-open-menu-btn"
              onClick={onOpenCampaignMenu}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950/30 cursor-pointer transition-all"
            >
              <Scroll className="w-4 h-4" />
              <span>Abrir Menu de Campanhas</span>
            </button>
          )}
          <button
            type="button"
            id="empty-state-new-camp-btn"
            onClick={() => setIsNewCampaignOpen(true)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Criar Campanha Rápida</span>
          </button>
        </div>

        {/* Modal de Criação Rápida */}
        {isNewCampaignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Nova Campanha</span>
                </h3>
                <button
                  onClick={() => setIsNewCampaignOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Nome da Campanha</label>
                <input
                  type="text"
                  placeholder="Ex: A Maldição de Strahd"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Sistema de RPG</label>
                <select
                  value={selectedSystemId}
                  onChange={(e) => setSelectedSystemId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {POPULAR_SYSTEM_GROUPS.map((group) => (
                    <optgroup key={group.group} label={group.group} className="bg-zinc-900 text-zinc-400">
                      {group.systems.map((sys) => (
                        <option key={sys.id} value={sys.id}>
                          {sys.name} ({sys.diceConvention})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="custom">Outro (Personalizado)...</option>
                </select>
              </div>

              {selectedSystemId === 'custom' && (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Nome do Sistema Customizado</label>
                  <input
                    type="text"
                    placeholder="Ex: 3D&T Alpha, Gurps 4e, Cyberpunk RED..."
                    value={customSystemText}
                    onChange={(e) => setCustomSystemText(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  onClick={() => setIsNewCampaignOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (newTitle.trim()) {
                      const finalSystem =
                        selectedSystemId === 'custom'
                          ? customSystemText.trim() || 'Sistema Próprio'
                          : RPG_SYSTEMS.find((s) => s.id === selectedSystemId)?.shortName || 'D&D 5e';

                      onCreateCampaign(newTitle.trim(), finalSystem);
                      setIsNewCampaignOpen(false);
                      setNewTitle('');
                      setSelectedSystemId('dnd5e');
                      setCustomSystemText('');
                    }
                  }}
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
                >
                  Criar Campanha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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

            {/* Menu de Campanhas Button & Selector */}
            {onOpenCampaignMenu && (
              <button
                type="button"
                id="open-campaign-menu-top-btn"
                onClick={onOpenCampaignMenu}
                className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-xs font-semibold text-amber-300 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs group"
                title="Abrir Menu de Campanhas (Selecionar, criar ou apagar todas)"
              >
                <Scroll className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-6 transition-transform shrink-0" />
                <span className="hidden sm:inline">Campanhas</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {campaigns.length}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-amber-400" />
              </button>
            )}

            <div className="relative">
              <select
                id="campaign-select"
                value={activeCampaignId}
                onChange={(e) => onSelectCampaign(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 rounded-lg px-2.5 py-1.5 pr-7 focus:outline-none focus:border-amber-500/50 cursor-pointer max-w-[170px] sm:max-w-[200px] truncate"
                title="Trocar campanha ativa"
              >
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Badge de Identificação do Sistema de RPG no Topo */}
            <button
              type="button"
              id="top-campaign-system-badge"
              onClick={() => setShowSystemRulesInfo(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-xs font-medium transition-all cursor-pointer shadow-xs group"
              title={`Sistema de RPG ativo: ${activeSystemKnowledge.name}\nConvenção: ${activeSystemKnowledge.diceConvention}\nClique para ver as regras`}
            >
              <Dices className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
              <span className="font-semibold">{activeSystemKnowledge.shortName}</span>
              <span className="text-[10px] text-amber-400/80 font-normal px-1 py-0.2 rounded bg-amber-500/10 hidden xl:inline">
                {activeSystemKnowledge.badge}
              </span>
            </button>

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

          {/* Sistema de RPG com Seletor de Lista Inteligente & Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">Sistema:</span>
            
            <div className="flex items-center gap-1">
              <select
                id="campaign-system-select"
                value={
                  RPG_SYSTEMS.some((s) => s.shortName === system || s.name === system || s.id === system)
                    ? RPG_SYSTEMS.find((s) => s.shortName === system || s.name === system || s.id === system)?.id
                    : 'custom'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsEditingCustomSystem(true);
                  } else {
                    setIsEditingCustomSystem(false);
                    const found = RPG_SYSTEMS.find((s) => s.id === val);
                    if (found) {
                      setSystem(found.shortName);
                    }
                  }
                }}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
                title={`Sistema ativo: ${activeSystemKnowledge.name}\nMecânica: ${activeSystemKnowledge.diceConvention}`}
              >
                {POPULAR_SYSTEM_GROUPS.map((group) => (
                  <optgroup key={group.group} label={group.group} className="bg-zinc-900 text-zinc-400">
                    {group.systems.map((sys) => (
                      <option key={sys.id} value={sys.id} className="bg-zinc-950 text-zinc-200">
                        {sys.shortName}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="custom" className="bg-zinc-950 text-amber-400 font-medium">
                  Outro / Personalizado...
                </option>
              </select>

              {(isEditingCustomSystem || !RPG_SYSTEMS.some((s) => s.shortName === system || s.name === system || s.id === system)) && (
                <input
                  type="text"
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  placeholder="Nome do sistema..."
                  className="w-24 sm:w-32 bg-zinc-950 border border-amber-500/50 rounded-lg px-2 py-1 text-xs text-amber-200 font-medium placeholder:text-zinc-600 focus:outline-none"
                  title="Digite o nome personalizado do seu sistema"
                  autoFocus
                />
              )}

              {/* Botão de Resumo de Regras do Sistema */}
              <button
                type="button"
                onClick={() => setShowSystemRulesInfo(true)}
                className="p-1 px-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-400 hover:text-amber-300 text-[10px] flex items-center gap-1 transition-colors"
                title={`Ver modelo de regras de ${activeSystemKnowledge.shortName}`}
              >
                <Dices className="w-3 h-3 text-amber-400" />
                <span className="hidden md:inline">{activeSystemKnowledge.badge}</span>
              </button>
            </div>

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
                type="button"
                onClick={() => setEditorMode('edit')}
                className={`px-2 py-1 rounded-md text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  editorMode === 'edit'
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Editor"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`px-2 py-1 rounded-md text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  editorMode === 'preview'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Visualização (exibe fichas interativas renderizadas no texto)"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Visualizar</span>
                {embeddedFichaCards.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40">
                    {embeddedFichaCards.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={`hidden md:flex px-2 py-1 rounded-md text-xs transition-colors items-center gap-1 cursor-pointer ${
                  editorMode === 'split'
                    ? 'bg-zinc-800 text-amber-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Modo Dividido (Editor à esquerda e Fichas/Preview interativo à direita)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Dividido</span>
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
              <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-sm font-semibold text-zinc-200 hover:text-amber-400 cursor-pointer flex items-center gap-1.5 transition-colors group truncate"
                  title="Clique para renomear"
                >
                  <span className="truncate">{title}</span>
                  <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-60 text-zinc-400 shrink-0" />
                </h2>

                {/* Badge do Sistema de RPG Ativo */}
                <button
                  type="button"
                  id="campaign-active-system-badge"
                  onClick={() => setShowSystemRulesInfo(true)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-[11px] font-medium transition-all shadow-xs shrink-0 cursor-pointer group"
                  title={`Sistema de RPG ativo: ${activeSystemKnowledge.name}\nConvenção de Dados: ${activeSystemKnowledge.diceConvention}\nClique para ver as regras e detalhes do sistema`}
                >
                  <Dices className="w-3 h-3 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="font-semibold">{activeSystemKnowledge.shortName}</span>
                  <span className="text-[10px] text-amber-400/80 font-normal px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 hidden sm:inline">
                    {activeSystemKnowledge.badge}
                  </span>
                </button>
              </div>
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

            <div className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
              <button
                type="button"
                id="insert-sheet-toolbar-btn"
                onClick={() => setIsInsertSheetModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                title="Inserir ficha de Personagem, NPC ou Monstro do Bestiário diretamente no texto da campanha"
              >
                <Skull className="w-3.5 h-3.5 text-rose-400" />
                <span>+ Ficha / Bestiário</span>
              </button>
            </div>
          </div>
        )}

        {/* Editor / Preview Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          {/* Toast Notification when a sheet was inserted */}
          {sheetInsertedNotice && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{sheetInsertedNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSheetInsertedNotice(null)}
                className="text-zinc-400 hover:text-zinc-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Embedded Sheets Strip when in pure edit mode */}
          {editorMode === 'edit' && embeddedFichaCards.length > 0 && (
            <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 text-xs shrink-0 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="font-semibold text-amber-400 flex items-center gap-1 shrink-0 text-xs">
                  <Skull className="w-3.5 h-3.5 text-rose-400" />
                  {embeddedFichaCards.length === 1 ? '1 Ficha vinculada:' : `${embeddedFichaCards.length} Fichas vinculadas:`}
                </span>
                {embeddedFichaCards.map((char) => (
                  <div
                    key={char.id}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 shadow-xs"
                  >
                    {char.avatarUrl ? (
                      <img src={char.avatarUrl} alt={char.name} className="w-4 h-4 rounded object-cover" />
                    ) : (
                      <span className="text-[10px]">{char.type === 'Monstro' ? '💀' : '👤'}</span>
                    )}
                    <span className="font-semibold text-zinc-100 max-w-[120px] truncate">{char.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditingCharacter(char)}
                      className="text-amber-400 hover:text-amber-300 text-[10px] font-medium underline cursor-pointer"
                      title="Editar ficha"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmbedFromNotes(char.id)}
                      className="text-zinc-500 hover:text-rose-400 p-0.5 cursor-pointer"
                      title="Remover tag do texto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-md font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                  title="Ver fichas renderizadas com barras de vida interativas diretamente no texto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver no Texto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('split')}
                  className="hidden md:flex px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-md font-medium text-xs items-center gap-1 transition-colors cursor-pointer"
                  title="Modo Dividido: Editor e Ficha lado a lado"
                >
                  <Columns className="w-3 h-3" />
                  <span>Dividido</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden relative flex">
            {/* Editor Mode */}
            {(editorMode === 'edit' || editorMode === 'split') && (
              <div className={`h-full flex-1 flex flex-col ${editorMode === 'split' ? 'border-r border-zinc-800' : ''}`}>
                <textarea
                  id="campaign-notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="# Anotações da Sessão... Use '+ Ficha / Bestiário' para incorporar fichas no texto"
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
                  <MarkdownRenderer
                    content={notes}
                    characters={characters}
                    onUpdateCharacter={handleUpdateCharacterSheet}
                    onEditCharacter={(char) => setEditingCharacter(char)}
                  />
                ) : (
                  <div className="text-zinc-600 italic text-sm text-center pt-10 space-y-2">
                    <p>Nenhuma anotação ainda. Escreva no modo editor para visualizar aqui.</p>
                    <button
                      type="button"
                      onClick={() => setIsInsertSheetModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-amber-400 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Skull className="w-3.5 h-3.5 text-rose-400" />
                      <span>Inserir Ficha ou Monstro do Bestiário</span>
                    </button>
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
      </div>

      {/* ========================================================================= */}
      {/* LADO DIREITO: CHAT COM IA (COPILOTO GEMINI 2.5 FLASH)                     */}
      {/* ========================================================================= */}
      {!isFullScreen && (
        <div className="w-full md:w-[420px] lg:w-[480px] flex flex-col h-[50vh] md:h-full bg-zinc-950 shrink-0">
        {/* Chat Header: Context indicator & Actions */}
        <div className="p-3 px-4 bg-zinc-900/70 border-b border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-zinc-100">Copiloto do Mestre</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {model || 'gemini-3.6-flash'}
                </span>
                <button
                  onClick={() => setShowSystemRulesInfo(true)}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 border border-amber-500/20 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title={`Modelo de regras: ${activeSystemKnowledge.name}\n${activeSystemKnowledge.diceConvention}\nClique para ver detalhes.`}
                >
                  <Dices className="w-3 h-3 text-amber-400" />
                  <span>{activeSystemKnowledge.shortName}</span>
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 truncate max-w-[260px]">
                Contexto: {title} • Regras de {activeSystemKnowledge.shortName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync status indicator */}
            {userId || auth.currentUser ? (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 font-medium"
                title="Histórico de mensagens sincronizado na nuvem (Firestore)"
              >
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Firestore</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium"
                title="Histórico salvo localmente no navegador"
              >
                <Database className="w-3 h-3 text-zinc-400" />
                <span className="hidden sm:inline">Local</span>
              </span>
            )}

            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg text-xs transition-colors cursor-pointer"
                title="Limpar histórico desta campanha"
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
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-3 text-amber-500 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                Copiloto RPG Sintonizado
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-3">
                Pergunte sobre regras, combate, perícias ou ganchos. O Copiloto conhece as regras oficiais de{' '}
                <span className="text-amber-400 font-medium">{activeSystemKnowledge.name}</span> e suas anotações de{' '}
                <span className="text-zinc-200 font-medium">"{title}"</span>.
              </p>

              {/* Card de sintonia do sistema ativo */}
              <div className="w-full max-w-xs bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3 text-left space-y-1.5 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Dices className="w-3.5 h-3.5 text-amber-400" />
                    {activeSystemKnowledge.shortName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30">
                    {activeSystemKnowledge.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">
                  <strong className="text-zinc-300">Rolagens:</strong> {activeSystemKnowledge.diceConvention}
                </p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1 border-t border-zinc-800/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Dúvidas de regras respondidas conforme o sistema oficial.</span>
                </div>
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

      {/* Modal: Nova Campanha com Lista de Sistemas */}
      {isNewCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">Criar Nova Campanha</h3>
                  <p className="text-[11px] text-zinc-400">Escolha o sistema para a IA carregar as regras oficiais</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsNewCampaignOpen(false);
                  setNewTitle('');
                  setSelectedSystemId('dnd5e');
                  setCustomSystemText('');
                }}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Título da Campanha */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Título da Campanha
              </label>
              <input
                type="text"
                placeholder="ex: As Areias de Al-Qadim, Sombras de Arton, O Caso Blackwood"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                autoFocus
              />
            </div>

            {/* Seletor de Sistema como Lista */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>Sistema de RPG</span>
                <span className="text-[10px] text-amber-400/90 font-mono">IA adaptada às regras</span>
              </label>
              <select
                value={selectedSystemId}
                onChange={(e) => setSelectedSystemId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-500/60 cursor-pointer"
              >
                {POPULAR_SYSTEM_GROUPS.map((group) => (
                  <optgroup key={group.group} label={group.group} className="bg-zinc-900 text-zinc-300 font-semibold">
                    {group.systems.map((sys) => (
                      <option key={sys.id} value={sys.id} className="bg-zinc-950 text-zinc-200 py-1 font-normal">
                        {sys.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="custom" className="bg-zinc-950 text-amber-400 font-semibold">
                  Outro Sistema / Sistema Próprio...
                </option>
              </select>
            </div>

            {/* Campo para Sistema Customizado */}
            {selectedSystemId === 'custom' && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Nome do Sistema Personalizado
                </label>
                <input
                  type="text"
                  placeholder="ex: Alien RPG, Blades in the Dark, Numenera..."
                  value={customSystemText}
                  onChange={(e) => setCustomSystemText(e.target.value)}
                  className="w-full bg-zinc-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
            )}

            {/* Preview do Sistema Selecionado com Diretrizes da IA */}
            {(() => {
              const previewKnowledge =
                selectedSystemId === 'custom'
                  ? getSystemKnowledge(customSystemText.trim() || 'Sistema Próprio')
                  : RPG_SYSTEMS.find((s) => s.id === selectedSystemId) || RPG_SYSTEMS[0];

              return (
                <div className="bg-zinc-950/90 border border-zinc-800/90 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Dices className="w-3.5 h-3.5 text-amber-400" />
                      {previewKnowledge.shortName}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300">
                      {previewKnowledge.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    <strong className="text-zinc-300">Mecânica:</strong> {previewKnowledge.diceConvention}
                  </p>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1.5 border-t border-zinc-800/70">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>O Copiloto IA responderá dúvidas de regras aplicando as mecânicas canônicas deste sistema.</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsNewCampaignOpen(false);
                  setNewTitle('');
                  setSelectedSystemId('dnd5e');
                  setCustomSystemText('');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newTitle.trim()) {
                    const finalSystem =
                      selectedSystemId === 'custom'
                        ? customSystemText.trim() || 'Sistema Próprio'
                        : RPG_SYSTEMS.find((s) => s.id === selectedSystemId)?.shortName || 'D&D 5e';

                    onCreateCampaign(newTitle.trim(), finalSystem);
                    setIsNewCampaignOpen(false);
                    setNewTitle('');
                    setSelectedSystemId('dnd5e');
                    setCustomSystemText('');
                  }
                }}
                disabled={!newTitle.trim()}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
              >
                Criar Campanha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes das Regras e Modelo do Sistema na IA */}
      {showSystemRulesInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Dices className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">{activeSystemKnowledge.name}</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30">
                    {activeSystemKnowledge.badge}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSystemRulesInfo(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                <div className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider">
                  Mecânica de Rolagem e Resolução
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{activeSystemKnowledge.diceConvention}</p>
              </div>

              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                <div className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider">
                  Mecânicas Chave do Sistema
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed">{activeSystemKnowledge.keyMechanics}</p>
              </div>

              <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                <div className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Diretrizes Injetadas no Copiloto IA
                </div>
                <div className="text-zinc-300 text-[11px] leading-relaxed whitespace-pre-wrap font-sans max-h-40 overflow-y-auto pr-1">
                  {activeSystemKnowledge.aiSystemDirectives}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => {
                  setShowSystemRulesInfo(false);
                  const prompt = `Como Mestre de ${activeSystemKnowledge.name}, explique detalhadamente como resolver um teste desafiador ou combate no sistema.`;
                  setInputPrompt(prompt);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Perguntar sobre regras no chat</span>
              </button>
              <button
                onClick={() => setShowSystemRulesInfo(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Insert Existing Campaign Sheet or 1-Click Bestiary Monster */}
      {isInsertSheetModalOpen && (
        <InsertSheetModal
          isOpen={isInsertSheetModalOpen}
          activeCampaignId={activeCampaign?.id || ''}
          activeSystemName={activeCampaign?.system || system}
          campaignCharacters={characters.filter((c) => c.campaignId === activeCampaign?.id)}
          onClose={() => setIsInsertSheetModalOpen(false)}
          onInsertIntoText={handleInsertSheetIntoNotes}
          onAddMonsterToCampaign={handleAddMonsterToCampaign}
          onEditCharacter={(char) => setEditingCharacter(char)}
          onOpenNewCharacterModal={(type) => {
            const newChar: CharacterSheet = {
              id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              campaignId: activeCampaign?.id || '',
              name: type === 'Monstro' ? 'Novo Monstro' : type === 'NPC' ? 'Novo NPC' : 'Novo Personagem',
              role: type === 'Monstro' ? 'Besta / Criatura' : 'Aventureiro',
              type,
              challengeRating: type === 'Monstro' ? 'ND 1' : undefined,
              avatarUrl: '',
              attributes: [
                { id: '1', key: 'FOR', value: '10' },
                { id: '2', key: 'DES', value: '10' },
                { id: '3', key: 'CON', value: '10' },
                { id: '4', key: 'INT', value: '10' },
                { id: '5', key: 'SAB', value: '10' },
                { id: '6', key: 'CAR', value: '10' },
              ],
              resources: [
                { id: 'hp', name: 'Pontos de Vida', current: 20, max: 20 },
              ],
              notes: '',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            onCreateCharacter?.(newChar);
            setEditingCharacter(newChar);
          }}
        />
      )}

      {/* Modal to Edit any Character / NPC / Monster Sheet directly */}
      {editingCharacter && (
        <EditCharacterModal
          isOpen={!!editingCharacter}
          character={editingCharacter}
          onClose={() => setEditingCharacter(null)}
          onSave={(updated) => {
            handleUpdateCharacterSheet(updated);
            setEditingCharacter(null);
          }}
        />
      )}
    </div>
  );
};
