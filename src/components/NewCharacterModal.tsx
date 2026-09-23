import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Sparkles,
  Heart,
  Brain,
  Check,
  Dices,
  Flame,
  ArrowRight,
  BookOpen,
  Plus,
  Trash2,
  Sliders,
  Settings2,
  CheckSquare,
  Square,
  Wand2,
} from 'lucide-react';
import { CharacterSheet, CharacterType, AttributeItem, ResourceBar } from '../types';
import {
  SHEET_TEMPLATES,
  SheetTemplate,
  TemplateAttributeField,
  TemplateResourceField,
  findTemplateBySystem,
} from '../data/sheetTemplates';

interface NewCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignSystem?: string;
  initialType?: CharacterType;
  onCreateCharacter: (character: Omit<CharacterSheet, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isPlayerMode?: boolean;
  playerName?: string;
  masterId?: string;
}

interface EditableAttributeItem {
  key: string;
  label?: string;
  value: string | number;
  selected: boolean;
  isOptional?: boolean;
}

interface EditableResourceItem {
  name: string;
  current: number;
  max: number;
  color: string;
  selected: boolean;
}

export const NewCharacterModal: React.FC<NewCharacterModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignSystem,
  initialType = 'PJ',
  onCreateCharacter,
  isPlayerMode = false,
  playerName,
  masterId,
}) => {
  const recommendedTemplate = findTemplateBySystem(campaignSystem);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(recommendedTemplate.id);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [characterType, setCharacterType] = useState<CharacterType>(isPlayerMode ? 'PJ' : initialType);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');

  // Customizable Pre-defined fields state
  const [attributesList, setAttributesList] = useState<EditableAttributeItem[]>([]);
  const [resourcesList, setResourcesList] = useState<EditableResourceItem[]>([]);
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);
  const [notesContent, setNotesContent] = useState<string>('');

  // Custom field adder
  const [isAddingCustomAttr, setIsAddingCustomAttr] = useState(false);
  const [customAttrKey, setCustomAttrKey] = useState('');
  const [customAttrVal, setCustomAttrVal] = useState('');

  // Custom resource adder
  const [isAddingCustomRes, setIsAddingCustomRes] = useState(false);
  const [customResName, setCustomResName] = useState('');
  const [customResMax, setCustomResMax] = useState(10);
  const [customResColor, setCustomResColor] = useState('blue');

  const activeTemplate =
    SHEET_TEMPLATES.find((t) => t.id === selectedTemplateId) || recommendedTemplate;

  // Initialize form when opened or template changed
  const populateFromTemplate = (tmpl: SheetTemplate, type: CharacterType) => {
    setName(type === 'PJ' ? 'Novo Personagem' : 'Novo NPC');
    setRole(type === 'PJ' ? tmpl.defaultRolePJ : tmpl.defaultRoleNPC);

    // Initialize attributes with selection flags
    const attrs: EditableAttributeItem[] = tmpl.attributes.map((a) => ({
      key: a.key,
      label: a.label,
      value: a.value,
      selected: !a.isOptional, // Primary attributes checked by default
      isOptional: a.isOptional,
    }));
    setAttributesList(attrs);

    // Initialize resources with selection flags
    const res: EditableResourceItem[] = tmpl.resources.map((r) => ({
      name: r.name,
      current: r.current,
      max: r.max,
      color: r.color,
      selected: !r.isOptional,
    }));
    setResourcesList(res);

    setNotesContent(tmpl.notes);
    setIncludeNotes(true);
  };

  useEffect(() => {
    if (isOpen) {
      setCharacterType(initialType);
      const rec = findTemplateBySystem(campaignSystem);
      setSelectedTemplateId(rec.id);
      populateFromTemplate(rec, initialType);
    }
  }, [isOpen, initialType, campaignSystem]);

  // When template changes
  const handleSelectTemplate = (tmpl: SheetTemplate) => {
    setSelectedTemplateId(tmpl.id);
    populateFromTemplate(tmpl, characterType);
  };

  const handleTypeChange = (newType: CharacterType) => {
    setCharacterType(newType);
    setName(newType === 'PJ' ? 'Novo Personagem' : 'Novo NPC');
    setRole(newType === 'PJ' ? activeTemplate.defaultRolePJ : activeTemplate.defaultRoleNPC);
  };

  // Apply archetype preset
  const handleApplyArchetype = (archetypeId: string) => {
    const arch = activeTemplate.archetypes?.find((a) => a.id === archetypeId);
    if (!arch) return;

    setRole(characterType === 'PJ' ? arch.rolePJ : arch.roleNPC);

    // Update attributes matching archetype
    setAttributesList((prev) =>
      prev.map((attr) => {
        if (arch.attributes[attr.key] !== undefined) {
          return {
            ...attr,
            value: arch.attributes[attr.key],
            selected: true,
          };
        }
        return attr;
      })
    );

    // Update resources matching archetype
    if (arch.resources) {
      setResourcesList((prev) =>
        prev.map((res) => {
          if (arch.resources && arch.resources[res.name]) {
            const vals = arch.resources[res.name];
            return {
              ...res,
              current: vals.current,
              max: vals.max,
              selected: true,
            };
          }
          return res;
        })
      );
    }
  };

  // Toggle attribute selection
  const handleToggleAttribute = (index: number) => {
    setAttributesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  // Update attribute value
  const handleUpdateAttributeValue = (index: number, val: string) => {
    setAttributesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value: val } : item))
    );
  };

  // Select all or only basic attributes
  const handleSelectAllAttributes = (selectAll: boolean) => {
    setAttributesList((prev) =>
      prev.map((item) => ({
        ...item,
        selected: selectAll ? true : !item.isOptional,
      }))
    );
  };

  // Add custom attribute
  const handleAddCustomAttribute = () => {
    if (!customAttrKey.trim()) return;
    const newKey = customAttrKey.trim().toUpperCase();
    if (attributesList.some((a) => a.key === newKey)) return;

    setAttributesList((prev) => [
      ...prev,
      {
        key: newKey,
        label: customAttrKey.trim(),
        value: customAttrVal.trim() || '10',
        selected: true,
        isOptional: true,
      },
    ]);
    setCustomAttrKey('');
    setCustomAttrVal('');
    setIsAddingCustomAttr(false);
  };

  // Toggle resource selection
  const handleToggleResource = (index: number) => {
    setResourcesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  // Update resource values
  const handleUpdateResource = (index: number, current: number, max: number) => {
    setResourcesList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, current, max } : item))
    );
  };

  // Add custom resource
  const handleAddCustomResource = () => {
    if (!customResName.trim()) return;
    setResourcesList((prev) => [
      ...prev,
      {
        name: customResName.trim(),
        current: Number(customResMax) || 10,
        max: Number(customResMax) || 10,
        color: customResColor,
        selected: true,
      },
    ]);
    setCustomResName('');
    setIsAddingCustomRes(false);
  };

  if (!isOpen) return null;

  // Filter templates by category
  const categories = ['Todos', 'Fantasia Medieval', 'Nacional', 'Horror & Sobrenatural', 'Ficção & Cyberpunk', 'Narrativo & Aberto'];
  const filteredTemplates = SHEET_TEMPLATES.filter((t) =>
    selectedCategory === 'Todos' ? true : t.category === selectedCategory
  );

  const selectedAttributesCount = attributesList.filter((a) => a.selected).length;
  const selectedResourcesCount = resourcesList.filter((r) => r.selected).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const charName = name.trim() || (characterType === 'PJ' ? 'Novo Personagem' : 'Novo NPC');
    const charRole =
      role.trim() || (characterType === 'PJ' ? activeTemplate.defaultRolePJ : activeTemplate.defaultRoleNPC);

    // Only include selected attributes
    const finalAttributes: AttributeItem[] = attributesList
      .filter((a) => a.selected)
      .map((a, idx) => ({
        id: `attr-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        key: a.key,
        value: a.value,
      }));

    // Only include selected resources
    const finalResources: ResourceBar[] = resourcesList
      .filter((r) => r.selected)
      .map((r, idx) => ({
        id: `res-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name: r.name,
        current: r.current,
        max: r.max,
        color: r.color,
      }));

    const newChar: Omit<CharacterSheet, 'id' | 'createdAt' | 'updatedAt'> = {
      campaignId,
      name: charName,
      role: charRole,
      type: characterType,
      attributes: finalAttributes,
      resources: finalResources,
      notes: includeNotes ? notesContent : '',
      masterId: masterId || undefined,
      creatorName: playerName || undefined,
      system: activeTemplate.system,
    };

    onCreateCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        id="new-character-modal"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl shadow-cyan-950/20 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                {isPlayerMode ? 'Montar Ficha do Personagem' : 'Criar Ficha com Template de Sistema'}
                <span className="text-[11px] font-normal text-cyan-400 font-mono">
                  ({activeTemplate.name})
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {isPlayerMode
                  ? 'Ficha oficial montada de acordo com o sistema da mesa. O Mestre terá acesso em tempo real assim que for salva.'
                  : 'Escolha o sistema e selecione os campos pré-definidos (atributos e recursos de combate) desejados.'}
              </p>
            </div>
          </div>
          <button
            id="close-new-character-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {/* Top Row: Type Selector & Initial Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/70">
            {/* Type selector (PJ vs NPC) */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Tipo da Ficha
              </label>
              <div className="flex p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                <button
                  type="button"
                  id="select-type-pj"
                  onClick={() => handleTypeChange('PJ')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    characterType === 'PJ'
                      ? 'bg-cyan-500 text-zinc-950 shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  PJ (Jogador)
                </button>
                <button
                  type="button"
                  id="select-type-npc"
                  onClick={() => handleTypeChange('NPC')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    characterType === 'NPC'
                      ? 'bg-purple-600 text-zinc-100 shadow-xs font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  NPC / Monstro
                </button>
              </div>
            </div>

            {/* Character Name */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Nome do Personagem
              </label>
              <input
                id="modal-character-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={characterType === 'PJ' ? 'Ex: Sir Gideon' : 'Ex: Cultista da Noite'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Character Role / Concept */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Classe / Conceito
              </label>
              <input
                id="modal-character-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Ladino Especialista Nv 2"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Section 1: Template Selection by System */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Dices className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold text-zinc-200">1. Escolha o Sistema de RPG</span>
                {campaignSystem && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                    Campanha: {campaignSystem}
                  </span>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-[10px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-zinc-800 text-cyan-400 font-semibold border border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {filteredTemplates.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                const isRecommended =
                  campaignSystem &&
                  (recommendedTemplate.id === tmpl.id ||
                    campaignSystem.toLowerCase().includes(tmpl.system.toLowerCase()));

                return (
                  <div
                    key={tmpl.id}
                    id={`template-card-${tmpl.id}`}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/40 shadow-sm shadow-cyan-950/20'
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-zinc-100 line-clamp-1">
                          {tmpl.name}
                        </span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 mb-1.5">
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {tmpl.badge}
                        </span>
                        {isRecommended && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                            ★ Ativo
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                        {tmpl.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono">
                      {tmpl.attributes.length} attrs • {tmpl.resources.length} barras
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Archetype Preset Pills (if present for this template) */}
          {activeTemplate.archetypes && activeTemplate.archetypes.length > 0 && (
            <div className="p-2.5 bg-cyan-950/15 border border-cyan-500/20 rounded-xl flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-cyan-400 font-semibold text-[11px] shrink-0">
                <Wand2 className="w-3.5 h-3.5" />
                <span>Preencher com Arquétipo Rápido:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {activeTemplate.archetypes.map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => handleApplyArchetype(arch.id)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 border border-zinc-700/80 hover:border-cyan-500/40 text-[11px] transition-colors cursor-pointer"
                    title={arch.description}
                  >
                    {arch.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Choose Pre-defined Fields & Attributes */}
          <div className="space-y-3 bg-zinc-900/40 border border-zinc-800 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <h3 className="text-xs font-bold text-zinc-100">
                  2. Campos Pré-Definidos da Ficha ({activeTemplate.name})
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                  {selectedAttributesCount} Atributos • {selectedResourcesCount} Barras de Recurso
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSelectAllAttributes(true)}
                  className="px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Marcar Todos
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllAttributes(false)}
                  className="px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Apenas Principais
                </button>
              </div>
            </div>

            {/* Attributes Grid with Toggles and Live Inputs */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Atributos & Estatísticas</span>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomAttr(!isAddingCustomAttr)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 normal-case font-normal cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Campo Extra</span>
                </button>
              </div>

              {/* Form to add custom attribute */}
              {isAddingCustomAttr && (
                <div className="mb-2 p-2.5 bg-zinc-950 border border-cyan-500/30 rounded-lg flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome do Campo (ex: CA, PERC)"
                    value={customAttrKey}
                    onChange={(e) => setCustomAttrKey(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 flex-1"
                  />
                  <input
                    type="text"
                    placeholder="Valor (ex: 14 ou +2)"
                    value={customAttrVal}
                    onChange={(e) => setCustomAttrVal(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 w-24"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAttribute}
                    className="px-3 py-1 bg-cyan-500 text-zinc-950 rounded text-xs font-bold hover:bg-cyan-400 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {attributesList.map((attr, index) => (
                  <div
                    key={`${attr.key}-${index}`}
                    className={`p-2 rounded-lg border transition-all flex flex-col justify-between ${
                      attr.selected
                        ? 'bg-zinc-950 border-cyan-500/40 shadow-xs'
                        : 'bg-zinc-950/40 border-zinc-800/80 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <label
                        className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-bold text-zinc-200"
                        onClick={() => handleToggleAttribute(index)}
                      >
                        <input
                          type="checkbox"
                          checked={attr.selected}
                          onChange={() => handleToggleAttribute(index)}
                          className="rounded border-zinc-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span title={attr.label || attr.key}>{attr.key}</span>
                      </label>
                      {attr.isOptional && (
                        <span className="text-[9px] text-zinc-500 font-mono">opcional</span>
                      )}
                    </div>

                    <div className="mt-1">
                      <input
                        type="text"
                        disabled={!attr.selected}
                        value={String(attr.value)}
                        onChange={(e) => handleUpdateAttributeValue(index, e.target.value)}
                        className={`w-full bg-zinc-900 border rounded px-2 py-0.5 text-xs text-center font-mono font-bold transition-colors ${
                          attr.selected
                            ? 'text-cyan-400 border-zinc-700 focus:border-cyan-500 focus:outline-none'
                            : 'text-zinc-600 border-zinc-800'
                        }`}
                      />
                      {attr.label && attr.label !== attr.key && (
                        <div className="text-[9px] text-zinc-500 truncate text-center mt-0.5">
                          {attr.label}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Resource Bars Selector */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>Barras de Recursos de Combate</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomRes(!isAddingCustomRes)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 normal-case font-normal cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar Barra Extra</span>
                </button>
              </div>

              {/* Form to add custom resource */}
              {isAddingCustomRes && (
                <div className="mb-2 p-2.5 bg-zinc-950 border border-cyan-500/30 rounded-lg flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Nome da Barra (ex: Fúria, Fadiga)"
                    value={customResName}
                    onChange={(e) => setCustomResName(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 flex-1"
                  />
                  <input
                    type="number"
                    placeholder="Valor Máx"
                    value={customResMax}
                    onChange={(e) => setCustomResMax(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 w-20"
                  />
                  <select
                    value={customResColor}
                    onChange={(e) => setCustomResColor(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="red">Vermelho</option>
                    <option value="blue">Azul</option>
                    <option value="amber">Âmbar</option>
                    <option value="purple">Roxo</option>
                    <option value="emerald">Verde</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomResource}
                    className="px-3 py-1 bg-cyan-500 text-zinc-950 rounded text-xs font-bold hover:bg-cyan-400 cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {resourcesList.map((res, index) => (
                  <div
                    key={`${res.name}-${index}`}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                      res.selected
                        ? 'bg-zinc-950 border-zinc-700'
                        : 'bg-zinc-950/40 border-zinc-800/80 opacity-50'
                    }`}
                  >
                    <label
                      className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-zinc-200 min-w-0"
                      onClick={() => handleToggleResource(index)}
                    >
                      <input
                        type="checkbox"
                        checked={res.selected}
                        onChange={() => handleToggleResource(index)}
                        className="rounded border-zinc-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{res.name}</span>
                    </label>

                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        disabled={!res.selected}
                        value={res.current}
                        onChange={(e) =>
                          handleUpdateResource(index, Number(e.target.value), res.max)
                        }
                        className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 text-xs text-center font-mono font-bold text-zinc-200"
                      />
                      <span className="text-zinc-500 text-xs">/</span>
                      <input
                        type="number"
                        disabled={!res.selected}
                        value={res.max}
                        onChange={(e) =>
                          handleUpdateResource(index, res.current, Number(e.target.value))
                        }
                        className="w-12 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 text-xs text-center font-mono font-bold text-cyan-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Starting Equipment Toggle */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Incluir Kit Inicial de Equipamento & Perícias do Sistema</span>
                </div>
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded border-zinc-700 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              {includeNotes && (
                <textarea
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                  placeholder="Notas, armas e regras pré-definidas..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-400 hidden sm:block">
            Você poderá adicionar novos atributos e editar valores a qualquer momento na ficha.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="confirm-create-character-btn"
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/30 transition-all cursor-pointer"
            >
              <span>Criar Ficha ({selectedAttributesCount} campos)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
