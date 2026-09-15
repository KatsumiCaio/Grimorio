export interface SheetTemplate {
  id: string;
  name: string;
  system: string;
  badge: string;
  description: string;
  defaultRolePJ: string;
  defaultRoleNPC: string;
  attributes: Array<{ key: string; value: string | number }>;
  resources: Array<{ name: string; current: number; max: number; color: string }>;
  notes: string;
}

export const SHEET_TEMPLATES: SheetTemplate[] = [
  {
    id: 'dnd5e',
    name: 'Dungeons & Dragons 5e',
    system: 'D&D 5e',
    badge: 'd20 Clássico',
    description: 'Os 6 atributos tradicionais com PV, slots/magia e Classe de Armadura.',
    defaultRolePJ: 'Guerreiro Humano Nv 1',
    defaultRoleNPC: 'Líder Bandido / Goblin Xamã',
    attributes: [
      { key: 'FOR', value: 14 },
      { key: 'DES', value: 12 },
      { key: 'CON', value: 14 },
      { key: 'INT', value: 10 },
      { key: 'SAB', value: 12 },
      { key: 'CAR', value: 8 },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 22, max: 22, color: 'red' },
      { name: 'Slots de Magia / Recurso', current: 4, max: 4, color: 'blue' },
      { name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'amber' },
    ],
    notes: `### Equipamento & Armas
- Espada Longa (1d8/1d10 cortante)
- Cota de Malha, Escudo (+2 CA)
- Mochila de aventureiro, tochas e 15 PO

### Perícias & Talentos
- Atletismo (+4), Percepção (+3), Intimidação (+1)
- Estilo de Luta: Defesa
- Retomar o Fôlego (1d10 + nível)

### Anotações do Mestre
- Vínculo com a guilda local dos Corvos de Prata.`,
  },
  {
    id: 'osr',
    name: 'OSR / Shadowdark / OSE',
    system: 'OSR / Old-School',
    badge: 'Old-School D&D',
    description: 'Atributos 3d6 compactos, PVs letais, slots de inventário e CA descendente ou ascendente.',
    defaultRolePJ: 'Ladino Especialista Nv 1',
    defaultRoleNPC: 'Esqueleto Guardião / Acólito Sinistro',
    attributes: [
      { key: 'FOR', value: 11 },
      { key: 'DES', value: 15 },
      { key: 'CON', value: 12 },
      { key: 'INT', value: 10 },
      { key: 'SAB', value: 9 },
      { key: 'CAR', value: 13 },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 6, max: 6, color: 'red' },
      { name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'amber' },
      { name: 'Slots de Carga / Inventário', current: 8, max: 10, color: 'blue' },
    ],
    notes: `### Alinhamento & Dados de Vida
- Alinhamento: Caótico / Neutro
- Dados de Vida: 1d4 (PV frágil)

### Inventário Ativo (Limite de Slots)
1. Adaga (+1 dano furtivo)
2. Ferramentas de ladrão (gazua)
3. Tochas (2) - Duração 1 hora real
4. Corda de 15m com gancho
5. Ração de ferro (3 dias)
6. 12 Peças de Prata (PP)

### Anotações Rápidas
- Furtividade nas sombras: 1 em 1d6 de ser ouvido.`,
  },
  {
    id: 'coc',
    name: 'Call of Cthulhu 7ª Ed.',
    system: 'Call of Cthulhu',
    badge: 'Investigação & Mitos',
    description: 'Atributos percentuais (d100), Sanidade mental, Pontos de Magia e Sorte volátil.',
    defaultRolePJ: 'Jornalista Investigativo / Arqueólogo',
    defaultRoleNPC: 'Cultista dos Mitos / Entidade Menor',
    attributes: [
      { key: 'FOR', value: 50 },
      { key: 'CON', value: 55 },
      { key: 'TAM', value: 60 },
      { key: 'DES', value: 50 },
      { key: 'APA', value: 45 },
      { key: 'EDU', value: 65 },
      { key: 'INT', value: 70 },
      { key: 'POD', value: 50 },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 11, max: 11, color: 'red' },
      { name: 'Sanidade (SAN)', current: 50, max: 99, color: 'purple' },
      { name: 'Pontos de Magia (PM)', current: 10, max: 10, color: 'blue' },
      { name: 'Sorte (SOR)', current: 55, max: 99, color: 'amber' },
    ],
    notes: `### Ocupação & Finanças
- Ocupação: Jornalista / Investigador Particular
- Nível de Gastos: Padrão ($10/dia)
- Crédito: 45%

### Principais Perícias
- Encontrar / Percepção: 65%
- Psicologia: 60%
- Mitos de Cthulhu: 05%
- Armas de Fogo (Pistola .38): 40%
- Furtividade: 50%

### Fobias & Traumas Mentais
- Nenhuma no momento (Pontos de Sanidade intactos).
- Carrega um medalhão antigo encontrado em Innsmouth.`,
  },
  {
    id: 'tormenta20',
    name: 'Tormenta 20 (T20)',
    system: 'Tormenta 20',
    badge: 'Fantasia Nacional',
    description: 'Modificadores diretos (-1 a +5), Pontos de Mana dinâmicos para magias e poderes.',
    defaultRolePJ: 'Arcanista Bruxo Nv 2',
    defaultRoleNPC: 'Monstro da Lefeu / Guarda de Valkaria',
    attributes: [
      { key: 'FOR', value: 0 },
      { key: 'DES', value: 2 },
      { key: 'CON', value: 1 },
      { key: 'INT', value: 4 },
      { key: 'SAB', value: 1 },
      { key: 'CAR', value: 0 },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 18, max: 18, color: 'red' },
      { name: 'Pontos de Mana (PM)', current: 14, max: 14, color: 'blue' },
      { name: 'Defesa', current: 12, max: 12, color: 'amber' },
    ],
    notes: `### Origem & Divindade
- Origem: Estudioso / Assistente de Laboratório
- Devoção: Wynna (Deusa da Magia)

### Poderes & Magias (Gasto em PM)
- Foco em Magia (+2 em testes de Misticismo)
- Seta Infalível de Talude (1 PM - 1d4+1 essência)
- Armadura Arcana (1 PM - +5 Defesa)
- Raio Solar (2 PM)

### Equipamento
- Foco arcano (cajado entalhado), grimório em couro, poção de mana menor.`,
  },
  {
    id: 'vampire',
    name: 'Vampiro: A Máscara (V5 / Storyteller)',
    system: 'Vampiro / WoD',
    badge: 'Terror Pessoal',
    description: 'Atributos divididos em Físicos, Sociais e Mentais (1 a 5), com Fome e Humanidade.',
    defaultRolePJ: 'Ventrue / Toreador Neófito',
    defaultRoleNPC: 'Carniçal Vigilante / Inquisidor',
    attributes: [
      { key: 'FOR', value: 2 },
      { key: 'DES', value: 3 },
      { key: 'VIG', value: 2 },
      { key: 'CAR', value: 3 },
      { key: 'MAN', value: 3 },
      { key: 'APA', value: 2 },
      { key: 'PER', value: 2 },
      { key: 'INT', value: 3 },
      { key: 'RAC', value: 3 },
    ],
    resources: [
      { name: 'Vitalidade', current: 5, max: 5, color: 'red' },
      { name: 'Força de Vontade', current: 6, max: 6, color: 'blue' },
      { name: 'Fome', current: 1, max: 5, color: 'purple' },
      { name: 'Humanidade', current: 7, max: 10, color: 'amber' },
    ],
    notes: `### Clã & Seita
- Clã: Brujah / Ventrue / Tremere
- Geração: 12ª | Predador: Beco / Sereia

### Disciplinas Conhecidas
- Potência / Presença Nível 1
- Dominação Nível 1

### Convicções & Pedras de Toque
- Nunca tirar a vida de quem não pode se defender.
- Contato humano: Irmã mais nova em um hospital local.`,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk RED / 2020',
    system: 'Cyberpunk',
    badge: 'Distopia Futurista',
    description: 'Atributos de 1 a 10 (REF, DES, TEC, etc.), Blindagem corporal e Humanidade.',
    defaultRolePJ: 'Mercenário Solo / Netrunner',
    defaultRoleNPC: 'Operativo da Arasaka / Boostergang',
    attributes: [
      { key: 'REF', value: 7 },
      { key: 'DES', value: 6 },
      { key: 'INT', value: 7 },
      { key: 'TEC', value: 6 },
      { key: 'ATR', value: 5 },
      { key: 'VON', value: 6 },
      { key: 'SOR', value: 5 },
      { key: 'MOV', value: 6 },
      { key: 'COR', value: 6 },
      { key: 'EMP', value: 5 },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 35, max: 35, color: 'red' },
      { name: 'Humanidade', current: 42, max: 50, color: 'purple' },
      { name: 'Blindagem (SP Cabeça/Corpo)', current: 11, max: 11, color: 'blue' },
    ],
    notes: `### Ciberimplantes (Custo de Humanidade)
- Kiroshi Optics com scanner de alvo
- Interface Neural direta
- Braço cibernético com compartimento oculto

### Armas & Equipamentos
- Pistola Pesada Militech (3d6, pente 12)
- Jaqueta de Kevlar reforçada (SP 11)
- Cyberdeck com programas de quebra de gelo

### Dívidas & Reputação
- Reputação nas Ruas: 2
- Deve 2.000 eurodólares para um agiota em Heywood.`,
  },
  {
    id: 'fate',
    name: 'FATE Core / Acelerado',
    system: 'FATE',
    badge: 'Narrativo Aberto',
    description: 'Abordagens / Pirâmide de perícias, Estresse físico e mental, e Pontos de Destino.',
    defaultRolePJ: 'Piloto Destemido de Caça Estelar',
    defaultRoleNPC: 'Agente Duplo do Império',
    attributes: [
      { key: 'ÁPICE (+4)', value: 'Pilotagem' },
      { key: 'ÓTIMO (+3)', value: 'Combate' },
      { key: 'BOM (+2)', value: 'Contatos' },
      { key: 'RAZOÁVEL (+1)', value: 'Engenharia' },
      { key: 'MÉDIO (+0)', value: 'Empatia' },
    ],
    resources: [
      { name: 'Estresse Físico', current: 3, max: 3, color: 'red' },
      { name: 'Estresse Mental', current: 3, max: 3, color: 'purple' },
      { name: 'Pontos de Destino', current: 3, max: 3, color: 'amber' },
    ],
    notes: `### Aspectos do Personagem
- **Conceito Principal**: O melhor piloto de contrabando da Nebulosa Negra.
- **Dificuldade**: Procurado pela Frota Corporativa.
- **Aspecto 3**: "Se tem motores, eu posso fazer voar."
- **Aspecto 4**: Amigo leal até o fim do universo.

### Proezas
- **Manobra Arriscada**: +2 para Superar usando Pilotagem sob fogo cruzado intenso.`,
  },
  {
    id: 'custom',
    name: 'Livre / Sistema Próprio',
    system: 'Livre',
    badge: 'Totalmente Customizável',
    description: 'Estrutura neutra com atributos editáveis para qualquer sistema caseiro ou independente.',
    defaultRolePJ: 'Aventureiro / Protagonista',
    defaultRoleNPC: 'Guarda / Contato / Rival',
    attributes: [
      { key: 'FOR', value: 10 },
      { key: 'AGI', value: 10 },
      { key: 'VIG', value: 10 },
      { key: 'INT', value: 10 },
    ],
    resources: [
      { name: 'Pontos de Vida', current: 20, max: 20, color: 'red' },
      { name: 'Energia / Recurso', current: 10, max: 10, color: 'blue' },
    ],
    notes: `### Anotações Gerais
- Adicione atributos personalizados no painel ao lado.
- Ajuste valores e nomes das barras conforme a mecânica do seu sistema.`,
  },
];

/**
 * Heurística inteligente para encontrar o modelo recomendado com base no sistema da campanha
 */
export function findTemplateBySystem(systemName?: string): SheetTemplate {
  if (!systemName) return SHEET_TEMPLATES[0];

  const lower = systemName.toLowerCase();

  if (lower.includes('cthulhu') || lower.includes('coc') || lower.includes('investigação')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'coc') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('osr') || lower.includes('shadowdark') || lower.includes('ose') || lower.includes('old school') || lower.includes('b/x')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'osr') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('tormenta') || lower.includes('t20')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'tormenta20') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('vampir') || lower.includes('wod') || lower.includes('storyteller') || lower.includes('máscara')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'vampire') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('cyber') || lower.includes('red') || lower.includes('2020') || lower.includes('sci-fi')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'cyberpunk') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('fate') || lower.includes('fudge')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'fate') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('d&d') || lower.includes('dnd') || lower.includes('5e') || lower.includes('pathfinder')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'dnd5e') || SHEET_TEMPLATES[0];
  }

  return SHEET_TEMPLATES[0];
}
