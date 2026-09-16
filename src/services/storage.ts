import { Campaign, CharacterSheet, AppSettings, ChatMessage } from '../types';

const CAMPAIGNS_STORAGE_KEY = 'grimorio_campaigns_v1';
const CHARACTERS_STORAGE_KEY = 'grimorio_characters_v1';
const SETTINGS_STORAGE_KEY = 'grimorio_settings_v1';
const CHAT_STORAGE_PREFIX = 'grimorio_chat_';

const DEFAULT_SETTINGS: AppSettings = {
  customApiKey: '',
  model: 'gemini-3.6-flash',
  fontSize: 'base',
  editorMode: 'edit',
};

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-default-1',
    title: 'A Torre dos Ventos Esquecidos',
    system: 'D&D 5e',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    notes: `# Sessão 4 — A Garganta dos Murmúrios

## 🌒 Clima & Atmosfera
- Névoa rasteira espessa, cheiro de enxofre antigo e cinzas frias.
- O vento uiva entre as rochas como se sussurrasse nomes do passado dos personagens.

## 🧭 Objetivo do Grupo
O grupo precisa alcançar o monastério abandonado de Val-Khar antes que o eclipse da lua cinzenta atinja o zênite.
Lá se encontra a relíquia conhecida como **O Olho de Quartzo**, capaz de romper o selo da cripta subterrânea.

---

## ⚔️ Ganchos de Enredo Ativos
1. **O Mensageiro Ferido**: Encontraram um corvo de ferro com um pergaminho manchado de sangue. O emissário prometeu 200 PO para quem impedisse o ritual no topo da torre.
2. **A Maldição de Lyra**: As mãos da ladina começaram a escurecer desde que tocou o baú na masmorra anterior. Um teste de Sanidade/Sabedoria será exigido se entrar em áreas consagradas.
3. **A Aliança Desconfiada**: O *Mago Vermelho Ignis* ofereceu guiar o grupo pelo desfiladeiro, mas seus verdadeiros motivos envolvem recuperar um tomo proibido.

---

## 🏰 Locais Marcantes
- **Ponte das Cordas Podres**: Suspensa sobre um abismo de 40 metros. Teste de Destreza (Acrobacia) CD 13 para atravessar sob a ventania forte.
- **Santuário dos Sentinelas**: Ruína com estátuas decapitadas. Descansar aqui recupera 1 Dado de Vida extra, mas atrai sombras espectrais na 3ª hora.

## 🎲 Encontros Rápidos
- **Furtivo**: 3 Espectros das Rochas espreitam sob o nevoeiro.
- **Social**: Encontro com o eremita *Barnabé*, que troca informações valiosas por rações ou água purificada.
`,
  },
  {
    id: 'camp-default-2',
    title: 'O Chamado de Innsmouth: 1928',
    system: 'Call of Cthulhu 7e',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 2,
    notes: `# Investigação: Mistérios no Porto Decrépito

## Pistas Principais
- Diário criptografado encontrado no sótão do cartório municipal.
- Ouro com estranho brilho esverdeado circulando na refinaria Marsh.

## Testes Relevantes
- Encontrar Livros (CD Difícil) na biblioteca da vila.
- Psicologia para interrogar o balconista do hotel Gilman House.
`,
  },
];

const DEFAULT_CHARACTERS: CharacterSheet[] = [
  {
    id: 'char-1',
    campaignId: 'camp-default-1',
    name: 'Valerius Ardent',
    role: 'Paladino da Coroa (Nv 4)',
    type: 'PJ',
    attributes: [
      { id: 'a1', key: 'FOR', value: 16 },
      { id: 'a2', key: 'DES', value: 10 },
      { id: 'a3', key: 'CON', value: 14 },
      { id: 'a4', key: 'INT', value: 10 },
      { id: 'a5', key: 'SAB', value: 12 },
      { id: 'a6', key: 'CAR', value: 16 },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida', current: 36, max: 36, color: 'red' },
      { id: 'r2', name: 'Cura pelas Mãos', current: 20, max: 20, color: 'amber' },
      { id: 'r3', name: 'Espaços de Magia Nv 1', current: 3, max: 3, color: 'blue' },
    ],
    notes: `Equipamento: Armadura de Placas, Espada Longa radiante, Escudo de Aço Brasonado.
Juramento: Proteger os inocentes e não permitir que o caos domine as fronteiras do reino.`,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'char-2',
    campaignId: 'camp-default-1',
    name: 'Lyra Ventoveloz',
    role: 'Ladina Espadachim (Nv 4)',
    type: 'PJ',
    attributes: [
      { id: 'a1', key: 'FOR', value: 10 },
      { id: 'a2', key: 'DES', value: 18 },
      { id: 'a3', key: 'CON', value: 12 },
      { id: 'a4', key: 'INT', value: 13 },
      { id: 'a5', key: 'SAB', value: 12 },
      { id: 'a6', key: 'CAR', value: 14 },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida', current: 28, max: 28, color: 'red' },
      { id: 'r2', name: 'Inspiração de Bardo/Heróica', current: 1, max: 1, color: 'amber' },
    ],
    notes: `Perícias com Foco: Furtividade (+8), Prestidigitação (+8), Acrobacia (+6).
Equipamento: Rapieira de Prata, Par de Adagas Ocultas, Gazua Mestra.`,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'char-3',
    campaignId: 'camp-default-1',
    name: 'Ignis, o Renegado',
    role: 'Mago Evocador Ambíguo',
    type: 'NPC',
    attributes: [
      { id: 'a1', key: 'FOR', value: 8 },
      { id: 'a2', key: 'DES', value: 14 },
      { id: 'a3', key: 'CON', value: 12 },
      { id: 'a4', key: 'INT', value: 17 },
      { id: 'a5', key: 'SAB', value: 13 },
      { id: 'a6', key: 'CAR', value: 11 },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida', current: 42, max: 42, color: 'red' },
      { id: 'r2', name: 'Espaços Nv 1-3', current: 6, max: 7, color: 'purple' },
    ],
    notes: `Segredo do Mestre: Planeja usar os jogadores para destrancar a câmara selada da torre e roubar o Tomo das Cinzas.
Reação inicial: Amigável e prestativo, mas evita perguntas sobre seu antigo mestre.`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'char-4',
    campaignId: 'camp-default-1',
    name: 'Velho Barnabé',
    role: 'Barqueiro & Eremita Local',
    type: 'NPC',
    attributes: [
      { id: 'a1', key: 'FOR', value: 12 },
      { id: 'a2', key: 'DES', value: 9 },
      { id: 'a3', key: 'CON', value: 13 },
      { id: 'a4', key: 'INT', value: 11 },
      { id: 'a5', key: 'SAB', value: 15 },
      { id: 'a6', key: 'CAR', value: 8 },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida', current: 15, max: 15, color: 'red' },
    ],
    notes: `Conhece todos os atalhos do pântano. Perdeu a visão na juventude após olhar diretamente para o eclipse anterior. Fala em profecias enigmáticas.`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
];

export const storageService = {
  getCampaigns(): Campaign[] {
    try {
      const data = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
      if (!data) {
        this.saveCampaigns(DEFAULT_CAMPAIGNS);
        return DEFAULT_CAMPAIGNS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CAMPAIGNS;
    }
  },

  saveCampaigns(campaigns: Campaign[]): void {
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    } catch (e) {
      console.error('Falha ao salvar campanhas no LocalStorage:', e);
    }
  },

  getCharacters(): CharacterSheet[] {
    try {
      const data = localStorage.getItem(CHARACTERS_STORAGE_KEY);
      if (!data) {
        this.saveCharacters(DEFAULT_CHARACTERS);
        return DEFAULT_CHARACTERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_CHARACTERS;
    }
  },

  saveCharacters(characters: CharacterSheet[]): void {
    try {
      localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
    } catch (e) {
      console.error('Falha ao salvar fichas no LocalStorage:', e);
    }
  },

  getCampaignChatMessages(campaignId: string): ChatMessage[] {
    if (!campaignId) return [];
    try {
      const raw = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${campaignId}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveCampaignChatMessages(campaignId: string, messages: ChatMessage[]): void {
    if (!campaignId) return;
    try {
      // Filter out streaming placeholders
      const cleanMessages = messages
        .filter((m) => !m.isStreaming || m.content.trim().length > 0)
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));
      localStorage.setItem(`${CHAT_STORAGE_PREFIX}${campaignId}`, JSON.stringify(cleanMessages));
    } catch (e) {
      console.error('Falha ao salvar mensagens de chat da campanha no LocalStorage:', e);
    }
  },

  clearCampaignChatMessages(campaignId: string): void {
    if (!campaignId) return;
    try {
      localStorage.removeItem(`${CHAT_STORAGE_PREFIX}${campaignId}`);
    } catch (e) {
      console.error('Falha ao limpar chat da campanha no LocalStorage:', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      const settings = { ...DEFAULT_SETTINGS, ...parsed };
      // Migrate legacy/deprecated model
      if (settings.model === 'gemini-2.5-flash' || !settings.model) {
        settings.model = 'gemini-3.6-flash';
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      }
      return settings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Falha ao salvar configurações:', e);
    }
  },

  exportBackup(): string {
    const payload = {
      version: 1,
      appName: 'Grimorio',
      exportedAt: new Date().toISOString(),
      campaigns: this.getCampaigns(),
      characters: this.getCharacters(),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.campaigns)) {
        this.saveCampaigns(parsed.campaigns);
      }
      if (Array.isArray(parsed.characters)) {
        this.saveCharacters(parsed.characters);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error('Erro ao importar backup:', e);
      return false;
    }
  },
};
