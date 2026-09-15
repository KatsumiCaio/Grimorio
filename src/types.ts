export type CharacterType = 'PJ' | 'NPC';

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
  role: string; // e.g. "Ladino Assassino Nv 4" or "Taberneiro Suspeito"
  type: CharacterType;
  attributes: AttributeItem[];
  resources: ResourceBar[];
  notes: string; // Spells, equipment, secret GM notes
  avatarUrl?: string;
  createdAt: number;
  updatedAt: number;
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
}

export type MainTab = 'campaign' | 'characters';
