import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Shield,
  Heart,
  Skull,
  User,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { CharacterSheet, CharacterType, AttributeItem, ResourceBar } from '../types';
import { GeneratePortraitModal } from './GeneratePortraitModal';

interface EditCharacterModalProps {
  isOpen: boolean;
  character: CharacterSheet | null;
  onClose: () => void;
  onSave: (updatedCharacter: CharacterSheet) => void;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({
  isOpen,
  character,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(character?.name || '');
  const [role, setRole] = useState(character?.role || '');
  const [type, setType] = useState<CharacterType>(character?.type || 'PJ');
  const [challengeRating, setChallengeRating] = useState(character?.challengeRating || '');
  const [avatarUrl, setAvatarUrl] = useState(character?.avatarUrl || '');
  const [attributes, setAttributes] = useState<AttributeItem[]>(character?.attributes ? [...character.attributes] : []);
  const [resources, setResources] = useState<ResourceBar[]>(character?.resources ? [...character.resources] : []);
  const [notes, setNotes] = useState(character?.notes || '');
  const [backstory, setBackstory] = useState(character?.backstory || '');
  const [isPortraitModalOpen, setIsPortraitModalOpen] = useState(false);

  // New attribute state
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrVal, setNewAttrVal] = useState('');

  // New resource state
  const [newResName, setNewResName] = useState('');
  const [newResMax, setNewResMax] = useState(20);

  useEffect(() => {
    if (character && isOpen) {
      setName(character.name || '');
      setRole(character.role || '');
      setType(character.type || 'PJ');
      setChallengeRating(character.challengeRating || '');
      setAvatarUrl(character.avatarUrl || '');
      setAttributes(character.attributes ? [...character.attributes] : []);
      setResources(character.resources ? [...character.resources] : []);
      setNotes(character.notes || '');
      setBackstory(character.backstory || '');
      setIsPortraitModalOpen(false);
      setNewAttrKey('');
      setNewAttrVal('');
      setNewResName('');
      setNewResMax(20);
    }
  }, [character, isOpen]);

  if (!isOpen || !character) return null;

  const handleAddAttribute = () => {
    if (!newAttrKey.trim()) return;
    setAttributes((prev) => [
      ...prev,
      {
        id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        key: newAttrKey.trim().toUpperCase(),
        value: newAttrVal.trim() || '10',
      },
    ]);
    setNewAttrKey('');
    setNewAttrVal('');
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateAttribute = (id: string, key: string, value: string) => {
    setAttributes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, key, value } : a))
    );
  };

  const handleAddResource = () => {
    if (!newResName.trim()) return;
    setResources((prev) => [
      ...prev,
      {
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: newResName.trim(),
        current: Number(newResMax) || 10,
        max: Number(newResMax) || 10,
      },
    ]);
    setNewResName('');
    setNewResMax(20);
  };

  const handleRemoveResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateResource = (
    id: string,
    field: 'name' | 'current' | 'max',
    val: string | number
  ) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (field === 'name') return { ...r, name: String(val) };
        const numVal = Math.max(0, Number(val) || 0);
        if (field === 'max') {
          return { ...r, max: numVal, current: Math.min(r.current, numVal) };
        }
        return { ...r, current: numVal };
      })
    );
  };

  const handleSave = () => {
    onSave({
      ...character,
      name: name.trim() || 'Sem Nome',
      role: role.trim() || 'Personagem',
      type,
      challengeRating: challengeRating.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      attributes,
      resources,
      notes,
      backstory: backstory.trim() || undefined,
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div
          id="edit-character-modal"
          className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100"
        >
          {/* Header */}
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {type === 'Monstro' ? (
                  <Skull className="w-5 h-5 text-rose-400" />
                ) : type === 'NPC' ? (
                  <Sparkles className="w-5 h-5 text-purple-400" />
                ) : (
                  <User className="w-5 h-5 text-blue-400" />
                )}
              </span>
              <div>
                <h3 className="font-bold text-base text-zinc-100">Modificar Ficha</h3>
                <p className="text-xs text-zinc-400">
                  Edite estatísticas, atributos, PV e notas desta ficha
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Top row: Portrait, Name, Type, Role */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Avatar Box */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 self-center sm:self-start">
                <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPortraitModalOpen(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-[10px] text-cyan-300 transition-opacity cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Alterar</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPortraitModalOpen(true)}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Trocar Retrato
                </button>
              </div>

              {/* Basic Fields */}
              <div className="flex-1 space-y-3 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">
                      Nome da Criatura / Personagem
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">
                      Tipo de Ficha
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-700">
                      {(['PJ', 'NPC', 'Monstro'] as CharacterType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                            type === t
                              ? t === 'Monstro'
                                ? 'bg-rose-600 text-white'
                                : t === 'NPC'
                                ? 'bg-purple-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">
                      Função / Classe / Arquétipo
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Ex: Predador Alfa, Guerreiro Nv 3..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-medium mb-1">
                      Nível de Desafio / Ameaça (ND / VD)
                    </label>
                    <input
                      type="text"
                      value={challengeRating}
                      onChange={(e) => setChallengeRating(e.target.value)}
                      placeholder="Ex: ND 10, Ameaça 5, VD 40..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resources (HP, PV, PM, Mana, etc.) */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Recursos & Barras de Vida (PV, Mana, Sanidade)
                </span>
              </div>

              <div className="space-y-2">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-800"
                  >
                    <input
                      type="text"
                      value={res.name}
                      onChange={(e) => handleUpdateResource(res.id, 'name', e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-zinc-500 text-[10px]">Atual:</span>
                      <input
                        type="number"
                        value={res.current}
                        onChange={(e) =>
                          handleUpdateResource(res.id, 'current', Number(e.target.value))
                        }
                        className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 text-center font-mono"
                      />
                      <span className="text-zinc-500 text-[10px]">/ Máx:</span>
                      <input
                        type="number"
                        value={res.max}
                        onChange={(e) =>
                          handleUpdateResource(res.id, 'max', Number(e.target.value))
                        }
                        className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 text-center font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveResource(res.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                      title="Excluir recurso"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add resource row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Nome (ex: Pontos de Vida, Mana)..."
                  value={newResName}
                  onChange={(e) => setNewResName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 placeholder:text-zinc-600"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={newResMax}
                  onChange={(e) => setNewResMax(Number(e.target.value))}
                  className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 text-center font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddResource}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Atributos & Modificadores
                </span>
                <span className="text-[10px] text-zinc-500">
                  {attributes.length} cadastrados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attributes.map((attr) => (
                  <div
                    key={attr.id}
                    className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={attr.key}
                      onChange={(e) => handleUpdateAttribute(attr.id, e.target.value, String(attr.value))}
                      className="w-14 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-300 font-bold uppercase text-center"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => handleUpdateAttribute(attr.id, attr.key, e.target.value)}
                      className="flex-1 min-w-0 bg-zinc-950 border border-zinc-700 rounded px-1.5 py-0.5 text-xs text-cyan-300 font-mono text-center font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(attr.id)}
                      className="text-zinc-600 hover:text-rose-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add attribute row */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Nome (ex: FOR)"
                  value={newAttrKey}
                  onChange={(e) => setNewAttrKey(e.target.value)}
                  className="w-24 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 uppercase text-center"
                />
                <input
                  type="text"
                  placeholder="Valor (ex: 18 (+4))"
                  value={newAttrVal}
                  onChange={(e) => setNewAttrVal(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200"
                />
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-400 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* Backstory, Lore & Biography */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1">
                História, Origem & Biografia
              </label>
              <textarea
                rows={4}
                value={backstory}
                onChange={(e) => setBackstory(e.target.value)}
                placeholder="Origem do personagem, infância, terra natal, motivações, vínculos e segredos..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500 mb-3"
              />
            </div>

            {/* Notes, attacks and lore */}
            <div>
              <label className="block text-zinc-400 font-medium mb-1">
                Ações, Habilidades, Golpes & Anotações
              </label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Descreva ataques, magias conhecidas, imunidades, itens ou segredos..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portrait selector modal */}
      {isPortraitModalOpen && (
        <GeneratePortraitModal
          isOpen={isPortraitModalOpen}
          character={{
            ...character,
            name,
            role,
            avatarUrl,
          }}
          onClose={() => setIsPortraitModalOpen(false)}
          onApplyPortrait={(url) => {
            setAvatarUrl(url);
            setIsPortraitModalOpen(false);
          }}
        />
      )}
    </>
  );
};
