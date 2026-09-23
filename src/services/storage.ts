import { Campaign, CampaignChapter, CharacterSheet, AppSettings, ChatMessage, UserProfile, CampaignMember, CampaignSharedItem } from '../types';
import { authService } from './auth';

const CAMPAIGNS_STORAGE_KEY = 'grimorio_campaigns_v1';
const CHARACTERS_STORAGE_KEY = 'grimorio_characters_v1';
const SETTINGS_STORAGE_KEY = 'grimorio_settings_v1';
const CHAT_STORAGE_PREFIX = 'grimorio_chat_';

export function generateCampaignInviteCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function ensureCampaignChapters(campaign: Campaign): Campaign {
  const masterId = campaign.masterId || campaign.userId || 'usr_mestre';
  const inviteCode = campaign.inviteCode || generateCampaignInviteCode();
  const members: CampaignMember[] =
    campaign.members && campaign.members.length > 0
      ? campaign.members
      : [
          {
            userId: masterId,
            displayName: campaign.masterName || 'Mestre da Masmorra',
            role: 'master',
            joinedAt: campaign.createdAt || Date.now(),
          },
        ];
  const sharedItems: CampaignSharedItem[] = Array.isArray(campaign.sharedItems) ? campaign.sharedItems : [];

  if (campaign.chapters && campaign.chapters.length > 0) {
    const activeId = campaign.activeChapterId && campaign.chapters.some((c) => c.id === campaign.activeChapterId)
      ? campaign.activeChapterId
      : campaign.chapters[0].id;
    const activeChapter = campaign.chapters.find((c) => c.id === activeId) || campaign.chapters[0];
    return {
      ...campaign,
      masterId,
      inviteCode,
      members,
      sharedItems,
      activeChapterId: activeId,
      notes: activeChapter.content || campaign.notes || '',
    };
  }

  const initialChapter: CampaignChapter = {
    id: `chap_${campaign.id}_1`,
    title: 'Capítulo 1: Introdução & Anotações',
    content: campaign.notes || '',
    sessionDate: 'Sessão 01',
    order: 0,
    createdAt: campaign.createdAt || Date.now(),
    updatedAt: campaign.updatedAt || Date.now(),
  };

  return {
    ...campaign,
    masterId,
    inviteCode,
    members,
    sharedItems,
    chapters: [initialChapter],
    activeChapterId: initialChapter.id,
    notes: initialChapter.content,
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  customApiKey: '',
  model: 'gemini-3.8-flash',
  fontSize: 'base',
  editorMode: 'edit',
  customLogoUrl: '',
  themeTone: 'cyan',
};

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-default-1',
    title: 'A Torre dos Ventos Esquecidos',
    system: 'D&D 5e',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    notes: `# Sessão 2 — A Garganta dos Murmúrios\n\n## 🌒 Clima & Atmosfera\n- Névoa rasteira espessa, cheiro de enxofre antigo e cinzas frias.\n- O vento uiva entre as rochas como se sussurrasse nomes do passado dos personagens.\n\n## 🧭 Objetivo do Grupo\nO grupo precisa alcançar o monastério abandonado de Val-Khar antes que o eclipse da lua cinzenta atinja o zênite.\nLá se encontra a relíquia conhecida como **O Olho de Quartzo**, capaz de romper o selo da cripta subterrânea.\n\n---\n\n## 👥 Heróis & Aliados em Campo\n> O grupo avança com passos firmes pelo desfiladeiro rochoso. Valerius mantém a guarda erguida com seu escudo brasonado:\n\n{{ficha:char-1}}\n\n---\n\n## ⚔️ Ganchos de Enredo Ativos\n1. **O Mensageiro Ferido**: Encontraram um corvo de ferro com um pergaminho manchado de sangue. O emissário prometeu 200 PO para quem impedisse o ritual no topo da torre.\n2. **A Maldição de Lyra**: As mãos da ladina começaram a escurecer desde que tocou o baú na masmorra anterior. Um teste de Sanidade/Sabedoria será exigido se entrar em áreas consagradas.\n3. **A Aliança Desconfiada**: O *Mago Vermelho Ignis* ofereceu guiar o grupo pelo desfiladeiro, mas seus verdadeiros motivos envolvem recuperar um tomo proibido.\n\n---\n\n## 🏰 Locais Marcantes\n- **Ponte das Cordas Podres**: Suspensa sobre um abismo de 40 metros. Teste de Destreza (Acrobacia) CD 13 para atravessar sob a ventania forte.\n- **Santuário dos Sentinelas**: Ruína com estátuas decapitadas. Descansar aqui recupera 1 Dado de Vida extra, mas atrai sombras espectrais na 3ª hora.\n\n## 🎲 Encontros Rápidos & Ameaças\n> Entre os escombros do santuário, criaturas espreitam nas frestas de pedra:\n\n{{monstro: Goblin}}\n`,
    chapters: [
      {
        id: 'chap-d1-1',
        title: 'Capítulo 1: O Encontro no Javali Caolho',
        sessionDate: 'Sessão 01',
        order: 0,
        content: `# Capítulo 1 — O Encontro no Javali Caolho\n\n## 🍻 O Ponto de Partida\n- A chuva fustiga as vidraças da taverna em Oakhaven. O taverneiro limpa canecos com um pano encardido.\n- Um emissário com capuz cinzento oferece um contrato aos heróis: investigar estranhos uivos e caravanas desaparecidas na Garganta dos Murmúrios.\n\n## 🗝️ Pistas Iniciais\n- Um corvo mecânico manchado de sangue caiu nos estábulos trazendo um pergaminho com o símbolo do Olho de Quartzo.\n- Os aldeões evitam o desfiladeiro desde a última lua cheia.\n`,
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now() - 86400000 * 5,
      },
      {
        id: 'chap-d1-2',
        title: 'Capítulo 2: A Garganta dos Murmúrios',
        sessionDate: 'Sessão 02',
        order: 1,
        content: `# Sessão 2 — A Garganta dos Murmúrios\n\n## 🌒 Clima & Atmosfera\n- Névoa rasteira espessa, cheiro de enxofre antigo e cinzas frias.\n- O vento uiva entre as rochas como se sussurrasse nomes do passado dos personagens.\n\n## 🧭 Objetivo do Grupo\nO grupo precisa alcançar o monastério abandonado de Val-Khar antes que o eclipse da lua cinzenta atinja o zênite.\nLá se encontra a relíquia conhecida como **O Olho de Quartzo**, capaz de romper o selo da cripta subterrânea.\n\n---\n\n## 👥 Heróis & Aliados em Campo\n> O grupo avança com passos firmes pelo desfiladeiro rochoso. Valerius mantém a guarda erguida com seu escudo brasonado:\n\n{{ficha:char-1}}\n\n---\n\n## ⚔️ Ganchos de Enredo Ativos\n1. **O Mensageiro Ferido**: Encontraram um corvo de ferro com um pergaminho manchado de sangue. O emissário prometeu 200 PO para quem impedisse o ritual no topo da torre.\n2. **A Maldição de Lyra**: As mãos da ladina começaram a escurecer desde que tocou o baú na masmorra anterior. Um teste de Sanidade/Sabedoria será exigido se entrar em áreas consagradas.\n3. **A Aliança Desconfiada**: O *Mago Vermelho Ignis* ofereceu guiar o grupo pelo desfiladeiro, mas seus verdadeiros motivos envolvem recuperar um tomo proibido.\n\n---\n\n## 🏰 Locais Marcantes\n- **Ponte das Cordas Podres**: Suspensa sobre um abismo de 40 metros. Teste de Destreza (Acrobacia) CD 13 para atravessar sob a ventania forte.\n- **Santuário dos Sentinelas**: Ruína com estátuas decapitadas. Descansar aqui recupera 1 Dado de Vida extra, mas atrai sombras espectrais na 3ª hora.\n\n## 🎲 Encontros Rápidos & Ameaças\n> Entre os escombros do santuário, criaturas espreitam nas frestas de pedra:\n\n{{monstro: Goblin}}\n`,
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now(),
      },
      {
        id: 'chap-d1-3',
        title: 'Capítulo 3: O Monastério de Val-Khar',
        sessionDate: 'Sessão 03',
        order: 2,
        content: `# Capítulo 3 — O Monastério de Val-Khar\n\n## ⚡ A Cripta Subterrânea\n- O eclipse da lua cinzenta atinge o ápice no céu tempestuoso sobre o cume da torre abandonada.\n- O altar de pedra no centro do monastério reluz com runas arcanas carmesins.\n\n## ⚔️ O Confronto Final\n- Guardiões de pedra despertam se qualquer personagem se aproximar a menos de 9 metros do Olho de Quartzo.\n- Teste de Arcanismo CD 15 para interromper a transferência de energia sombria.\n`,
        createdAt: Date.now() - 86400000 * 1,
        updatedAt: Date.now(),
      },
    ],
    activeChapterId: 'chap-d1-2',
  },
  {
    id: 'camp-default-2',
    title: 'O Chamado de Innsmouth: 1928',
    system: 'Call of Cthulhu 7e',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 2,
    notes: `# Investigação: Mistérios no Porto Decrépito\n\n## Pistas Principais\n- Diário criptografado encontrado no sótão do cartório municipal.\n- Ouro com estranho brilho esverdeado circulando na refinaria Marsh.\n\n## Testes Relevantes\n- Encontrar Livros (CD Difícil) na biblioteca da vila.\n- Psicologia para interrogar o balconista do hotel Gilman House.\n`,
    chapters: [
      {
        id: 'chap-d2-1',
        title: 'Capítulo 1: Chegada ao Porto Decrépito',
        sessionDate: 'Sessão 01',
        order: 0,
        content: `# Investigação: Mistérios no Porto Decrépito\n\n## Pistas Principais\n- Diário criptografado encontrado no sótão do cartório municipal.\n- Ouro com estranho brilho esverdeado circulando na refinaria Marsh.\n\n## Testes Relevantes\n- Encontrar Livros (CD Difícil) na biblioteca da vila.\n- Psicologia para interrogar o balconista do hotel Gilman House.\n`,
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'chap-d2-2',
        title: 'Capítulo 2: A Refinaria Marsh & A Ordem Secreta',
        sessionDate: 'Sessão 02',
        order: 1,
        content: `# Capítulo 2 — A Refinaria Marsh & A Ordem Secreta\n\n## 🌊 A Noite em Innsmouth\n- Batidas abafadas nas portas dos quartos durante a madrugada no hotel Gilman House.\n- Símbolos arcanos gravados em tiaras de ouro encontradas no porão da refinaria.\n\n## 👁️ Teste de Sanidade\n- Perda de 1d4/1d10 de Sanidade ao testemunhar formas humanoides com traços de peixe e olhos arregalados sem pálpebras.\n`,
        createdAt: Date.now() - 86400000 * 4,
        updatedAt: Date.now() - 86400000 * 2,
      },
    ],
    activeChapterId: 'chap-d2-1',
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

// Distinct starter campaigns for Narradora Lyra
const NARRADORA_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-lyra-1',
    title: 'Crônicas de Cyber-Neo-Tokyo 2099',
    system: 'Cyberpunk RED',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
    notes: `# Operação: Protocolo Sombra em Shinjuku

## 🌃 Clima & Cenário
- Chuva ácida fina, reflexos de neon azul e magenta no asfalto molhado.
- Sirenes de drones da megacorporação Arasaka patrulhando o setor 4.

## 💾 Missão Ativa
Extrair o chip quântico da bioengenheira Dra. Vane antes que a equipe de contenção limpe o laboratório.

## 👥 Contatos & Aliados
{{ficha:char-lyra-1}}
`,
  },
  {
    id: 'camp-lyra-2',
    title: 'O Culto da Serpente de Ferro',
    system: 'Tormenta 20',
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 3,
    notes: `# A Fenda de Valkaria

## 🗡️ Rumores na Taverna
- Mercadores afirmam que caravanas estão sumindo nas colinas dos Uivantes.
- Um clérigo da deusa da cura pede ajuda para purificar uma mina de ferro corrompida.
`,
  },
];

const NARRADORA_CHARACTERS: CharacterSheet[] = [
  {
    id: 'char-lyra-1',
    campaignId: 'camp-lyra-1',
    name: 'Kaelen "Glitch" Vane',
    role: 'Netrunner & Mercenário de Elite',
    type: 'PJ',
    attributes: [
      { id: 'a1', key: 'REF', value: 14 },
      { id: 'a2', key: 'INT', value: 18 },
      { id: 'a3', key: 'TEC', value: 16 },
      { id: 'a4', key: 'VON', value: 13 },
      { id: 'a5', key: 'MOV', value: 12 },
      { id: 'a6', key: 'COR', value: 10 },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida', current: 35, max: 35, color: 'emerald' },
      { id: 'r2', name: 'Interface Cyberdeck', current: 5, max: 5, color: 'blue' },
    ],
    notes: 'Equipado com Cyberdeck Militech e pistola de plasma silenciosa.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

export const storageService = {
  // --- USER SPECIFIC CAMPAIGNS ---
  getUserCampaigns(userId: string): Campaign[] {
    if (!userId) return [];
    const storageKey = `grimorio_user_${userId}_campaigns`;
    try {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.map((c) => ensureCampaignChapters(c));
        }
      }

      // Check migration from legacy storage if this is the primary master account
      if (userId === 'usr_mestre' || userId === 'shared') {
        const legacyData = localStorage.getItem(CAMPAIGNS_STORAGE_KEY);
        if (legacyData) {
          try {
            const parsedLegacy = JSON.parse(legacyData);
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
              const ensuredLegacy = parsedLegacy.map((c) => ensureCampaignChapters(c));
              this.saveUserCampaigns(userId, ensuredLegacy);
              return ensuredLegacy;
            }
          } catch {
            // ignore
          }
        }
        // Seed default master campaigns
        const ensuredDefaults = DEFAULT_CAMPAIGNS.map((c) => ensureCampaignChapters(c));
        this.saveUserCampaigns(userId, ensuredDefaults);
        return ensuredDefaults;
      }

      if (userId === 'usr_narradora') {
        const ensuredNarradora = NARRADORA_CAMPAIGNS.map((c) => ensureCampaignChapters(c));
        this.saveUserCampaigns(userId, ensuredNarradora);
        return ensuredNarradora;
      }

      // For any newly created user, start with a fresh custom starter campaign
      const starterCamp: Campaign[] = [
        ensureCampaignChapters({
          id: `camp_${userId}_starter`,
          title: 'Primeira Jornada',
          system: 'D&D 5e',
          notes: `# Primeira Jornada do Mestre\n\nBem-vindo ao seu novo Grimório!\n\n## ⚔️ Ganchos Iniciais\n- A aventura começa aqui. Adicione suas anotações, fichas de personagens e use o Copiloto IA para expandir seu mundo.\n`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ];
      this.saveUserCampaigns(userId, starterCamp);
      return starterCamp;
    } catch {
      return [];
    }
  },

  saveUserCampaigns(userId: string, campaigns: Campaign[]): void {
    if (!userId) return;
    const storageKey = `grimorio_user_${userId}_campaigns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(campaigns));
    } catch (e) {
      console.error(`Falha ao salvar campanhas do usuário ${userId}:`, e);
    }
  },

  clearUserCampaigns(userId: string): void {
    if (!userId) return;
    const storageKey = `grimorio_user_${userId}_campaigns`;
    try {
      localStorage.setItem(storageKey, JSON.stringify([]));
    } catch (e) {
      console.error(`Falha ao limpar campanhas do usuário ${userId}:`, e);
    }
  },

  // --- USER SPECIFIC CHARACTERS ---
  getUserCharacters(userId: string): CharacterSheet[] {
    if (!userId) return [];
    const storageKey = `grimorio_user_${userId}_characters`;
    try {
      const data = localStorage.getItem(storageKey);
      let list: CharacterSheet[] = [];
      if (data) {
        try {
          list = JSON.parse(data);
        } catch {}
      } else if (userId === 'usr_mestre' || userId === 'shared') {
        const legacyData = localStorage.getItem(CHARACTERS_STORAGE_KEY);
        if (legacyData) {
          try {
            const parsedLegacy = JSON.parse(legacyData);
            if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
              this.saveUserCharacters(userId, parsedLegacy);
              list = parsedLegacy;
            }
          } catch {
            // ignore
          }
        }
        if (list.length === 0) {
          this.saveUserCharacters(userId, DEFAULT_CHARACTERS);
          list = DEFAULT_CHARACTERS;
        }
      } else if (userId === 'usr_narradora') {
        this.saveUserCharacters(userId, NARRADORA_CHARACTERS);
        list = NARRADORA_CHARACTERS;
      }

      // Merge characters from all campaigns mastered or owned by this user
      const userCampaigns = this.getUserCampaigns(userId);
      for (const camp of userCampaigns) {
        const campChars = this.getCampaignCharacters(camp.id);
        for (const cc of campChars) {
          if (!list.some((c) => c.id === cc.id)) {
            list.push(cc);
          }
        }
      }

      return list;
    } catch {
      return [];
    }
  },

  saveUserCharacters(userId: string, characters: CharacterSheet[]): void {
    if (!userId) return;
    const storageKey = `grimorio_user_${userId}_characters`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(characters));
      // Also update campaign characters store for any campaignId present
      for (const char of characters) {
        if (char.campaignId) {
          this.saveCampaignCharacter(char.campaignId, char);
        }
        if (char.masterId && char.masterId !== userId) {
          this.saveCharacterForMaster(char.masterId, char);
        }
      }
    } catch (e) {
      console.error(`Falha ao salvar fichas do usuário ${userId}:`, e);
    }
  },

  saveCampaignCharacter(campaignId: string, character: CharacterSheet): void {
    if (!campaignId || !character?.id) return;
    const key = `grimorio_campaign_${campaignId}_characters`;
    try {
      const existing = localStorage.getItem(key);
      const list: CharacterSheet[] = existing ? JSON.parse(existing) : [];
      const updated = [...list.filter((c) => c.id !== character.id), character];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar ficha na campanha:', e);
    }
  },

  getCampaignCharacters(campaignId: string): CharacterSheet[] {
    if (!campaignId) return [];
    const key = `grimorio_campaign_${campaignId}_characters`;
    try {
      const existing = localStorage.getItem(key);
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  },

  saveCharacterForMaster(masterId: string, character: CharacterSheet): void {
    if (!masterId || !character?.id) return;
    const masterKey = `grimorio_user_${masterId}_characters`;
    try {
      const existing = localStorage.getItem(masterKey);
      const list: CharacterSheet[] = existing ? JSON.parse(existing) : [];
      const updated = [...list.filter((c) => c.id !== character.id), character];
      localStorage.setItem(masterKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao sincronizar ficha no cache do mestre:', e);
    }
  },

  clearUserCharacters(userId: string): void {
    if (!userId) return;
    const storageKey = `grimorio_user_${userId}_characters`;
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error(`Falha ao limpar fichas do usuário ${userId}:`, e);
    }
  },

  // --- USER ACTIVE CAMPAIGN ID ---
  getUserActiveCampaignId(userId: string): string {
    if (!userId) return '';
    const key = `grimorio_user_${userId}_active_camp`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) return stored;
    } catch {
      // ignore
    }
    const userCamps = this.getUserCampaigns(userId);
    const fallback = userCamps[0]?.id || '';
    if (fallback) {
      this.saveUserActiveCampaignId(userId, fallback);
    }
    return fallback;
  },

  saveUserActiveCampaignId(userId: string, campaignId: string): void {
    if (!userId) return;
    const key = `grimorio_user_${userId}_active_camp`;
    try {
      localStorage.setItem(key, campaignId);
    } catch {
      // ignore
    }
  },

  // --- USER & CAMPAIGN CHAT MESSAGES ---
  getUserCampaignChatMessages(userId: string, campaignId: string): ChatMessage[] {
    if (!campaignId) return [];
    const key = userId
      ? `grimorio_user_${userId}_chat_${campaignId}`
      : `${CHAT_STORAGE_PREFIX}${campaignId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        // Fallback check legacy
        const legacyRaw = localStorage.getItem(`${CHAT_STORAGE_PREFIX}${campaignId}`);
        if (legacyRaw) {
          const parsedLegacy = JSON.parse(legacyRaw);
          return Array.isArray(parsedLegacy) ? parsedLegacy : [];
        }
        return [];
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveUserCampaignChatMessages(userId: string, campaignId: string, messages: ChatMessage[]): void {
    if (!campaignId) return;
    const key = userId
      ? `grimorio_user_${userId}_chat_${campaignId}`
      : `${CHAT_STORAGE_PREFIX}${campaignId}`;
    try {
      const cleanMessages = messages
        .filter((m) => !m.isStreaming || m.content.trim().length > 0)
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        }));
      localStorage.setItem(key, JSON.stringify(cleanMessages));
    } catch (e) {
      console.error('Falha ao salvar chat no LocalStorage:', e);
    }
  },

  clearUserCampaignChatMessages(userId: string, campaignId: string): void {
    if (!campaignId) return;
    const key = userId
      ? `grimorio_user_${userId}_chat_${campaignId}`
      : `${CHAT_STORAGE_PREFIX}${campaignId}`;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Falha ao limpar chat no LocalStorage:', e);
    }
  },

  // --- GLOBAL DELEGATES (Using active user) ---
  getCampaigns(): Campaign[] {
    const user = authService.getCurrentUser();
    return this.getUserCampaigns(user.id);
  },

  saveCampaigns(campaigns: Campaign[]): void {
    const user = authService.getCurrentUser();
    this.saveUserCampaigns(user.id, campaigns);
    // Also mirror to legacy key for backwards safety
    try {
      localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(campaigns));
    } catch {
      // ignore
    }
  },

  clearCampaigns(): void {
    const user = authService.getCurrentUser();
    this.clearUserCampaigns(user.id);
  },

  getCharacters(): CharacterSheet[] {
    const user = authService.getCurrentUser();
    return this.getUserCharacters(user.id);
  },

  saveCharacters(characters: CharacterSheet[]): void {
    const user = authService.getCurrentUser();
    this.saveUserCharacters(user.id, characters);
    try {
      localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
    } catch {
      // ignore
    }
  },

  getCampaignChatMessages(campaignId: string): ChatMessage[] {
    const user = authService.getCurrentUser();
    return this.getUserCampaignChatMessages(user.id, campaignId);
  },

  saveCampaignChatMessages(campaignId: string, messages: ChatMessage[]): void {
    const user = authService.getCurrentUser();
    this.saveUserCampaignChatMessages(user.id, campaignId, messages);
  },

  clearCampaignChatMessages(campaignId: string): void {
    const user = authService.getCurrentUser();
    this.clearUserCampaignChatMessages(user.id, campaignId);
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      const settings = { ...DEFAULT_SETTINGS, ...parsed };
      if (
        settings.model === 'gemini-2.5-flash' ||
        settings.model === 'gemini-2.5-flash-lite' ||
        !settings.model
      ) {
        settings.model = 'gemini-3.8-flash';
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
    const user = authService.getCurrentUser();
    if (!user) return '{}';
    const payload = {
      version: 2,
      appName: 'Grimorio',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      campaigns: this.getUserCampaigns(user.id),
      characters: this.getUserCharacters(user.id),
      settings: this.getSettings(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const user = authService.getCurrentUser();
      if (!user) return false;
      if (Array.isArray(parsed.campaigns)) {
        this.saveUserCampaigns(user.id, parsed.campaigns);
      }
      if (Array.isArray(parsed.characters)) {
        this.saveUserCharacters(user.id, parsed.characters);
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

  // Direct Account Transfer Code (Transfer between PCs without needing active cloud setup)
  exportAccountTransferCode(userId: string): string {
    const accounts = authService.getAccounts();
    const user = accounts.find((a) => a.id === userId) || authService.getCurrentUser();
    if (!user) return '';
    const payload = {
      version: 2,
      type: 'grimorio_account_transfer',
      user,
      campaigns: this.getUserCampaigns(user.id),
      characters: this.getUserCharacters(user.id),
      activeCampaignId: this.getUserActiveCampaignId(user.id),
      exportedAt: Date.now(),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  },

  importAccountTransferCode(codeOrJson: string): { success: boolean; user?: UserProfile; error?: string } {
    try {
      let raw = (codeOrJson || '').trim();
      if (!raw) return { success: false, error: 'Por favor, cole o código de transferência.' };

      if (!raw.startsWith('{')) {
        try {
          raw = decodeURIComponent(escape(atob(raw)));
        } catch {
          raw = atob(raw);
        }
      }

      const data = JSON.parse(raw);
      const user: UserProfile | undefined = data.user;
      if (!user || !user.id || !user.username) {
        return { success: false, error: 'Código inválido: dados da conta não encontrados.' };
      }

      // Add to accounts list
      const accounts = authService.getAccounts().filter((a) => a.id !== user.id);
      accounts.push(user);
      authService.saveAccounts(accounts);

      // Save user campaigns & characters
      if (Array.isArray(data.campaigns)) {
        this.saveUserCampaigns(user.id, data.campaigns);
      }
      if (Array.isArray(data.characters)) {
        this.saveUserCharacters(user.id, data.characters);
      }
      if (data.activeCampaignId) {
        this.saveUserActiveCampaignId(user.id, data.activeCampaignId);
      }

      authService.setCurrentUser(user.id);
      return { success: true, user };
    } catch (e: any) {
      return { success: false, error: 'Código de transferência inválido ou corrompido.' };
    }
  },
};
