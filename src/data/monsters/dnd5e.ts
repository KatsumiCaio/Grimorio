import { BestiaryMonster } from '../../types';
import { getMonsterAvatar } from '../monsterAvatarHelper';

export const DND5E_BESTIARY: BestiaryMonster[] = [
  // ----------------------------------------------------
  // ND 1/8 a ND 1/2: Pequenos Lacaios, Emboscadores e Mortos-Vivos Menores
  // ----------------------------------------------------
  {
    id: 'dnd5e_kobold',
    name: 'Kobold Emboscador',
    system: 'D&D 5e',
    category: 'Humanóide',
    challenge: 'ND 1/8 (25 XP)',
    role: 'Lacaio / Espreitador de Túneis',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('goblin', '#b91c1c', '#f87171', '#1f0202'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '7 (-2)' },
      { id: 'a2', key: 'DES', value: '15 (+2)' },
      { id: 'a3', key: 'CON', value: '9 (-1)' },
      { id: 'a4', key: 'INT', value: '8 (-1)' },
      { id: 'a5', key: 'SAB', value: '7 (-2)' },
      { id: 'a6', key: 'CAR', value: '8 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 5, max: 5, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 12, max: 12, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Características Especiais
- **Táticas de Bando:** O kobold tem Vantagem nas jogadas de ataque contra uma criatura se pelo menos um aliado do kobold estiver a até 1,5 metro dela e não estiver incapacitado.
- **Sensibilidade à Luz Solar:** Enquanto sob luz solar direta, o kobold tem Desvantagem nas jogadas de ataque e testes de Percepção baseados em visão.

### Ações
- **Adaga:** +4 para atingir, alcance 1,5m, dano: 4 (1d4 + 2) perfurante.
- **Funda:** +4 para atingir, distância 9/36m, dano: 4 (1d4 + 2) concussão.`,
  },
  {
    id: 'dnd5e_goblin_skirmisher',
    name: 'Goblin Salteador',
    system: 'D&D 5e',
    category: 'Humanóide',
    challenge: 'ND 1/4 (50 XP)',
    role: 'Lacaio / Espreitador Ágil',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('goblin', '#16a34a', '#86efac', '#052e16'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '8 (-1)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '10 (+0)' },
      { id: 'a4', key: 'INT', value: '10 (+0)' },
      { id: 'a5', key: 'SAB', value: '8 (-1)' },
      { id: 'a6', key: 'CAR', value: '8 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 7, max: 7, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'blue' },
    ],
    notes: `### Habilidade Especial
- **Fuga Ágil:** O goblin pode realizar a ação de Desengajar ou Esconder-se como uma Ação Bônus em cada um dos seus turnos.

### Ações
- **Cimitarra:** +4 para atingir, alcance 1,5m, dano: 5 (1d6 + 2) cortante.
- **Arco Curto:** +4 para atingir, distância 24/96m, dano: 5 (1d6 + 2) perfurante.`,
  },
  {
    id: 'dnd5e_skeleton',
    name: 'Esqueleto Guerreiro',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 1/4 (50 XP)',
    role: 'Soldado Morto-Vivo',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('skull', '#71717a', '#d4d4d8', '#09090b'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '10 (+0)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '15 (+2)' },
      { id: 'a4', key: 'INT', value: '6 (-2)' },
      { id: 'a5', key: 'SAB', value: '8 (-1)' },
      { id: 'a6', key: 'CAR', value: '5 (-3)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 13, max: 13, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'red' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Vulnerabilidades & Imunidades
- **Vulnerabilidade a Dano:** Concussão (golpes contundentes esmigalham os ossos).
- **Imunidade a Dano:** Veneno.
- **Imunidade a Condições:** Envenenado, Exaustão.

### Ações
- **Espada Curta:** +4 para atingir, alcance 1,5m, dano: 5 (1d6 + 2) perfurante.
- **Arco Curto:** +4 para atingir, distância 24/96m, dano: 5 (1d6 + 2) perfurante.`,
  },
  {
    id: 'dnd5e_zombie',
    name: 'Zumbi Pútrido',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 1/4 (50 XP)',
    role: 'Bucho de Canhão Incansável',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('skull', '#065f46', '#34d399', '#022c22'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '13 (+1)' },
      { id: 'a2', key: 'DES', value: '6 (-2)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '3 (-4)' },
      { id: 'a5', key: 'SAB', value: '6 (-2)' },
      { id: 'a6', key: 'CAR', value: '5 (-3)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 22, max: 22, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 8, max: 8, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 6, max: 6, color: 'purple' },
    ],
    notes: `### Resistência à Morte
- **Fortitude de Morto-Vivo:** Se o dano reduzir o zumbi a 0 PV, ele deve fazer um Teste de Resistência de Constituição com CD 5 + o dano sofrido, a não ser que o dano seja radiante ou de um acerto crítico. Se obtiver sucesso, o zumbi cai para 1 PV em vez disso!

### Ações
- **Pancada Apodrecida:** +3 para atingir, alcance 1,5m, dano: 4 (1d6 + 1) concussão.`,
  },
  {
    id: 'dnd5e_orc',
    name: 'Orc Guerreiro',
    system: 'D&D 5e',
    category: 'Humanóide',
    challenge: 'ND 1/2 (100 XP)',
    role: 'Brutamontes Selvagem',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('goblin', '#854d0e', '#facc15', '#2e1065'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '16 (+3)' },
      { id: 'a2', key: 'DES', value: '12 (+1)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '7 (-2)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '10 (+0)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 15, max: 15, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Habilidade Especial
- **Agressivo:** Com uma Ação Bônus, o orc pode mover-se até o seu deslocamento em direção a uma criatura hostil que ele possa ver.

### Ações
- **Machado Grande:** +5 para atingir, alcance 1,5m, dano: 9 (1d12 + 3) cortante.
- **Azagaia:** +5 para atingir, alcance 1,5m ou distância 9/36m, dano: 6 (1d6 + 3) perfurante.`,
  },
  {
    id: 'dnd5e_hobgoblin',
    name: 'Hobgoblin Soldado',
    system: 'D&D 5e',
    category: 'Humanóide',
    challenge: 'ND 1/2 (100 XP)',
    role: 'Combatente Disciplinado',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('goblin', '#991b1b', '#fca5a5', '#1c0505'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '13 (+1)' },
      { id: 'a2', key: 'DES', value: '12 (+1)' },
      { id: 'a3', key: 'CON', value: '12 (+1)' },
      { id: 'a4', key: 'INT', value: '10 (+0)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '9 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 11, max: 11, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 18, max: 18, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'blue' },
    ],
    notes: `### Habilidade de Batalha
- **Vantagem Marcial:** Uma vez por turno, o hobgoblin pode causar 7 (2d6) de dano extra a uma criatura que ele acerte com um ataque armado, se essa criatura estiver a até 1,5m de um aliado do hobgoblin.

### Ações
- **Espada Longa:** +3 para atingir, alcance 1,5m, dano: 5 (1d8 + 1) cortante, ou 6 (1d10 + 1) cortante empunhada com as duas mãos.
- **Arco Longo:** +3 para atingir, distância 45/180m, dano: 5 (1d8 + 1) perfurante.`,
  },

  // ----------------------------------------------------
  // ND 1 a ND 2: Predadores Selvagens, Masmorra & Rastejantes
  // ----------------------------------------------------
  {
    id: 'dnd5e_dire_wolf',
    name: 'Lobo Atroz (Dire Wolf)',
    system: 'D&D 5e',
    category: 'Fera',
    challenge: 'ND 1 (200 XP)',
    role: 'Predador de Matilha',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('beast', '#52525b', '#a1a1aa', '#18181b'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '17 (+3)' },
      { id: 'a2', key: 'DES', value: '15 (+2)' },
      { id: 'a3', key: 'CON', value: '15 (+2)' },
      { id: 'a4', key: 'INT', value: '3 (-4)' },
      { id: 'a5', key: 'SAB', value: '12 (+1)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 37, max: 37, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 14, max: 14, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 15, max: 15, color: 'blue' },
    ],
    notes: `### Sentidos & Matilha
- **Olfato e Audição Aguçados:** Vantagem em testes de Sabedoria (Percepção) baseados no olfato ou audição.
- **Táticas de Matilha:** Vantagem em jogadas de ataque se um aliado estiver a até 1,5m do alvo.

### Ações
- **Mordida Derrubadora:** +5 para atingir, alcance 1,5m, dano: 10 (2d6 + 3) perfurante. Se o alvo for uma criatura, deve ser bem-sucedido em um Teste de Resistência de Força CD 13 ou cairá no chão (Caído).`,
  },
  {
    id: 'dnd5e_giant_spider',
    name: 'Aranha Gigante',
    system: 'D&D 5e',
    category: 'Fera',
    challenge: 'ND 1 (200 XP)',
    role: 'Predador Venenoso',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('spider', '#18181b', '#ef4444', '#09090b'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '14 (+2)' },
      { id: 'a2', key: 'DES', value: '16 (+3)' },
      { id: 'a3', key: 'CON', value: '12 (+1)' },
      { id: 'a4', key: 'INT', value: '2 (-4)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '4 (-3)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 26, max: 26, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 14, max: 14, color: 'amber' },
      { id: 'r3', name: 'Escalada na Teia', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Características Especiais
- **Escalada Aracnídea:** Pode escalar superfícies difíceis, incluindo de cabeça para baixo no teto, sem precisar realizar testes.
- **Caminhar na Teia:** Não sofre restrição de movimento em teias de aranha.

### Ações
- **Mordida Venenosa:** +5 para atingir, alcance 1,5m, dano: 7 (1d8 + 3) perfurante, e o alvo deve fazer TR de Constituição CD 11, sofrendo 9 (2d8) dano de veneno se falhar. Se o veneno reduzir o alvo a 0 PV, fica Paralisado por 1 hora.
- **Teia (Recarga 5–6):** +5 para atingir à distância (9/18m). O alvo fica Preso (CD 12 FOR para escapar).`,
  },
  {
    id: 'dnd5e_bugbear',
    name: 'Bugbear Espreitador',
    system: 'D&D 5e',
    category: 'Humanóide',
    challenge: 'ND 1 (200 XP)',
    role: 'Assassino Furtivo',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('goblin', '#451a03', '#d97706', '#1c0a00'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '15 (+2)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '13 (+1)' },
      { id: 'a4', key: 'INT', value: '8 (-1)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '9 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 27, max: 27, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 16, max: 16, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'blue' },
    ],
    notes: `### Características Especiais
- **Surpresa Brutal:** Se o bugbear surpreender uma criatura e acertá-la com um ataque durante a primeira rodada de combate, ele causa 7 (2d6) de dano extra.
- **Alcance Longo:** O bugbear tem +1,5m de alcance ao desferir ataques corpo a corpo durante seu turno.

### Ações
- **Maça-Estrela:** +4 para atingir, alcance 1,5m, dano: 11 (2d8 + 2) perfurante.
- **Azagaia:** +4 para atingir, alcance 1,5m ou 9/36m, dano: 9 (2d6 + 2) perfurante.`,
  },
  {
    id: 'dnd5e_ghoul',
    name: 'Carniçal Devorador (Ghoul)',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 1 (200 XP)',
    role: 'Paralisador das Catacumbas',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('skull', '#1c1917', '#a8a29e', '#0c0a09'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '13 (+1)' },
      { id: 'a2', key: 'DES', value: '15 (+2)' },
      { id: 'a3', key: 'CON', value: '10 (+0)' },
      { id: 'a4', key: 'INT', value: '7 (-2)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '6 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 22, max: 22, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 12, max: 12, color: 'red' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Imunidades
- **Dano:** Veneno.
- **Condições:** Encantado, Envenenado, Exaustão.

### Ações
- **Mordida:** +2 para atingir, alcance 1,5m, dano: 9 (2d6 + 2) perfurante.
- **Garras Paralisantes:** +4 para atingir, alcance 1,5m, dano: 7 (2d4 + 2) cortante. Se o alvo for uma criatura viva que não seja um elfo ou morto-vivo, deve passar em TR de Constituição CD 10 ou ficará Paralisada por 1 minuto (novo teste no fim de cada turno).`,
  },
  {
    id: 'dnd5e_specter',
    name: 'Espectro (Specter)',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 1 (200 XP)',
    role: 'Assombração Incorpórea',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('skull', '#1e1b4b', '#818cf8', '#030712'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '1 (-5)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '11 (+0)' },
      { id: 'a4', key: 'INT', value: '10 (+0)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '11 (+0)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 22, max: 22, color: 'purple' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 12, max: 12, color: 'blue' },
      { id: 'r3', name: 'Voo Flutuante', current: 15, max: 15, color: 'emerald' },
    ],
    notes: `### Movimento & Resistências
- **Movimento Incorpóreo:** Pode mover-se através de outras criaturas e objetos como se fossem terreno difícil. Sofre 5 (1d10) dano de força se terminar o turno dentro de um objeto.
- **Resistências:** Ácido, Frio, Fogo, Eletricidade, Trovão; Concussão, Perfurante e Cortante de ataques não-mágicos.

### Ações
- **Dreno de Vida:** +4 para atingir, alcance 1,5m, dano: 10 (3d6) necrótico. O alvo deve fazer TR de Constituição CD 10 ou seu limite de Pontos de Vida é reduzido pelo valor igual ao dano sofrido. Se reduzido a 0 PV, morre!`,
  },
  {
    id: 'dnd5e_ogre',
    name: 'Ogro Brutamontes',
    system: 'D&D 5e',
    category: 'Gigante',
    challenge: 'ND 2 (450 XP)',
    role: 'Esmagador Brutal',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('giant', '#78350f', '#f59e0b', '#291404'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '19 (+4)' },
      { id: 'a2', key: 'DES', value: '8 (-1)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '5 (-3)' },
      { id: 'a5', key: 'SAB', value: '7 (-2)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 59, max: 59, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 11, max: 11, color: 'red' },
      { id: 'r3', name: 'Deslocamento', current: 12, max: 12, color: 'emerald' },
    ],
    notes: `### Ações
- **Grande Clava:** +6 para atingir, alcance 1,5m, dano: 13 (2d8 + 4) concussão.
- **Azagaia Gigante:** +6 para atingir, alcance 9/36m, dano: 11 (2d6 + 4) perfurante.`,
  },
  {
    id: 'dnd5e_mimic',
    name: 'Mímico Predador (Mimic)',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 2 (450 XP)',
    role: 'Emboscador Camuflado',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('mimic', '#92400e', '#fde047', '#451a03'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '17 (+3)' },
      { id: 'a2', key: 'DES', value: '12 (+1)' },
      { id: 'a3', key: 'CON', value: '15 (+2)' },
      { id: 'a4', key: 'INT', value: '5 (-3)' },
      { id: 'a5', key: 'SAB', value: '13 (+1)' },
      { id: 'a6', key: 'CAR', value: '8 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 58, max: 58, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 12, max: 12, color: 'purple' },
      { id: 'r3', name: 'Deslocamento', current: 4.5, max: 4.5, color: 'blue' },
    ],
    notes: `### Camuflagem & Aderência
- **Aparência Falsa:** Enquanto permanecer imóvel na forma de objeto (baú, porta, estátua), é indistinguível de um objeto comum.
- **Adesivo:** O mímico adere a qualquer coisa que o toque. Uma criatura Enorme ou menor grudada fica Agarrada (CD 13 para escapar). Jogadas de ataque contra essa criatura têm Vantagem.

### Ações
- **Pseudópode Pegajoso:** +5 para atingir, alcance 1,5m, dano: 7 (1d8 + 3) concussão e o alvo fica preso pelo adesivo.
- **Mordida Ácida:** +5 para atingir, alcance 1,5m, dano: 7 (1d8 + 3) perfurante mais 4 (1d8) de dano ácido.`,
  },
  {
    id: 'dnd5e_gelatinous_cube',
    name: 'Cubo Gelatinoso',
    system: 'D&D 5e',
    category: 'Gosma',
    challenge: 'ND 2 (450 XP)',
    role: 'Limpador de Corredores',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('slime', '#059669', '#6ee7b7', '#064e3b'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '14 (+2)' },
      { id: 'a2', key: 'DES', value: '3 (-4)' },
      { id: 'a3', key: 'CON', value: '20 (+5)' },
      { id: 'a4', key: 'INT', value: '1 (-5)' },
      { id: 'a5', key: 'SAB', value: '6 (-2)' },
      { id: 'a6', key: 'CAR', value: '1 (-5)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 84, max: 84, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 6, max: 6, color: 'red' },
      { id: 'r3', name: 'Deslocamento', current: 4.5, max: 4.5, color: 'blue' },
    ],
    notes: `### Perigos da Masmorra
- **Transparente:** Criaturas que não tenham percebido o cubo devem ser bem-sucedidas em um teste de Sabedoria (Percepção) CD 15 para avistá-lo antes de tropeçarem nele.
- **Cubo Ocupante:** Ocupa todo o corredor de 3x3 metros.

### Ações
- **Pseudópode:** +4 para atingir, alcance 1,5m, dano: 10 (3d6) de ácido.
- **Engolfar:** Entra no espaço de criaturas Grandes ou menores. Cada criatura deve fazer TR de Destreza CD 12. Se falhar, é engolfada no ácido do cubo: sofre 10 (3d6) ácido no início de cada turno, fica Presa e sufocando!`,
  },
  {
    id: 'dnd5e_gargoyle',
    name: 'Gárgula Pétrea',
    system: 'D&D 5e',
    category: 'Elemental',
    challenge: 'ND 2 (450 XP)',
    role: 'Guardião de Fachadas',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('golem', '#4b5563', '#9ca3af', '#111827'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '15 (+2)' },
      { id: 'a2', key: 'DES', value: '11 (+0)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '6 (-2)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 52, max: 52, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'emerald' },
      { id: 'r3', name: 'Voo', current: 18, max: 18, color: 'blue' },
    ],
    notes: `### Corpo de Pedra
- **Aparência Falsa:** Enquanto imóvel, é indistinguível de uma estátua de gárgula comum.
- **Resistências:** Resistente a dano de Concussão, Perfurante e Cortante de armas não-mágicas e não-adamantinas.
- **Imunidade:** Veneno, Envenenado, Petrificado.

### Ações
- **Multiataque:** Dois ataques: um com a mordida e outro com as garras.
- **Mordida:** +4 para atingir, alcance 1,5m, dano: 5 (1d6 + 2) perfurante.
- **Garras:** +4 para atingir, alcance 1,5m, dano: 5 (1d6 + 2) cortante.`,
  },
  {
    id: 'dnd5e_cult_fanatic',
    name: 'Cultista Fanático',
    system: 'D&D 5e',
    category: 'Humanóide',
    challenge: 'ND 2 (450 XP)',
    role: 'Conjurador Sombrio',
    type: 'NPC',
    avatarUrl: getMonsterAvatar('skull', '#581c87', '#c084fc', '#2e1065'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '11 (+0)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '12 (+1)' },
      { id: 'a4', key: 'INT', value: '10 (+0)' },
      { id: 'a5', key: 'SAB', value: '13 (+1)' },
      { id: 'a6', key: 'CAR', value: '14 (+2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 33, max: 33, color: 'purple' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'amber' },
      { id: 'r3', name: 'Espaços de Magia', current: 6, max: 6, color: 'blue' },
    ],
    notes: `### Devoção & Conjurador (4º Nível de Clérigo)
- **Devoção Sombria:** Tem Vantagem em TRs contra ser Encantado ou Aterrorizado.
- **Magias Preparadas:**
  - Truques: *Chama Sagrada (1d8)*, *Taumaturgia*.
  - 1º Círculo (4 espaços): *Comando*, *Infligir Ferimentos (3d10 necrótico)*, *Escudo da Fé*.
  - 2º Círculo (3 espaços): *Imobilizar Pessoa (Paralisia CD 11)*, *Arma Espiritual*.

### Ações
- **Multiataque:** Faz dois ataques corpo a corpo com a adaga.
- **Adaga Cerimonial:** +4 para atingir, dano: 4 (1d4 + 2) perfurante.`,
  },

  // ----------------------------------------------------
  // ND 3 a ND 4: Monstros Icônicos Clássicos
  // ----------------------------------------------------
  {
    id: 'dnd5e_owlbear',
    name: 'Urso-Coruja (Owlbear)',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 3 (700 XP)',
    role: 'Predador Feroz',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('beast', '#78350f', '#d97706', '#1c0a00'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '20 (+5)' },
      { id: 'a2', key: 'DES', value: '12 (+1)' },
      { id: 'a3', key: 'CON', value: '17 (+3)' },
      { id: 'a4', key: 'INT', value: '3 (-4)' },
      { id: 'a5', key: 'SAB', value: '12 (+1)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 59, max: 59, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'red' },
      { id: 'r3', name: 'Deslocamento', current: 12, max: 12, color: 'emerald' },
    ],
    notes: `### Sentidos Aguçados
- Possui Vantagem em testes de Sabedoria (Percepção) que dependam da visão ou do olfato.

### Ações
- **Multiataque:** O urso-coruja realiza dois ataques: um com o bico e um com as garras.
- **Bico:** +7 para atingir, alcance 1,5m, dano: 10 (1d10 + 5) perfurante.
- **Garras:** +7 para atingir, alcance 1,5m, dano: 14 (2d8 + 5) cortante.`,
  },
  {
    id: 'dnd5e_basilisk',
    name: 'Basilisco da Pedra',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 3 (700 XP)',
    role: 'Petrificador Rastejante',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('spider', '#065f46', '#34d399', '#022c22'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '16 (+3)' },
      { id: 'a2', key: 'DES', value: '8 (-1)' },
      { id: 'a3', key: 'CON', value: '15 (+2)' },
      { id: 'a4', key: 'INT', value: '2 (-4)' },
      { id: 'a5', key: 'SAB', value: '8 (-1)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 52, max: 52, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 6, max: 6, color: 'purple' },
    ],
    notes: `### Olhar Petrificador
- **Olhar de Pedra:** Se uma criatura iniciar seu turno a até 9 metros do basilisco e puder vê-lo, o basilisco pode forçá-la a fazer um Teste de Resistência de Constituição CD 12. Se falhar, a criatura começa a se transformar em pedra e fica Contida. Ela deve repetir o teste no fim do próximo turno; se falhar novamente, fica Petrificada permanentemente!

### Ações
- **Mordida:** +5 para atingir, alcance 1,5m, dano: 10 (2d6 + 3) perfurante mais 7 (2d6) de dano de veneno.`,
  },
  {
    id: 'dnd5e_manticore',
    name: 'Mantícora Alada',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 3 (700 XP)',
    role: 'Bombardeiro Alado',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('beast', '#991b1b', '#f87171', '#260404'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '17 (+3)' },
      { id: 'a2', key: 'DES', value: '16 (+3)' },
      { id: 'a3', key: 'CON', value: '17 (+3)' },
      { id: 'a4', key: 'INT', value: '7 (-2)' },
      { id: 'a5', key: 'SAB', value: '12 (+1)' },
      { id: 'a6', key: 'CAR', value: '8 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 68, max: 68, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 14, max: 14, color: 'amber' },
      { id: 'r3', name: 'Voo', current: 15, max: 15, color: 'blue' },
      { id: 'r4', name: 'Espinhos Restantes', current: 24, max: 24, color: 'purple' },
    ],
    notes: `### Ações
- **Multiataque:** A mantícora realiza três ataques: um com a mordida e dois com as garras, OU três ataques com os espinhos da cauda.
- **Mordida:** +5 para atingir, alcance 1,5m, dano: 7 (1d8 + 3) perfurante.
- **Garras:** +5 para atingir, alcance 1,5m, dano: 6 (1d6 + 3) cortante.
- **Espinhos da Cauda:** +5 para atingir, distância 30/60m, dano: 7 (1d8 + 3) perfurante cada espinho.`,
  },
  {
    id: 'dnd5e_minotaur',
    name: 'Minotauro do Labirinto',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 3 (700 XP)',
    role: 'Bruto de Labirinto',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('beast', '#451a03', '#f59e0b', '#1c0a00'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '18 (+4)' },
      { id: 'a2', key: 'DES', value: '11 (+0)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '6 (-2)' },
      { id: 'a5', key: 'SAB', value: '16 (+3)' },
      { id: 'a6', key: 'CAR', value: '9 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 76, max: 76, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 14, max: 14, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 12, max: 12, color: 'emerald' },
    ],
    notes: `### Habilidades de Labirinto
- **Investida:** Se mover pelo menos 3m em linha reta em direção a um alvo e acertar um ataque de chifres no mesmo turno, causa 9 (2d8) dano extra. Se for criatura, CD 14 FOR ou é empurrada 3m e cai Caída.
- **Recordação do Labirinto:** Nunca se perde e sempre recorda o caminho percorrido.

### Ações
- **Machado Grande:** +6 para atingir, alcance 1,5m, dano: 17 (2d12 + 4) cortante.
- **Chifres:** +6 para atingir, alcance 1,5m, dano: 13 (2d8 + 4) perfurante.`,
  },
  {
    id: 'dnd5e_mummy',
    name: 'Múmia Amaldiçoada',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 3 (700 XP)',
    role: 'Guardião de Tumba Amaldiçoado',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('mummy', '#78350f', '#facc15', '#271202'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '16 (+3)' },
      { id: 'a2', key: 'DES', value: '8 (-1)' },
      { id: 'a3', key: 'CON', value: '15 (+2)' },
      { id: 'a4', key: 'INT', value: '6 (-2)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '12 (+1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 58, max: 58, color: 'amber' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 11, max: 11, color: 'red' },
      { id: 'r3', name: 'Vulnerabilidade a Fogo', current: 2, max: 2, color: 'purple' },
    ],
    notes: `### Vulnerabilidades & Maldição
- **Vulnerabilidade:** Dano de Fogo (as bandagens ardem ferozmente).
- **Imunidades:** Necrótico, Veneno; Encantado, Envenenado, Paralisado.

### Ações
- **Olhar Pavoroso:** O alvo a até 18m deve passar em TR de Sabedoria CD 11 ou fica Aterrorizado por 1 minuto (se falhar por 5 ou mais, fica também Paralisado).
- **Pancada Apodrecida:** +5 para atingir, dano: 10 (2d6 + 3) concussão mais 10 (3d6) necrótico. O alvo é amaldiçoado com a **Podridão de Múmia** (não pode recuperar PVs e seu máximo de PV diminui em 10 (3d6) a cada 24 horas até morrer e virar poeira).`,
  },

  // ----------------------------------------------------
  // ND 5 a ND 8: Ameaças de Elite, Elementais & Quimeras
  // ----------------------------------------------------
  {
    id: 'dnd5e_fire_elemental',
    name: 'Elemental do Fogo',
    system: 'D&D 5e',
    category: 'Elemental',
    challenge: 'ND 5 (1.800 XP)',
    role: 'Incinerador Destrutivo',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('elemental_fire', '#dc2626', '#f59e0b', '#450a0a'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '10 (+0)' },
      { id: 'a2', key: 'DES', value: '17 (+3)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '6 (-2)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 102, max: 102, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 13, max: 13, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 15, max: 15, color: 'emerald' },
    ],
    notes: `### Forma de Fogo
- Pode passar por espaços estreitos de até 2,5 cm.
- Uma criatura que toque o elemental ou o atinja com ataque corpo a corpo a até 1,5m sofre 5 (1d10) dano de fogo.
- Entrar no espaço de uma criatura incendeia o alvo (5 de dano de fogo contínuo no início de cada turno até apagar).

### Ações
- **Multiataque:** O elemental faz dois ataques de toque ígneo.
- **Toque:** +6 para atingir, alcance 1,5m, dano: 10 (2d6 + 3) de fogo e incendeia o alvo.`,
  },
  {
    id: 'dnd5e_water_elemental',
    name: 'Elemental da Água',
    system: 'D&D 5e',
    category: 'Elemental',
    challenge: 'ND 5 (1.800 XP)',
    role: 'Tromba d\'Água Sufocante',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('elemental_water', '#0284c7', '#38bdf8', '#082f49'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '18 (+4)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '18 (+4)' },
      { id: 'a4', key: 'INT', value: '5 (-3)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '8 (-1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 114, max: 114, color: 'blue' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 14, max: 14, color: 'amber' },
      { id: 'r3', name: 'Natação', current: 27, max: 27, color: 'emerald' },
    ],
    notes: `### Forma Líquida & Afogamento
- **Invisibilidade na Água:** É invisível enquanto estiver completamente submerso em água.
- **Resistências:** Ácido; Concussão, Perfurante e Cortante de armas não-mágicas.

### Ações
- **Multiataque:** Dois golpes de pancada aquática.
- **Golpe:** +7 para atingir, alcance 1,5m, dano: 13 (2d8 + 4) concussão.
- **Tromba de Afogamento (Recarga 4–6):** Cada criatura no espaço do elemental deve passar em TR de Força CD 15 ou sofre 13 (2d8 + 4) concussão, é Engolfada no vórtice, fica Presa e incapaz de respirar a não ser que respire água!`,
  },
  {
    id: 'dnd5e_troll',
    name: 'Troll Regenerador',
    system: 'D&D 5e',
    category: 'Gigante',
    challenge: 'ND 5 (1.800 XP)',
    role: 'Bruto Voraz Regenerativo',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('goblin', '#15803d', '#4ade80', '#052e16'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '18 (+4)' },
      { id: 'a2', key: 'DES', value: '13 (+1)' },
      { id: 'a3', key: 'CON', value: '20 (+5)' },
      { id: 'a4', key: 'INT', value: '7 (-2)' },
      { id: 'a5', key: 'SAB', value: '9 (-1)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 84, max: 84, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'amber' },
      { id: 'r3', name: 'Regeneração / Turno', current: 10, max: 10, color: 'red' },
    ],
    notes: `### Regeneração Lendária
- **Regeneração 10:** No início do seu turno, o troll recupera 10 Pontos de Vida. Se o troll sofrer dano de **Fogo** ou **Ácido**, essa característica não funciona no início do próximo turno do troll.
- O troll só morre de fato se começar seu turno com 0 PV e não puder se regenerar!

### Ações
- **Multiataque:** Três ataques: um com a mordida e dois com as garras.
- **Mordida:** +7 para atingir, alcance 1,5m, dano: 7 (1d6 + 4) perfurante.
- **Garras:** +7 para atingir, alcance 1,5m, dano: 11 (2d6 + 4) cortante.`,
  },
  {
    id: 'dnd5e_chimera',
    name: 'Quimera Polimorfa',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 6 (2.300 XP)',
    role: 'Terror Dracônico Triplo',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('dragon', '#b91c1c', '#ea580c', '#1e0303'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '19 (+4)' },
      { id: 'a2', key: 'DES', value: '11 (+0)' },
      { id: 'a3', key: 'CON', value: '19 (+4)' },
      { id: 'a4', key: 'INT', value: '3 (-4)' },
      { id: 'a5', key: 'SAB', value: '14 (+2)' },
      { id: 'a6', key: 'CAR', value: '10 (+0)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 114, max: 114, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 14, max: 14, color: 'amber' },
      { id: 'r3', name: 'Voo', current: 18, max: 18, color: 'blue' },
    ],
    notes: `### Três Cabeças
- Tem Vantagem em testes de Percepção e em TRs contra ser Cegada, Ensurdecida, Aterrorizada ou Atordoada.

### Ações
- **Multiataque:** A quimera realiza três ataques: um com a mordida, um com os chifres e um com as garras. Quando disponível, pode usar o Sopro de Fogo no lugar da mordida ou dos chifres.
- **Mordida de Leão:** +7 para atingir, dano: 11 (2d6 + 4) perfurante.
- **Chifres de Bode:** +7 para atingir, dano: 10 (1d12 + 4) concussão.
- **Garras:** +7 para atingir, dano: 11 (2d6 + 4) cortante.
- **Sopro de Fogo Dracônico (Recarga 5–6):** Cone de 4,5m. TR de Destreza CD 15. Dano: 31 (7d8) de fogo (metade se passar).`,
  },
  {
    id: 'dnd5e_mind_flayer',
    name: 'Devorador de Mentes (Illithid)',
    system: 'D&D 5e',
    category: 'Aberração',
    challenge: 'ND 7 (2.900 XP)',
    role: 'Manipulador Psíquico',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('tentacle', '#4338ca', '#818cf8', '#0f0e26'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '11 (+0)' },
      { id: 'a2', key: 'DES', value: '12 (+1)' },
      { id: 'a3', key: 'CON', value: '12 (+1)' },
      { id: 'a4', key: 'INT', value: '19 (+4)' },
      { id: 'a5', key: 'SAB', value: '17 (+3)' },
      { id: 'a6', key: 'CAR', value: '17 (+3)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 71, max: 71, color: 'purple' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'blue' },
      { id: 'r3', name: 'Resistência Mágica', current: 1, max: 1, color: 'emerald' },
    ],
    notes: `### Resistência Mágica
- O devorador de mentes tem Vantagem em Testes de Resistência contra magias e outros efeitos mágicos.

### Ações
- **Tentáculos:** +7 para atingir, alcance 1,5m, uma criatura. Dano: 15 (2d10 + 4) psíquico. Se for Média ou menor, fica Agarrada (CD 15 para escapar) e Atordoada enquanto durar o agarre.
- **Extrair Cérebro:** +7 para atingir, um humanoide incapacitado agarrado pelo devorador. Dano: 55 (10d10) perfurante. Se o dano reduzir a 0 PV, o devorador arranca e consome o cérebro, matando o alvo instantaneamente!
- **Rajada Mental (Recarga 5–6):** Cone psíquico de 18m. Cada criatura deve passar em TR de Inteligência CD 15 ou sofre 22 (4d8 + 4) de dano psíquico e fica Atordoada por 1 minuto.`,
  },
  {
    id: 'dnd5e_hydra',
    name: 'Hidra Carniceira',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 8 (3.900 XP)',
    role: 'Monstro Voraz de Muitas Cabeças',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('hydra', '#065f46', '#10b981', '#022c22'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '20 (+5)' },
      { id: 'a2', key: 'DES', value: '12 (+1)' },
      { id: 'a3', key: 'CON', value: '20 (+5)' },
      { id: 'a4', key: 'INT', value: '2 (-4)' },
      { id: 'a5', key: 'SAB', value: '10 (+0)' },
      { id: 'a6', key: 'CAR', value: '7 (-2)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 172, max: 172, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 15, max: 15, color: 'amber' },
      { id: 'r3', name: 'Cabeças Vivas', current: 5, max: 10, color: 'red' },
    ],
    notes: `### Cabeças Múltiplas & Rebrota
- A hidra começa com 5 cabeças. Cada vez que sofrer 25 ou mais de dano em um único turno, uma cabeça morre.
- No final do turno, duas cabeças nascem no lugar de cada cabeça morta, a não ser que ela tenha sofrido dano de Fogo desde o fim de seu último turno! A hidra também recupera 10 PV para cada cabeça que renascer.
- A hidra pode realizar tantos ataques de mordida quantas cabeças possuir!

### Ações
- **Multiataque:** Faz tantos ataques de mordida quantas cabeças possuir (começa com 5 ataques).
- **Mordida:** +8 para atingir, alcance 3m, dano: 10 (1d10 + 5) perfurante.`,
  },
  {
    id: 'dnd5e_fire_giant',
    name: 'Gigante do Fogo',
    system: 'D&D 5e',
    category: 'Gigante',
    challenge: 'ND 9 (5.000 XP)',
    role: 'Ferreiro e Senhor da Guerra',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('giant', '#991b1b', '#f97316', '#2a0404'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '25 (+7)' },
      { id: 'a2', key: 'DES', value: '9 (-1)' },
      { id: 'a3', key: 'CON', value: '23 (+6)' },
      { id: 'a4', key: 'INT', value: '10 (+0)' },
      { id: 'a5', key: 'SAB', value: '14 (+2)' },
      { id: 'a6', key: 'CAR', value: '13 (+1)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 162, max: 162, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 18, max: 18, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Imunidades
- **Imunidade:** Dano de Fogo total.

### Ações
- **Multiataque:** O gigante faz dois ataques com seu espadão colossal.
- **Espadão:** +11 para atingir, alcance 3m, dano: 28 (6d6 + 7) cortante.
- **Arremesso de Rocha:** +11 para atingir, distância 18/72m, dano: 29 (4d10 + 7) concussão.`,
  },

  // ----------------------------------------------------
  // ND 10 a ND 16: Predadores Alfa, Tiranos e Aberrações Maiores
  // ----------------------------------------------------
  {
    id: 'dnd5e_red_dragon_young',
    name: 'Dragão Vermelho Jovem',
    system: 'D&D 5e',
    category: 'Dragão',
    challenge: 'ND 10 (5.900 XP)',
    role: 'Predador Alfa / Terror Alado',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('dragon', '#991b1b', '#ef4444', '#1f0202'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '23 (+6)' },
      { id: 'a2', key: 'DES', value: '10 (+0)' },
      { id: 'a3', key: 'CON', value: '21 (+5)' },
      { id: 'a4', key: 'INT', value: '14 (+2)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '19 (+4)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 178, max: 178, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 18, max: 18, color: 'amber' },
      { id: 'r3', name: 'Voo', current: 24, max: 24, color: 'blue' },
    ],
    notes: `### Ações
- **Multiataque:** O dragão faz três ataques: um com a mordida e dois com as garras.
- **Mordida:** +10 para atingir, alcance 3m, um alvo. Dano: 17 (2d10 + 6) perfurante mais 3 (1d6) de fogo.
- **Garra:** +10 para atingir, alcance 1,5m, um alvo. Dano: 13 (2d6 + 6) cortante.
- **Sopro de Fogo (Recarga 5–6):** Cone de 9 metros. TR de Destreza CD 17, sofrendo 56 (16d6) dano de fogo se falhar, ou metade se obtiver sucesso.`,
  },
  {
    id: 'dnd5e_aboleth',
    name: 'Aboleth Ancião',
    system: 'D&D 5e',
    category: 'Aberração',
    challenge: 'ND 10 (5.900 XP)',
    role: 'Tirano Telepático Primordial',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('tentacle', '#1e3a8a', '#38bdf8', '#082f49'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '21 (+5)' },
      { id: 'a2', key: 'DES', value: '9 (-1)' },
      { id: 'a3', key: 'CON', value: '15 (+2)' },
      { id: 'a4', key: 'INT', value: '18 (+4)' },
      { id: 'a5', key: 'SAB', value: '15 (+2)' },
      { id: 'a6', key: 'CAR', value: '18 (+4)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 135, max: 135, color: 'blue' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 17, max: 17, color: 'purple' },
      { id: 'r3', name: 'Natação', current: 12, max: 12, color: 'emerald' },
    ],
    notes: `### Lodo Transmutador & Escravizar
- **Lodo de Contato:** Uma criatura atingida por um tentáculo deve passar em TR de Constituição CD 14 ou sua pele se torna uma membrana viscosa (ela só pode respirar sob a água e sofre 1d12 ácido a cada 10 min fora d'água!).
- **Escravizar Mente (3/dia):** O aboleth tem como alvo uma criatura a até 9m. Ela deve passar em TR de Sabedoria CD 14 ou fica Encantada magicamente pelo aboleth, obedecendo a todos os seus comandos telepáticos.

### Ações Lendárias (3/rodada)
- Pode desferir golpe de cauda (+9, 3d6+5), ativar percepção ou drenar psiquismo de uma criatura escravizada.`,
  },
  {
    id: 'dnd5e_beholder',
    name: 'Beholder (O Observador)',
    system: 'D&D 5e',
    category: 'Aberração',
    challenge: 'ND 13 (10.000 XP)',
    role: 'Chefe Tirano dos Olhos',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('eye', '#581c87', '#c084fc', '#1e0538'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '10 (+0)' },
      { id: 'a2', key: 'DES', value: '14 (+2)' },
      { id: 'a3', key: 'CON', value: '18 (+4)' },
      { id: 'a4', key: 'INT', value: '17 (+3)' },
      { id: 'a5', key: 'SAB', value: '15 (+2)' },
      { id: 'a6', key: 'CAR', value: '17 (+3)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 180, max: 180, color: 'purple' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 18, max: 18, color: 'amber' },
      { id: 'r3', name: 'Voo Planar', current: 6, max: 6, color: 'blue' },
    ],
    notes: `### Olho Central de Antimagia
- **Cone Antimagia:** O olho central emite um cone de antimagia de 45 metros. Todas as magias e itens mágicos são suprimidos na área.

### Raios Oculares (d10 aleatório)
1. Raio de Encanto (CD 16 SAB)
2. Raio Paralisante (CD 16 CON)
3. Raio do Medo (CD 16 SAB)
4. Raio de Lentidão (CD 16 DES)
5. Raio de Enervação (36 dano necrótico)
6. Raio Telecinético (CD 16 FOR)
7. Raio do Sono (CD 16 SAB)
8. Raio de Petrificação (CD 16 DES)
9. Raio Desintegrador (45 dano de força CD 16 DES)
10. Raio da Morte (55 dano necrótico; mata se reduzir a 0 PV).

### Ações Lendárias (3/rodada)
Dispara um raio ocular aleatório ao fim do turno de outro jogador.`,
  },
  {
    id: 'dnd5e_vampire',
    name: 'Vampiro Lorde da Noite',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 13 (10.000 XP)',
    role: 'Senhor das Sombras / Necromante',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('vampire', '#18181b', '#ef4444', '#09090b'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '18 (+4)' },
      { id: 'a2', key: 'DES', value: '18 (+4)' },
      { id: 'a3', key: 'CON', value: '18 (+4)' },
      { id: 'a4', key: 'INT', value: '17 (+3)' },
      { id: 'a5', key: 'SAB', value: '15 (+2)' },
      { id: 'a6', key: 'CAR', value: '18 (+4)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 144, max: 144, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 16, max: 16, color: 'amber' },
      { id: 'r3', name: 'Regeneração / Rodada', current: 20, max: 20, color: 'purple' },
    ],
    notes: `### Imunidades & Fraquezas
- **Regeneração 20:** Recupera 20 PV no início de cada turno a menos que esteja sob luz solar ou água corrente.
- **Resistências:** Resistente a Concussão, Perfurante e Cortante não-mágicos.
- **Fuga em Névoa:** Se reduzido a 0 PV fora do caixão, transforma-se em névoa e voa até o caixão para se regenerar.

### Ações
- **Multiataque:** Dois ataques, um dos quais pode ser uma mordida.
- **Pancada:** +9 para atingir, dano 8 (1d8 + 4) concussão. O alvo fica agarrado (CD 18).
- **Mordida Voraz:** +9 para atingir uma criatura disposta, agarrada ou incapacitada. Dano: 7 (1d6 + 4) perfurante mais 10 (3d6) necrótico. O PV máximo do alvo é reduzido no mesmo valor e o vampiro se cura!
- **Encantar:** Olhar hipnótico CD 17 SAB (o alvo o vê como seu amigo mais querido).`,
  },
  {
    id: 'dnd5e_iron_golem',
    name: 'Golem de Ferro',
    system: 'D&D 5e',
    category: 'Constructo',
    challenge: 'ND 16 (15.000 XP)',
    role: 'Fortaleza Blindada Imbatível',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('golem', '#374151', '#9ca3af', '#111827'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '24 (+7)' },
      { id: 'a2', key: 'DES', value: '9 (-1)' },
      { id: 'a3', key: 'CON', value: '20 (+5)' },
      { id: 'a4', key: 'INT', value: '3 (-4)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '1 (-5)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 210, max: 210, color: 'blue' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 20, max: 20, color: 'amber' },
      { id: 'r3', name: 'Deslocamento', current: 9, max: 9, color: 'emerald' },
    ],
    notes: `### Imunidade Mágica Absoluta
- **Imunidade a Magias:** É imune a qualquer magia ou efeito que requeira um Teste de Resistência, a não ser que o feitiço especifique o contrário.
- **Absorção de Fogo:** Dano de fogo não causa dano; em vez disso, cura o golem em valor igual ao dano!
- **Armas Não-Mágicas:** Imune a concussão, perfurante e cortante de armas que não sejam de adamante.

### Ações
- **Multiataque:** Dois ataques de espada colossal ou duas pancadas de ferro.
- **Espada Colossal:** +13 para atingir, alcance 3m, dano: 23 (3d10 + 7) cortante.
- **Sopro Venenoso (Recarga 6):** Cone de 4,5m de gás tóxico. CD 19 CON ou sofre 45 (10d8) de dano de veneno.`,
  },

  // ----------------------------------------------------
  // ND 19 a ND 30: Chefes Épicos, Demônios Maiores & Titãs
  // ----------------------------------------------------
  {
    id: 'dnd5e_balor',
    name: 'Balor (Lorde Demônio das Chamas)',
    system: 'D&D 5e',
    category: 'Ínfero',
    challenge: 'ND 19 (22.000 XP)',
    role: 'General dos Abismos',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('demon', '#991b1b', '#f97316', '#450a0a'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '26 (+8)' },
      { id: 'a2', key: 'DES', value: '15 (+2)' },
      { id: 'a3', key: 'CON', value: '22 (+6)' },
      { id: 'a4', key: 'INT', value: '20 (+5)' },
      { id: 'a5', key: 'SAB', value: '16 (+3)' },
      { id: 'a6', key: 'CAR', value: '22 (+6)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 262, max: 262, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 19, max: 19, color: 'amber' },
      { id: 'r3', name: 'Voo', current: 24, max: 24, color: 'blue' },
    ],
    notes: `### Aura de Fogo & Espasmo Mortal
- **Aura Flamejante:** Qualquer criatura a até 1,5m sofre 10 (3d6) dano de fogo no início de seu turno.
- **Espasmo Mortal:** Ao morrer, o balor explode! Cada criatura a até 9m sofre 70 (20d6) dano de fogo (CD 20 DES reduz à metade).

### Ações
- **Multiataque:** Dois ataques: um com a Espada Longa Elétrica e um com o Chicote Flamejante.
- **Espada Relâmpago:** +14 para atingir, alcance 3m, dano: 21 (3d8 + 8) cortante mais 13 (3d8) elétrico. Em crítico, causa 16 de dano extra e decapita se possível!
- **Chicote Ígneo:** +14 para atingir, alcance 9m, dano: 15 (2d6 + 8) cortante mais 10 (3d6) fogo e puxa o alvo até 7,5m.`,
  },
  {
    id: 'dnd5e_lich',
    name: 'Lich Mestre Necromante',
    system: 'D&D 5e',
    category: 'Morto-Vivo',
    challenge: 'ND 21 (33.000 XP)',
    role: 'Mestre da Morte / Arcano Lendário',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('skull', '#3b0764', '#c084fc', '#140326'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '11 (+0)' },
      { id: 'a2', key: 'DES', value: '16 (+3)' },
      { id: 'a3', key: 'CON', value: '16 (+3)' },
      { id: 'a4', key: 'INT', value: '20 (+5)' },
      { id: 'a5', key: 'SAB', value: '14 (+2)' },
      { id: 'a6', key: 'CAR', value: '16 (+3)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 135, max: 135, color: 'purple' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 17, max: 17, color: 'blue' },
      { id: 'r3', name: 'Resistência Lendária (3/dia)', current: 3, max: 3, color: 'amber' },
    ],
    notes: `### Rejuvenescimento & Resistência Lendária
- **Filactéria:** Se o lich for destruído, ele rejuvenesce em 1d10 dias com um novo corpo ao lado de sua filactéria.
- **Resistência Lendária (3/dia):** Se falhar em um TR, pode escolher ter sucesso em vez disso.

### Magias Preparadas (CD 20)
- 9º Círculo: *Palavra de Poder Matar (Mata na hora se tiver 100 PV ou menos)*.
- 8º Círculo: *Dominar Monstro*, *Labirinto*.
- 7º Círculo: *Dedo da Morte (7d8+30 necrótico)*, *Teleporte*.
- 6º Círculo: *Desintegrar (10d6+40 dano de força)*, *Globo de Invulnerabilidade*.

### Ações Lendárias (3/rodada)
Pode lançar um truque, usar Toque Paralisante (+12, 3d6 frio + paralisia) ou perturbar a vida (1d6 de dano necrótico em área).`,
  },
  {
    id: 'dnd5e_ancient_red_dragon',
    name: 'Dragão Vermelho Ancião',
    system: 'D&D 5e',
    category: 'Dragão',
    challenge: 'ND 24 (62.000 XP)',
    role: 'Lorde Supremo da Destruição',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('dragon', '#7f1d1d', '#f87171', '#180202'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '30 (+10)' },
      { id: 'a2', key: 'DES', value: '10 (+0)' },
      { id: 'a3', key: 'CON', value: '29 (+9)' },
      { id: 'a4', key: 'INT', value: '18 (+4)' },
      { id: 'a5', key: 'SAB', value: '15 (+2)' },
      { id: 'a6', key: 'CAR', value: '23 (+6)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 546, max: 546, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 22, max: 22, color: 'amber' },
      { id: 'r3', name: 'Voo', current: 24, max: 24, color: 'blue' },
      { id: 'r4', name: 'Resistência Lendária (3/dia)', current: 3, max: 3, color: 'emerald' },
    ],
    notes: `### Presença Aterradora & Resistência Lendária
- **Presença Aterradora:** Cada criatura à escolha do dragão a até 36m deve passar em TR de Sabedoria CD 21 ou fica Aterrorizada por 1 minuto.
- **Resistência Lendária (3/dia):** Se falhar em um teste, obtém sucesso.

### Ações
- **Multiataque:** O dragão usa sua Presença Aterradora e realiza três ataques: um com a mordida e dois com as garras.
- **Mordida Colossal:** +17 para atingir, alcance 4,5m, dano: 21 (2d10 + 10) perfurante mais 14 (4d6) de fogo.
- **Garra:** +17 para atingir, alcance 3m, dano: 17 (2d6 + 10) cortante.
- **Sopro de Fogo Apocalíptico (Recarga 5–6):** Cone titânico de 27 metros! Cada criatura deve fazer TR de Destreza CD 24, sofrendo 91 (26d6) de dano de fogo se falhar, ou metade se passar!

### Ações Lendárias (3/rodada)
- Ataque com a Cauda (+17, 19 dano concussão e derruba), Ataque de Asas (danifica e empurra 6m), ou Detectar.`,
  },
  {
    id: 'dnd5e_tarrasque',
    name: 'Tarrasque (O Devorador de Mundos)',
    system: 'D&D 5e',
    category: 'Monstruosidade',
    challenge: 'ND 30 (155.000 XP)',
    role: 'Titã Apocalíptico Lendário',
    type: 'Monstro',
    avatarUrl: getMonsterAvatar('dragon', '#451a03', '#f59e0b', '#1a0800'),
    attributes: [
      { id: 'a1', key: 'FOR', value: '30 (+10)' },
      { id: 'a2', key: 'DES', value: '11 (+0)' },
      { id: 'a3', key: 'CON', value: '30 (+10)' },
      { id: 'a4', key: 'INT', value: '3 (-4)' },
      { id: 'a5', key: 'SAB', value: '11 (+0)' },
      { id: 'a6', key: 'CAR', value: '11 (+0)' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 676, max: 676, color: 'red' },
      { id: 'r2', name: 'Classe de Armadura (CA)', current: 25, max: 25, color: 'amber' },
      { id: 'r3', name: 'Resistência Lendária (3/dia)', current: 3, max: 3, color: 'purple' },
    ],
    notes: `### Carapaça Refletora & Imunidade Mágica
- **Carapaça Refletora:** Qualquer magia de linha ou raio, como *Míssil Mágico*, *Relâmpago* ou *Desintegrar*, é automaticamente refletida ou desviada (role d6: em um 6, a magia é refletida de volta ao conjurador!).
- **Imunidades:** Fogo, Veneno; Concussão, Perfurante e Cortante não-mágicos; Encantado, Aterrorizado, Paralisado, Envenenado.
- **Monstro de Cerco:** Causa dano dobrado a objetos e estruturas.

### Ações
- **Multiataque:** O Tarrasque usa sua Presença Aterradora e desfere cinco ataques: uma mordida, duas garras, um chifre e uma cauda.
- **Mordida:** +19 para atingir, alcance 3m, dano: 36 (4d12 + 10) perfurante. Se for criatura Grande ou menor, fica Agarrada (CD 20) e pode ser **Engolida** no próximo ataque (sofre 56 dano de ácido por turno no estômago!).
- **Garras:** +19 para atingir, alcance 4,5m, dano: 28 (4d8 + 10) cortante.
- **Chifres:** +19 para atingir, dano: 32 (4d10 + 10) perfurante.
- **Cauda:** +19 para atingir, alcance 6m, dano: 24 (4d6 + 10) concussão e derruba o alvo.`,
  },
];
