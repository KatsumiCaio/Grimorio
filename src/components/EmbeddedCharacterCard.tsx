import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Edit3,
  Dices,
  ChevronDown,
  ChevronUp,
  Skull,
  User,
  Sparkles,
  Zap,
  Sword,
  Flame,
  Crown,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { CharacterSheet, AttributeItem } from '../types';

interface EmbeddedCharacterCardProps {
  character: CharacterSheet;
  onUpdateCharacter?: (updated: CharacterSheet) => void;
  onEditCharacter?: (character: CharacterSheet) => void;
  onRollDice?: (diceExpression: string, label: string) => void;
}

// Ornate Corner SVG Filigree
const CornerFlourish: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; colorClass?: string }> = ({
  position,
  colorClass = 'text-cyan-500/50',
}) => {
  const rotation = {
    tl: '',
    tr: 'rotate-90',
    br: 'rotate-180',
    bl: '-rotate-90',
  }[position];

  const positioning = {
    tl: 'top-1.5 left-1.5',
    tr: 'top-1.5 right-1.5',
    br: 'bottom-1.5 right-1.5',
    bl: 'bottom-1.5 left-1.5',
  }[position];

  return (
    <svg
      className={`absolute w-3.5 h-3.5 pointer-events-none transition-opacity ${colorClass} ${rotation} ${positioning}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21V9a6 6 0 0 1 6-6h12" />
      <path d="M7 17v-6a2 2 0 0 1 2-2h6" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
};

// Parse attribute score and modifier
function parseAttributeDetails(val: string | number) {
  if (typeof val === 'number') {
    const mod = Math.floor((val - 10) / 2);
    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
    return { score: `${val}`, modifier: modStr, hasMod: true, rawNum: val };
  }
  const str = String(val).trim();
  // Format: "16 (+3)"
  const withParen = str.match(/^(\d+)\s*\(([+-]?\d+)\)/);
  if (withParen) {
    return { score: withParen[1], modifier: withParen[2], hasMod: true, rawNum: parseInt(withParen[1]) };
  }
  // Pure modifier: "+3" or "-1"
  if (/^[+-]\d+$/.test(str)) {
    return { score: str, modifier: str, hasMod: true, rawNum: null };
  }
  // Standard integer: "16"
  if (/^\d+$/.test(str)) {
    const num = parseInt(str);
    if (num >= 1 && num <= 30) {
      const mod = Math.floor((num - 10) / 2);
      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
      return { score: str, modifier: modStr, hasMod: true, rawNum: num };
    }
    return { score: str, modifier: null, hasMod: false, rawNum: num };
  }
  // Generic string: "18/00", "65%", etc.
  return { score: str, modifier: null, hasMod: false, rawNum: null };
}

export const EmbeddedCharacterCard: React.FC<EmbeddedCharacterCardProps> = ({
  character,
  onUpdateCharacter,
  onEditCharacter,
  onRollDice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentNotice, setRecentNotice] = useState<{ text: string; isHeal: boolean } | null>(null);
  const [customHealthDelta, setCustomHealthDelta] = useState('');
  const [showCustomHealthInput, setShowCustomHealthInput] = useState(false);

  // Identify health/pv resource
  const healthResourceIndex = character.resources.findIndex(
    (r) =>
      r.name.toLowerCase().includes('vida') ||
      r.name.toLowerCase().includes('pv') ||
      r.name.toLowerCase().includes('hp') ||
      r.name.toLowerCase().includes('vitalidade')
  );

  const primaryHealth =
    healthResourceIndex >= 0 ? character.resources[healthResourceIndex] : character.resources[0];

  // Extract Armor Class / CA if present in attributes
  const armorClassAttr = character.attributes.find((a) =>
    /^(ca|ac|armadura|defesa|def)$/i.test(a.key.trim())
  );

  // Filter out CA from standard attribute shields if it's already highlighted prominently
  const displayAttributes = character.attributes.filter(
    (a) => !/^(ca|ac|armadura|defesa|def)$/i.test(a.key.trim())
  );

  const handleAdjustHealth = (delta: number) => {
    if (!onUpdateCharacter || !primaryHealth) return;

    const newCurrent = Math.max(0, Math.min(primaryHealth.max * 2, primaryHealth.current + delta));
    const updatedResources = [...character.resources];

    if (healthResourceIndex >= 0) {
      updatedResources[healthResourceIndex] = {
        ...primaryHealth,
        current: newCurrent,
      };
    } else {
      updatedResources[0] = {
        ...primaryHealth,
        current: newCurrent,
      };
    }

    onUpdateCharacter({
      ...character,
      resources: updatedResources,
      updatedAt: Date.now(),
    });

    const isHeal = delta > 0;
    const label = isHeal ? `+${delta} PV` : `${delta} PV`;
    setRecentNotice({ text: label, isHeal });
    setTimeout(() => setRecentNotice(null), 2000);
  };

  const handleCustomHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customHealthDelta);
    if (!isNaN(val) && val !== 0) {
      handleAdjustHealth(val);
      setCustomHealthDelta('');
      setShowCustomHealthInput(false);
    }
  };

  const handleRollAttribute = (attr: AttributeItem) => {
    if (!onRollDice) return;
    const { modifier, rawNum } = parseAttributeDetails(attr.value);

    let expr = '1d20';
    if (modifier) {
      expr = modifier.startsWith('-') ? `1d20${modifier}` : `1d20+${modifier.replace('+', '')}`;
    }

    onRollDice(expr, `Teste de ${attr.key} (${attr.value}) - ${character.name}`);
  };

  // Roll dice expressions found in text
  const handleRollExpression = (expression: string, label: string) => {
    if (onRollDice) {
      onRollDice(expression, `${label} - ${character.name}`);
    }
  };

  // Type aesthetics configuration (Ornate High Fantasy Themes)
  const isMonster = character.type === 'Monstro';
  const isNPC = character.type === 'NPC';
  const isPJ = !isMonster && !isNPC;

  // Thematic frame gradients & borders
  const themeConfig = {
    outerBorder: isMonster
      ? 'border-rose-600/60 shadow-[0_0_20px_-3px_rgba(225,29,72,0.25)]'
      : isNPC
      ? 'border-purple-500/60 shadow-[0_0_20px_-3px_rgba(168,85,247,0.2)]'
      : 'border-cyan-500/60 shadow-[0_0_20px_-3px_rgba(6,182,212,0.25)]',
    outerGlow: isMonster
      ? 'bg-gradient-to-b from-rose-950/40 via-zinc-950 to-zinc-950'
      : isNPC
      ? 'bg-gradient-to-b from-purple-950/40 via-zinc-950 to-zinc-950'
      : 'bg-gradient-to-b from-cyan-950/40 via-zinc-950 to-zinc-950',
    headerBg: isMonster
      ? 'bg-gradient-to-r from-rose-950/70 via-zinc-900 to-zinc-900'
      : isNPC
      ? 'bg-gradient-to-r from-purple-950/70 via-zinc-900 to-zinc-900'
      : 'bg-gradient-to-r from-cyan-950/70 via-zinc-900 to-zinc-900',
    flourishColor: isMonster ? 'text-rose-500/60' : isNPC ? 'text-purple-400/60' : 'text-cyan-400/60',
    accentText: isMonster ? 'text-rose-400' : isNPC ? 'text-purple-300' : 'text-cyan-400',
    badgeStyle: isMonster
      ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
      : isNPC
      ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
      : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
    portraitRing: isMonster
      ? 'ring-rose-500/70 border-rose-500/40'
      : isNPC
      ? 'ring-purple-500/70 border-purple-500/40'
      : 'ring-cyan-500/80 border-cyan-500/50',
  };

  const hpPercentage = primaryHealth
    ? Math.max(0, Math.min(100, Math.round((primaryHealth.current / (primaryHealth.max || 1)) * 100)))
    : 100;

  // Health Status label
  const getHealthStatus = () => {
    if (!primaryHealth) return null;
    if (primaryHealth.current <= 0) return { label: 'INCAPACITADO', color: 'text-zinc-400 bg-zinc-900 border-zinc-700' };
    if (hpPercentage <= 25) return { label: 'CRÍTICO / FERIDO', color: 'text-rose-400 bg-rose-950/70 border-rose-700/60' };
    if (hpPercentage <= 60) return { label: 'EM COMBATE', color: 'text-cyan-300 bg-cyan-950/70 border-cyan-700/60' };
    return { label: 'INTACTO', color: 'text-emerald-300 bg-emerald-950/70 border-emerald-700/60' };
  };

  const healthStatus = getHealthStatus();

  return (
    <div
      id={`embedded-card-${character.id}`}
      className={`my-4 relative rounded-2xl border-2 ${themeConfig.outerBorder} ${themeConfig.outerGlow} overflow-hidden text-zinc-200 select-none not-prose transition-all`}
    >
      {/* 4 Ornate Corner Filigrees */}
      <CornerFlourish position="tl" colorClass={themeConfig.flourishColor} />
      <CornerFlourish position="tr" colorClass={themeConfig.flourishColor} />
      <CornerFlourish position="bl" colorClass={themeConfig.flourishColor} />
      <CornerFlourish position="br" colorClass={themeConfig.flourishColor} />

      {/* Decorative Gold Inset Border Outline */}
      <div className="absolute inset-[3px] rounded-[14px] border border-cyan-500/15 pointer-events-none" />

      {/* Top Banner & Header */}
      <div className={`p-3.5 sm:p-4 ${themeConfig.headerBg} border-b border-zinc-800/90 relative`}>
        <div className="flex items-start justify-between gap-3">
          {/* Avatar and Identity */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Gilded Portrait Medallion */}
            <div className="relative shrink-0">
              <div
                className={`w-12 h-12 rounded-xl overflow-hidden ring-2 ring-offset-2 ring-offset-zinc-950 border ${themeConfig.portraitRing} bg-zinc-950 shadow-md relative group`}
              >
                {character.avatarUrl ? (
                  <img
                    src={character.avatarUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                    {isMonster ? (
                      <Skull className="w-6 h-6 text-rose-400" />
                    ) : isNPC ? (
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Crown className="w-6 h-6 text-cyan-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Mini jewel badge in the corner */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-zinc-950 flex items-center justify-center shadow-xs ${
                  isMonster ? 'bg-rose-500' : isNPC ? 'bg-purple-500' : 'bg-cyan-500'
                }`}
              >
                {isMonster ? (
                  <Skull className="w-2.5 h-2.5 text-zinc-950" />
                ) : isNPC ? (
                  <Sparkles className="w-2.5 h-2.5 text-zinc-950" />
                ) : (
                  <Shield className="w-2.5 h-2.5 text-zinc-950" />
                )}
              </div>
            </div>

            {/* Character Name, Type and Role */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-bold text-base sm:text-lg text-cyan-100 tracking-wide truncate drop-shadow-xs">
                  {character.name}
                </h3>

                {/* Ornate Type Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-xs ${themeConfig.badgeStyle}`}
                >
                  {isMonster && <Skull className="w-2.5 h-2.5 text-rose-400" />}
                  {isNPC && <Sparkles className="w-2.5 h-2.5 text-purple-400" />}
                  {isPJ && <Crown className="w-2.5 h-2.5 text-cyan-400" />}
                  <span>{character.type}</span>
                </span>

                {/* Challenge Rating / ND Medallion */}
                {character.challengeRating && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-xs">
                    <Flame className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{character.challengeRating}</span>
                  </span>
                )}

                {/* Health Condition Pill */}
                {healthStatus && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold border ${healthStatus.color}`}
                  >
                    {healthStatus.label}
                  </span>
                )}
              </div>

              {/* Role / Class / Subtitle */}
              <div className="flex items-center gap-2 text-xs text-cyan-200/70 italic font-serif">
                <span>◈</span>
                <p className="truncate">{character.role || 'Guerreiro Errante'}</p>
              </div>
            </div>
          </div>

          {/* Top Action Controls & CA Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Prominent CA (Armor Class) Shield if available */}
            {armorClassAttr && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-cyan-500/40 shadow-xs text-xs font-bold text-cyan-300"
                title={`Classe de Armadura / Defesa: ${armorClassAttr.value}`}
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                <span className="text-[10px] text-zinc-400 uppercase font-mono">{armorClassAttr.key}:</span>
                <span className="font-mono text-xs font-black text-cyan-200">{armorClassAttr.value}</span>
              </div>
            )}

            {/* Roll d20 Quick Action */}
            {onRollDice && (
              <button
                type="button"
                onClick={() => onRollDice('1d20', `Rolagem de Teste: ${character.name}`)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Rolar d20 puro para este personagem"
              >
                <Dices className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline font-mono text-[11px]">d20</span>
              </button>
            )}

            {/* Edit Character Modal */}
            {onEditCharacter && (
              <button
                type="button"
                onClick={() => onEditCharacter(character)}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                title="Editar dados da ficha completa"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Editar</span>
              </button>
            )}

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
              title={isExpanded ? 'Recolher detalhes' : 'Expandir magias, notas e habilidades'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Medieval Filigree Divider Line */}
      <div className="flex items-center justify-center gap-2 px-6 py-0.5 opacity-40">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-cyan-500" />
        <span className="text-[10px] text-cyan-400 select-none tracking-widest">⚜ ◈ ⚜</span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-cyan-500/60 to-cyan-500" />
      </div>

      {/* Ornate Health & Vitality Gauge (Recipiente de Vida) */}
      {primaryHealth && (
        <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Heart & HP Progress Bar */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="relative">
                <Heart
                  className={`w-4 h-4 text-rose-500 fill-rose-500/40 ${
                    hpPercentage <= 30 ? 'animate-bounce text-rose-400' : ''
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-300 font-serif tracking-wide uppercase">
                  {primaryHealth.name}:
                </span>
              </div>

              {/* Ornate Glass HP Bar */}
              <div className="flex-1 max-w-sm h-3 bg-zinc-950 rounded-full p-0.5 border border-zinc-700/80 shadow-inner relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 relative shadow-sm ${
                    hpPercentage > 50
                      ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400'
                      : hpPercentage > 25
                      ? 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-yellow-400'
                      : 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-500'
                  }`}
                  style={{ width: `${hpPercentage}%` }}
                >
                  {/* Glass shine highlight */}
                  <div className="absolute inset-0 bg-white/15 h-[40%] rounded-full" />
                </div>
              </div>

              {/* Numeric fraction */}
              <span className="font-mono text-xs font-black text-cyan-100 tracking-wider shrink-0 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                {primaryHealth.current} <span className="text-zinc-500 font-normal">/</span> {primaryHealth.max}
              </span>

              {/* Floating Notice */}
              {recentNotice && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm animate-pulse shrink-0 ${
                    recentNotice.isHeal
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300'
                  }`}
                >
                  {recentNotice.text}
                </span>
              )}
            </div>

            {/* Tactical Heal / Damage Buttons */}
            {onUpdateCharacter && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAdjustHealth(-5)}
                  className="px-2 py-0.5 rounded-md bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-rose-100 text-[11px] font-black font-mono transition-colors cursor-pointer shadow-xs"
                  title="Causar 5 de Dano"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustHealth(-1)}
                  className="px-1.5 py-0.5 rounded-md bg-rose-950/50 hover:bg-rose-900 border border-rose-800/40 text-rose-300 hover:text-rose-100 text-[11px] font-bold font-mono transition-colors cursor-pointer"
                  title="Causar 1 de Dano"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustHealth(1)}
                  className="px-1.5 py-0.5 rounded-md bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-800/40 text-emerald-300 hover:text-emerald-100 text-[11px] font-bold font-mono transition-colors cursor-pointer"
                  title="Curar 1 PV"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustHealth(5)}
                  className="px-2 py-0.5 rounded-md bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 hover:text-emerald-100 text-[11px] font-black font-mono transition-colors cursor-pointer shadow-xs"
                  title="Curar 5 PV"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomHealthInput((prev) => !prev)}
                  className="px-1.5 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-cyan-300 text-[10px] font-mono transition-colors cursor-pointer"
                  title="Ajuste de PV Personalizado"
                >
                  ±
                </button>
              </div>
            )}
          </div>

          {/* Custom Health Input Form */}
          {showCustomHealthInput && (
            <form
              onSubmit={handleCustomHealthSubmit}
              className="flex items-center justify-end gap-2 pt-1 border-t border-zinc-800/60 animate-fadeIn"
            >
              <span className="text-[11px] text-zinc-400">Ajuste de PV:</span>
              <input
                type="number"
                value={customHealthDelta}
                onChange={(e) => setCustomHealthDelta(e.target.value)}
                placeholder="Ex: -12 ou +8"
                className="w-24 px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-cyan-200 text-center font-mono focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-0.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded font-bold text-xs cursor-pointer shadow-xs"
              >
                Aplicar
              </button>
              <button
                type="button"
                onClick={() => setShowCustomHealthInput(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      )}

      {/* Heraldic Attribute Shield Tablets (Escudos Rúnicos de Atributos) */}
      {displayAttributes.length > 0 && (
        <div className="p-3 bg-zinc-950/60 border-b border-zinc-800/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 font-serif flex items-center gap-1.5">
              <span>✦</span> Atributos Rúnicos (Clique para rolar teste com d20)
            </span>
            {onRollDice && (
              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                <Dices className="w-3 h-3 text-cyan-500" />
                <span>d20 + mod</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {displayAttributes
              .slice(0, isExpanded ? displayAttributes.length : 6)
              .map((attr) => {
                const { score, modifier, hasMod } = parseAttributeDetails(attr.value);

                return (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() => handleRollAttribute(attr)}
                    className="relative group p-1.5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-cyan-500/30 hover:border-cyan-400/80 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition-all cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden"
                    title={`Rolar teste de ${attr.key} com d20`}
                  >
                    {/* Tiny top notch */}
                    <div className="w-3 h-0.5 bg-cyan-500/40 group-hover:bg-cyan-400 rounded-full mb-1 transition-colors" />

                    {/* Attribute Name */}
                    <span className="text-[10px] font-bold text-cyan-400/90 tracking-wider uppercase font-serif">
                      {attr.key}
                    </span>

                    {/* Attribute Score */}
                    <span className="text-sm sm:text-base font-black font-mono text-zinc-100 group-hover:text-cyan-200 transition-colors drop-shadow-xs my-0.5">
                      {score}
                    </span>

                    {/* Modifier Chip or roll indicator */}
                    {hasMod && modifier ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-colors">
                        <Dices className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                        <span>{modifier}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-zinc-500 font-mono group-hover:text-cyan-300 transition-colors">
                        rolar
                      </span>
                    )}
                  </button>
                );
              })}
          </div>

          {!isExpanded && displayAttributes.length > 6 && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-medium"
              >
                + Ver mais {displayAttributes.length - 6} atributos e perícias...
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expanded Details: Mana, Secondary Vials, Attacks, Grimoire Notes */}
      {isExpanded && (
        <div className="p-4 bg-zinc-950/95 border-t border-zinc-800 space-y-4 animate-fadeIn">
          {/* Secondary Resource Vials (Mana, Sanidade, Ki, etc.) */}
          {character.resources.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 font-serif">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>Frascos de Recursos Secundários:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {character.resources.slice(1).map((res) => {
                  const resPct = Math.round((res.current / (res.max || 1)) * 100);
                  return (
                    <div
                      key={res.id}
                      className="p-2.5 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-300 text-[11px] truncate">{res.name}</span>
                        <span className="font-mono font-bold text-cyan-300 text-xs">
                          {res.current}/{res.max}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.max(0, Math.min(100, resPct))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Grimoire Notes, Attacks, Spells and Actions */}
          {character.notes && (
            <div className="rounded-xl bg-zinc-900/90 border border-cyan-500/30 p-3.5 space-y-2 shadow-inner">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-serif">
                  <Sword className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ações de Combate, Habilidades & Feitiços:</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Grimório da Ficha</span>
              </div>

              <div className="text-zinc-300 text-xs whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pr-1 font-sans space-y-1">
                {character.notes}
              </div>

              {/* Quick Dice Roll Shortcuts in notes if expressions like 1d8, 2d6 are detected */}
              {(() => {
                const matches = character.notes.match(/\b\d+d\d+(?:\s*[+-]\s*\d+)?\b/gi);
                if (!matches || matches.length === 0) return null;
                const uniqueRolls = Array.from(new Set(matches)).slice(0, 6);
                return (
                  <div className="pt-2 border-t border-zinc-800/70 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 font-serif">
                      <Dices className="w-3 h-3 text-cyan-400" />
                      <span>Rolar do Texto:</span>
                    </span>
                    {uniqueRolls.map((expr, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleRollExpression(expr.replace(/\s+/g, ''), `Ataque / Dano (${expr})`)}
                        className="px-2 py-0.5 rounded bg-zinc-950 hover:bg-zinc-800 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        🎲 {expr}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/70 text-xs">
            <span className="text-[10px] text-zinc-500 italic font-serif">
              ID: <span className="font-mono text-zinc-400">{character.id}</span>
            </span>

            {onEditCharacter && (
              <button
                type="button"
                onClick={() => onEditCharacter(character)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-zinc-950 font-bold text-xs transition-all cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Abrir Editor Completo da Ficha</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
