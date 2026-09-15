import React from 'react';
import { BookOpen, Users, Settings, Sparkles, CheckCircle2 } from 'lucide-react';
import { FlamingD20Logo } from './FlamingD20Logo';
import { MainTab } from '../types';
import { DiceRoller } from './DiceRoller';

interface HeaderProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  characterCount: number;
  isSaved?: boolean;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  characterCount,
  isSaved = true,
  onOpenSettings,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <FlamingD20Logo size={32} showGlow={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-100 font-mono">
                Grimório
              </span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                RPG Copilot
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 hidden md:block">
              Caderno de Campanha & IA
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Only 2 Main Tabs as strictly required) */}
      <nav className="flex items-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
        <button
          id="tab-campaign-btn"
          onClick={() => onTabChange('campaign')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'campaign'
              ? 'bg-zinc-800 text-amber-400 shadow-xs border border-amber-500/30 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${currentTab === 'campaign' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span>Campanha & Copiloto</span>
        </button>

        <button
          id="tab-characters-btn"
          onClick={() => onTabChange('characters')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'characters'
              ? 'bg-zinc-800 text-amber-400 shadow-xs border border-amber-500/30 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${currentTab === 'characters' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span>Fichas</span>
          {characterCount > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                currentTab === 'characters'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {characterCount}
            </span>
          )}
        </button>
      </nav>

      {/* Quick Tools: Autosave, Dice, Settings */}
      <div className="flex items-center gap-2">
        {/* Autosave badge */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-500 pr-2 border-r border-zinc-800/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" />
          <span>Salvo offline</span>
        </div>

        {/* Quick Dice Roller */}
        <DiceRoller />

        {/* Settings button */}
        <button
          id="settings-modal-btn"
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-colors"
          title="Configurações & Backup"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
