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
} from 'lucide-react';
import { CharacterSheet, CharacterType } from '../types';
import { SHEET_TEMPLATES, SheetTemplate, findTemplateBySystem } from '../data/sheetTemplates';

interface NewCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignSystem?: string;
  initialType?: CharacterType;
  onCreateCharacter: (character: Omit<CharacterSheet, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const NewCharacterModal: React.FC<NewCharacterModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignSystem,
  initialType = 'PJ',
  onCreateCharacter,
}) => {
  const recommendedTemplate = findTemplateBySystem(campaignSystem);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(recommendedTemplate.id);
  const [characterType, setCharacterType] = useState<CharacterType>(initialType);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');

  // Whenever modal opens or initialType changes, update state
  useEffect(() => {
    if (isOpen) {
      setCharacterType(initialType);
      const rec = findTemplateBySystem(campaignSystem);
      setSelectedTemplateId(rec.id);
      setName(initialType === 'PJ' ? 'Novo Personagem' : 'Novo NPC');
      setRole(initialType === 'PJ' ? rec.defaultRolePJ : rec.defaultRoleNPC);
    }
  }, [isOpen, initialType, campaignSystem]);

  // When template changes, update default role if user hasn't typed a custom one
  const handleSelectTemplate = (tmpl: SheetTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setRole(characterType === 'PJ' ? tmpl.defaultRolePJ : tmpl.defaultRoleNPC);
  };

  const handleTypeChange = (newType: CharacterType) => {
    setCharacterType(newType);
    const tmpl = SHEET_TEMPLATES.find((t) => t.id === selectedTemplateId) || recommendedTemplate;
    setName(newType === 'PJ' ? 'Novo Personagem' : 'Novo NPC');
    setRole(newType === 'PJ' ? tmpl.defaultRolePJ : tmpl.defaultRoleNPC);
  };

  if (!isOpen) return null;

  const activeTemplate =
    SHEET_TEMPLATES.find((t) => t.id === selectedTemplateId) || SHEET_TEMPLATES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const charName = name.trim() || (characterType === 'PJ' ? 'Novo Personagem' : 'Novo NPC');
    const charRole =
      role.trim() || (characterType === 'PJ' ? activeTemplate.defaultRolePJ : activeTemplate.defaultRoleNPC);

    const newChar: Omit<CharacterSheet, 'id' | 'createdAt' | 'updatedAt'> = {
      campaignId,
      name: charName,
      role: charRole,
      type: characterType,
      attributes: activeTemplate.attributes.map((attr, idx) => ({
        id: `attr-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        key: attr.key,
        value: attr.value,
      })),
      resources: activeTemplate.resources.map((res, idx) => ({
        id: `res-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        name: res.name,
        current: res.current,
        max: res.max,
        color: res.color,
      })),
      notes: activeTemplate.notes,
    };

    onCreateCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        id="new-character-modal"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/20 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Criar Nova Ficha
                <span className="text-[11px] font-normal text-zinc-400">
                  (com atributos pré-configurados)
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Selecione o sistema para auto-popular atributos, recursos de combate e notas iniciais.
              </p>
            </div>
          </div>
          <button
            id="close-new-character-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Top Row: Type Selector & Initial Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/70">
            {/* Type selector (PJ vs NPC) */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Tipo da Ficha
              </label>
              <div className="flex p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                <button
                  type="button"
                  id="select-type-pj"
                  onClick={() => handleTypeChange('PJ')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    characterType === 'PJ'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  PJ (Jogador)
                </button>
                <button
                  type="button"
                  id="select-type-npc"
                  onClick={() => handleTypeChange('NPC')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    characterType === 'NPC'
                      ? 'bg-purple-600 text-zinc-100 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  NPC / Monstro
                </button>
              </div>
            </div>

            {/* Character Name */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Nome
              </label>
              <input
                id="modal-character-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={characterType === 'PJ' ? 'Ex: Sir Gideon' : 'Ex: Cultista das Sombras'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Character Role / Class */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Classe / Conceito
              </label>
              <input
                id="modal-character-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Ladino Especialista Nv 3"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Section Title: Modelos Pré-Configurados */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5 text-amber-500" />
                <span>Modelos Pré-Configurados de Sistema</span>
              </label>
              {campaignSystem && (
                <span className="text-[11px] text-zinc-400">
                  Sistema da Campanha: <strong className="text-amber-400">{campaignSystem}</strong>
                </span>
              )}
            </div>

            {/* Templates Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {SHEET_TEMPLATES.map((tmpl) => {
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
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/70 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/30'
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* Card Header: Title & Badges */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-zinc-100 line-clamp-1">
                          {tmpl.name}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 mb-2">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
                          }`}
                        >
                          {tmpl.badge}
                        </span>
                        {isRecommended && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Recomendado
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>

                    {/* Compact Attribute Pills preview */}
                    <div className="pt-2 border-t border-zinc-800/80">
                      <div className="text-[10px] text-zinc-400 mb-1 font-mono">
                        Atributos ({tmpl.attributes.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {tmpl.attributes.map((a) => (
                          <span
                            key={a.key}
                            className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-950 text-zinc-300 border border-zinc-800"
                          >
                            {a.key}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Template Detailed Preview Box */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-zinc-200">
                  Pré-visualização dos Dados Auto-Populados:{' '}
                  <span className="text-amber-400">{activeTemplate.name}</span>
                </h4>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {activeTemplate.attributes.length} Atributos • {activeTemplate.resources.length}{' '}
                Recursos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Attributes */}
              <div>
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span>Atributos da Ficha</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {activeTemplate.attributes.map((attr) => (
                    <div
                      key={attr.key}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-1.5 text-center"
                    >
                      <div className="text-[10px] font-bold text-zinc-400">{attr.key}</div>
                      <div className="text-xs font-mono font-bold text-amber-400">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Resources & Spells/Notes */}
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500" />
                    <span>Recursos & Barras em Tempo Real</span>
                  </div>
                  <div className="space-y-1.5">
                    {activeTemplate.resources.map((res) => (
                      <div
                        key={res.name}
                        className="flex items-center justify-between bg-zinc-950 border border-zinc-800/80 rounded-lg px-2.5 py-1 text-xs"
                      >
                        <span className="text-zinc-300 text-[11px]">{res.name}</span>
                        <span className="font-mono text-[11px] text-amber-400 font-bold">
                          {res.current} / {res.max}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-400 hidden sm:block">
            Você poderá personalizar ou adicionar qualquer outro atributo após a criação.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              id="confirm-create-character-btn"
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all cursor-pointer"
            >
              <span>Criar Ficha com {activeTemplate.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
