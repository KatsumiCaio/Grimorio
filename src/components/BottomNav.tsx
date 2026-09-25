import React from 'react';
import { BookOpen, Users, Skull, Settings, Share2 } from 'lucide-react';
import { MainTab } from '../types';

interface BottomNavProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  characterCount: number;
  onOpenSettings: () => void;
  onOpenTableModal?: () => void;
  sharedItemsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  characterCount,
  onOpenSettings,
  onOpenTableModal,
  sharedItemsCount = 0,
}) => {
  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/90 flex items-center justify-around h-14 px-1 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Navegação Principal Móvel"
    >
      {/* Tab: Campanha */}
      <button
        type="button"
        id="bottom-nav-campaign"
        onClick={() => onTabChange('campaign')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all cursor-pointer ${
          currentTab === 'campaign'
            ? 'text-cyan-400 font-semibold'
            : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
        }`}
      >
        <div className="relative">
          <BookOpen className={`w-5 h-5 ${currentTab === 'campaign' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-zinc-400'}`} />
          {currentTab === 'campaign' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Campanha</span>
      </button>

      {/* Tab: Fichas */}
      <button
        type="button"
        id="bottom-nav-characters"
        onClick={() => onTabChange('characters')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all cursor-pointer relative ${
          currentTab === 'characters'
            ? 'text-cyan-400 font-semibold'
            : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
        }`}
      >
        <div className="relative">
          <Users className={`w-5 h-5 ${currentTab === 'characters' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'text-zinc-400'}`} />
          {characterCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-mono font-bold rounded-full bg-cyan-500 text-zinc-950">
              {characterCount}
            </span>
          )}
          {currentTab === 'characters' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Fichas</span>
      </button>

      {/* Tab: Bestiário */}
      <button
        type="button"
        id="bottom-nav-bestiary"
        onClick={() => onTabChange('bestiary')}
        className={`flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all cursor-pointer ${
          currentTab === 'bestiary'
            ? 'text-rose-400 font-semibold'
            : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
        }`}
      >
        <div className="relative">
          <Skull className={`w-5 h-5 ${currentTab === 'bestiary' ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'text-zinc-400'}`} />
          {currentTab === 'bestiary' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-400" />
          )}
        </div>
        <span className="text-[10px] tracking-tight mt-0.5">Bestiário</span>
      </button>

      {/* Tab: Mesa & Revelações */}
      {onOpenTableModal && (
        <button
          type="button"
          id="bottom-nav-table"
          onClick={onOpenTableModal}
          className="flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] transition-all cursor-pointer relative text-zinc-400 hover:text-amber-300 active:scale-95"
        >
          <div className="relative">
            <Share2 className="w-5 h-5 text-amber-400" />
            {sharedItemsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-mono font-bold rounded-full bg-amber-500 text-zinc-950">
                {sharedItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Mesa</span>
        </button>
      )}

      {/* Action: Configurações & Firebase */}
      <button
        type="button"
        id="bottom-nav-settings"
        onClick={onOpenSettings}
        className="flex-1 flex flex-col items-center justify-center py-1 min-h-[44px] text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
      >
        <Settings className="w-5 h-5 text-zinc-400" />
        <span className="text-[10px] tracking-tight mt-0.5">Ajustes</span>
      </button>
    </nav>
  );
};
