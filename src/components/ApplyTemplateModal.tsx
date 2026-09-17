import React, { useState, useEffect } from 'react';
import { X, Dices, Brain, Heart, Check, Sparkles, AlertTriangle, Sliders, CheckSquare, Square } from 'lucide-react';
import { SHEET_TEMPLATES, SheetTemplate, findTemplateBySystem } from '../data/sheetTemplates';
import { CharacterSheet, AttributeItem, ResourceBar } from '../types';

interface ApplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterSheet;
  campaignSystem?: string;
  onApplyTemplate: (
    newAttributes: AttributeItem[],
    newResources?: ResourceBar[],
    newNotes?: string
  ) => void;
}

export const ApplyTemplateModal: React.FC<ApplyTemplateModalProps> = ({
  isOpen,
  onClose,
  character,
  campaignSystem,
  onApplyTemplate,
}) => {
  const defaultTmpl = findTemplateBySystem(campaignSystem);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTmpl.id);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, boolean>>({});
  const [includeResources, setIncludeResources] = useState<boolean>(true);
  const [selectedResources, setSelectedResources] = useState<Record<string, boolean>>({});
  const [includeNotes, setIncludeNotes] = useState<boolean>(false);

  const selectedTemplate =
    SHEET_TEMPLATES.find((t) => t.id === selectedTemplateId) || defaultTmpl;

  // Whenever template changes, initialize attributes & resources selection
  useEffect(() => {
    if (isOpen) {
      const tmpl = SHEET_TEMPLATES.find((t) => t.id === selectedTemplateId) || defaultTmpl;
      const initialAttrs: Record<string, boolean> = {};
      tmpl.attributes.forEach((a) => {
        initialAttrs[a.key] = !a.isOptional;
      });
      setSelectedAttributes(initialAttrs);

      const initialRes: Record<string, boolean> = {};
      tmpl.resources.forEach((r) => {
        initialRes[r.name] = !r.isOptional;
      });
      setSelectedResources(initialRes);
    }
  }, [isOpen, selectedTemplateId]);

  if (!isOpen) return null;

  const toggleAttribute = (key: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleResource = (name: string) => {
    setSelectedResources((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleApply = () => {
    const generatedAttributes: AttributeItem[] = selectedTemplate.attributes
      .filter((attr) => selectedAttributes[attr.key])
      .map((attr, idx) => ({
        id: `attr-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        key: attr.key,
        value: attr.value,
      }));

    const generatedResources: ResourceBar[] | undefined = includeResources
      ? selectedTemplate.resources
          .filter((res) => selectedResources[res.name])
          .map((res, idx) => ({
            id: `res-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            name: res.name,
            current: res.current,
            max: res.max,
            color: res.color,
          }))
      : undefined;

    const notesToApply = includeNotes ? selectedTemplate.notes : undefined;

    onApplyTemplate(generatedAttributes, generatedResources, notesToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        id="apply-template-modal"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Reaplicar Modelo de Atributos & Campos
                <span className="text-[11px] font-normal text-cyan-400">
                  ({character.name})
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Selecione o sistema e escolha quais campos pré-definidos deseja aplicar nesta ficha.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>
              Esta ação atualizará os atributos de <strong>{character.name}</strong> para o esquema do sistema escolhido.
            </span>
          </div>

          {/* Grid of Templates */}
          <div>
            <div className="text-xs font-bold text-zinc-200 mb-2">1. Escolha o Sistema</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SHEET_TEMPLATES.map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500/30'
                        : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-zinc-100 truncate">{tmpl.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-400">
                        {tmpl.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-defined fields selection */}
          <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-200">
                2. Selecione os Campos Pré-definidos ({selectedTemplate.name})
              </span>
              <button
                type="button"
                onClick={() => {
                  const all: Record<string, boolean> = {};
                  selectedTemplate.attributes.forEach((a) => (all[a.key] = true));
                  setSelectedAttributes(all);
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                Selecionar Todos
              </button>
            </div>

            {/* Attributes checkboxes */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 mb-1.5">Atributos:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                {selectedTemplate.attributes.map((attr) => (
                  <label
                    key={attr.key}
                    onClick={() => toggleAttribute(attr.key)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer select-none transition-all ${
                      selectedAttributes[attr.key]
                        ? 'bg-zinc-950 border-cyan-500/40 text-cyan-300 font-bold'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedAttributes[attr.key]}
                      onChange={() => toggleAttribute(attr.key)}
                      className="rounded border-zinc-700 text-cyan-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="truncate">{attr.key} ({String(attr.value)})</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Resources checkboxes */}
            <div className="pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer select-none mb-2">
                <input
                  type="checkbox"
                  checked={includeResources}
                  onChange={(e) => setIncludeResources(e.target.checked)}
                  className="rounded border-zinc-700 text-cyan-500 w-3.5 h-3.5"
                />
                <span>Substituir Barras de Recursos de Combate</span>
              </label>

              {includeResources && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                  {selectedTemplate.resources.map((res) => (
                    <label
                      key={res.name}
                      onClick={() => toggleResource(res.name)}
                      className={`p-1.5 px-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer select-none ${
                        selectedResources[res.name]
                          ? 'bg-zinc-950 border-zinc-700 text-zinc-200'
                          : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <input
                          type="checkbox"
                          checked={!!selectedResources[res.name]}
                          onChange={() => toggleResource(res.name)}
                          className="rounded border-zinc-700 text-cyan-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{res.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-400">
                        {res.current}/{res.max}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Notes checkbox */}
            <div className="pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="rounded border-zinc-700 text-cyan-500 w-3.5 h-3.5"
                />
                <span>Substituir bloco de anotações pelo modelo padrão do sistema (atenção: sobrescreve texto atual)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-800/90 bg-zinc-900/60 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="confirm-apply-template-btn"
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/30 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar Campos ({selectedTemplate.name})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
