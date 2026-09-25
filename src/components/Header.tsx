import React from 'react';
import {
  BookOpen,
  Users,
  Settings,
  Search,
  CloudCheck,
  RefreshCw,
  CloudOff,
  AlertTriangle,
  LogIn,
  User as UserIcon,
  ChevronDown,
  Scroll,
  Skull,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { FlamingD20Logo } from './FlamingD20Logo';
import { MainTab, Campaign, UserProfile } from '../types';
import { DiceRoller } from './DiceRoller';
import { UserAvatar } from './UserAvatar';
import { themeService, ThemeMode } from '../services/theme';

interface HeaderProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  characterCount: number;
  activeCampaign?: Campaign;
  campaignsCount?: number;
  onOpenCampaignMenu?: () => void;
  onOpenTableModal?: () => void;
  isMaster?: boolean;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'error' | 'quota';
  currentUser?: UserProfile;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  customLogoUrl?: string;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  characterCount,
  activeCampaign,
  campaignsCount = 0,
  onOpenCampaignMenu,
  onOpenTableModal,
  isMaster = true,
  syncStatus = 'synced',
  currentUser,
  onOpenAuthModal,
  onLogout,
  onOpenSettings,
  onOpenSearch,
  customLogoUrl,
  themeMode,
  onToggleTheme,
}) => {
  const [isDark, setIsDark] = React.useState(() => themeService.isDark());

  React.useEffect(() => {
    const unsub = themeService.subscribe((dark) => {
      setIsDark(dark);
    });
    return () => unsub();
  }, []);

  const handleToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      themeService.toggleTheme();
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md px-2.5 sm:px-5 flex items-center justify-between select-none z-30 shrink-0 max-w-full overflow-hidden">
      {/* Zone 1: Brand Wordmark + Unified Campaign Trigger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <FlamingD20Logo size={28} showGlow={true} customLogoUrl={customLogoUrl} />
          <span className="font-bold text-sm sm:text-base tracking-tight text-zinc-100 font-mono hidden xs:inline shrink-0">
            Grimório
          </span>
        </div>

        {/* Unified Campaign Selector Pill */}
        {onOpenCampaignMenu && (
          <button
            type="button"
            id="header-campaign-menu-btn"
            onClick={onOpenCampaignMenu}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/50 text-xs text-zinc-200 transition-all cursor-pointer group shadow-xs max-w-[120px] xs:max-w-[160px] sm:max-w-[210px] md:max-w-[260px]"
            title="Trocar ou gerenciar campanhas de RPG"
          >
            <Scroll className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-6 transition-transform shrink-0" />
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="font-semibold text-zinc-100 truncate text-[11px] leading-tight">
                {activeCampaign ? activeCampaign.title : 'Escolher Campanha'}
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono truncate leading-none">
                {activeCampaign?.system || `${campaignsCount} campanhas`}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 shrink-0" />
          </button>
        )}
      </div>

      {/* Zone 2: Primary Navigation Tabs (Desktop) */}
      <nav className="hidden md:flex items-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
        <button
          type="button"
          id="tab-campaign-btn"
          onClick={() => onTabChange('campaign')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentTab === 'campaign'
              ? 'bg-zinc-800 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${currentTab === 'campaign' ? 'text-cyan-400' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap">Campanha & Copiloto</span>
        </button>

        <button
          type="button"
          id="tab-characters-btn"
          onClick={() => onTabChange('characters')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentTab === 'characters'
              ? 'bg-zinc-800 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${currentTab === 'characters' ? 'text-cyan-400' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap">Fichas</span>
          {characterCount > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full tabular-nums ${
                currentTab === 'characters'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {characterCount}
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-bestiary-btn"
          onClick={() => onTabChange('bestiary')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            currentTab === 'bestiary'
              ? 'bg-zinc-800 text-rose-400 shadow-xs border border-rose-500/30 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
          title="Bestiário com monstros e criaturas por sistema"
        >
          <Skull className={`w-3.5 h-3.5 ${currentTab === 'bestiary' ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span className="whitespace-nowrap">Bestiário</span>
        </button>
      </nav>

      {/* Zone 3: Quick Interactive Tools & Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Table & Party modal trigger (Desktop) */}
        {activeCampaign && onOpenTableModal && (
          <button
            type="button"
            id="header-table-modal-btn"
            onClick={onOpenTableModal}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
            title={isMaster ? 'Mesa & Jogadores: revelar fotos, fichas e ver anotações da mesa' : 'Mesa & Conteúdo Revelado pelo Mestre'}
          >
            <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{isMaster ? 'Mesa & Revelações' : 'Mesa'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 font-mono tabular-nums">
              {activeCampaign.members?.length || 1}
            </span>
          </button>
        )}

        {/* Global Search Button */}
        <button
          type="button"
          id="global-search-btn"
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all cursor-pointer"
          title="Pesquisa Global (Ctrl+K ou ⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline font-medium">Buscar</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick Dice Roller */}
        <DiceRoller />

        {/* Dark / Light Theme Quick Toggle */}
        <button
          type="button"
          id="header-theme-toggle-btn"
          onClick={handleToggle}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-all cursor-pointer group"
          title={isDark ? "Alternar para Modo Claro (Light)" : "Alternar para Modo Escuro (Dark)"}
          aria-label={isDark ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 group-hover:text-amber-300 transition-all duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-600 group-hover:-rotate-12 group-hover:text-cyan-700 transition-all duration-200" />
          )}
        </button>

        {/* User Account / Profile Switcher Button */}
        {currentUser && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="header-user-profile-btn"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 sm:gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-cyan-500/50 text-xs transition-all cursor-pointer group shadow-xs"
              title={`Perfil ativo: ${currentUser.displayName} (@${currentUser.username}) - Clique para alternar conta`}
            >
              <UserAvatar
                avatarId={currentUser.avatarId}
                color={currentUser.color}
                size="xs"
                showGlow={true}
              />
              <span className="font-semibold text-zinc-100 text-[11px] leading-tight truncate max-w-[70px] sm:max-w-[110px] hidden md:inline">
                {currentUser.displayName}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 shrink-0 transition-colors hidden sm:inline" />
            </button>

            {onLogout && (
              <button
                type="button"
                id="header-logout-btn"
                onClick={onLogout}
                className="hidden sm:inline-flex p-1.5 rounded-lg bg-zinc-900/90 hover:bg-rose-500/15 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Sair desta conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Settings button with live sync status badge */}
        <button
          type="button"
          id="settings-modal-btn"
          onClick={onOpenSettings}
          className="relative p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-colors cursor-pointer"
          title={
            syncStatus === 'syncing'
              ? 'Sincronizando com Firestore...'
              : syncStatus === 'quota'
              ? 'Cota Firestore atingida (salvo localmente). Clique para detalhes.'
              : syncStatus === 'offline'
              ? 'Modo Offline (dados salvos localmente)'
              : 'Configurações, Firebase & Backup'
          }
        >
          <Settings className="w-4 h-4" />
          {/* Subtle status indicator dot */}
          <span
            className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-zinc-950 ${
              syncStatus === 'syncing'
                ? 'bg-cyan-400 animate-pulse'
                : syncStatus === 'quota'
                ? 'bg-amber-400'
                : syncStatus === 'offline'
                ? 'bg-zinc-500'
                : syncStatus === 'error'
                ? 'bg-rose-500'
                : 'bg-emerald-400'
            }`}
          />
        </button>
      </div>
    </header>
  );
};
