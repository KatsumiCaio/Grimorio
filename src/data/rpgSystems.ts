export interface RpgSystemDefinition {
  id: string;
  name: string;
  shortName: string;
  category: string;
  diceConvention: string;
  keyMechanics: string;
  badge: string;
  aiSystemDirectives: string;
}

export const RPG_SYSTEMS: RpgSystemDefinition[] = [
  {
    id: 'dnd5e',
    name: 'Dungeons & Dragons 5e (D&D 5ª Edição)',
    shortName: 'D&D 5e',
    category: 'Fantasia Medieval',
    diceConvention: 'd20 + Modificador de Atributo + Bônus de Proficiência vs CA ou CD',
    keyMechanics: 'Atributos (FOR, DES, CON, INT, SAB, CAR), Vantagem/Desvantagem, CA, CD de Dificuldade (5 Muito Fácil, 10 Fácil, 15 Médio, 20 Difícil, 25 Muito Difícil, 30 Quase Impossível), Slots de Magia, Concentração, Descanso Curto/Longo, Economia de Ações (Ação, Ação Bônus, Reação, Movimento).',
    badge: 'd20 Clássico',
    aiSystemDirectives: `Especialização em D&D 5ª Edição:
- Resolução de Testes: 1d20 + Modificador de Habilidade (+ Proficiência se aplicável) vs Classe de Dificuldade (CD) ou Classe de Armadura (CA).
- Vantagem/Desvantagem: role 2d20 e escolha o maior/menor resultado. Não se acumulam.
- Economia de Ação no Combate: 1 Ação, 1 Ação Bônus (apenas se concedida por habilidade/magia), 1 Reação por rodada, Movimento fracionável e 1 Interação livre com objeto.
- Magias: Espaços de Magia (Spell Slots) de 1º a 9º círculo, Truques à vontade, Concentração (apenas 1 magia por vez; dano sofrido exige Teste de Resistência de CON CD 10 ou metade do dano sofrido, o que for maior).
- Cura e Morte: 0 PV resulta em Testes contra a Morte (3 sucessos estabiliza, 3 falhas morre, 1 natural conta como 2 falhas, 20 natural recupera 1 PV). Dados de Vida recuperados no Descanso Longo (metade do total).`,
  },
  {
    id: 'tormenta20',
    name: 'Tormenta 20 (T20 / Jogo do Ano)',
    shortName: 'Tormenta 20',
    category: 'Fantasia Nacional',
    diceConvention: 'd20 + Metade do Nível + Modificador de Atributo + Treinamento vs Defesa ou CD',
    keyMechanics: 'Pontos de Mana (PM) unificados para magias, manobras e poderes de classe. Pontos de Vida (PV). Atributos (Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma). Testes de Perícia, CD padrão (15 Médio, 20 Difícil, 25 Muito Difícil). Condições de combate, Ações Padrão, Movimento, Completa, Reação e Livre.',
    badge: 'd20 Heroico & PM',
    aiSystemDirectives: `Especialização em Tormenta 20 (T20):
- Resolução de Testes: 1d20 + Bônus de Perícia (metade do nível + atributo + treino + outros bônus) vs Defesa ou CD da perícia/efeito.
- Gestão de PM: Pontos de Mana são o combustível universal de magias, golpes especiais e poderes. O limite máximo de PM gastos em uma mesma ação é igual ao nível do personagem (exceto com poderes especiais).
- Magias e Aprimoramentos: Magias possuem custo base em PM e aprimoramentos opcionais que aumentam efeitos, alcance, alvos ou CD somando mais PMs.
- Economia de Ações: Ação Padrão (atacar, lançar magia), Ação de Movimento (deslocar-se, sacar item), Ação Completa (corrida, magias demoradas), Ações Livres e Reações.
- Letalidade & Condições: 0 PV deixa o personagem Sangrando e Inconsciente (teste de Constituição CD 15 por rodada para não perder mais PVs; morte aos -metade dos PVs máximos).`,
  },
  {
    id: 'pathfinder2e',
    name: 'Pathfinder 2ª Edição (PF2e)',
    shortName: 'Pathfinder 2e',
    category: 'Fantasia Tática',
    diceConvention: 'd20 + Modificador de Proficiência (T/E/M/L) + Atributo vs DC/AC',
    keyMechanics: 'Sistema rígido e tático de 3 Ações por turno + 1 Reação. Quatro Graus de Sucesso (Sucesso Crítico se DC+10 ou 20 nat; Falha Crítica se DC-10 ou 1 nat). Penalidade de Ataques Múltiplos (MAP: 0/-5/-10 ou 0/-4/-8 para armas Ágeis). Traços (Traits) em tudo.',
    badge: '3 Ações & 4 Graus',
    aiSystemDirectives: `Especialização em Pathfinder 2e:
- 4 Graus de Sucesso fundamentais: Sucesso Crítico (+10 acima da CD ou nat 20 promovendo), Sucesso, Falha, Falha Crítica (-10 abaixo da CD ou nat 1 rebaixando).
- Economia de 3 Ações: Toda criatura tem 3 ações e 1 reação por turno. Andar custa 1 ação (Stride), atacar custa 1 ação (Strike), magias comuns costumam custar 2 ações.
- Penalidade de Ataques Múltiplos (MAP): -5 no segundo ataque, -10 no terceiro (ou -4/-8 para armas Ágeis/Agile).
- Proficiência Unificada: Não Treinado (+0), Treinado (+2 + nível), Especialista (+4 + nível), Mestre (+6 + nível), Lendário (+8 + nível).`,
  },
  {
    id: 'call_of_cthulhu',
    name: 'Call of Cthulhu 7ª Edição (Chamado de Cthulhu)',
    shortName: 'Call of Cthulhu 7e',
    category: 'Horror & Investigação',
    diceConvention: 'd100 (Percentil roll-under): tirar igual ou menor que a Perícia/Característica',
    keyMechanics: 'Graus de Sucesso: Regular (<= valor), Bom/Difícil (<= metade), Extremo (<= um quinto), Sucesso Crítico (01), Desastre/Fumble (96-100 ou 100 se perícia >= 50). Sanidade (SAN), Testes Forçados (Pushing Rolls), Acometimentos de Loucura e Sorte (Luck).',
    badge: 'd100 Investigativo',
    aiSystemDirectives: `Especialização em Chamado de Cthulhu 7ª Edição:
- Resolução de Testes: Role 1d100. Sucesso se resultado <= valor da perícia.
- Graus de Sucesso: Regular (resultado <= valor total), Difícil/Hard (<= valor/2), Extremo (<= valor/5), Crítico (01), Desastre/Fumble (96-100 ou 100).
- Dados de Bônus e Penalidade: Rola-se 1 dado de dezena adicional, escolhendo a melhor ou pior dezena.
- Forçar o Teste (Pushed Roll): Se falhar em um teste não-combate com justificativa plausível, o investigador pode tentar de novo com a condição de que uma nova falha trará consequências desastrosas.
- Sistema de Sanidade: Perda de 5+ pontos de SAN de uma vez provoca Acometimento de Loucura Temporária se falhar em teste de Ideia (INT). Ao chegar a 0 SAN, o investigador torna-se louco permanente e NPC.
- Combate Letal: Qualquer dano igual ou superior a metade dos Pontos de Vida máximos causa Ferimento Grave (Major Wound). Se cair a 0 PV com Ferimento Grave, fica Moribundo.`,
  },
  {
    id: 'ordem_paranormal',
    name: 'Ordem Paranormal RPG',
    shortName: 'Ordem Paranormal',
    category: 'Investigação Paranormal',
    diceConvention: 'Pool de d20s igual ao Atributo (escolhe o maior) + Bônus de Treinamento vs DT',
    keyMechanics: '5 Atributos (AGI, FOR, INT, PRE, VIG). NEX (Nível de Exposição Paranormal). PV, Sanidade (SAN), Pontos de Esforço (PE). Elementos Paranormais (Sangue, Morte, Energia, Conhecimento, Medo). Graus de Perícia (Destreinado +0, Treinado +5, Veterano +10, Expert +15). DT de Testes.',
    badge: 'Pool d20 & NEX',
    aiSystemDirectives: `Especialização em Ordem Paranormal RPG:
- Resolução de Testes: Role uma quantidade de d20s igual ao Atributo correspondente (ex: Agilidade 3 = 3d20) e escolha o MAIOR valor. Em seguida, some o bônus de perícia (+5 Treinado, +10 Veterano, +15 Expert).
- Desvantagem em Atributo 0: Rola-se 2d20 e escolhe o MENOR valor.
- Crítico: Se o maior d20 alcançar a margem de ameaça da arma (ex: 19 ou 20), é um Crítico e multiplica os dados de dano.
- Pontos de Esforço (PE): Gastos para ativar rituais paranormais e habilidades de trilha/classe. O limite de PE por rodada é igual ao limite de classe/NEX.
- Sanidade e Enlouquecendo: Falhas em testes de Presença contra cenas aterrorizantes drenam Sanidade. Chegar a 0 de Sanidade deixa o personagem Enlouquecendo (podendo virar monstro).`,
  },
  {
    id: 'vampire_v5',
    name: 'Vampiro: A Máscara (V5 - Vampire: The Masquerade)',
    shortName: 'Vampiro V5',
    category: 'Horror Pessoal & Narrativo',
    diceConvention: 'Pool de d10s (Atributo + Perícia) vs Dificuldade em número de sucessos (6+)',
    keyMechanics: 'Fome (Hunger 1 a 5) que substitui dados normais por Dados de Fome. Crítico (dois 10s = 4 sucessos). Crítico Bagunçado (Messy Critical se um 10 estiver no Dado de Fome). Falha Bestial (Bestial Failure se falhar e tirar 1 no Dado de Fome). Humanidade, Ressonâncias de Sangue, Disciplinas e Frenesi.',
    badge: 'Dados de Fome d10',
    aiSystemDirectives: `Especialização em Vampiro: A Máscara V5 (Storyteller System):
- Resolução de Testes: Role (Atributo + Perícia) em d10s. Cada dado com resultado 6 ou mais é 1 Sucesso. O total deve igualar ou superar a Dificuldade do teste.
- Críticos: Cada par de 10s conta como 4 sucessos (dois normais + dois de bônus).
- Dados de Fome (Hunger Dice): O nível de Fome do vampiro (1 a 5) substitui a mesma quantidade de dados da pilha por Dados de Fome (vermelhos/diferenciados).
- Efeitos da Besta:
  * Crítico Bagunçado (Messy Critical): Ocorre ao vencer com pelo menos um 10 nos Dados de Fome. A Besta impõe a vitória com selvageria e quebra de sigilo da Máscara.
  * Falha Bestial (Bestial Failure): Ocorre ao falhar no teste com pelo menos um resultado 1 nos Dados de Fome. A Besta se manifesta em compulsões, fome voraz ou frenesi.
- Dano: Dividido em Superficial (dividido por 2 para vampiros contra danos normais) e Agravado (fogo, luz solar, decapitação).`,
  },
  {
    id: 'cyberpunk_red',
    name: 'Cyberpunk RED',
    shortName: 'Cyberpunk RED',
    category: 'Cyberpunk & Sci-Fi',
    diceConvention: '1d10 + Estatística (STAT) + Perícia vs DV (Difficulty Value)',
    keyMechanics: 'Explosão de Dados (Crítico em 10 soma 1d10; Desastre em 1 subtrai 1d10). Pontos de Vida, Limiar de Ferimento Grave (Seriously Wounded), Humanidade (HUM) e Perda de Empatia por Ciberware (Ciberpsicose). Ações de Movimento e Combate.',
    badge: '1d10 Explosivo & DV',
    aiSystemDirectives: `Especialização em Cyberpunk RED:
- Resolução de Testes: 1d10 + STAT + Skill + Bônus vs DV (Difficulty Value: 9 Simples, 13 Cotidiano, 15 Complexo, 17 Difícil, 21 Extremo, 24 Quase Impossível).
- Rolagens Explosivas: Se tirar 10 no d10, rola-se outro 1d10 e SOMA. Se tirar 1 no d10, rola-se outro 1d10 e SUBTRAI do total.
- Blindagem e SP (Stopping Power): Armadura reduz o dano pelo valor de SP. Dano que superar a SP causa perda de PV e degrada o SP da armadura em 1 ponto.
- Ferimentos Críticos: Dois dados de dano iguais a 6 causam um Ferimento Crítico tabelado (membros amputados, órgãos perfurados, etc.).
- Humanidade & Ciberpsicose: Instalar implantes ciberware custa Humanidade, reduzindo a Estatística de Empatia. Empatia 0 significa surto psicótico.`,
  },
  {
    id: 'savage_worlds',
    name: 'Savage Worlds (SWADE - Edição Aventura)',
    shortName: 'Savage Worlds',
    category: 'Genérico & Ação Pulper',
    diceConvention: 'Dado do Traço (d4, d6, d8, d10, d12) + Dado Selvagem (1d6), escolhe o maior vs Número-Alvo 4',
    keyMechanics: 'Dados Explodem (Aces/Áses em valor máximo). Número-Alvo padrão é 4. Cada 4 pontos acima do alvo é uma Elevação (Raise). Bennies (Fichas de Aventura), Abalado (Shaken), Ferimentos (Wounds até 3), Iniciativa com baralho de cartas.',
    badge: 'Dado Selvagem & Aces',
    aiSystemDirectives: `Especialização em Savage Worlds (SWADE):
- Resolução de Testes: Personagens Carta Selvagem (Wild Cards) rolam o dado do Atributo/Perícia (ex: Luta d8) JUNTO com 1d6 de Dado Selvagem, escolhendo o maior valor.
- Dados que Explodem (Acing): Se qualquer dado atingir seu valor máximo, rola-se novamente e soma-se o resultado (indefinidamente).
- Número-Alvo (Target Number): Padrão é 4 (em combate contra Aparar). A cada 4 pontos acima do alvo tem-se 1 Elevação (Raise), gerando efeitos extras ou +1d6 no dano.
- Combate & Ferimentos: Sucesso deixa o alvo Abalado (Shaken). Com 1 Elevação ou novo golpe Abalado, causa Ferimento (Wound). Três ferimentos deixam o herói Incapacitado.
- Bennies (Fichas): Usados para re-rolar testes, absorver ferimentos (Soak Roll) e remover a condição Abalado.`,
  },
  {
    id: 'old_dragon_2',
    name: 'Old Dragon 2 (OD2 / OSR Nacional)',
    shortName: 'Old Dragon 2',
    category: 'Fantasia Old-School',
    diceConvention: 'd20 roll-under para testes de atributos / d20 + BA vs CA para combate',
    keyMechanics: 'Filosofia OSR: alta letalidade, exploração de masmorras, gerenciamento de recursos (tochas, rações, peso). Atributos (FOR, DES, CON, INT, SAB, CAR) com geração 3d6. Teste de Atributo: tirar menor ou igual ao valor. Base de Ataque (BA) vs CA ascendente.',
    badge: 'OSR Raiz & Letal',
    aiSystemDirectives: `Especialização em Old Dragon 2 (OD2):
- Filosofia OSR: Priorize a inteligência e descrição dos jogadores no ambiente antes de pedir rolagens de dados. Combate é perigoso e mortífero.
- Testes de Atributos: Role 1d20 buscando resultado IGUAL OU MENOR que o valor do atributo na ficha.
- Combate: 1d20 + Base de Ataque (BA) + Modificador de Força/Destreza vs Classe de Armadura (CA) do alvo.
- Testes de Proteção (Jogada de Proteção): Jogue 1d20 buscando igualar ou superar o valor base da classe (evitar magias, sopros, venenos e armadilhas).
- Recursos e Masmorra: Controle rígido de turnos de 10 minutos na masmorra, tochas com duração finita e testes de Encontros Aleatórios a cada intervalo.`,
  },
  {
    id: 'mork_borg',
    name: 'Mörk Borg (e derivados como Cy_Borg)',
    shortName: 'Mörk Borg',
    category: 'Grimdark Apocalíptico',
    diceConvention: 'd20 + Modificador de Habilidade vs Dificuldade (DR 12 padrão)',
    keyMechanics: 'Regras ultraleves e brutais. 4 Habilidades (Agilidade, Presença, Força, Resistência de -3 a +6). Defesa ativa (jogadores rolam para esquivar e defender). Presságios (Omens) para re-rolar ou alterar o destino. Calendário de Nechrubel e Misérias do Apocalipse.',
    badge: 'Grimdark & DR 12',
    aiSystemDirectives: `Especialização em Mörk Borg:
- Resolução de Testes: 1d20 + Modificador de Habilidade vs DR (Dificuldade Padrão é DR 12).
- Jogadores Rolam Tudo: Monstros não rolam ataque; os jogadores rolam Agilidade DR 12 para esquivar ou sofrem dano.
- Dano e Armadura: Armadura reduz dano rolando um dado (ex: Armadura Leve -d2, Média -d4, Pesada -d6).
- Morte: 0 PV = Quebrado (Broken). Rola-se 1d4 na tabela: 1 cai inconsciente, 2 perde membro/olho, 3 sangrando até a morte em d4 rodadas, 4 morre instantaneamente.
- Tom e Atmosfera: Niilismo gótico e sombrio, mundo à beira do fim inevitável, humor negro e descrições grotescas.`,
  },
  {
    id: 'shadowrun',
    name: 'Shadowrun (5ª / 6ª Edição)',
    shortName: 'Shadowrun',
    category: 'Cyberpunk & Magia',
    diceConvention: 'Pool de d6s (Atributo + Perícia). Cada 5 e 6 é um Sucesso (Hit)',
    keyMechanics: 'Pilhas massivas de d6. Limiares de Sucessos (Thresholds). Glitch (mais da metade dos dados derem 1). Critical Glitch (Glitch sem nenhum sucesso). Tríade do jogo: Mundo Físico, Espaço Astral/Magia e Matrix (Hacking/Decking). Essência e Ciberware.',
    badge: 'Pool d6 & Matrix',
    aiSystemDirectives: `Especialização em Shadowrun:
- Resolução de Testes: Role uma quantidade de d6s igual a (Atributo + Perícia). Resultados 5 e 6 contam como Sucessos (Hits).
- Glitch: Se mais da metade dos dados rolados resultarem em 1, ocorre uma Falha Técnica (Glitch), gerando complicações. Se não houver nenhum sucesso, é um Critical Glitch fatal.
- Iniciativa e Ações: A iniciativa determina a quantidade de Passes de Combate por rodada.
- Dano e Resistência: O dano líquido é o dano da arma + sucessos não resistidos, mitigado por teste de Resistência a Dano (Constituição + Blindagem).
- Essência: Começa em 6. Cada implante drena Essência. Se chegar a 0, o personagem morre.`,
  },
  {
    id: 'fate',
    name: 'Fate Básico / Condensado / Acelerado',
    shortName: 'Fate',
    category: 'Narrativo & Cooperativo',
    diceConvention: '4 dados Fudge/Fate (4dF: símbolos -, 0, +) somados à Perícia vs Oposição',
    keyMechanics: 'Escala de resultados de -4 a +4 adicionada à perícia. Quatro Resultados: Falha, Empate, Sucesso, Sucesso com Estilo. Quatro Ações: Superar, Criar Vantagem, Atacar, Defender. Aspectos, Pontos de Destino (Fate Points), Proezas (Stunts), Caixas de Estresse e Consequências.',
    badge: '4dF Narrativo',
    aiSystemDirectives: `Especialização em Fate (Core / Condensado):
- Resolução de Testes: 4dF (dados Fudge com faces [-1, 0, +1]) + Perícia/Abordagem vs Dificuldade ou Oposição ativa.
- 4 Resultados: Falha (não atinge ou sucesso a custo alto), Empate (sucesso menor ou impulso), Sucesso (+1 a +2 acima da oposição), Sucesso com Estilo (+3 ou mais acima, gera impulso extra).
- 4 Ações: Superar (resolver obstáculos), Criar Vantagem (criar ou descobrir aspectos com invocações gratuitas), Atacar (causar estresse), Defender (resistir a ataques ou vantagens).
- Aspectos & Pontos de Destino: Invocar um aspecto relevante custa 1 Ponto de Destino para ganhar +2 ou re-rolar. Forçar um aspecto concede 1 Ponto de Destino em troca de um contratempo dramático.`,
  },
  {
    id: '3det_victory',
    name: '3D&T Victory (e 3D&T Alpha)',
    shortName: '3D&T Victory',
    category: 'Anime & Ação Desenfreada',
    diceConvention: '1d6 + Atributo correspondente (ou rolagens adicionais com Vantagens) vs Dificuldade',
    keyMechanics: 'Atributos fundamentais (Poder, Habilidade, Resistência). Pontos de Ação (PA), Pontos de Mana (PM), Pontos de Vida (PV). Escala de Poder (Ningen, Sugoi, Kiai, Kami). Vantagens e Desvantagens, Críticos e testes de Perícia rápidos.',
    badge: 'Anime d6 Nacional',
    aiSystemDirectives: `Especialização em 3D&T Victory:
- Resolução de Testes: Role 1d6 e some o Atributo relevante vs Dificuldade da tarefa.
- Crítico em 6: Um resultado 6 no dado dobra o valor do atributo somado na jogada de teste ou ataque.
- Vantagens e Perícias: Vantagens concedem dados extras para escolher o melhor, ou habilidades ativadas por PMs.
- Escalas de Poder: Diferença de escalas multiplica o dano e a resistência exponencialmente (ex: um mecha na escala Sugoi contra um humano Ningen).
- Tom: Dinâmico, estilo anime, mangá, quadrinhos e videogames com ação veloz.`,
  },
  {
    id: 'custom',
    name: 'Outro Sistema / Sistema Próprio',
    shortName: 'Personalizado',
    category: 'Customizado',
    diceConvention: 'Mecânicas e convenções definidas livremente pelo mestre da mesa',
    keyMechanics: 'Total flexibilidade narrativa e mecânica conforme as anotações do mestre.',
    badge: 'Customizado',
    aiSystemDirectives: `Especialização em Sistema Próprio / Customizado:
- Adapte-se estritamente à descrição, termos e regras registradas nas anotações do mestre.
- Pergunte ou confirme convenções caso haja ambiguidade mecânica, mantendo consistência com as fichas e notas já criadas.`,
  },
];

/**
 * Normalizes and finds system definition by matching user input string
 */
export function getSystemKnowledge(systemName?: string): RpgSystemDefinition {
  if (!systemName || !systemName.trim()) {
    return RPG_SYSTEMS[0]; // Default to D&D 5e
  }

  const raw = systemName.toLowerCase().trim();

  // Direct ID or name match
  const exact = RPG_SYSTEMS.find(
    (s) => s.id.toLowerCase() === raw || s.shortName.toLowerCase() === raw || s.name.toLowerCase() === raw
  );
  if (exact) return exact;

  // Partial semantic matches
  if (raw.includes('d&d') || raw.includes('dnd') || raw.includes('dungeon') || raw.includes('5e')) {
    return RPG_SYSTEMS.find((s) => s.id === 'dnd5e')!;
  }
  if (raw.includes('tormenta') || raw.includes('t20') || raw.includes('jambo')) {
    return RPG_SYSTEMS.find((s) => s.id === 'tormenta20')!;
  }
  if (raw.includes('pathfinder') || raw.includes('pf2e') || raw.includes('paizo')) {
    return RPG_SYSTEMS.find((s) => s.id === 'pathfinder2e')!;
  }
  if (raw.includes('cthulhu') || raw.includes('coc') || raw.includes('chamado')) {
    return RPG_SYSTEMS.find((s) => s.id === 'call_of_cthulhu')!;
  }
  if (raw.includes('ordem') || raw.includes('paranormal') || raw.includes('cellbit')) {
    return RPG_SYSTEMS.find((s) => s.id === 'ordem_paranormal')!;
  }
  if (raw.includes('vampir') || raw.includes('v5') || raw.includes('mascara') || raw.includes('masquerade')) {
    return RPG_SYSTEMS.find((s) => s.id === 'vampire_v5')!;
  }
  if (raw.includes('cyberpunk') || raw.includes('red') || raw.includes('night city') || raw.includes('2020')) {
    return RPG_SYSTEMS.find((s) => s.id === 'cyberpunk_red')!;
  }
  if (raw.includes('savage') || raw.includes('swade') || raw.includes('selvagem')) {
    return RPG_SYSTEMS.find((s) => s.id === 'savage_worlds')!;
  }
  if (raw.includes('old dragon') || raw.includes('od2') || raw.includes('osr')) {
    return RPG_SYSTEMS.find((s) => s.id === 'old_dragon_2')!;
  }
  if (raw.includes('mork') || raw.includes('mörk') || raw.includes('cy_borg')) {
    return RPG_SYSTEMS.find((s) => s.id === 'mork_borg')!;
  }
  if (raw.includes('shadowrun') || raw.includes('chummer')) {
    return RPG_SYSTEMS.find((s) => s.id === 'shadowrun')!;
  }
  if (raw.includes('fate') || raw.includes('fudge')) {
    return RPG_SYSTEMS.find((s) => s.id === 'fate')!;
  }
  if (raw.includes('3d&t') || raw.includes('3det') || raw.includes('victory') || raw.includes('alpha')) {
    return RPG_SYSTEMS.find((s) => s.id === '3det_victory')!;
  }

  // Fallback for custom user system
  const customDef = RPG_SYSTEMS.find((s) => s.id === 'custom')!;
  return {
    ...customDef,
    name: systemName,
    shortName: systemName,
  };
}

export const POPULAR_SYSTEM_GROUPS = [
  {
    group: 'Fantasia Medieval & Heroica',
    systems: RPG_SYSTEMS.filter((s) => s.category.includes('Fantasia')),
  },
  {
    group: 'Horror, Investigação & Sobrenatural',
    systems: RPG_SYSTEMS.filter(
      (s) => s.category.includes('Horror') || s.category.includes('Investigação') || s.category.includes('Grimdark')
    ),
  },
  {
    group: 'Cyberpunk & Sci-Fi',
    systems: RPG_SYSTEMS.filter((s) => s.category.includes('Cyberpunk')),
  },
  {
    group: 'Genéricos, Narrativos & Outros',
    systems: RPG_SYSTEMS.filter(
      (s) => s.category.includes('Genérico') || s.category.includes('Narrativo') || s.category.includes('Anime') || s.id === 'custom'
    ),
  },
];

