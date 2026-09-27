import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  FolderInput,
  Copy,
  ArrowRight,
  Search,
  Shield,
  Heart,
  BookOpen,
  Check,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  User,
  Upload,
  ChevronRight,
  Download,
  Info,
  Layers,
  Flame,
} from 'lucide-react';
import { Campaign, CharacterSheet, UserProfile } from '../types';
import { storageService } from '../services/storage';
import { findTemplateBySystem } from '../data/sheetTemplates';

interface PullCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCampaign: Campaign;
  currentUser: UserProfile;
  allCharacters: CharacterSheet[];
  campaigns?: Campaign[];
  existingCharacter?: CharacterSheet;
  onImportCharacter: (
    newChar: CharacterSheet,
    options?: { replaceActive?: boolean; isMove?: boolean }
  ) => void;
}

export const PullCharacterModal: React.FC<PullCharacterModalProps> = ({
  isOpen,
  onClose,
  targetCampaign,
  currentUser,
  allCharacters,
  campaigns = [],
  existingCharacter,
  onImportCharacter,
}) => {
  const [activeTab, setActiveTab] = useState<'my_chars' | 'all_chars' | 'json_file'>('my_chars');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'copy' | 'move'>('copy');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [adaptSystem, setAdaptSystem] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [parsedJsonChar, setParsedJsonChar] = useState<CharacterSheet | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pool of all candidate characters from other campaigns
  const candidateCharacters = useMemo(() => {
    const list: CharacterSheet[] = [];
    const seen = new Set<string>();

    const addList = (items: CharacterSheet[]) => {
      for (const item of items) {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          list.push(item);
        }
      }
    };

    addList(allCharacters);
    addList(storageService.getAllAccessibleCharacters(currentUser.id));

    // Filter out characters that already belong to this campaign
    return list.filter((c) => c.campaignId !== targetCampaign.id);
  }, [allCharacters, currentUser.id, targetCampaign.id]);

  // Map campaignId to campaign title
  const campaignMap = useMemo(() => {
    const map = new Map<string, Campaign>();
    for (const c of campaigns) {
      if (c && c.id) {
        map.set(c.id, c);
      }
    }
    return map;
  }, [campaigns]);

  // Filtered lists
  const myCharacters = useMemo(() => {
    return candidateCharacters.filter((c) => {
      const isOwner =
        (c.userId && c.userId === currentUser.id) ||
        (c.creatorName && c.creatorName === currentUser.displayName) ||
        c.type === 'PJ';
      return isOwner;
    });
  }, [candidateCharacters, currentUser]);

  const displayedCharacters = useMemo(() => {
    const baseList = activeTab === 'my_chars' ? myCharacters : candidateCharacters;
    if (!searchQuery.trim()) return baseList;

    const q = searchQuery.toLowerCase().trim();
    return baseList.filter((c) => {
      const originCamp = campaignMap.get(c.campaignId);
      const campName = originCamp?.title?.toLowerCase() || '';
      return (
        c.name.toLowerCase().includes(q) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.system && c.system.toLowerCase().includes(q)) ||
        campName.includes(q) ||
        (c.backstory && c.backstory.toLowerCase().includes(q))
      );
    });
  }, [activeTab, myCharacters, candidateCharacters, searchQuery, campaignMap]);

  // Selected character reference
  const selectedCharacter = useMemo(() => {
    if (activeTab === 'json_file' && parsedJsonChar) {
      return parsedJsonChar;
    }
    if (!selectedCharId) return null;
    return candidateCharacters.find((c) => c.id === selectedCharId) || null;
  }, [activeTab, parsedJsonChar, selectedCharId, candidateCharacters]);

  // When selection changes, reset inputs
  const handleSelectCharacter = (char: CharacterSheet) => {
    setSelectedCharId(char.id);
    setCustomName(char.name);
    setCustomRole(char.role || '');
    setAdaptSystem(false);
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        parseAndSetJson(content);
      } catch (err) {
        setJsonError('Erro ao ler arquivo: formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  const parseAndSetJson = (text: string) => {
    setJsonError(null);
    try {
      const data = JSON.parse(text);
      if (!data.name || typeof data.name !== 'string') {
        throw new Error('A ficha JSON precisa ter pelo menos um campo "name".');
      }

      const imported: CharacterSheet = {
        id: data.id || `char-imported-${Date.now()}`,
        campaignId: targetCampaign.id,
        name: data.name,
        role: data.role || 'Aventureiro',
        type: 'PJ',
        attributes: Array.isArray(data.attributes) ? data.attributes : [],
        resources: Array.isArray(data.resources)
          ? data.resources
          : [{ id: 'res-hp', name: 'Pontos de Vida', current: 20, max: 20, color: 'red' }],
        notes: data.notes || '',
        backstory: data.backstory || '',
        avatarUrl: data.avatarUrl || undefined,
        system: data.system || targetCampaign.system,
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      setParsedJsonChar(imported);
      setSelectedCharId(imported.id);
      setCustomName(imported.name);
      setCustomRole(imported.role);
    } catch (err: any) {
      setParsedJsonChar(null);
      setJsonError(err.message || 'JSON inválido para formato de ficha de personagem.');
    }
  };

  // Export character to JSON
  const handleExportJson = (char: CharacterSheet) => {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ficha_${char.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Perform the import
  const handleConfirmImport = () => {
    if (!selectedCharacter) return;

    const targetTemplate = findTemplateBySystem(targetCampaign.system);

    // Prepare attributes: either keep or adapt
    let finalAttributes = selectedCharacter.attributes.map((attr) => ({
      ...attr,
      id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    if (adaptSystem && targetTemplate) {
      finalAttributes = targetTemplate.attributes.map((tplAttr) => {
        // Try to match existing attribute key
        const match = selectedCharacter.attributes.find(
          (a) => a.key.toUpperCase() === tplAttr.key.toUpperCase()
        );
        return {
          id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          key: tplAttr.key,
          value: match ? match.value : tplAttr.value,
        };
      });
    }

    const finalResources = selectedCharacter.resources.map((res) => ({
      ...res,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      current: res.max, // Reset current HP/Mana to full on new campaign
    }));

    const newId =
      importMode === 'copy'
        ? `char-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        : selectedCharacter.id;

    const importedSheet: CharacterSheet = {
      ...selectedCharacter,
      id: newId,
      campaignId: targetCampaign.id,
      userId: currentUser.id,
      creatorName: currentUser.displayName,
      masterId: targetCampaign.masterId,
      name: customName.trim() || selectedCharacter.name,
      role: customRole.trim() || selectedCharacter.role,
      type: 'PJ',
      attributes: finalAttributes,
      resources: finalResources,
      notes: selectedCharacter.notes || '',
      backstory: selectedCharacter.backstory || '',
      avatarUrl: selectedCharacter.avatarUrl,
      system: adaptSystem ? targetCampaign.system : selectedCharacter.system || targetCampaign.system,
      createdAt: importMode === 'copy' ? Date.now() : selectedCharacter.createdAt,
      updatedAt: Date.now(),
    };

    onImportCharacter(importedSheet, {
      replaceActive: true,
      isMove: importMode === 'move',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/40 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Puxar Ficha de Outra Campanha</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  Jogador
                </span>
              </h2>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 flex-wrap">
                <span>Destino:</span>
                <strong className="text-zinc-200">{targetCampaign.title}</strong>
                <span className="text-zinc-600">•</span>
                <span className="text-cyan-400 font-mono text-[11px]">{targetCampaign.system}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing character warning */}
        {existingCharacter && (
          <div className="px-4 sm:px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-300 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Você já possui o personagem <strong>{existingCharacter.name}</strong> ativo nesta mesa. Ao puxar uma ficha, ela se tornará sua nova ficha ativa para o Mestre.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800/80 bg-zinc-900/60 px-4 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('my_chars');
              if (activeTab === 'json_file') setSelectedCharId(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'my_chars'
                ? 'border-cyan-400 text-cyan-300 bg-zinc-950/60 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Minhas Fichas ({myCharacters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('all_chars');
              if (activeTab === 'json_file') setSelectedCharId(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all_chars'
                ? 'border-cyan-400 text-cyan-300 bg-zinc-950/60 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todas as Fichas Disponíveis ({candidateCharacters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('json_file');
              if (parsedJsonChar) setSelectedCharId(parsedJsonChar.id);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'json_file'
                ? 'border-cyan-400 text-cyan-300 bg-zinc-950/60 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar de Arquivo JSON</span>
          </button>
        </div>

        {/* Main Content Area: Split 2 columns on desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* LEFT COLUMN: List or JSON Input */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-800/80 overflow-hidden min-h-0">
            {activeTab !== 'json_file' ? (
              <>
                {/* Search Bar */}
                <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/30">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por nome, classe, sistema ou campanha..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/60"
                    />
                  </div>
                </div>

                {/* Character Cards List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {displayedCharacters.length === 0 ? (
                    <div className="text-center py-10 px-4 space-y-2 text-zinc-500">
                      <FolderInput className="w-8 h-8 mx-auto text-zinc-600" />
                      <p className="text-xs font-medium text-zinc-400">
                        {searchQuery
                          ? 'Nenhuma ficha encontrada para esta busca.'
                          : 'Nenhuma ficha encontrada em outras campanhas.'}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        Você também pode usar a aba &quot;Importar de Arquivo JSON&quot; caso tenha uma ficha salva.
                      </p>
                    </div>
                  ) : (
                    displayedCharacters.map((char) => {
                      const originCamp = campaignMap.get(char.campaignId);
                      const isSelected = selectedCharId === char.id;
                      const hpRes = char.resources?.find((r) =>
                        r.name.toLowerCase().includes('vida') || r.name.toLowerCase().includes('pv')
                      );

                      return (
                        <div
                          key={char.id}
                          onClick={() => handleSelectCharacter(char)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? 'bg-cyan-950/30 border-cyan-500 shadow-md shadow-cyan-950/20 ring-1 ring-cyan-500/40'
                              : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Portrait */}
                            <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                              {char.avatarUrl ? (
                                <img
                                  src={char.avatarUrl}
                                  alt={char.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-xs text-zinc-400">
                                  {char.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-xs text-zinc-100 truncate">
                                  {char.name}
                                </h4>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    {char.type}
                                  </span>
                                  {isSelected && (
                                    <span className="w-4 h-4 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                  )}
                                </div>
                              </div>

                              <p className="text-[11px] text-zinc-400 truncate">
                                {char.role || 'Sem classe'}
                              </p>

                              <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-zinc-500">
                                <span className="font-mono text-cyan-400/80">
                                  {char.system || 'Sistema livre'}
                                </span>
                                <span>•</span>
                                <span className="truncate max-w-[140px] text-zinc-400">
                                  {originCamp ? `De: ${originCamp.title}` : 'Campanha anterior'}
                                </span>
                                {hpRes && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-400 font-mono">
                                      PV {hpRes.current}/{hpRes.max}
                                    </span>
                                  </>
                                )}
                                {char.backstory?.trim() && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-400 flex items-center gap-0.5">
                                      <BookOpen className="w-2.5 h-2.5" /> História
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* JSON Import View */
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Importar Ficha via Arquivo JSON
                  </span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Você pode importar um arquivo exportado de outro Grimório ou colar o código JSON da ficha abaixo.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Carregar arquivo (.json):
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-zinc-700 hover:border-cyan-500/60 bg-zinc-900/60 hover:bg-zinc-900 flex items-center justify-center gap-2 text-xs font-medium text-zinc-300 hover:text-cyan-300 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Selecionar arquivo JSON do seu computador</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">
                    Ou cole o JSON da ficha diretamente:
                  </label>
                  <textarea
                    rows={7}
                    value={jsonText}
                    onChange={(e) => {
                      setJsonText(e.target.value);
                      parseAndSetJson(e.target.value);
                    }}
                    placeholder='{"name": "Sir Kaelen", "role": "Paladino Nv 5", "attributes": [...]}'
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 font-mono text-[11px] text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {jsonError && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}

                {parsedJsonChar && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Ficha válida: <strong>{parsedJsonChar.name}</strong> ({parsedJsonChar.role})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Selected Character Preview & Import Configuration */}
          <div className="flex-1 flex flex-col bg-zinc-900/20 overflow-y-auto p-4 sm:p-5 space-y-4">
            {!selectedCharacter ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-2">
                <Shield className="w-10 h-10 text-zinc-700 mb-1" />
                <h4 className="text-xs font-bold text-zinc-400">Nenhuma ficha selecionada</h4>
                <p className="text-[11px] text-zinc-600 max-w-xs">
                  Clique em uma ficha na lista à esquerda para pré-visualizar atributos, história e configurar a importação para esta campanha.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Character Hero Card */}
                <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/30 via-zinc-900 to-zinc-950 border border-cyan-500/30 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-800 border-2 border-cyan-500/40 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                        {selectedCharacter.avatarUrl ? (
                          <img
                            src={selectedCharacter.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-extrabold text-sm text-cyan-400">
                            {selectedCharacter.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                          {selectedCharacter.name}
                        </h3>
                        <p className="text-xs text-zinc-400">{selectedCharacter.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                            {selectedCharacter.system || 'Sistema original'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExportJson(selectedCharacter)}
                      className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Exportar esta ficha como JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Attributes Preview Chips */}
                  {selectedCharacter.attributes && selectedCharacter.attributes.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1.5">
                        Atributos Originais:
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {selectedCharacter.attributes.map((attr) => (
                          <div
                            key={attr.id}
                            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center"
                          >
                            <span className="block text-[9px] font-bold text-cyan-400">{attr.key}</span>
                            <span className="block text-xs font-mono font-bold text-zinc-200">
                              {attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources Preview */}
                  {selectedCharacter.resources && selectedCharacter.resources.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                      {selectedCharacter.resources.map((res) => (
                        <span
                          key={res.id}
                          className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300 flex items-center gap-1"
                        >
                          <Flame className="w-2.5 h-2.5 text-cyan-400" />
                          <span>
                            {res.name}: {res.current}/{res.max}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Story Preview */}
                  {selectedCharacter.backstory?.trim() && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        <span>História & Biografia Registrada</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 italic line-clamp-3 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60 leading-relaxed">
                        &quot;{selectedCharacter.backstory}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* Import Customization Form */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                  <span className="text-xs font-bold text-zinc-200 block border-b border-zinc-800 pb-2">
                    Opções de Importação para Esta Campanha
                  </span>

                  {/* Name and Role inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Nome do Personagem na Mesa:
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                        placeholder="Nome"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Classe / Conceito:
                      </label>
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                        placeholder="Classe / Papel"
                      />
                    </div>
                  </div>

                  {/* Import Mode Radio */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-zinc-400">
                      Modo de Importação:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('copy')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          importMode === 'copy'
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Copy className="w-3.5 h-3.5" />
                          <span>Criar Cópia (Recomendado)</span>
                        </div>
                        <p className="text-[10px] mt-1 text-zinc-500 leading-tight">
                          Mantém a ficha original na outra campanha intacta.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('move')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          importMode === 'move'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Mover / Transferir</span>
                        </div>
                        <p className="text-[10px] mt-1 text-zinc-500 leading-tight">
                          Transfere a ficha permanentemente para esta mesa.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* System Difference Notice & Adaptation */}
                  {selectedCharacter.system &&
                    selectedCharacter.system.toLowerCase() !== targetCampaign.system.toLowerCase() && (
                      <div className="p-3 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                          <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Sistemas Diferentes</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          A ficha original é de <strong>{selectedCharacter.system}</strong>, enquanto esta campanha utiliza <strong>{targetCampaign.system}</strong>.
                        </p>
                        <label className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={adaptSystem}
                            onChange={(e) => setAdaptSystem(e.target.checked)}
                            className="rounded border-zinc-700 text-cyan-500 focus:ring-0"
                          />
                          <span>Adaptar atributos para a lista oficial de {targetCampaign.system}</span>
                        </label>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            id="btn-confirm-pull-character"
            disabled={!selectedCharacter}
            onClick={handleConfirmImport}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              selectedCharacter
                ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-zinc-950 shadow-cyan-950/50 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <FolderInput className="w-4 h-4" />
            <span>
              {selectedCharacter
                ? `Puxar "${customName || selectedCharacter.name}" para a Mesa`
                : 'Selecione uma Ficha'}
            </span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
