import React, { useState } from 'react';
import { X, Dices, Brain, Heart, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { SHEET_TEMPLATES, SheetTemplate } from '../data/sheetTemplates';
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SHEET_TEMPLATES[0].id);
  const [includeResources, setIncludeResources] = useState<boolean>(true);
  const [includeNotes, setIncludeNotes] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedTemplate =
    SHEET_TEMPLATES.find((t) => t.id === selectedTemplateId) || SHEET_TEMPLATES[0];

  const handleApply = () => {
    const generatedAttributes: AttributeItem[] = selectedTemplate.attributes.map((attr, idx) => ({
      id: `attr-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      key: attr.key,
      value: attr.value,
    }));

    const generatedResources: ResourceBar[] | undefined = includeResources
      ? selectedTemplate.resources.map((res, idx) => ({
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
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-amber-950/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Reaplicar Modelo de Atributos
                <span className="text-[11px] font-normal text-amber-400">
                  ({character.name})
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Substitui o esquema de atributos desta ficha pelo padrão do sistema escolhido.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Esta ação substituirá os atributos atuais (
              <strong>{character.attributes.map((a) => a.key).join(', ') || 'Nenhum'}</strong>)
              pelos novos atributos do modelo selecionado.
            </span>
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SHEET_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/70 ring-1 ring-amber-500/30'
                      : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-zinc-100">{tmpl.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                    {tmpl.description}
                  </p>
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
              );
            })}
          </div>

          {/* Options: Include Resources / Notes */}
          <div className="p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2">
            <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Opções de Atualização
            </div>
            <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeResources}
                onChange={(e) => setIncludeResources(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>
                Substituir também as barras de recursos (ex:{' '}
                {selectedTemplate.resources.map((r) => r.name).join(', ')})
              </span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0 focus:ring-offset-0"
              />
              <span>
                Substituir bloco de anotações pelo modelo padrão do sistema (atenção: sobrescreve o texto atual)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/90 bg-zinc-900/60 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            id="confirm-apply-template-btn"
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/30 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Aplicar Modelo ({selectedTemplate.name})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
