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
  userId?: string; // ID do usuário que criou a ficha (Jogador ou Mestre)
  masterId?: string; // ID do Mestre da campanha
  creatorName?: string; // Nome de exibição do autor
  system?: string; // Sistema de regras da ficha
  name: string;
  role: string; // e.g. "Ladino Assassino Nv 4" or "Taberneiro Suspeito" or "Dragão Ancião (ND 10)"
  type: CharacterType;
  attributes: AttributeItem[];
  resources: ResourceBar[];
  notes: string; // Spells, equipment, secret GM notes, attacks
  backstory?: string; // História, origem, vínculos, objetivos e biografia do personagem
  avatarUrl?: string;
  challengeRating?: string; // e.g. "ND 10", "Ameaça 5", "VD 40", etc.
  sharedWithPlayers?: boolean; // Se verdadeiro, o Mestre permitiu que os jogadores vejam esta ficha
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

export interface CampaignChapter {
  id: string;
  title: string;
  content: string; // Markdown notes specific to this session/chapter
  sessionDate?: string; // e.g. "Sessão 01", "21/09/2026", "Ato I"
  summary?: string; // Optional short recap/objective
  order: number;
  createdAt: number;
  updatedAt: number;
}

export type CampaignRole = 'master' | 'player';

export interface CampaignMember {
  userId: string;
  displayName: string;
  role: CampaignRole;
  avatarId?: string;
  avatarUrl?: string;
  joinedAt: number;
  characterId?: string; // ID da ficha do personagem do jogador vinculada
  notes?: string; // Anotações pessoais / diário do jogador nesta campanha (visíveis para o jogador e para o mestre!)
}

export interface CampaignSharedItem {
  id: string;
  campaignId: string;
  title: string;
  type: 'image' | 'handout' | 'sheet' | 'clue';
  category?: 'map' | 'photo' | 'document' | 'npc' | 'lore';
  url?: string; // URL da imagem, mapa ou foto
  content?: string; // Texto formatado, carta, pista, descrição em markdown
  characterId?: string; // Referência a ficha caso seja um NPC/Monstro compartilhado
  sharedBy: string; // ID do Mestre
  sharedAt: number;
}

export interface Campaign {
  id: string;
  userId?: string; // ID do criador (Mestre)
  masterId?: string; // ID do Mestre da campanha
  masterName?: string; // Nome de exibição do Mestre
  inviteCode?: string; // Código de 6 caracteres (e.g. "GRM-8X2L") para jogadores entrarem
  title: string;
  system: string; // e.g. "D&D 5e", "Call of Cthulhu", "Tormenta 20", "Sistema Próprio"
  notes: string; // Anotações secretas do Mestre (exclusivas do Mestre)
  chapters?: CampaignChapter[]; // Capítulos com anotações secretas do Mestre
  activeChapterId?: string;
  members?: CampaignMember[]; // Membros da mesa (Mestre e Jogadores)
  sharedItems?: CampaignSharedItem[]; // Fotos, mapas, handouts e cartas compartilhadas pelo Mestre com os jogadores
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
  themeMode?: 'dark' | 'light' | 'system';
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
