import React from 'react';
import {
  BookOpen,
  Users,
  Settings,
  Search,
  CloudCheck,
  RefreshCw,
  CloudOff,
  LogIn,
  User as UserIcon,
  ChevronDown,
  Scroll,
  Skull,
  ExternalLink,
} from 'lucide-react';
import { FlamingD20Logo } from './FlamingD20Logo';
import { MainTab, Campaign } from '../types';
import { DiceRoller } from './DiceRoller';
import type { User } from 'firebase/auth';
import { isInsideIframe } from '../services/firebase';

interface HeaderProps {
  currentTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  characterCount: number;
  activeCampaign?: Campaign;
  campaignsCount?: number;
  onOpenCampaignMenu?: () => void;
  syncStatus?: 'synced' | 'syncing' | 'offline' | 'error';
  user?: User | null;
  onSignInGoogle?: () => void;
  isLoggingIn?: boolean;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  customLogoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  characterCount,
  activeCampaign,
  campaignsCount = 0,
  onOpenCampaignMenu,
  syncStatus = 'synced',
  user,
  onSignInGoogle,
  isLoggingIn = false,
  onOpenSettings,
  onOpenSearch,
  customLogoUrl,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Logo + Campaign Menu Trigger */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <FlamingD20Logo size={32} showGlow={true} customLogoUrl={customLogoUrl} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-zinc-100 font-mono">
                Grimório
              </span>
              <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 font-medium">
                RPG Copilot
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 hidden md:block">
              Caderno de Campanha & IA
            </span>
          </div>
        </div>

        {/* Campaign Menu Quick Trigger Pill */}
        {onOpenCampaignMenu && (
          <button
            type="button"
            id="header-campaign-menu-btn"
            onClick={onOpenCampaignMenu}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 text-xs text-zinc-200 transition-all cursor-pointer group shadow-xs max-w-[170px] sm:max-w-[240px]"
            title="Abrir Menu de Campanhas (Escolher, criar ou apagar campanhas)"
          >
            <Scroll className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-6 transition-transform shrink-0" />
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="font-semibold text-zinc-100 truncate text-[11px] leading-tight">
                {activeCampaign ? activeCampaign.title : 'Escolher Campanha'}
              </span>
              <span className="text-[9px] text-cyan-400/80 font-mono truncate leading-none">
                {activeCampaign?.system || `${campaignsCount} campanhas`}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 shrink-0" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
        <button
          id="tab-campaign-btn"
          onClick={() => onTabChange('campaign')}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'campaign'
              ? 'bg-zinc-800 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${currentTab === 'campaign' ? 'text-cyan-400' : 'text-zinc-400'}`} />
          <span>Campanha & Copiloto</span>
        </button>

        <button
          id="tab-characters-btn"
          onClick={() => onTabChange('characters')}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'characters'
              ? 'bg-zinc-800 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)] border border-cyan-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${currentTab === 'characters' ? 'text-cyan-400' : 'text-zinc-400'}`} />
          <span>Fichas</span>
          {characterCount > 0 && (
            <span
              className={`px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
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
          id="tab-bestiary-btn"
          onClick={() => onTabChange('bestiary')}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'bestiary'
              ? 'bg-zinc-800 text-rose-400 shadow-xs border border-rose-500/30 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
          title="Bestiário com monstros e criaturas por sistema"
        >
          <Skull className={`w-3.5 h-3.5 ${currentTab === 'bestiary' ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span>Bestiário</span>
        </button>
      </nav>

      {/* Quick Tools: Autosave/Cloud, User Auth, Search, Dice, Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Firebase Cloud Sync Badge */}
        <div
          className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 cursor-pointer hover:border-zinc-700 transition-colors"
          onClick={onOpenSettings}
          title="Status do Firebase Firestore. Clique para abrir configurações de nuvem."
        >
          {syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span className="text-zinc-400">Sincronizando...</span>
            </>
          ) : syncStatus === 'offline' ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-500">Offline</span>
            </>
          ) : syncStatus === 'error' ? (
            <>
              <CloudOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400">Erro Nuvem</span>
            </>
          ) : (
            <>
              <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300">Firebase Firestore</span>
            </>
          )}
        </div>

        {/* User Account / Google Sign-in */}
        {user && !user.isAnonymous ? (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs transition-colors"
            title={`Conectado como ${user.displayName || user.email || 'Usuário Google'}`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Foto"
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-cyan-500/40"
              />
            ) : (
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden lg:inline text-[11px] text-zinc-200 font-medium max-w-[90px] truncate">
              {user.displayName?.split(' ')[0] || 'Google'}
            </span>
          </button>
        ) : onSignInGoogle ? (
          <div className="flex items-center gap-1">
            <button
              id="google-signin-btn"
              disabled={isLoggingIn}
              onClick={() => {
                void onSignInGoogle();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              title={
                isInsideIframe()
                  ? 'Conectar com o Google (Caso o visualizador embutido bloqueie o pop-up, utilize o botão ao lado para abrir em nova aba)'
                  : 'Conectar com o Google para sincronizar suas campanhas em qualquer dispositivo'
              }
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span className="text-cyan-300 font-medium">Conectando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Conectar Google</span>
                </>
              )}
            </button>

            {/* In iframe preview, provide a fast 1-click escape to an unrestricted browser tab */}
            {isInsideIframe() && (
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-700 transition-colors cursor-pointer"
                title="Abrir Grimório em Nova Aba (Permite login Google sem restrições de iframe do navegador)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400/80" />
              </button>
            )}
          </div>
        ) : null}

        {/* Global Search Button */}
        <button
          id="global-search-btn"
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all cursor-pointer"
          title="Pesquisa Global (Ctrl+K ou ⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline font-medium">Pesquisar</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Quick Dice Roller */}
        <DiceRoller />

        {/* Settings button */}
        <button
          id="settings-modal-btn"
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg transition-colors"
          title="Configurações, Firebase & Backup"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
