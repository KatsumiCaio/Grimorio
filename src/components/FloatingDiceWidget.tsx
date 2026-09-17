import React, { useState, useEffect } from 'react';
import {
  Dices,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Copy,
  Check,
  History,
  Send,
  Zap,
} from 'lucide-react';
import { playDiceRollSound } from '../utils/diceSound';

export interface CampaignRollResult {
  id: string;
  expression: string;
  label: string;
  count: number;
  sides: number;
  rolls: number[];
  modifier: number;
  total: number;
  detail: string;
  isCrit?: boolean;
  isFumble?: boolean;
  timestamp: number;
  timeStr: string;
}

interface FloatingDiceWidgetProps {
  onRoll: (result: CampaignRollResult) => void;
  onInsertIntoNotes?: (formattedText: string) => void;
  onSendToChat?: (text: string) => void;
  className?: string;
}

const COMMON_DICE = [4, 6, 8, 10, 12, 20, 100];
const QUICK_PRESETS = [
  { label: '1d20', count: 1, sides: 20, mod: 0, tag: 'Teste d20' },
  { label: '2d6', count: 2, sides: 6, mod: 0, tag: 'Dano / PbtA' },
  { label: '3d6', count: 3, sides: 6, mod: 0, tag: 'GURPS / 3d6' },
  { label: '4d6', count: 4, sides: 6, mod: 0, tag: 'Atributos' },
  { label: '1d100', count: 1, sides: 100, mod: 0, tag: 'Percentil' },
  { label: '1d12', count: 1, sides: 12, mod: 0, tag: 'Bárbaro' },
  { label: '1d10', count: 1, sides: 10, mod: 0, tag: 'Truque' },
  { label: '1d8', count: 1, sides: 8, mod: 0, tag: 'Espada / Cura' },
  { label: '1d4', count: 1, sides: 4, mod: 0, tag: 'Adaga / Bênção' },
];

export const FloatingDiceWidget: React.FC<FloatingDiceWidgetProps> = ({
  onRoll,
  onInsertIntoNotes,
  onSendToChat,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState<number>(1);
  const [selectedSides, setSelectedSides] = useState<number>(20);
  const [modifier, setModifier] = useState<number>(0);
  const [customFormula, setCustomFormula] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [insertedId, setInsertedId] = useState<string | null>(null);
  const [lastRoll, setLastRoll] = useState<CampaignRollResult | null>(null);
  const [history, setHistory] = useState<CampaignRollResult[]>([]);
  const [isRollingAnimation, setIsRollingAnimation] = useState(false);

  // Load sound mute preference from localStorage
  useEffect(() => {
    try {
      const savedMute = localStorage.getItem('grimorio_dice_muted');
      if (savedMute !== null) {
        setIsMuted(savedMute === 'true');
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isMuted;
    setIsMuted(next);
    try {
      localStorage.setItem('grimorio_dice_muted', String(next));
    } catch {
      // Ignore
    }
  };

  const executeRoll = (count: number, sides: number, mod: number, customLabel?: string) => {
    playDiceRollSound(isMuted);
    setIsRollingAnimation(true);
    setTimeout(() => setIsRollingAnimation(false), 300);

    const safeCount = Math.max(1, Math.min(count, 50));
    const rolls: number[] = [];
    for (let i = 0; i < safeCount; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const sum = rolls.reduce((acc, val) => acc + val, 0);
    const total = sum + mod;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const modStr = mod !== 0 ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : '';
    const expr = `${safeCount}d${sides}${mod !== 0 ? (mod > 0 ? `+${mod}` : mod) : ''}`;
    const detail = `${safeCount}d${sides} [${rolls.join(', ')}]${modStr} = ${total}`;

    let isCrit = false;
    let isFumble = false;
    if (safeCount === 1 && sides === 20) {
      if (rolls[0] === 20) isCrit = true;
      if (rolls[0] === 1) isFumble = true;
    }

    const result: CampaignRollResult = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      expression: expr,
      label: customLabel || (isCrit ? 'ACERTO CRÍTICO!' : isFumble ? 'FALHA CRÍTICA!' : `Rolagem ${expr}`),
      count: safeCount,
      sides,
      rolls,
      modifier: mod,
      total,
      detail,
      isCrit,
      isFumble,
      timestamp: Date.now(),
      timeStr,
    };

    setLastRoll(result);
    setHistory((prev) => [result, ...prev.slice(0, 19)]);
    onRoll(result);
  };

  // Roll advantage or disadvantage (rolls 2d20, picks highest or lowest)
  const executeAdvantageRoll = (type: 'advantage' | 'disadvantage') => {
    playDiceRollSound(isMuted);
    setIsRollingAnimation(true);
    setTimeout(() => setIsRollingAnimation(false), 300);

    const roll1 = Math.floor(Math.random() * 20) + 1;
    const roll2 = Math.floor(Math.random() * 20) + 1;
    const chosen = type === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
    const dropped = type === 'advantage' ? Math.min(roll1, roll2) : Math.max(roll1, roll2);
    const total = chosen + modifier;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const modStr = modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : '';
    const label = type === 'advantage' ? '2d20 com Vantagem' : '2d20 com Desvantagem';
    const detail = `2d20 [Escolhido: ${chosen}, Descartado: ${dropped}]${modStr} = ${total}`;

    const isCrit = chosen === 20;
    const isFumble = chosen === 1;

    const result: CampaignRollResult = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      expression: type === 'advantage' ? '2d20 (Vant)' : '2d20 (Desv)',
      label,
      count: 2,
      sides: 20,
      rolls: [chosen, dropped],
      modifier,
      total,
      detail,
      isCrit,
      isFumble,
      timestamp: Date.now(),
      timeStr,
    };

    setLastRoll(result);
    setHistory((prev) => [result, ...prev.slice(0, 19)]);
    onRoll(result);
  };

  const handleCustomFormulaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormula.trim()) return;

    const clean = customFormula.replace(/\s+/g, '');
    const match = clean.match(/^(\d*)d(\d+)([+-]\d+)?$/i);

    if (match) {
      const count = match[1] ? parseInt(match[1]) : 1;
      const sides = parseInt(match[2]);
      const mod = match[3] ? parseInt(match[3]) : 0;
      executeRoll(count, sides, mod);
      setCustomFormula('');
    } else {
      // Direct number or fallback
      const directNum = parseInt(clean);
      if (!isNaN(directNum)) {
        executeRoll(1, directNum, 0);
        setCustomFormula('');
      }
    }
  };

  const handleCopyRoll = (res: CampaignRollResult) => {
    const text = `🎲 Rolagem ${res.expression}: ${res.detail}`;
    navigator.clipboard.writeText(text);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInsert = (res: CampaignRollResult) => {
    if (!onInsertIntoNotes) return;
    const text = `\n> 🎲 **Rolagem (${res.expression})**: ${res.detail}\n`;
    onInsertIntoNotes(text);
    setInsertedId(res.id);
    setTimeout(() => setInsertedId(null), 2000);
  };

  const handleSendChat = (res: CampaignRollResult) => {
    if (!onSendToChat) return;
    const text = `Rolei ${res.expression} e o resultado foi ${res.total} (${res.detail})`;
    onSendToChat(text);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        id="floating-dice-roller"
        className={`absolute z-40 transition-all select-none ${className}`}
      >
        {/* ========================================================================= */}
        {/* ESTADO EXPANDIDO: PAINEL COMPLETO DE DADOS                               */}
        {/* ========================================================================= */}
        {isOpen ? (
          <div className="w-[310px] sm:w-[350px] max-h-[75vh] sm:max-h-[80vh] overflow-y-auto bg-zinc-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-3.5 shadow-2xl shadow-cyan-950/40 text-zinc-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3">
            {/* Header do Widget */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/90">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
                <Dices className={`w-4 h-4 ${isRollingAnimation ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                  <span>Rolador de Dados</span>
                  <span className="text-[10px] font-mono font-normal text-cyan-400">RPG</span>
                </h4>
                <p className="text-[10px] text-zinc-400">Rolagens rápidas na campanha</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Botão Mudo / Som */}
              <button
                type="button"
                onClick={toggleMute}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                }`}
                title={isMuted ? 'Ativar som de rolagem' : 'Silenciar som de rolagem'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Toggle Histórico */}
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  showHistory
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Ver histórico de rolagens"
              >
                <History className="w-3.5 h-3.5" />
              </button>

              {/* Botão Minimizar */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                title="Minimizar rolador flutuante"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ÚLTIMA ROLAGEM DESTAQUE */}
          {lastRoll && (
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                lastRoll.isCrit
                  ? 'bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-zinc-950 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
                  : lastRoll.isFumble
                  ? 'bg-gradient-to-r from-rose-950/80 via-zinc-900 to-zinc-950 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                  : 'bg-zinc-950 border-zinc-800/90'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-200">{lastRoll.expression}</span>
                    {lastRoll.isCrit && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 border border-cyan-400/60 uppercase tracking-wide">
                        Crítico!
                      </span>
                    )}
                    {lastRoll.isFumble && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 border border-rose-500/60 uppercase tracking-wide">
                        Falha!
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 break-words mt-0.5">
                    {lastRoll.detail}
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div
                    className={`text-2xl font-black font-mono leading-none ${
                      lastRoll.isCrit
                        ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                        : lastRoll.isFumble
                        ? 'text-rose-400'
                        : 'text-zinc-100'
                    }`}
                  >
                    {lastRoll.total}
                  </div>
                </div>
              </div>

              {/* Botões Rápidos de Ação sobre a Rolagem */}
              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-zinc-850">
                {onInsertIntoNotes && (
                  <button
                    type="button"
                    onClick={() => handleInsert(lastRoll)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-zinc-900 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-500/40 text-[10px] font-semibold text-zinc-300 hover:text-cyan-300 transition-colors cursor-pointer"
                    title="Inserir resultado na nota ativa"
                  >
                    {insertedId === lastRoll.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Inserido!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3 text-cyan-400" />
                        <span>Inserir na Nota</span>
                      </>
                    )}
                  </button>
                )}

                {onSendToChat && (
                  <button
                    type="button"
                    onClick={() => handleSendChat(lastRoll)}
                    className="flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Enviar este valor para o Copiloto IA"
                  >
                    <Send className="w-3 h-3 text-cyan-400" />
                    <span>Copiloto</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyRoll(lastRoll)}
                  className="flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Copiar texto da rolagem"
                >
                  {copiedId === lastRoll.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* HISTÓRICO EXPANSÍVEL */}
          {showHistory ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium px-1">
                <span>Histórico ({history.length})</span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistory([]);
                      setLastRoll(null);
                    }}
                    className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-center py-4 text-xs text-zinc-500">
                  Nenhuma rolagem recente ainda.
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => executeRoll(h.count, h.sides, h.modifier)}
                    className="p-2 rounded-lg bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-cyan-500/30 flex items-center justify-between text-xs cursor-pointer transition-colors group"
                    title="Clique para rolar novamente"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[10px] text-zinc-500 font-mono">{h.timeStr}</span>
                      <span className="font-bold text-zinc-200">{h.expression}</span>
                      <span className="text-[11px] text-zinc-400 truncate">[{h.rolls.join(',')}]</span>
                    </div>
                    <span
                      className={`font-mono font-black shrink-0 ${
                        h.isCrit ? 'text-cyan-400' : h.isFumble ? 'text-rose-400' : 'text-zinc-200'
                      }`}
                    >
                      {h.total}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* ATALHOS RÁPIDOS (1d20, 2d6, etc.) */}
              <div>
                <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Rolagens Rápidas</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => executeRoll(preset.count, preset.sides, preset.mod, preset.label)}
                      className={`p-1.5 rounded-lg border text-left transition-all active:scale-95 cursor-pointer ${
                        preset.label === '1d20'
                          ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-300 font-bold'
                          : preset.label === '2d6'
                          ? 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-300 font-bold'
                          : 'bg-zinc-950 hover:bg-zinc-850 border-zinc-800 text-zinc-300 hover:text-zinc-100'
                      }`}
                    >
                      <div className="text-xs font-mono font-bold leading-tight">{preset.label}</div>
                      <div className="text-[9px] text-zinc-500 truncate">{preset.tag}</div>
                    </button>
                  ))}
                </div>

                {/* Vantagem / Desvantagem Especial para D20 */}
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => executeAdvantageRoll('advantage')}
                    className="p-1.5 rounded-lg bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-[11px] font-bold leading-tight">2d20 Vantagem</div>
                    <div className="text-[9px] text-emerald-400/80">Escolhe o maior</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => executeAdvantageRoll('disadvantage')}
                    className="p-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 text-rose-300 text-left transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="text-[11px] font-bold leading-tight">2d20 Desvantagem</div>
                    <div className="text-[9px] text-rose-400/80">Escolhe o menor</div>
                  </button>
                </div>
              </div>

              {/* CONSTRUTOR DE ROLAGEM CUSTOMIZADA */}
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2">
                {/* Quantidade e Modificador */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  {/* Quantidade de Dados */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400">Qtd:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCount((c) => Math.max(1, c - 1))}
                      className="w-5 h-5 rounded flex items-center justify-center bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-cyan-300">
                      {selectedCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCount((c) => Math.min(20, c + 1))}
                      className="w-5 h-5 rounded flex items-center justify-center bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Modificador */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400">Mod:</span>
                    <button
                      type="button"
                      onClick={() => setModifier((m) => m - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      className={`w-7 text-center font-mono font-bold ${
                        modifier > 0
                          ? 'text-emerald-400'
                          : modifier < 0
                          ? 'text-rose-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {modifier > 0 ? `+${modifier}` : modifier}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModifier((m) => m + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Seleção do Tipo de Dado */}
                <div className="grid grid-cols-7 gap-1">
                  {COMMON_DICE.map((die) => (
                    <button
                      key={die}
                      type="button"
                      onClick={() => setSelectedSides(die)}
                      className={`py-1.5 rounded-lg text-center font-mono text-xs transition-all cursor-pointer ${
                        selectedSides === die
                          ? 'bg-cyan-500 text-zinc-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      d{die}
                    </button>
                  ))}
                </div>

                {/* Botão Rolar Principal */}
                <button
                  type="button"
                  onClick={() => executeRoll(selectedCount, selectedSides, modifier)}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 via-cyan-500 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-zinc-950 font-extrabold text-xs rounded-lg transition-all active:scale-98 shadow-md shadow-cyan-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Dices className="w-4 h-4" />
                  <span>
                    Rolar {selectedCount}d{selectedSides}
                    {modifier !== 0 && (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`)}
                  </span>
                </button>
              </div>

              {/* Entrada de Fórmula Livre (ex: 2d6+4) */}
              <form onSubmit={handleCustomFormulaSubmit} className="flex gap-1.5">
                <input
                  type="text"
                  value={customFormula}
                  onChange={(e) => setCustomFormula(e.target.value)}
                  placeholder="Fórmula livre (ex: 2d6+3, 4d8)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 font-mono"
                />
                <button
                  type="submit"
                  disabled={!customFormula.trim()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-cyan-600 disabled:opacity-50 text-xs font-semibold text-zinc-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Rolar
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* ESTADO MINIMIZADO: BARRA / BOTÃO FLUTUANTE COMPACTO                       */
        /* ========================================================================= */
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 hover:bg-zinc-900 backdrop-blur-md border border-cyan-500/40 rounded-full shadow-xl shadow-cyan-950/40 transition-all hover:border-cyan-400 group">
          {/* Botão Principal com Ícone e Glow */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 rounded-full text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
            title="Abrir painel completo de rolagem de dados"
          >
            <div className="relative flex items-center justify-center">
              <Dices className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>
            <span>Dados</span>
            {lastRoll && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full font-mono text-[11px] font-bold border ${
                  lastRoll.isCrit
                    ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400'
                    : lastRoll.isFumble
                    ? 'bg-rose-500/30 text-rose-300 border-rose-500'
                    : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                }`}
              >
                {lastRoll.total}
              </span>
            )}
          </button>

          {/* Quick Roll Pills: 1d20 e 2d6 direto na barra flutuante! */}
          <div className="hidden sm:flex items-center gap-1 pr-1 border-l border-zinc-800 pl-1.5">
            <button
              type="button"
              onClick={() => executeRoll(1, 20, 0, '1d20')}
              className="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400/50 rounded-full font-mono text-[11px] font-bold text-cyan-300 transition-all active:scale-95 cursor-pointer"
              title="Rolar 1d20 instantaneamente"
            >
              1d20
            </button>
            <button
              type="button"
              onClick={() => executeRoll(2, 6, 0, '2d6')}
              className="px-2 py-1 bg-sky-500/10 hover:bg-sky-500/25 border border-sky-500/30 hover:border-sky-400/50 rounded-full font-mono text-[11px] font-bold text-sky-300 transition-all active:scale-95 cursor-pointer"
              title="Rolar 2d6 instantaneamente"
            >
              2d6
            </button>
          </div>

          {/* Seta para Expandir */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors mr-1 cursor-pointer"
            title="Expandir rolador de dados"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      </div>
    </>
  );
};
