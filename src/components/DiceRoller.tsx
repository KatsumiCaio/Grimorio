import React, { useState } from 'react';
import { Dices, Plus, Minus, RotateCcw } from 'lucide-react';

interface RollLog {
  id: string;
  die: number;
  roll: number;
  modifier: number;
  total: number;
  time: string;
}

export const DiceRoller: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modifier, setModifier] = useState<number>(0);
  const [logs, setLogs] = useState<RollLog[]>([]);
  const [lastRoll, setLastRoll] = useState<RollLog | null>(null);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const rollDie = (sides: number) => {
    const raw = Math.floor(Math.random() * sides) + 1;
    const total = raw + modifier;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const rollEntry: RollLog = {
      id: `${Date.now()}-${Math.random()}`,
      die: sides,
      roll: raw,
      modifier,
      total,
      time: timeStr,
    };

    setLastRoll(rollEntry);
    setLogs((prev) => [rollEntry, ...prev.slice(0, 9)]);
  };

  return (
    <div className="relative">
      <button
        id="dice-roller-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isOpen
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
        }`}
        title="Rolador de Dados Rápido"
      >
        <Dices className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">Dados</span>
        {lastRoll && (
          <span className="ml-1 px-1.5 py-0.2 bg-zinc-800 text-amber-300 rounded font-mono font-bold text-[11px]">
            {lastRoll.total}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Dices className="w-4 h-4 text-amber-500" />
                <span>Rolar Dados</span>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={() => {
                    setLogs([]);
                    setLastRoll(null);
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            {/* Modifier selector */}
            <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-zinc-800 mb-3 text-xs">
              <span className="text-zinc-400">Modificador:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setModifier((m) => m - 1)}
                  className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span
                  className={`w-7 text-center font-mono font-semibold ${
                    modifier > 0
                      ? 'text-emerald-400'
                      : modifier < 0
                      ? 'text-rose-400'
                      : 'text-zinc-300'
                  }`}
                >
                  {modifier > 0 ? `+${modifier}` : modifier}
                </span>
                <button
                  onClick={() => setModifier((m) => m + 1)}
                  className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Dice buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {diceTypes.map((die) => (
                <button
                  key={die}
                  onClick={() => rollDie(die)}
                  className="px-2 py-2 bg-zinc-950 hover:bg-amber-950/30 hover:border-amber-500/50 border border-zinc-800 rounded-lg text-xs font-mono font-medium text-zinc-200 transition-all active:scale-95 flex flex-col items-center justify-center"
                >
                  <span className="text-amber-500 font-bold">d{die}</span>
                </button>
              ))}
            </div>

            {/* Last Roll Highlight */}
            {lastRoll && (
              <div className="bg-gradient-to-r from-amber-500/10 via-zinc-950 to-zinc-950 border border-amber-500/30 rounded-lg p-2.5 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-zinc-400">
                    d{lastRoll.die} {lastRoll.modifier !== 0 && (lastRoll.modifier > 0 ? `+ ${lastRoll.modifier}` : `- ${Math.abs(lastRoll.modifier)}`)}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    (Rolou {lastRoll.roll})
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {lastRoll.total}
                </div>
              </div>
            )}

            {/* Roll History */}
            {logs.length > 1 && (
              <div className="border-t border-zinc-800/80 pt-2">
                <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-1.5">
                  Histórico Recente
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px]">
                  {logs.slice(1).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-zinc-400 py-0.5"
                    >
                      <span className="font-mono text-zinc-500 text-[10px]">{log.time}</span>
                      <span>d{log.die}{log.modifier !== 0 && (log.modifier > 0 ? `+${log.modifier}` : log.modifier)}</span>
                      <span className="font-mono font-bold text-zinc-200">{log.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
