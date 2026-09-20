export type CharacterType = 'PJ' | 'NPC' | 'Monstro';

export interface AttributeItem {
  id: string;
  key: string;
  value: string | number;
}

export interface ResourceBar {
  id: string;
  name: string;
  current: number;
  max: number;
  color?: string; // e.g., 'red', 'blue', 'amber', 'emerald', 'purple'
}

export interface CharacterSheet {
  id: string;
  campaignId: string;
  name: string;
  role: string; // e.g. "Ladino Assassino Nv 4" or "Taberneiro Suspeito" or "Dragão Ancião (ND 10)"
  type: CharacterType;
  attributes: AttributeItem[];
  resources: ResourceBar[];
  notes: string; // Spells, equipment, secret GM notes, attacks
  avatarUrl?: string;
  challengeRating?: string; // e.g. "ND 10", "Ameaça 5", "VD 40", etc.
  createdAt: number;
  updatedAt: number;
}

export interface BestiaryMonster {
  id: string;
  name: string;
  system: string; // e.g. "D&D 5e", "Tormenta 20", "Call of Cthulhu 7e", "Pathfinder 2e", "Ordem Paranormal", "Vampiro V5", "Cyberpunk RED", "Geral"
  category: string; // e.g. "Dragão", "Aberração", "Morto-Vivo", "Besta", "Humanóide", "Constructo", "Monstruosidade", "Paranormal"
  challenge: string; // e.g. "ND 10", "ND 1/4", "Ameaça 5", "VD 40"
  role: string; // e.g. "Predador Alfa / Chefe", "Lacaio Salteador"
  type: CharacterType;
  attributes: AttributeItem[];
  resources: ResourceBar[];
  notes: string; // Full stats, attacks, actions, traits, lore
  avatarUrl: string;
}

export interface Campaign {
  id: string;
  title: string;
  system: string; // e.g. "D&D 5e", "Call of Cthulhu", "Tormenta 20", "Sistema Próprio"
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
}

export interface AppSettings {
  customApiKey: string;
  model: string;
  fontSize: 'sm' | 'base' | 'lg';
  editorMode: 'edit' | 'preview' | 'split';
  customLogoUrl?: string;
  themeTone?: 'amber' | 'crimson' | 'emerald' | 'purple' | 'cyan';
}

export type MainTab = 'campaign' | 'characters' | 'bestiary';

export type UserRole =
  | 'Mestre da Masmorra'
  | 'Narrador'
  | 'Guardião de Segredos'
  | 'Jogador'
  | 'Criador de Mundos';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarId: string; // e.g. 'd20' | 'wizard' | 'dragon' | 'warrior' | 'rogue' | 'skull' | 'crown' | 'shield' | 'flame' | custom URL
  color: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'indigo';
  bio?: string;
  createdAt: number;
  lastLoginAt: number;
  passwordHash?: string;
}
