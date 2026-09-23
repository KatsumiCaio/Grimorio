export interface TemplateAttributeField {
  key: string;
  label?: string;
  value: string | number;
  category?: 'Atributo Principal' | 'Secundário / Estatística' | 'Perícia / Traço';
  isOptional?: boolean;
}

export interface TemplateResourceField {
  name: string;
  current: number;
  max: number;
  color: string;
  isOptional?: boolean;
}

export interface TemplateArchetypePreset {
  id: string;
  name: string;
  rolePJ: string;
  roleNPC: string;
  description: string;
  attributes: Record<string, string | number>;
  resources?: Record<string, { current: number; max: number }>;
  notesSnippet?: string;
}

export interface SheetTemplate {
  id: string;
  name: string;
  system: string;
  category: 'Fantasia Medieval' | 'Horror & Sobrenatural' | 'Ficção & Cyberpunk' | 'Narrativo & Aberto' | 'Nacional';
  badge: string;
  description: string;
  defaultRolePJ: string;
  defaultRoleNPC: string;
  attributes: TemplateAttributeField[];
  resources: TemplateResourceField[];
  archetypes?: TemplateArchetypePreset[];
  notes: string;
}

export const SHEET_TEMPLATES: SheetTemplate[] = [
  {
    id: 'dnd5e',
    name: 'Dungeons & Dragons 5e',
    system: 'D&D 5e',
    category: 'Fantasia Medieval',
    badge: 'd20 Clássico',
    description: 'Os 6 atributos tradicionais com PV, CA, Slots de Magia e campos derivados de combate.',
    defaultRolePJ: 'Guerreiro Humano Nv 1',
    defaultRoleNPC: 'Líder Bandido / Goblin Xamã',
    attributes: [
      { key: 'FOR', label: 'Força', value: 14, category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza', value: 12, category: 'Atributo Principal' },
      { key: 'CON', label: 'Constituição', value: 14, category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência', value: 10, category: 'Atributo Principal' },
      { key: 'SAB', label: 'Sabedoria', value: 12, category: 'Atributo Principal' },
      { key: 'CAR', label: 'Carisma', value: 8, category: 'Atributo Principal' },
      { key: 'PROF', label: 'Bônus de Proficiência', value: '+2', category: 'Secundário / Estatística', isOptional: true },
      { key: 'PERC_PAS', label: 'Percepção Passiva', value: 11, category: 'Secundário / Estatística', isOptional: true },
      { key: 'INIC', label: 'Iniciativa', value: '+1', category: 'Secundário / Estatística', isOptional: true },
      { key: 'DESLOC', label: 'Deslocamento', value: '9m (30ft)', category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 22, max: 22, color: 'red' },
      { name: 'Classe de Armadura (CA)', current: 16, max: 16, color: 'amber' },
      { name: 'Slots de Magia / Especial', current: 2, max: 2, color: 'blue' },
      { name: 'Dados de Vida (DV)', current: 1, max: 1, color: 'purple', isOptional: true },
      { name: 'Inspiração do Mestre', current: 0, max: 1, color: 'amber', isOptional: true },
    ],
    archetypes: [
      {
        id: 'fighter',
        name: 'Guerreiro / Combatente',
        rolePJ: 'Guerreiro Humano Nv 2 - Estilo Defesa',
        roleNPC: 'Capitão da Guarda da Cidade',
        description: 'Focado em alta Força, Constituição e resistência em linha de frente.',
        attributes: { FOR: 16, DES: 12, CON: 15, INT: 9, SAB: 12, CAR: 8, PROF: '+2', PERC_PAS: 11, INIC: '+1', DESLOC: '9m' },
        resources: { 'Pontos de Vida (PV)': { current: 24, max: 24 }, 'Classe de Armadura (CA)': { current: 18, max: 18 } },
      },
      {
        id: 'wizard',
        name: 'Mago / Conjurador',
        rolePJ: 'Mago Evocador Élfico Nv 2',
        roleNPC: 'Mago de Torre / Aprendiz Arcano',
        description: 'Alta Inteligência, grimório e múltiplos slots de magia preparados.',
        attributes: { FOR: 8, DES: 14, CON: 13, INT: 16, SAB: 12, CAR: 10, PROF: '+2', PERC_PAS: 11, INIC: '+2', DESLOC: '9m' },
        resources: { 'Pontos de Vida (PV)': { current: 14, max: 14 }, 'Slots de Magia / Especial': { current: 3, max: 3 }, 'Classe de Armadura (CA)': { current: 12, max: 12 } },
      },
      {
        id: 'rogue',
        name: 'Ladino / Especialista',
        rolePJ: 'Ladino Assassino Halfling Nv 2',
        roleNPC: 'Espião das Sombras / Gatuno',
        description: 'Destreza extrema, perícias de infiltração e ataque furtivo.',
        attributes: { FOR: 10, DES: 17, CON: 12, INT: 13, SAB: 12, CAR: 14, PROF: '+2', PERC_PAS: 13, INIC: '+3', DESLOC: '7.5m' },
        resources: { 'Pontos de Vida (PV)': { current: 17, max: 17 }, 'Classe de Armadura (CA)': { current: 14, max: 14 } },
      },
      {
        id: 'cleric',
        name: 'Clérigo / Curador',
        rolePJ: 'Clérigo da Vida Anão Nv 2',
        roleNPC: 'Sacerdote do Templo Solar',
        description: 'Alta Sabedoria e Constituição, magias divinas e armadura pesada.',
        attributes: { FOR: 14, DES: 10, CON: 15, INT: 10, SAB: 16, CAR: 12, PROF: '+2', PERC_PAS: 13, INIC: '+0', DESLOC: '7.5m' },
        resources: { 'Pontos de Vida (PV)': { current: 20, max: 20 }, 'Classe de Armadura (CA)': { current: 18, max: 18 }, 'Slots de Magia / Especial': { current: 3, max: 3 } },
      },
    ],
    notes: `### Equipamento & Armas
- Espada Longa (1d8/1d10 cortante) ou Adagas
- Cota de Malha ou Armadura de Couro, Escudo
- Mochila de aventureiro, tochas e 25 PO

### Perícias & Habilidades
- Perícias Treinadas: Atletismo (+4), Percepção (+3)
- Habilidade Chave: Retomar o Fôlego / Ataque Furtivo / Truques

### Anotações da Campanha
- Vínculo com a cidade ou patrono da missão.`,
  },
  {
    id: 'tormenta20',
    name: 'Tormenta 20 (T20)',
    system: 'Tormenta 20',
    category: 'Nacional',
    badge: 'd20 Heroico & PM',
    description: 'Modificadores diretos (-1 a +5), Pontos de Mana (PM) unificados e Defesa ativa de Arton.',
    defaultRolePJ: 'Guerreiro de Valkaria Nv 2',
    defaultRoleNPC: 'Lefeu Corruptor / Guarda de Valkaria',
    attributes: [
      { key: 'FOR', label: 'Força (Mod)', value: 3, category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza (Mod)', value: 1, category: 'Atributo Principal' },
      { key: 'CON', label: 'Constituição (Mod)', value: 2, category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência (Mod)', value: 0, category: 'Atributo Principal' },
      { key: 'SAB', label: 'Sabedoria (Mod)', value: 1, category: 'Atributo Principal' },
      { key: 'CAR', label: 'Carisma (Mod)', value: 0, category: 'Atributo Principal' },
      { key: 'DESLOC', label: 'Deslocamento', value: '9m', category: 'Secundário / Estatística', isOptional: true },
      { key: 'CD_MAGIA', label: 'CD para Resistir a Efeitos', value: 14, category: 'Secundário / Estatística', isOptional: true },
      { key: 'LIMITE_PM', label: 'Limite de PM por Ação', value: 2, category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 26, max: 26, color: 'red' },
      { name: 'Pontos de Mana (PM)', current: 12, max: 12, color: 'blue' },
      { name: 'Defesa', current: 17, max: 17, color: 'amber' },
      { name: 'RD (Redução de Dano)', current: 0, max: 5, color: 'purple', isOptional: true },
    ],
    archetypes: [
      {
        id: 't20-guerreiro',
        name: 'Guerreiro Artoniano',
        rolePJ: 'Guerreiro Humano Nv 2 - Foco em Ataque Especial',
        roleNPC: 'Veterano do Exército do Reinado',
        description: 'Mestre das armas, gastando PM para Ataque Especial e Golpe Poderoso.',
        attributes: { FOR: 4, DES: 1, CON: 3, INT: 0, SAB: 1, CAR: 0, DESLOC: '9m', LIMITE_PM: 2 },
        resources: { 'Pontos de Vida (PV)': { current: 30, max: 30 }, 'Pontos de Mana (PM)': { current: 8, max: 8 }, Defesa: { current: 18, max: 18 } },
      },
      {
        id: 't20-arcanista',
        name: 'Arcanista / Mago',
        rolePJ: 'Arcanista Mago Qareen Nv 2',
        roleNPC: 'Mago da Academia Arcana',
        description: 'Amplo repertório de magias arcanas com grande reserva de PM.',
        attributes: { FOR: -1, DES: 2, CON: 1, INT: 4, SAB: 1, CAR: 2, DESLOC: '9m', CD_MAGIA: 15, LIMITE_PM: 2 },
        resources: { 'Pontos de Vida (PV)': { current: 16, max: 16 }, 'Pontos de Mana (PM)': { current: 18, max: 18 }, Defesa: { current: 12, max: 12 } },
      },
      {
        id: 't20-ladino',
        name: 'Ladino Emboscador',
        rolePJ: 'Ladino Goblin Nv 2',
        roleNPC: 'Membro da Guilda dos Ladrões',
        description: 'Especialista em Furtividade, Ladinagem e Ataque Furtivo com adagas.',
        attributes: { FOR: 0, DES: 4, CON: 2, INT: 3, SAB: 0, CAR: 1, DESLOC: '9m', LIMITE_PM: 2 },
        resources: { 'Pontos de Vida (PV)': { current: 20, max: 20 }, 'Pontos de Mana (PM)': { current: 12, max: 12 }, Defesa: { current: 16, max: 16 } },
      },
    ],
    notes: `### Origem & Divindade
- Origem: Guarda / Estudioso / Amigo dos Animais
- Devoção: Valkaria (Deusa da Ambição) ou Lin-Wu ou Khalmyr

### Poderes de Classe & Gastos em PM
- Ataque Especial (1 PM por +2 em ataque ou dano)
- Magias Aprendidas (Seta Infalível, Armadura Arcana, Concentração de Combate)

### Equipamentos
- Espada Bastarda / Arco Curto / Foco Arcano
- Armadura Brunea, Escudo Leve, 3 Tibares de Ouro`,
  },
  {
    id: 'pathfinder2e',
    name: 'Pathfinder 2ª Edição (PF2e)',
    system: 'Pathfinder 2e',
    category: 'Fantasia Medieval',
    badge: '3 Ações & 4 Graus',
    description: 'Sistema tático com 3 Ações, 4 Graus de Sucesso, Pontos de Foco e Salvamentos separados.',
    defaultRolePJ: 'Guerreiro Humano Nv 1 (Agressor)',
    defaultRoleNPC: 'Capitão da Guarda de Absalom',
    attributes: [
      { key: 'FOR', label: 'Força (Mod)', value: '+4', category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza (Mod)', value: '+1', category: 'Atributo Principal' },
      { key: 'CON', label: 'Constituição (Mod)', value: '+2', category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência (Mod)', value: '+0', category: 'Atributo Principal' },
      { key: 'SAB', label: 'Sabedoria (Mod)', value: '+1', category: 'Atributo Principal' },
      { key: 'CAR', label: 'Carisma (Mod)', value: '+0', category: 'Atributo Principal' },
      { key: 'PERCEP', label: 'Percepção (Especialista)', value: '+6', category: 'Secundário / Estatística', isOptional: true },
      { key: 'FORT', label: 'Fortitude (Salvamento)', value: '+7', category: 'Secundário / Estatística', isOptional: true },
      { key: 'REFL', label: 'Reflexos (Salvamento)', value: '+6', category: 'Secundário / Estatística', isOptional: true },
      { key: 'VONT', label: 'Vontade (Salvamento)', value: '+4', category: 'Secundário / Estatística', isOptional: true },
      { key: 'VELOC', label: 'Velocidade', value: '25 ft (7.5m)', category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 20, max: 20, color: 'red' },
      { name: 'Classe de Armadura (CA)', current: 18, max: 18, color: 'amber' },
      { name: 'Pontos de Foco (Focus)', current: 1, max: 1, color: 'blue' },
      { name: 'Dureza do Escudo (Shield HP)', current: 20, max: 20, color: 'purple', isOptional: true },
    ],
    archetypes: [
      {
        id: 'pf2e-champion',
        name: 'Campeão / Champion',
        rolePJ: 'Campeão Paladino Nv 1',
        roleNPC: 'Cruzado de Iomedae',
        description: 'Defesa pesada, Reação Retribuição e cura por Imposição de Mãos.',
        attributes: { FOR: '+4', DES: '+0', CON: '+3', INT: '+0', SAB: '+1', CAR: '+2', PERCEP: '+4', FORT: '+8', REFL: '+3', VONT: '+6', VELOC: '20 ft' },
        resources: { 'Pontos de Vida (PV)': { current: 22, max: 22 }, 'Classe de Armadura (CA)': { current: 19, max: 19 }, 'Pontos de Foco (Focus)': { current: 1, max: 1 } },
      },
      {
        id: 'pf2e-rogue',
        name: 'Ladino / Rogue',
        rolePJ: 'Ladino Trapaceiro Nv 1',
        roleNPC: 'Agente da Guilda de Puddles',
        description: 'Ataque Furtivo, Esquiva Rápida e abundância de perícias especializadas.',
        attributes: { FOR: '+1', DES: '+4', CON: '+2', INT: '+2', SAB: '+1', CAR: '+1', PERCEP: '+7', FORT: '+5', REFL: '+9', VONT: '+5', VELOC: '25 ft' },
        resources: { 'Pontos de Vida (PV)': { current: 16, max: 16 }, 'Classe de Armadura (CA)': { current: 17, max: 17 } },
      },
    ],
    notes: `### Ações de Combate (3 Ações por Turno)
- Golpe (Strike): 1 ação (MAP: 0/-5/-10)
- Andar (Stride): 1 ação
- Erguer Escudo (Raise Shield): 1 ação (+2 CA)

### Feitos & Perícias
- Feito de Classe: Golpe Duplo ou Reação de Ataque
- Perícias Treinadas: Atletismo (+7), Intimidação (+5)

### Equipamentos
- Espada bastarda (1d8/1d12 cortante), Armadura de Placas, Escudo de Aço`,
  },
  {
    id: 'coc',
    name: 'Call of Cthulhu 7ª Ed.',
    system: 'Call of Cthulhu',
    category: 'Horror & Sobrenatural',
    badge: 'd100 Investigativo',
    description: 'Atributos percentuais (d100), Sanidade mental, Pontos de Magia e Sorte volátil.',
    defaultRolePJ: 'Jornalista Investigativo / Detetive',
    defaultRoleNPC: 'Cultista dos Mitos / Entidade Cósmica',
    attributes: [
      { key: 'FOR', label: 'Força %', value: 50, category: 'Atributo Principal' },
      { key: 'CON', label: 'Constituição %', value: 55, category: 'Atributo Principal' },
      { key: 'TAM', label: 'Tamanho %', value: 60, category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza %', value: 50, category: 'Atributo Principal' },
      { key: 'APA', label: 'Aparência %', value: 45, category: 'Atributo Principal' },
      { key: 'EDU', label: 'Educação %', value: 65, category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência %', value: 70, category: 'Atributo Principal' },
      { key: 'POD', label: 'Poder %', value: 50, category: 'Atributo Principal' },
      { key: 'CRÉDITO', label: 'Nível de Crédito %', value: 45, category: 'Secundário / Estatística', isOptional: true },
      { key: 'MITOS', label: 'Mitos de Cthulhu %', value: 0, category: 'Secundário / Estatística', isOptional: true },
      { key: 'MOV', label: 'Taxa de Movimento', value: 8, category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 11, max: 11, color: 'red' },
      { name: 'Sanidade (SAN)', current: 50, max: 99, color: 'purple' },
      { name: 'Sorte (SOR)', current: 55, max: 99, color: 'amber' },
      { name: 'Pontos de Magia (PM)', current: 10, max: 10, color: 'blue' },
    ],
    archetypes: [
      {
        id: 'coc-detective',
        name: 'Detetive Particular',
        rolePJ: 'Investigador Forense / Detetive de Boston',
        roleNPC: 'Informante do Cais',
        description: 'Especialista em armas de fogo, psicologia de interrogatório e rastreamento.',
        attributes: { FOR: 60, CON: 60, TAM: 65, DES: 60, APA: 45, EDU: 60, INT: 65, POD: 50, CRÉDITO: 40, MITOS: 0, MOV: 8 },
        resources: { 'Pontos de Vida (PV)': { current: 12, max: 12 }, 'Sanidade (SAN)': { current: 50, max: 99 }, 'Sorte (SOR)': { current: 60, max: 99 } },
      },
      {
        id: 'coc-doctor',
        name: 'Médico Legista / Alienista',
        rolePJ: 'Dr. Archibald Finch - Psiquiatra de Arkham',
        roleNPC: 'Médico do Sanatório de Danvers',
        description: 'Alta Educação e Medicina, resistente a horrores anatômicos.',
        attributes: { FOR: 40, CON: 50, TAM: 55, DES: 50, APA: 55, EDU: 85, INT: 75, POD: 60, CRÉDITO: 65, MITOS: 5, MOV: 7 },
        resources: { 'Pontos de Vida (PV)': { current: 10, max: 10 }, 'Sanidade (SAN)': { current: 60, max: 99 }, 'Sorte (SOR)': { current: 50, max: 99 } },
      },
    ],
    notes: `### Principais Perícias Investigativas
- Encontrar / Percepção: 65% (Difícil: 32% | Extremo: 13%)
- Psicologia: 60% (30% | 12%)
- Armas de Fogo (.38 Especial): 45% (22% | 9%)
- Furtividade: 50%
- Primeiros Socorros: 40%

### Traumas Mentais & Perturbações
- Sanidade intacta (sem loucura temporária por enquanto).
- Ponto de Ruptura de Sanidade: 40.`,
  },
  {
    id: 'ordem_paranormal',
    name: 'Ordem Paranormal RPG',
    system: 'Ordem Paranormal',
    category: 'Nacional',
    badge: 'Pool d20 & NEX',
    description: 'Pool de d20s conforme atributos (AGI, FOR, INT, PRE, VIG), NEX e Pontos de Esforço (PE).',
    defaultRolePJ: 'Combatente Aniquilador - NEX 15%',
    defaultRoleNPC: 'Zumbi de Sangue / Cultista da Morte',
    attributes: [
      { key: 'AGI', label: 'Agilidade (d20s)', value: 2, category: 'Atributo Principal' },
      { key: 'FOR', label: 'Força (d20s)', value: 3, category: 'Atributo Principal' },
      { key: 'INT', label: 'Intelecto (d20s)', value: 1, category: 'Atributo Principal' },
      { key: 'PRE', label: 'Presença (d20s)', value: 2, category: 'Atributo Principal' },
      { key: 'VIG', label: 'Vigor (d20s)', value: 3, category: 'Atributo Principal' },
      { key: 'NEX', label: 'Nível de Exposição (NEX)', value: '15%', category: 'Secundário / Estatística', isOptional: true },
      { key: 'LIMITE_PE', label: 'Limite de PE por Turno', value: 3, category: 'Secundário / Estatística', isOptional: true },
      { key: 'DESLOC', label: 'Deslocamento', value: '9m', category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 32, max: 32, color: 'red' },
      { name: 'Sanidade (SAN)', current: 20, max: 20, color: 'purple' },
      { name: 'Pontos de Esforço (PE)', current: 9, max: 9, color: 'blue' },
      { name: 'Defesa Passiva', current: 15, max: 15, color: 'amber' },
    ],
    archetypes: [
      {
        id: 'ordem-combatente',
        name: 'Combatente (Guerreiro)',
        rolePJ: 'Combatente Tropas de Choque - NEX 20%',
        roleNPC: 'Agente de Campo da Ordem',
        description: 'Focado em Força/Vigor e resistência a danos maciços.',
        attributes: { AGI: 2, FOR: 4, INT: 1, PRE: 1, VIG: 3, NEX: '20%', LIMITE_PE: 4 },
        resources: { 'Pontos de Vida (PV)': { current: 38, max: 38 }, 'Sanidade (SAN)': { current: 16, max: 16 }, 'Pontos de Esforço (PE)': { current: 8, max: 8 }, 'Defesa Passiva': { current: 16, max: 16 } },
      },
      {
        id: 'ordem-ocultista',
        name: 'Ocultista (Rituais)',
        rolePJ: 'Ocultista Conduíte - NEX 20%',
        roleNPC: 'Pesquisador de Fenômenos Anômalos',
        description: 'Alta Presença e Intelecto para conjuração de Rituais Paranormais.',
        attributes: { AGI: 1, FOR: 1, INT: 3, PRE: 4, VIG: 2, NEX: '20%', LIMITE_PE: 4 },
        resources: { 'Pontos de Vida (PV)': { current: 22, max: 22 }, 'Sanidade (SAN)': { current: 30, max: 30 }, 'Pontos de Esforço (PE)': { current: 16, max: 16 }, 'Defesa Passiva': { current: 12, max: 12 } },
      },
    ],
    notes: `### Perícias Treinadas (+5 / +10)
- Luta (+5), Fortitude (+5), Percepção (+5), Tática (+5)

### Armas & Rituais
- Machado Tático (1d12 cortante, Crítico 19/x3)
- Pistola .40 (2d6 balístico)
- Proteção Leve (+5 Defesa)`,
  },
  {
    id: 'vampire',
    name: 'Vampiro: A Máscara (V5 / Storyteller)',
    system: 'Vampiro / WoD',
    category: 'Horror & Sobrenatural',
    badge: 'Terror Pessoal',
    description: 'Atributos divididos em Físicos, Sociais e Mentais (1 a 5), com Fome e Humanidade.',
    defaultRolePJ: 'Ventrue Neófito - Camarrilla',
    defaultRoleNPC: 'Carniçal Vigilante / Inquisidor',
    attributes: [
      { key: 'FOR', label: 'Força (1-5)', value: 2, category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza (1-5)', value: 3, category: 'Atributo Principal' },
      { key: 'VIG', label: 'Vigor (1-5)', value: 2, category: 'Atributo Principal' },
      { key: 'CAR', label: 'Carisma (1-5)', value: 3, category: 'Atributo Principal' },
      { key: 'MAN', label: 'Manipulação (1-5)', value: 3, category: 'Atributo Principal' },
      { key: 'COM', label: 'Compostura (1-5)', value: 3, category: 'Atributo Principal' },
      { key: 'PER', label: 'Percepção (1-5)', value: 2, category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência (1-5)', value: 3, category: 'Atributo Principal' },
      { key: 'RAC', label: 'Raciocínio (1-5)', value: 3, category: 'Atributo Principal' },
      { key: 'GERAÇÃO', label: 'Geração', value: '12ª Geração', category: 'Secundário / Estatística', isOptional: true },
      { key: 'POTÊNCIA', label: 'Potência do Sangue', value: 1, category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Vitalidade', current: 5, max: 5, color: 'red' },
      { name: 'Força de Vontade', current: 6, max: 6, color: 'blue' },
      { name: 'Fome', current: 1, max: 5, color: 'purple' },
      { name: 'Humanidade', current: 7, max: 10, color: 'amber' },
    ],
    notes: `### Clã & Seita
- Clã: Ventrue / Toreador / Brujah
- Seita: Camarrilla | Predador: Beco

### Disciplinas de Sangue
- Presença Nível 1: Fascínio
- Dominação Nível 1: Comando

### Convicções & Pedras de Toque
- Convicção: Nunca ferir um inocente sem causa nobre.
- Pedra de Toque: Amigo de infância que ignora sua nova condição.`,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk RED / 2020',
    system: 'Cyberpunk',
    category: 'Ficção & Cyberpunk',
    badge: 'Distopia Futurista',
    description: 'Atributos de 1 a 10 (REF, DES, TEC, etc.), Blindagem corporal e Humanidade.',
    defaultRolePJ: 'Mercenário Solo / Netrunner',
    defaultRoleNPC: 'Operativo da Arasaka / Boostergang',
    attributes: [
      { key: 'REF', label: 'Reflexos (1-10)', value: 7, category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza (1-10)', value: 6, category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência (1-10)', value: 7, category: 'Atributo Principal' },
      { key: 'TEC', label: 'Técnica (1-10)', value: 6, category: 'Atributo Principal' },
      { key: 'ATR', label: 'Atratividade (1-10)', value: 5, category: 'Atributo Principal' },
      { key: 'VON', label: 'Vontade (1-10)', value: 6, category: 'Atributo Principal' },
      { key: 'SOR', label: 'Sorte (1-10)', value: 5, category: 'Atributo Principal' },
      { key: 'MOV', label: 'Movimento (1-10)', value: 6, category: 'Atributo Principal' },
      { key: 'COR', label: 'Corpo (1-10)', value: 6, category: 'Atributo Principal' },
      { key: 'EMP', label: 'Empatia (1-10)', value: 5, category: 'Atributo Principal' },
      { key: 'REPUTAÇÃO', label: 'Reputação nas Ruas', value: 2, category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 35, max: 35, color: 'red' },
      { name: 'Humanidade', current: 42, max: 50, color: 'purple' },
      { name: 'Blindagem Cabeça (SP)', current: 11, max: 11, color: 'blue' },
      { name: 'Blindagem Corpo (SP)', current: 11, max: 11, color: 'amber' },
    ],
    notes: `### Ciberimplantes (Custo de Humanidade)
- Kiroshi Optics com mira infravermelha
- Plugue de Interface Neural direta
- Braço cibernético reforçado

### Armas & Equipamentos
- Pistola Pesada Militech (.45, 3d6 dano)
- Jaqueta de Kevlar reforçada (SP 11)
- Cyberdeck com programas de quebra de gelo`,
  },
  {
    id: 'osr',
    name: 'OSR / Shadowdark / OSE',
    system: 'OSR / Old-School',
    category: 'Fantasia Medieval',
    badge: 'Old-School D&D',
    description: 'Atributos 3d6 compactos, PVs letais, slots de inventário e CA tradicional.',
    defaultRolePJ: 'Ladino Especialista Nv 1',
    defaultRoleNPC: 'Esqueleto Guardião / Acólito Sinistro',
    attributes: [
      { key: 'FOR', label: 'Força (3d6)', value: 11, category: 'Atributo Principal' },
      { key: 'DES', label: 'Destreza (3d6)', value: 15, category: 'Atributo Principal' },
      { key: 'CON', label: 'Constituição (3d6)', value: 12, category: 'Atributo Principal' },
      { key: 'INT', label: 'Inteligência (3d6)', value: 10, category: 'Atributo Principal' },
      { key: 'SAB', label: 'Sabedoria (3d6)', value: 9, category: 'Atributo Principal' },
      { key: 'CAR', label: 'Carisma (3d6)', value: 13, category: 'Atributo Principal' },
      { key: 'ALINHAMENTO', label: 'Alinhamento', value: 'Neutro', category: 'Secundário / Estatística', isOptional: true },
      { key: 'DADO_VIDA', label: 'Dado de Vida', value: '1d4', category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 6, max: 6, color: 'red' },
      { name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'amber' },
      { name: 'Slots de Carga / Inventário', current: 7, max: 10, color: 'blue' },
    ],
    notes: `### Inventário em Slots (Limite 10)
1. Adaga (+1 dano furtivo)
2. Ferramentas de ladrão (gazua)
3. Tochas (2) - Duração 1 hora real
4. Corda de 15m com gancho
5. Ração de ferro (3 dias)
6. 12 Peças de Prata (PP)`,
  },
  {
    id: 'fate',
    name: 'FATE Core / Acelerado',
    system: 'FATE',
    category: 'Narrativo & Aberto',
    badge: 'Narrativo Aberto',
    description: 'Abordagens / Pirâmide de perícias, Estresse físico e mental, e Pontos de Destino.',
    defaultRolePJ: 'Piloto Destemido de Caça Estelar',
    defaultRoleNPC: 'Agente Duplo Corporativo',
    attributes: [
      { key: 'ÁPICE (+4)', label: 'Abordagem Ápice', value: 'Pilotagem', category: 'Atributo Principal' },
      { key: 'ÓTIMO (+3)', label: 'Abordagem Ótima', value: 'Combate', category: 'Atributo Principal' },
      { key: 'BOM (+2)', label: 'Abordagem Boa', value: 'Contatos', category: 'Atributo Principal' },
      { key: 'RAZOÁVEL (+1)', label: 'Abordagem Razoável', value: 'Engenharia', category: 'Atributo Principal' },
      { key: 'MÉDIO (+0)', label: 'Abordagem Média', value: 'Empatia', category: 'Atributo Principal' },
    ],
    resources: [
      { name: 'Estresse Físico', current: 3, max: 3, color: 'red' },
      { name: 'Estresse Mental', current: 3, max: 3, color: 'purple' },
      { name: 'Pontos de Destino', current: 3, max: 3, color: 'amber' },
    ],
    notes: `### Aspectos do Personagem
- **Conceito Principal**: O melhor contrabandista da Nebulosa de Órion.
- **Dificuldade**: Preço na cabeça fixado pela Frota Federal.
- **Aspecto de Vínculo**: Amigo leal aos companheiros de bordo.

### Proezas
- Manobra Arriscada: +2 em testes de Pilotagem sob fogo cruzado.`,
  },
  {
    id: 'custom',
    name: 'Livre / Sistema Próprio',
    system: 'Livre',
    category: 'Narrativo & Aberto',
    badge: 'Totalmente Customizável',
    description: 'Estrutura neutra com atributos totalmente editáveis para qualquer sistema independente.',
    defaultRolePJ: 'Protagonista Aventureiro',
    defaultRoleNPC: 'Guarda / Contato / Rival',
    attributes: [
      { key: 'FOR', label: 'Força', value: 10, category: 'Atributo Principal' },
      { key: 'AGI', label: 'Agilidade', value: 10, category: 'Atributo Principal' },
      { key: 'VIG', label: 'Vigor', value: 10, category: 'Atributo Principal' },
      { key: 'INT', label: 'Intelecto', value: 10, category: 'Atributo Principal' },
      { key: 'PER', label: 'Percepção', value: 10, category: 'Secundário / Estatística', isOptional: true },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 20, max: 20, color: 'red' },
      { name: 'Energia / Mana', current: 10, max: 10, color: 'blue' },
      { name: 'Defesa / Guarda', current: 12, max: 12, color: 'amber', isOptional: true },
    ],
    notes: `### Anotações da Ficha
- Personalize atributos e valores conforme a mecânica do seu sistema.
- Crie novas barras de recursos de acordo com a necessidade.`,
  },
  {
    id: '3det',
    name: '3D&T (Alpha / Victory)',
    system: '3D&T Victory',
    category: 'Nacional',
    badge: '1d6 Anime & F,H,R,A,PdF',
    description: 'Sistema nacional ágil para anime e fantasia com F, H, R, A, PdF e escala de pontos.',
    defaultRolePJ: 'Lutador Espadachim (5 Pontos)',
    defaultRoleNPC: 'Monstro Gigante Kaiju / Rival',
    attributes: [
      { key: 'F', label: 'Força', value: 2, category: 'Atributo Principal' },
      { key: 'H', label: 'Habilidade', value: 3, category: 'Atributo Principal' },
      { key: 'R', label: 'Resistência', value: 2, category: 'Atributo Principal' },
      { key: 'A', label: 'Armadura', value: 1, category: 'Atributo Principal' },
      { key: 'PdF', label: 'Poder de Fogo', value: 0, category: 'Atributo Principal' },
    ],
    resources: [
      { name: 'Pontos de Vida (PV)', current: 10, max: 10, color: 'red' },
      { name: 'Pontos de Mana (PM)', current: 10, max: 10, color: 'blue' },
      { name: 'Pontos de Ação (PA)', current: 1, max: 3, color: 'amber', isOptional: true },
    ],
    archetypes: [
      {
        id: '3det-guerreiro',
        name: 'Lutador / Espadachim',
        rolePJ: 'Espadachim Humano (Novato)',
        roleNPC: 'Capitão da Guarda Local',
        description: 'Alta Força e Habilidade em combate corpo a corpo com golpes velozes.',
        attributes: { F: 3, H: 3, R: 2, A: 2, PdF: 0 },
        resources: { 'Pontos de Vida (PV)': { current: 10, max: 10 }, 'Pontos de Mana (PM)': { current: 10, max: 10 } },
      },
      {
        id: '3det-mago',
        name: 'Mago / Conjurador',
        rolePJ: 'Mago Elemental (Novato)',
        roleNPC: 'Ermitão Feiticeiro',
        description: 'Alta Habilidade e Resistência para conjurar magias devastadoras.',
        attributes: { F: 0, H: 4, R: 3, A: 1, PdF: 2 },
        resources: { 'Pontos de Vida (PV)': { current: 15, max: 15 }, 'Pontos de Mana (PM)': { current: 15, max: 15 } },
      },
    ],
    notes: `### Vantagens & Desvantagens
- Vantagens: Aceleração (1 pt), Ataque Especial (1 pt)
- Desvantagens: Código de Honra dos Heróis (-1 pt), Ponto Fraco (-1 pt)

### Equipamento & Golpes
- Espada da Família (+1 em FA)
- Anel com gema elemental`,
  },
];

/**
 * Heurística inteligente para encontrar o modelo recomendado com base no sistema da campanha
 */
export function findTemplateBySystem(systemName?: string): SheetTemplate {
  if (!systemName) return SHEET_TEMPLATES[0];

  const lower = systemName.toLowerCase();

  if (lower.includes('tormenta') || lower.includes('t20')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'tormenta20') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('pathfinder') || lower.includes('pf2') || lower.includes('pf2e')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'pathfinder2e') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('cthulhu') || lower.includes('coc') || lower.includes('investigação')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'coc') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('ordem') || lower.includes('paranormal')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'ordem_paranormal') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('3d&t') || lower.includes('3det') || lower.includes('victory') || lower.includes('alpha')) {
    return SHEET_TEMPLATES.find((t) => t.id === '3det') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('osr') || lower.includes('shadowdark') || lower.includes('ose') || lower.includes('old school') || lower.includes('old dragon') || lower.includes('b/x')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'osr') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('vampir') || lower.includes('wod') || lower.includes('storyteller') || lower.includes('máscara')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'vampire') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('cyber') || lower.includes('red') || lower.includes('2020') || lower.includes('sci-fi') || lower.includes('shadowrun')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'cyberpunk') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('fate') || lower.includes('fudge')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'fate') || SHEET_TEMPLATES[0];
  }
  if (lower.includes('d&d') || lower.includes('dnd') || lower.includes('5e')) {
    return SHEET_TEMPLATES.find((t) => t.id === 'dnd5e') || SHEET_TEMPLATES[0];
  }

  return SHEET_TEMPLATES[0];
}

/**
 * Cria uma ficha de personagem padrão compatível com o sistema especificado
 */
export function createSystemCharacter(params: {
  campaignId: string;
  systemName: string;
  name: string;
  role?: string;
  userId: string;
  masterId?: string;
  creatorName?: string;
  archetypeId?: string;
  avatarUrl?: string;
}): Omit<import('../types').CharacterSheet, 'createdAt' | 'updatedAt'> {
  const template = findTemplateBySystem(params.systemName);
  const arch = params.archetypeId ? template.archetypes?.find((a) => a.id === params.archetypeId) : undefined;

  const role = params.role?.trim() || (arch ? arch.rolePJ : template.defaultRolePJ);

  const attributes = template.attributes.map((attr, idx) => {
    const archVal = arch?.attributes[attr.key];
    const finalVal = archVal !== undefined ? archVal : attr.value;
    return {
      id: `attr-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      key: attr.key,
      value: finalVal,
    };
  });

  const resources = template.resources.map((res, idx) => {
    const archRes = arch?.resources?.[res.name];
    const current = archRes ? archRes.current : res.current;
    const max = archRes ? archRes.max : res.max;
    return {
      id: `res-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: res.name,
      current,
      max,
      color: res.color,
    };
  });

  return {
    id: `char-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    campaignId: params.campaignId,
    system: template.system,
    userId: params.userId,
    masterId: params.masterId,
    creatorName: params.creatorName,
    name: params.name.trim() || 'Novo Personagem',
    role,
    type: 'PJ',
    attributes,
    resources,
    notes: arch?.notesSnippet ? `${arch.notesSnippet}\n\n${template.notes}` : template.notes,
    avatarUrl: params.avatarUrl,
    sharedWithPlayers: false,
  };
}
